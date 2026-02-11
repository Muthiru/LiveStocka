// Edge Function: Milk Production Service
// Endpoints:
//  - POST /validate_production
//  - POST /create_production
//  - POST /update_production
//  - POST /bulk_create_production
//  - GET /production_stats
//  - GET /production_alerts

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false }
});

function jsonResponse(body: unknown, status = 200) {
    return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}

async function getUserAndFarm(req: Request) {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer /i, '').trim();

    if (!token) {
        return { error: 'AUTH_HEADER_MISSING_OR_MALFORMED' };
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) {
            return { error: `SUPABASE_AUTH_ERROR: ${error.message}` };
        }

        if (!user) {
            return { error: 'SUPABASE_AUTH_NO_USER' };
        }

        return { user, farm_id: user.id };
    } catch (err: any) {
        return { error: `EDGE_FUNCTION_EXCEPTION: ${err.message}` };
    }
}

// Validation helpers
function validateYield(yield_value: number | null | undefined, session: string): { valid: boolean; error?: string } {
    if (yield_value === null || yield_value === undefined || yield_value === 0) {
        return { valid: true }; // Optional field
    }

    if (yield_value < 0) {
        return { valid: false, error: `${session}_yield_cannot_be_negative` };
    }

    if (yield_value > 100) {
        return { valid: false, error: `${session}_yield_exceeds_realistic_limit` };
    }

    return { valid: true };
}

function validateProductionDate(date_string: string): { valid: boolean; error?: string } {
    const date = new Date(date_string);

    if (Number.isNaN(date.getTime())) {
        return { valid: false, error: 'invalid_production_date' };
    }

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (date > today) {
        return { valid: false, error: 'production_date_in_future' };
    }

    return { valid: true };
}

// Helper function to build production updates object
function buildProductionUpdates(body: any) {
    const updates: any = {};

    if (body.morning_yield !== undefined) {
        const val = Number.parseFloat(body.morning_yield) || 0;
        const validation = validateYield(val, 'morning');
        if (!validation.valid) return { valid: false, error: validation.error };
        updates.morning_yield = val;
    }

    if (body.midday_yield !== undefined) {
        const val = Number.parseFloat(body.midday_yield) || 0;
        const validation = validateYield(val, 'midday');
        if (!validation.valid) return { valid: false, error: validation.error };
        updates.midday_yield = val;
    }

    if (body.evening_yield !== undefined) {
        const val = Number.parseFloat(body.evening_yield) || 0;
        const validation = validateYield(val, 'evening');
        if (!validation.valid) return { valid: false, error: validation.error };
        updates.evening_yield = val;
    }

    if (body.morning_time !== undefined) updates.morning_time = body.morning_time || null;
    if (body.midday_time !== undefined) updates.midday_time = body.midday_time || null;
    if (body.evening_time !== undefined) updates.evening_time = body.evening_time || null;
    if (body.notes !== undefined) updates.notes = body.notes || null;

    return { valid: true, updates };
}

// Route handlers
async function handleValidateProduction(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body || !body.cow_id || !body.production_date) {
        return jsonResponse({ error: 'cow_id_and_production_date_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    // Validate cow ownership
    const { data: cows, error: cowErr } = await supabase
        .from('cows')
        .select('id')
        .eq('id', body.cow_id)
        .eq('farm_id', farm_id)
        .limit(1);

    if (cowErr) return jsonResponse({ error: 'db_error', detail: cowErr.message }, 500);
    if (!cows || cows.length === 0) return jsonResponse({ error: 'cow_not_found_or_no_access' }, 404);

    // Validate production date
    const dateValidation = validateProductionDate(body.production_date);
    if (!dateValidation.valid) return jsonResponse({ error: dateValidation.error }, 400);

    // Validate yields
    const morningValidation = validateYield(body.morning_yield, 'morning');
    if (!morningValidation.valid) return jsonResponse({ error: morningValidation.error }, 400);

    const middayValidation = validateYield(body.midday_yield, 'midday');
    if (!middayValidation.valid) return jsonResponse({ error: middayValidation.error }, 400);

    const eveningValidation = validateYield(body.evening_yield, 'evening');
    if (!eveningValidation.valid) return jsonResponse({ error: eveningValidation.error }, 400);

    // Ensure at least one yield is provided
    const morning = body.morning_yield || 0;
    const midday = body.midday_yield || 0;
    const evening = body.evening_yield || 0;

    if (morning === 0 && midday === 0 && evening === 0) {
        return jsonResponse({ error: 'at_least_one_yield_required' }, 400);
    }

    return jsonResponse({ valid: true });
}

async function handleCreateProduction(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body || !body.cow_id || !body.production_date) {
        return jsonResponse({ error: 'cow_id_and_production_date_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    // Validate cow ownership
    const { data: cows, error: cowErr } = await supabase
        .from('cows')
        .select('id')
        .eq('id', body.cow_id)
        .eq('farm_id', farm_id)
        .limit(1);

    if (cowErr) return jsonResponse({ error: 'db_error', detail: cowErr.message }, 500);
    if (!cows || cows.length === 0) return jsonResponse({ error: 'cow_not_found_or_no_access' }, 404);

    // Validate production date
    const dateValidation = validateProductionDate(body.production_date);
    if (!dateValidation.valid) return jsonResponse({ error: dateValidation.error }, 400);

    // Validate yields
    const morning = Number.parseFloat(body.morning_yield) || 0;
    const midday = Number.parseFloat(body.midday_yield) || 0;
    const evening = Number.parseFloat(body.evening_yield) || 0;

    const morningValidation = validateYield(morning, 'morning');
    if (!morningValidation.valid) return jsonResponse({ error: morningValidation.error }, 400);

    const middayValidation = validateYield(midday, 'midday');
    if (!middayValidation.valid) return jsonResponse({ error: middayValidation.error }, 400);

    const eveningValidation = validateYield(evening, 'evening');
    if (!eveningValidation.valid) return jsonResponse({ error: eveningValidation.error }, 400);

    if (morning === 0 && midday === 0 && evening === 0) {
        return jsonResponse({ error: 'at_least_one_yield_required' }, 400);
    }

    // Check for existing record (idempotency)
    const { data: existing } = await supabase
        .from('milk_production')
        .select('id')
        .eq('cow_id', body.cow_id)
        .eq('production_date', body.production_date)
        .limit(1);

    if (existing && existing.length > 0) {
        return jsonResponse({ id: existing[0].id, already_existed: true });
    }

    // Insert production record
    const insert = {
        farm_id,
        cow_id: body.cow_id,
        production_date: body.production_date,
        morning_yield: morning,
        midday_yield: midday,
        evening_yield: evening,
        morning_time: body.morning_time || null,
        midday_time: body.midday_time || null,
        evening_time: body.evening_time || null,
        notes: body.notes || null
    };

    const { data, error: insertErr } = await supabase
        .from('milk_production')
        .insert(insert)
        .select('id')
        .limit(1);

    if (insertErr) return jsonResponse({ error: 'insert_failed', detail: insertErr.message }, 500);

    return jsonResponse({ id: data?.[0]?.id, created: true });
}

async function handleUpdateProduction(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body || !body.id) {
        return jsonResponse({ error: 'production_id_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabase
        .from('milk_production')
        .select('id, cow_id')
        .eq('id', body.id)
        .eq('farm_id', farm_id)
        .limit(1);

    if (fetchErr) return jsonResponse({ error: 'db_error', detail: fetchErr.message }, 500);
    if (!existing || existing.length === 0) return jsonResponse({ error: 'production_record_not_found' }, 404);

    // Build updates using helper
    const updateResult = buildProductionUpdates(body);
    if (!updateResult.valid) return jsonResponse({ error: updateResult.error }, 400);

    if (Object.keys(updateResult.updates).length === 0) {
        return jsonResponse({ error: 'no_fields_to_update' }, 400);
    }

    const { error: updateErr } = await supabase
        .from('milk_production')
        .update(updateResult.updates)
        .eq('id', body.id)
        .eq('farm_id', farm_id);

    if (updateErr) return jsonResponse({ error: 'update_failed', detail: updateErr.message }, 500);

    return jsonResponse({ updated: true });
}

async function handleBulkCreateProduction(req: Request) {
    const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
    if (!body || !Array.isArray(body.records) || body.records.length === 0) {
        return jsonResponse({ error: 'records_array_required' }, 400);
    }

    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const results = [];
    const errors = [];

    for (const record of body.records) {
        try {
            if (!record.cow_id || !record.production_date) {
                errors.push({ cow_id: record.cow_id, error: 'missing_required_fields' });
                continue;
            }

            // Validate cow ownership
            const { data: cows } = await supabase
                .from('cows')
                .select('id')
                .eq('id', record.cow_id)
                .eq('farm_id', farm_id)
                .limit(1);

            if (!cows || cows.length === 0) {
                errors.push({ cow_id: record.cow_id, error: 'cow_not_found_or_no_access' });
                continue;
            }

            const morning = Number.parseFloat(record.morning_yield) || 0;
            const midday = Number.parseFloat(record.midday_yield) || 0;
            const evening = Number.parseFloat(record.evening_yield) || 0;

            if (morning === 0 && midday === 0 && evening === 0) {
                errors.push({ cow_id: record.cow_id, error: 'at_least_one_yield_required' });
                continue;
            }

            const insert = {
                farm_id,
                cow_id: record.cow_id,
                production_date: record.production_date,
                morning_yield: morning,
                midday_yield: midday,
                evening_yield: evening,
                morning_time: record.morning_time || null,
                midday_time: record.midday_time || null,
                evening_time: record.evening_time || null,
                notes: record.notes || null
            };

            const { data, error: insertErr } = await supabase
                .from('milk_production')
                .upsert(insert, { onConflict: 'cow_id,production_date' })
                .select('id')
                .limit(1);

            if (insertErr) {
                errors.push({ cow_id: record.cow_id, error: insertErr.message });
            } else {
                results.push({ cow_id: record.cow_id, id: data?.[0]?.id });
            }
        } catch (err: any) {
            errors.push({ cow_id: record.cow_id, error: err.message });
        }
    }

    return jsonResponse({
        success: results.length,
        failed: errors.length,
        results,
        errors
    });
}

async function handleGetProductionStats(req: Request) {
    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    // Today's total
    const { data: todayData } = await supabase
        .from('milk_production')
        .select('total_yield')
        .eq('farm_id', farm_id)
        .eq('production_date', today);

    const todayTotal = (todayData || [])
        .reduce((sum, r) => sum + Number.parseFloat(r.total_yield || '0'), 0);

    // Week total
    const { data: weekData } = await supabase
        .from('milk_production')
        .select('total_yield')
        .eq('farm_id', farm_id)
        .gte('production_date', weekAgo.toISOString().split('T')[0]);

    const weekTotal = (weekData || [])
        .reduce((sum, r) => sum + Number.parseFloat(r.total_yield || '0'), 0);

    // Month total
    const { data: monthData } = await supabase
        .from('milk_production')
        .select('total_yield')
        .eq('farm_id', farm_id)
        .gte('production_date', monthAgo.toISOString().split('T')[0]);

    const monthTotal = (monthData || [])
        .reduce((sum, r) => sum + Number.parseFloat(r.total_yield || '0'), 0);

    // Average per cow (last 30 days)
    const { data: cowCount } = await supabase
        .from('cows')
        .select('id', { count: 'exact' })
        .eq('farm_id', farm_id);

    const activeCows = cowCount?.length || 0;
    const avgPerCow = activeCows > 0 ? (monthTotal / activeCows).toFixed(2) : '0.00';

    return jsonResponse({
        todayTotal: todayTotal.toFixed(2),
        weekTotal: weekTotal.toFixed(2),
        monthTotal: monthTotal.toFixed(2),
        avgPerCow
    });
}

async function handleGetProductionAlerts(req: Request) {
    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: recentProduction } = await supabase
        .from('milk_production')
        .select('cow_id, total_yield, production_date, cows(name)')
        .eq('farm_id', farm_id)
        .gte('production_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('production_date', { ascending: false });

    if (!recentProduction || recentProduction.length === 0) {
        return jsonResponse({ alerts: [] });
    }

    // Group by cow and calculate averages
    const cowData: any = {};
    recentProduction.forEach((record: any) => {
        if (!cowData[record.cow_id]) {
            cowData[record.cow_id] = {
                name: record.cows?.name || 'Unknown',
                yields: [],
                recent: []
            };
        }
        const yieldVal = Number.parseFloat(record.total_yield) || 0;
        cowData[record.cow_id].yields.push(yieldVal);

        if (cowData[record.cow_id].recent.length < 3) {
            cowData[record.cow_id].recent.push(yieldVal);
        }
    });

    const alerts: any[] = [];

    Object.keys(cowData).forEach(cowId => {
        const data = cowData[cowId];

        if (data.yields.length < 5) return;

        const avg = data.yields.reduce((sum: number, val: number) => sum + val, 0) / data.yields.length;
        const recentAvg = data.recent.reduce((sum: number, val: number) => sum + val, 0) / data.recent.length;
        const dropPercentage = ((avg - recentAvg) / avg) * 100;

        if (dropPercentage >= 20 && avg > 5) {
            alerts.push({
                cow_id: cowId,
                cow_name: data.name,
                message: `Recent production (${recentAvg.toFixed(1)}L) is ${dropPercentage.toFixed(0)}% below average (${avg.toFixed(1)}L)`
            });
        }

        if (recentAvg < 3 && avg > 8) {
            alerts.push({
                cow_id: cowId,
                cow_name: data.name,
                message: `Very low recent production (${recentAvg.toFixed(1)}L) - check cow health`
            });
        }
    });

    return jsonResponse({ alerts });
}

async function handleGetProductionRecords(req: Request) {
    const auth = await getUserAndFarm(req);
    if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
    const { farm_id } = auth as any;

    let query = supabase
        .from('milk_production')
        .select(`
      id,
      cow_id,
      production_date,
      morning_yield,
      morning_time,
      midday_yield,
      midday_time,
      evening_yield,
      evening_time,
      total_yield,
      quality,
      notes,
      cows (name, tag_id)
    `)
        .eq('farm_id', farm_id)
        .order('production_date', { ascending: false });

    const url = new URL(req.url);
    const date = url.searchParams.get('date');
    if (date) {
        query = query.eq('production_date', date);
    }

    const { data, error: fetchErr } = await query;

    if (fetchErr) return jsonResponse({ error: 'fetch_failed', detail: fetchErr.message }, 500);

    return jsonResponse({ records: data || [] });
}

serve(async (req: Request) => {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, '');

    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    if (req.method === 'POST' && path.endsWith('/validate_production')) return handleValidateProduction(req);
    if (req.method === 'POST' && path.endsWith('/create_production')) return handleCreateProduction(req);
    if (req.method === 'POST' && path.endsWith('/update_production')) return handleUpdateProduction(req);
    if (req.method === 'POST' && path.endsWith('/bulk_create_production')) return handleBulkCreateProduction(req);
    if (req.method === 'GET' && path.endsWith('/production_records')) return handleGetProductionRecords(req);
    if (req.method === 'GET' && path.endsWith('/production_stats')) return handleGetProductionStats(req);
    if (req.method === 'GET' && path.endsWith('/production_alerts')) return handleGetProductionAlerts(req);

    return new Response('Not found', { status: 404, headers: corsHeaders });
});
