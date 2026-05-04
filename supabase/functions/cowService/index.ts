// Edge Function: Cow Service
// Endpoints:
//  - POST /create_cow
//  - POST /update_cow
//  - DELETE /delete_cow
//  - GET /get_cows
//  - GET /get_cow
//  - GET /get_stats

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createEdgeHelpers } from '../_shared/http.ts';

const { supabase, jsonResponse, getUserAndFarm } = createEdgeHelpers();

// Routes

async function handleGetCows(req: Request) {
    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const url = new URL(req.url);
    const limit = url.searchParams.get('limit');
    const status = url.searchParams.get('status');
    const orderBy = url.searchParams.get('order_by') || 'created_at';
    const sortOrder = url.searchParams.get('sort_order') === 'asc';

    // Pagination
    const page = Number(url.searchParams.get('page') || 1);
    const pageSize = Number(url.searchParams.get('page_size') || 100);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    // Search
    const search = url.searchParams.get('search');
    const breed = url.searchParams.get('breed');

    let query = supabase
        .from('cows')
        .select('*', { count: 'exact' })
        .eq('farm_id', farm_id);

    if (status) query = query.eq('status', status);
    if (breed) query = query.eq('breed', breed);

    if (search) {
        query = query.or(`name.ilike.%${search}%,tag_id.ilike.%${search}%`);
    }

    query = query.order(orderBy, { ascending: sortOrder });

    if (limit) {
        query = query.limit(Number(limit));
    } else {
        query = query.range(from, to);
    }

    const { data, count, error } = await query;

    if (error) return jsonResponse({ error: 'fetch_failed', detail: error.message }, 500);

    return jsonResponse({ cows: data || [], count: count || 0 });
}

async function handleGetCow(req: Request) {
    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) return jsonResponse({ error: 'cow_id_required' }, 400);

    const { data, error } = await supabase
        .from('cows')
        .select('*')
        .eq('id', id)
        .eq('farm_id', farm_id)
        .single();

    if (error) return jsonResponse({ error: 'fetch_failed', detail: error.message }, 500);
    if (!data) return jsonResponse({ error: 'cow_not_found' }, 404);

    return jsonResponse({ cow: data });
}

async function handleCreateCow(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body?.name) {
        return jsonResponse({ error: 'cow_name_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const insert = {
        ...body,
        farm_id,
        // sanitize numbers
        age: body.age ? Number(body.age) : null,
        weight: body.weight ? Number(body.weight) : null
    };

    // Remove id if present to allow DB to generate it
    delete insert.id;

    const { data, error } = await supabase
        .from('cows')
        .insert(insert)
        .select()
        .single();

    if (error) return jsonResponse({ error: 'create_failed', detail: error.message }, 500);

    return jsonResponse({ cow: data });
}

async function handleUpdateCow(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body?.id) {
        return jsonResponse({ error: 'cow_id_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const updates = { ...body };
    delete updates.id;
    delete updates.farm_id; // prevent ownership change
    delete updates.created_at;

    if (updates.age !== undefined) updates.age = updates.age ? Number(updates.age) : null;
    if (updates.weight !== undefined) updates.weight = updates.weight ? Number(updates.weight) : null;

    const { data, error } = await supabase
        .from('cows')
        .update(updates)
        .eq('id', body.id)
        .eq('farm_id', farm_id)
        .select()
        .single();

    if (error) return jsonResponse({ error: 'update_failed', detail: error.message }, 500);

    return jsonResponse({ cow: data });
}

async function handleDeleteCow(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body?.id) {
        return jsonResponse({ error: 'cow_id_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const { error } = await supabase
        .from('cows')
        .delete()
        .eq('id', body.id)
        .eq('farm_id', farm_id);

    if (error) return jsonResponse({ error: 'delete_failed', detail: error.message }, 500);

    return jsonResponse({ success: true });
}

async function handleGetStats(req: Request) {
    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    // Total cows
    const { count: total, error: totalErr } = await supabase
        .from('cows')
        .select('*', { count: 'exact', head: true })
        .eq('farm_id', farm_id);

    if (totalErr) return jsonResponse({ error: 'fetch_failed', detail: totalErr.message }, 500);

    // Active/Milkable cows (not bull, calf, dry, sold, deceased)
    // We fetch all statuses and count in memory to be safe and consistent with frontend logic.

    const { data: allCows, error: statErr } = await supabase
        .from('cows')
        .select('status')
        .eq('farm_id', farm_id);

    if (statErr) return jsonResponse({ error: 'fetch_failed', detail: statErr.message }, 500);

    let activeCount = 0;
    if (allCows) {
        activeCount = allCows.filter((cow: { status?: string | null }) => {
            const s = (cow.status || 'active').toLowerCase();
            return s !== 'bull' && s !== 'calf' && s !== 'dry' && s !== 'sold' && s !== 'deceased';
        }).length;
    }

    return jsonResponse({ total: total || 0, active: activeCount });
}

serve(async (req: Request) => {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method === 'GET' && path.endsWith('/get_cows')) return handleGetCows(req);
    if (req.method === 'GET' && path.endsWith('/get_cow')) return handleGetCow(req);
    if (req.method === 'GET' && path.endsWith('/get_stats')) return handleGetStats(req);
    if (req.method === 'POST' && path.endsWith('/create_cow')) return handleCreateCow(req);
    if (req.method === 'POST' && path.endsWith('/update_cow')) return handleUpdateCow(req);
    if (req.method === 'DELETE' && path.endsWith('/delete_cow')) return handleDeleteCow(req);

    return new Response('Not found', { status: 404, headers: corsHeaders });
});
