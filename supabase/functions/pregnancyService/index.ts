// Edge Function: Pregnancy Service
// Endpoints:
//  - POST /record_pregnancy_result
//  - POST /update_cow_status
//  - POST /schedule_calving_or_next_heat_alert

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

async function handleRecordPregnancyResult(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body || !body.breeding_attempt_id || !body.result) return jsonResponse({ error: 'breeding_attempt_id_and_result_required' }, 400);
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const { data: attempts, error: aErr } = await supabase.from('breeding_attempts').select('id,cow_id,attempt_time').eq('id', body.breeding_attempt_id).eq('farm_id', farm_id).limit(1);
  if (aErr) { console.error('breeding_attempts lookup failed', aErr); return jsonResponse({ error: 'db_error', detail: aErr.message }, 500); }
  if (!attempts || attempts.length === 0) return jsonResponse({ error: 'attempt_not_found' }, 404);
  const attempt = attempts[0];

  const checkTime = body.check_time ? new Date(body.check_time) : new Date();
  const { data: existing } = await supabase.from('pregnancy_checks').select('id').eq('breeding_attempt_id', attempt.id).eq('check_time', checkTime.toISOString()).limit(1);
  if (existing && existing.length > 0) return jsonResponse({ existing: true });

  const insert = { farm_id, cow_id: attempt.cow_id, breeding_attempt_id: attempt.id, check_time: checkTime.toISOString(), result: body.result, checked_by: body.checked_by || null, notes: body.notes || null };
  const { data, error: insErr } = await supabase.from('pregnancy_checks').insert(insert).select('id').limit(1);
  if (insErr) { console.error('pregnancy_checks insert failed', insErr); return jsonResponse({ error: 'insert_failed', detail: insErr.message }, 500); }

  const pcId = data?.[0]?.id;
  if (body.result.toLowerCase().includes('preg')) {
    await markPregnantAndScheduleCalving(attempt.cow_id, attempt.id, checkTime, farm_id);
  } else {
    await markOpenAndScheduleExpectedHeat(attempt.cow_id, attempt.id, farm_id);
  }

  return jsonResponse({ id: pcId });
}

async function markPregnantAndScheduleCalving(cow_id: string, attempt_id: string, checkTime: Date, farm_id: string) {
  const { error: upErr } = await supabase.from('cows').update({ status: 'pregnant' }).eq('id', cow_id).eq('farm_id', farm_id);
  if (upErr) console.error('mark pregnant update failed', upErr);
  const calvingDate = new Date(checkTime.getTime() + 280 * 24 * 3600 * 1000);
  const { error: calErr } = await supabase.from('breeding_alerts').insert({ farm_id, cow_id, alert_type: 'calving', alert_time: calvingDate.toISOString(), status: 'pending', related_event_id: attempt_id });
  if (calErr) console.error('calving alert insert failed', calErr);
}

async function markOpenAndScheduleExpectedHeat(cow_id: string, attempt_id: string, farm_id: string) {
  const { error: upErr } = await supabase.from('cows').update({ status: 'open' }).eq('id', cow_id).eq('farm_id', farm_id);
  if (upErr) console.error('mark open update failed', upErr);
  try {
    const { data: v, error: vErr } = await supabase.from('v_expected_heats').select('expected_heat').eq('cow_id', cow_id).limit(1);
    if (vErr) { console.error('v_expected_heats lookup failed', vErr); return; }
    const expected = v?.[0]?.expected_heat;
    if (expected) {
      const { error: expErr } = await supabase.from('breeding_alerts').insert({ farm_id, cow_id, alert_type: 'expected_heat', alert_time: expected, status: 'pending', related_event_id: attempt_id });
      if (expErr) console.error('expected_heat insert failed', expErr);
    }
  } catch (e) {
    console.error('v_expected_heats query failed', e);
  }
}

async function handleUpdateCowStatus(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body || !body.cow_id || !body.status) return jsonResponse({ error: 'cow_id_and_status_required' }, 400);
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const allowed = ['pregnant', 'open', 'calved', 'inactive'];
  if (!allowed.includes(body.status)) return jsonResponse({ error: 'invalid_status' }, 400);

  const { error: upErr } = await supabase.from('cows').update({ status: body.status }).eq('id', body.cow_id).eq('farm_id', farm_id);
  if (upErr) { console.error('cow status update failed', upErr); return jsonResponse({ error: 'update_failed', detail: upErr.message }, 500); }
  return jsonResponse({ updated: true });
}

async function handleScheduleCalvingOrNextHeatAlert(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body || !body.cow_id) return jsonResponse({ error: 'cow_id_required' }, 400);
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  if (body.pregnancy_result && body.pregnancy_result.toLowerCase().includes('preg')) {
    const refDate = body.check_time ? new Date(body.check_time) : new Date();
    const calvingDate = new Date(refDate.getTime() + 280 * 24 * 3600 * 1000);
    const { error: insErr } = await supabase.from('breeding_alerts').insert({ farm_id, cow_id: body.cow_id, alert_type: 'calving', alert_time: calvingDate.toISOString(), status: 'pending', related_event_id: body.related_event_id || null });
    if (insErr) { console.error('calving alert insert failed', insErr); return jsonResponse({ error: 'insert_failed', detail: insErr.message }, 500); }
    return jsonResponse({ scheduled: true, calving_date: calvingDate.toISOString() });
  }

  try {
    const { data: v } = await supabase.from('v_expected_heats').select('expected_heat').eq('cow_id', body.cow_id).limit(1);
    const expected = v?.[0]?.expected_heat;
    if (expected) {
      const { error: insErr } = await supabase.from('breeding_alerts').insert({ farm_id, cow_id: body.cow_id, alert_type: 'expected_heat', alert_time: expected, status: 'pending', related_event_id: body.related_event_id || null });
      if (insErr) { console.error('expected_heat insert failed', insErr); return jsonResponse({ error: 'insert_failed', detail: insErr.message }, 500); }
      return jsonResponse({ scheduled: true, expected_heat: expected });
    }
  } catch (e) {
    console.error('v_expected_heats query failed', e);
    return jsonResponse({ error: 'view_error' }, 500);
  }

  return jsonResponse({ scheduled: false, reason: 'no_expected_heat' });
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'POST' && path.endsWith('/record_pregnancy_result')) return handleRecordPregnancyResult(req);
  if (req.method === 'POST' && path.endsWith('/update_cow_status')) return handleUpdateCowStatus(req);
  if (req.method === 'POST' && path.endsWith('/schedule_calving_or_next_heat_alert')) return handleScheduleCalvingOrNextHeatAlert(req);
  return new Response('Not found', { status: 404, headers: corsHeaders });
});
