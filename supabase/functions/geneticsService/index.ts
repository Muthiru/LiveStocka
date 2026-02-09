// Edge Function: Genetics Service
// Endpoints:
//  - GET /get_ancestors?cow_id=&depth=
//  - GET /get_descendants?cow_id=&depth=
//  - POST /check_breeding_compatibility

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

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

// helper: gather ancestors up to depth by iterative queries to avoid recursive SQL
async function fetchAncestors(cowId: string, depth = 5, farm_id?: string) {
  const ancestors: { id: string; relation: string; depth: number }[] = [];
  let frontier = [cowId];
  const seen = new Set<string>();
  for (let d = 1; d <= depth; d++) {
    if (frontier.length === 0) break;
    const next: string[] = [];
    for (const id of frontier) {
      await processCowParents(id, d, ancestors, next, seen, farm_id);
    }
    frontier = next;
  }
  return ancestors;
}

// helper: gather descendants by BFS (up to depth) - iterate querying cows where sire_id or dam_id in frontier
async function fetchDescendants(cowId: string, depth = 5, farm_id?: string) {
  const descendants: { id: string; via: string; depth: number }[] = [];
  let frontier = [cowId];
  const seen = new Set<string>(frontier);
  for (let d = 1; d <= depth; d++) {
    if (frontier.length === 0) break;
    const rows = await getChildrenOfFrontier(frontier, farm_id);
    if (!rows || rows.length === 0) break;
    const next: string[] = [];
    for (const row of rows) {
      processChildRow(row, frontier, d, descendants, next, seen);
    }
    frontier = next;
  }
  return descendants;
}

async function processCowParents(id: string, depth: number, ancestors: { id: string; relation: string; depth: number }[], next: string[], seen: Set<string>, farm_id?: string) {
  const row = await getCowParents(id, farm_id);
  if (!row) return;
  const sire = (row as any).sire_id;
  if (sire && !seen.has(sire)) {
    ancestors.push({ id: sire, relation: 'sire', depth });
    next.push(sire);
    seen.add(sire);
  }
  const dam = (row as any).dam_id;
  if (dam && !seen.has(dam)) {
    ancestors.push({ id: dam, relation: 'dam', depth });
    next.push(dam);
    seen.add(dam);
  }
}

function processChildRow(row: any, frontier: string[], depth: number, descendants: { id: string; via: string; depth: number }[], next: string[], seen: Set<string>) {
  if (seen.has(row.id)) return;
  const via = frontier.includes(row.sire_id) ? 'sire' : 'dam';
  descendants.push({ id: row.id, via, depth });
  next.push(row.id);
  seen.add(row.id);
}

// helper: fetch a cow's sire_id/dam_id
async function getCowParents(id: string, farm_id?: string) {
  const q = supabase.from('cows').select('id,sire_id,dam_id').eq('id', id).limit(1);
  if (farm_id) q.eq('farm_id', farm_id);
  const { data, error } = await q;
  if (error || !data || data.length === 0) return null;
  return data[0];
}

// helper: fetch children where sire_id or dam_id is in frontier
async function getChildrenOfFrontier(frontier: string[], farm_id?: string) {
  const results: Array<{ id: string; sire_id: string | null; dam_id: string | null }> = [];
  if (frontier.length === 0) return results;
  // query by sire
  const q1 = supabase.from('cows').select('id,sire_id,dam_id').in('sire_id', frontier);
  if (farm_id) q1.eq('farm_id', farm_id);
  const { data: bySire, error: e1 } = await q1;
  if (e1) { console.error('children by sire query failed', e1); }
  if (bySire && bySire.length) results.push(...bySire as any);
  // query by dam
  const q2 = supabase.from('cows').select('id,sire_id,dam_id').in('dam_id', frontier);
  if (farm_id) q2.eq('farm_id', farm_id);
  const { data: byDam, error: e2 } = await q2;
  if (e2) { console.error('children by dam query failed', e2); }
  if (byDam && byDam.length) results.push(...byDam as any);
  return results;
}

async function handleGetAncestors(req: Request) {
  const url = new URL(req.url);
  const cow_id = url.searchParams.get('cow_id');
  const depth = Number.parseInt(url.searchParams.get('depth') || '5', 10);
  if (!cow_id) return jsonResponse({ error: 'cow_id_required' }, 400);
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;
  const ancestors = await fetchAncestors(cow_id, depth, farm_id);
  return jsonResponse({ ancestors });
}

async function handleGetDescendants(req: Request) {
  const url = new URL(req.url);
  const cow_id = url.searchParams.get('cow_id');
  const depth = Number.parseInt(url.searchParams.get('depth') || '5', 10);
  if (!cow_id) return jsonResponse({ error: 'cow_id_required' }, 400);
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;
  const descendants = await fetchDescendants(cow_id, depth, farm_id);
  return jsonResponse({ descendants });
}

async function handleCheckBreedingCompatibility(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body || !body.cow_id || !body.sire_id) return jsonResponse({ error: 'cow_id_and_sire_id_required' }, 400);
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const a1 = await fetchAncestors(body.cow_id, 5, farm_id);
  const a2 = await fetchAncestors(body.sire_id, 5, farm_id);
  const set1 = new Set(a1.map(a => a.id));
  const set2 = new Set(a2.map(a => a.id));
  const intersection = [...set1].filter(x => set2.has(x));

  const compatible = intersection.length === 0;
  return jsonResponse({ compatible, shared_ancestors: intersection });
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'GET' && path.endsWith('/get_ancestors')) return handleGetAncestors(req);
  if (req.method === 'GET' && path.endsWith('/get_descendants')) return handleGetDescendants(req);
  if (req.method === 'POST' && path.endsWith('/check_breeding_compatibility')) return handleCheckBreedingCompatibility(req);
  return new Response('Not found', { status: 404, headers: corsHeaders });
});
