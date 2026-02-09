// Edge Function: readService
// Provides SSR-safe read endpoints for frontend components
// UPDATED: Removed authorization requirements for public endpoints

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

async function getUserAndFarm(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer /i, '').trim();
  if (!token) return { user: null, farm_id: null, error: 'AUTH_HEADER_MISSING_OR_MALFORMED' };

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return { user: null, farm_id: null, error: `SUPABASE_AUTH_ERROR: ${error?.message || 'no_user'}` };

    return { user, farm_id: user.id };
  } catch (err: any) {
    return { user: null, farm_id: null, error: `EDGE_FUNCTION_EXCEPTION: ${err.message}` };
  }
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}

async function handleBulls(req: Request) {
  const { data, error } = await supabase.from('cows').select('id,name,tag_id').eq('status', 'bull').limit(200);
  if (error) return jsonResponse({ error: error.message }, 500);
  return jsonResponse({ bulls: data || [] });
}

async function handleBreedingHistory(req: Request) {
  const url = new URL(req.url);
  const cow_id = url.searchParams.get('cow_id');
  if (!cow_id) return jsonResponse({ error: 'cow_id_required' }, 400);

  const auth = await getUserAndFarm(req);
  if (auth.error) return jsonResponse({ error: auth.error }, 401);
  if (!auth.farm_id) return jsonResponse({ error: 'unauthorized' }, 401);

  const { data, error } = await supabase
    .from('breeding_attempts')
    .select('id,attempt_time,method,notes,cow_id,sire_id,sire_name, cows!fk_breeding_attempts_cow(name, tag_id)')
    .eq('cow_id', cow_id)
    .eq('farm_id', auth.farm_id)
    .order('attempt_time', { ascending: false })
    .limit(200);
  if (error) return jsonResponse({ error: error.message }, 500);

  // Fetch sire details separately to avoid ambiguous relationship
  const sireIds = [...new Set(data?.map(d => d.sire_id).filter(Boolean) || [])];
  let sireMap: { [key: string]: any } = {};
  if (sireIds.length > 0) {
    const { data: sires } = await supabase
      .from('cows')
      .select('id,name,tag_id')
      .in('id', sireIds);
    if (sires) {
      sireMap = Object.fromEntries(sires.map(s => [s.id, s]));
    }
  }

  const attempts = data?.map(d => {
    let sire = null;
    if (d.sire_id) {
      sire = sireMap[d.sire_id];
    } else if (d.sire_name) {
      sire = { name: d.sire_name };
    }
    // Handle both plural and singular relation names as PostgREST can vary
    const cow = (d as any).cows || (d as any).cow;
    return {
      ...d,
      sire,
      cow_name: cow?.name || cow?.tag_id || null,
      method: (d.method || (d as any).breeding_method) || 'ai'
    };
  }) || [];

  return jsonResponse({ attempts });
}

async function handleReproductionHistory(req: Request) {
  const url = new URL(req.url);
  const cow_id = url.searchParams.get('cow_id');

  const auth = await getUserAndFarm(req);
  if (auth.error) return jsonResponse({ error: auth.error }, 401);
  if (!auth.farm_id) return jsonResponse({ error: 'unauthorized' }, 401);

  // 1. Fetch Breeding Attempts
  let bQuery = supabase
    .from('breeding_attempts')
    .select('id,attempt_time,method,notes,cow_id,sire_id,sire_name,technician,semen_batch,cost,bcs, cows!fk_breeding_attempts_cow(name, tag_id)')
    .eq('farm_id', auth.farm_id);

  if (cow_id) bQuery = bQuery.eq('cow_id', cow_id);
  const { data: breeding, error: bErr } = await bQuery.order('attempt_time', { ascending: false });

  // 2. Fetch Heat Events
  let hQuery = supabase
    .from('heat_events')
    .select('id,heat_detected_at,intensity,signs,notes,cow_id, cows!fk_heat_events_cow(name, tag_id)')
    .eq('farm_id', auth.farm_id);

  if (cow_id) hQuery = hQuery.eq('cow_id', cow_id);
  const { data: heat, error: hErr } = await hQuery.order('heat_detected_at', { ascending: false });

  if (bErr || hErr) return jsonResponse({ error: (bErr?.message || hErr?.message) }, 500);

  // Fetch sire details for breeding
  const sireIds = [...new Set(breeding?.map(d => d.sire_id).filter(Boolean) || [])];
  let sireMap: { [key: string]: any } = {};
  if (sireIds.length > 0) {
    const { data: sires } = await supabase
      .from('cows')
      .select('id,name,tag_id')
      .in('id', sireIds);
    if (sires) {
      sireMap = Object.fromEntries(sires.map(s => [s.id, s]));
    }
  }

  const merged = [
    ...(breeding?.map(b => {
      let sire = null;
      if (b.sire_id) sire = sireMap[b.sire_id];
      else if (b.sire_name) sire = { name: b.sire_name };

      const cow = (b as any).cows || (b as any).cow;
      return {
        id: b.id,
        type: 'breeding',
        timestamp: b.attempt_time,
        method: b.method || 'ai',
        notes: b.notes,
        technician: b.technician,
        semen_batch: b.semen_batch,
        cost: b.cost,
        bcs: b.bcs,
        cow_name: cow?.name || cow?.tag_id,
        sire: sire,
        sire_name: sire?.name || sire?.tag_id || b.sire_name
      };
    }) || []),
    ...(heat?.map(h => {
      const cow = (h as any).cows || (h as any).cow;
      return {
        id: h.id,
        type: 'heat',
        timestamp: h.heat_detected_at,
        intensity: h.intensity,
        signs: h.signs,
        notes: h.notes,
        cow_name: cow?.name || cow?.tag_id
      };
    }) || [])
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return jsonResponse({ history: merged });
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = '/' + url.pathname.split('/').filter(Boolean).join('/');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'GET' && path.endsWith('/bulls')) return handleBulls(req);
  if (req.method === 'GET' && path.endsWith('/breeding_history')) return handleBreedingHistory(req);
  if (req.method === 'GET' && path.endsWith('/reproduction_history')) return handleReproductionHistory(req);
  return new Response('Not found', { status: 404, headers: corsHeaders });
});
