// Edge Function: readService
// Provides SSR-safe read endpoints for frontend components
// UPDATED: Removed authorization requirements for public endpoints

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createEdgeHelpers } from '../_shared/http.ts';

const { supabase, jsonResponse } = createEdgeHelpers();

interface BreedingAttemptRow {
  id: string;
  attempt_time: string;
  method?: string | null;
  notes?: string | null;
  cow_id: string;
  sire_id?: string | null;
}

interface CowRow {
  id: string;
  name?: string | null;
  tag_id?: string | null;
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

  const { data, error } = await supabase
    .from('breeding_attempts')
    .select('id,attempt_time,method,notes,cow_id,sire_id')
    .eq('cow_id', cow_id)
    .order('attempt_time', { ascending: false })
    .limit(200);
  if (error) return jsonResponse({ error: error.message }, 500);

  const attemptsData: BreedingAttemptRow[] = (data || []) as BreedingAttemptRow[];

  // Fetch sire details separately to avoid ambiguous relationship
  const sireIds: string[] = [];
  for (const attempt of attemptsData) {
    if (attempt.sire_id) sireIds.push(attempt.sire_id);
  }
  let sireMap: Record<string, CowRow> = {};
  if (sireIds.length > 0) {
    const { data: sires } = await supabase
      .from('cows')
      .select('id,name,tag_id')
      .in('id', sireIds);
    const sireRows: CowRow[] = (sires || []) as CowRow[];
    sireMap = Object.fromEntries(sireRows.map((sire: CowRow) => [sire.id, sire] as const));
  }

  const attempts = attemptsData.map((attempt: BreedingAttemptRow) => ({
    ...attempt,
    sire: attempt.sire_id ? sireMap[attempt.sire_id] : null
  }));

  return jsonResponse({ attempts });
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = '/' + url.pathname.split('/').filter(Boolean).join('/');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'GET' && path.endsWith('/bulls')) return handleBulls(req);
  if (req.method === 'GET' && path.endsWith('/breeding_history')) return handleBreedingHistory(req);
  return new Response('Not found', { status: 404, headers: corsHeaders });
});
