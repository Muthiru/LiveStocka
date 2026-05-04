/// <reference path="../_shim.d.ts" />

// Edge Function: Breeding Service
// Endpoints:
//  - POST /validate_breeding_attempt
//  - POST /calculate_attempt_number
//  - POST /schedule_pregnancy_check_alert

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createEdgeHelpers, getRequiredEnv } from '../_shared/http.ts';

const { supabase, jsonResponse, getUserAndFarm } = createEdgeHelpers();
const SUPABASE_URL = getRequiredEnv('SUPABASE_URL');

async function handleValidateBreedingAttempt(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body?.cow_id || !body?.heat_event_id) return jsonResponse({ error: 'cow_id_and_heat_event_id_required' }, 400);
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const [{ data: cows, error: cErr }, { data: heats, error: hErr }] = await Promise.all([
    supabase.from('cows').select('id').eq('id', body.cow_id).eq('farm_id', farm_id).limit(1),
    supabase.from('heat_events').select('id,event_time').eq('id', body.heat_event_id).eq('farm_id', farm_id).limit(1)
  ]);
  if (cErr || hErr) { console.error('db error', cErr || hErr); return jsonResponse({ error: 'db_error' }, 500); }
  if (!cows?.length) return jsonResponse({ error: 'cow_not_found_or_no_access' }, 404);
  if (!heats?.length) return jsonResponse({ error: 'heat_event_not_found' }, 404);

  const { data: windows, error: wErr } = await supabase.from('v_active_breeding_windows').select('*').eq('heat_event_id', body.heat_event_id).limit(1);
  if (wErr) { console.error('v_active_breeding_windows lookup failed', wErr); return jsonResponse({ error: 'db_error', detail: wErr.message }, 500); }
  if (!windows || windows.length === 0) return jsonResponse({ error: 'no_breeding_window' }, 400);
  const win = windows[0];
  if (win.status !== 'open') return jsonResponse({ error: 'breeding_window_not_open', status: win.status }, 400);

  return jsonResponse({ valid: true });
}

async function handleCalculateAttemptNumber(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body?.cow_id) return jsonResponse({ error: 'cow_id_required' }, 400);
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const q = supabase.from('breeding_attempts').select('id', { count: 'exact' }).eq('cow_id', body.cow_id).eq('farm_id', farm_id);
  if (body.heat_event_id) q.eq('heat_event_id', body.heat_event_id);
  const { count, error } = await q;
  if (error) { console.error('count query failed', error); return jsonResponse({ error: 'db_error', detail: error.message }, 500); }
  const next = (count || 0) + 1;
  return jsonResponse({ attempt_number: next });
}

async function handleSchedulePregnancyCheckAlert(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body?.breeding_attempt_id) return jsonResponse({ error: 'breeding_attempt_id_required' }, 400);
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const { data: attempts, error: aErr } = await supabase.from('breeding_attempts').select('id, cow_id, attempt_time').eq('id', body.breeding_attempt_id).eq('farm_id', farm_id).limit(1);
  if (aErr) { console.error('breeding_attempts lookup failed', aErr); return jsonResponse({ error: 'db_error', detail: aErr.message }, 500); }
  if (!attempts?.length) return jsonResponse({ error: 'attempt_not_found' }, 404);

  const att = attempts[0];
  const attemptTime = new Date(att.attempt_time);
  const checkDate = new Date(attemptTime.getTime() + 30 * 24 * 3600 * 1000);

  const { data: existing } = await supabase.from('breeding_alerts').select('id').eq('related_event_id', att.id).eq('alert_type', 'pregnancy_check').limit(1);
  if (existing && existing.length > 0) return jsonResponse({ scheduled: false, reason: 'already_scheduled' });

  const { error: insErr } = await supabase.from('breeding_alerts').insert({ farm_id, cow_id: att.cow_id, alert_type: 'pregnancy_check', alert_time: checkDate.toISOString(), status: 'pending', related_event_id: att.id });
  if (insErr) { console.error('insert failed', insErr); return jsonResponse({ error: 'insert_failed', detail: insErr.message }, 500); }

  return jsonResponse({ scheduled: true, check_date: checkDate.toISOString() });
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'POST' && path.endsWith('/validate_breeding_attempt')) return handleValidateBreedingAttempt(req);
  if (req.method === 'POST' && path.endsWith('/calculate_attempt_number')) return handleCalculateAttemptNumber(req);
  if (req.method === 'POST' && path.endsWith('/schedule_pregnancy_check_alert')) return handleSchedulePregnancyCheckAlert(req);
  return new Response('Not found', { status: 404, headers: corsHeaders });
});
