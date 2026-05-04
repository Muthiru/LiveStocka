// Edge Function: Pregnancy Result Service
// Records pregnancy check results
// Endpoint: POST /record_pregnancy_result

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createEdgeHelpers } from '../_shared/http.ts';

const { supabase, jsonResponse, getUserAndFarm } = createEdgeHelpers();

async function handleRecordPregnancyResult(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body?.breeding_attempt_id || !body?.result) {
    return jsonResponse({ error: 'breeding_attempt_id_and_result_required' }, 400);
  }
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  // Verify breeding attempt belongs to this farm and get cow_id
  const { data: attempts, error: attErr } = await supabase
    .from('breeding_attempts')
    .select('id,cow_id,attempt_time')
    .eq('id', body.breeding_attempt_id)
    .eq('farm_id', farm_id)
    .limit(1);

  if (attErr) return jsonResponse({ error: 'db_error', detail: attErr.message }, 500);
  if (!attempts || attempts.length === 0) {
    return jsonResponse({ error: 'breeding_attempt_not_found_or_no_access' }, 404);
  }

  const attempt = attempts[0];
  const checkTime = body.check_time ? new Date(body.check_time) : new Date();
  if (Number.isNaN(checkTime.getTime())) return jsonResponse({ error: 'invalid_check_time' }, 400);

  // Validate result value
  const validResults = ['pregnant', 'open', 'inconclusive'];
  if (!validResults.includes(body.result)) {
    return jsonResponse({ error: 'invalid_result_value', valid_values: validResults }, 400);
  }

  const insert = {
    farm_id,
    cow_id: attempt.cow_id,
    breeding_attempt_id: body.breeding_attempt_id,
    check_time: checkTime.toISOString(),
    result: body.result,
    checked_by: body.checked_by || null,
    notes: body.notes || null
  };

  const { data, error: insertErr } = await supabase.from('pregnancy_checks').insert(insert).select('id').limit(1);
  if (insertErr) return jsonResponse({ error: 'insert_failed', detail: insertErr.message }, 500);

  return jsonResponse({ id: data?.[0]?.id });
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'POST' && path.endsWith('/record_pregnancy_result')) return handleRecordPregnancyResult(req);
  return new Response('Not found', { status: 404, headers: corsHeaders });
});
