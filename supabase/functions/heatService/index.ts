// Edge Function: Heat Service
// Exposes endpoints:
//  - POST /validate_heat_event
//  - POST /create_heat_event
//  - POST /schedule_breeding_alerts
// Strict validation and idempotency applied.

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createEdgeSupabaseClient, getRequiredEnv, getUserAndFarm, jsonResponse } from '../_shared/http.ts';

const supabase = createEdgeSupabaseClient();
const SUPABASE_URL = getRequiredEnv('SUPABASE_URL');

// Route handlers
async function handleValidateHeatEvent(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body || !body.cow_id) return jsonResponse({ error: 'cow_id_required' }, 400);
  const auth = await getUserAndFarm(req, supabase);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const { data: cows, error } = await supabase.from('cows').select('id,deleted_at').eq('id', body.cow_id).eq('farm_id', farm_id).limit(1);
  if (error) return jsonResponse({ error: 'db_error', detail: error.message }, 500);
  if (!cows || cows.length === 0) return jsonResponse({ error: 'cow_not_found_or_no_access' }, 404);

  if (body.event_time) {
    const t = Date.parse(body.event_time);
    if (Number.isNaN(t)) return jsonResponse({ error: 'invalid_event_time' }, 400);
    if (t > Date.now() + 5 * 60 * 1000) return jsonResponse({ error: 'event_time_in_future' }, 400);
  }

  return jsonResponse({ valid: true });
}

async function handleCreateHeatEvent(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body || !body.cow_id) return jsonResponse({ error: 'cow_id_required' }, 400);
  const auth = await getUserAndFarm(req, supabase);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const { data: cows, error: cowErr } = await supabase.from('cows').select('id').eq('id', body.cow_id).eq('farm_id', farm_id).limit(1);
  if (cowErr) return jsonResponse({ error: 'db_error', detail: cowErr.message }, 500);
  if (!cows || cows.length === 0) return jsonResponse({ error: 'cow_not_found_or_no_access' }, 404);

  const eventTime = body.event_time ? new Date(body.event_time) : new Date();
  if (Number.isNaN(eventTime.getTime())) return jsonResponse({ error: 'invalid_event_time' }, 400);

  const { data: existing } = await supabase.from('heat_events').select('id').eq('cow_id', body.cow_id).eq('event_time', eventTime.toISOString()).limit(1);
  if (existing && existing.length > 0) return jsonResponse({ id: existing[0].id, already_existed: true });

  const insert = { farm_id, cow_id: body.cow_id, event_time: eventTime.toISOString(), intensity: body.intensity || null, signs: body.signs || null, detected_by: body.detected_by || null, notes: body.notes || null };
  const { data, error: insertErr } = await supabase.from('heat_events').insert(insert).select('id').limit(1);
  if (insertErr) return jsonResponse({ error: 'insert_failed', detail: insertErr.message }, 500);

  const heatId = data?.[0]?.id;
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/heatService/schedule_breeding_alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': req.headers.get('authorization') || '' },
      body: JSON.stringify({ heat_event_id: heatId })
    });
  } catch (e) {
    console.error('schedule_breeding_alerts call failed', e);
  }

  return jsonResponse({ id: heatId });
}

async function handleScheduleBreedingAlerts(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body || !body.heat_event_id) return jsonResponse({ error: 'heat_event_id_required' }, 400);
  const auth = await getUserAndFarm(req, supabase);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const { data: heats, error: heatErr } = await supabase.from('heat_events').select('id, cow_id, event_time').eq('id', body.heat_event_id).eq('farm_id', farm_id).limit(1);
  if (heatErr) return jsonResponse({ error: 'db_error', detail: heatErr.message }, 500);
  if (!heats || heats.length === 0) return jsonResponse({ error: 'heat_event_not_found' }, 404);

  const heat = heats[0];
  const eventTime = new Date(heat.event_time);
  const alerts = [
    { alert_type: 'window_open', alert_time: eventTime.toISOString(), status: 'pending', related_event_id: heat.id },
    { alert_type: 'window_close', alert_time: new Date(eventTime.getTime() + 3 * 24 * 3600 * 1000).toISOString(), status: 'pending', related_event_id: heat.id }
  ];

  for (const a of alerts) {
    const { data: existing, error: exErr } = await supabase.from('breeding_alerts').select('id').eq('related_event_id', heat.id).eq('alert_type', a.alert_type).limit(1);
    if (exErr) { console.error('breeding_alerts select failed', exErr); continue; }
    if (existing && existing.length > 0) continue;
    const { error: insErr } = await supabase.from('breeding_alerts').insert({ farm_id, cow_id: heat.cow_id, ...a });
    if (insErr) console.error('breeding_alerts insert failed', insErr);
  }

  return jsonResponse({ scheduled: true });
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  if (req.method === 'POST' && path.endsWith('/validate_heat_event')) return handleValidateHeatEvent(req);
  if (req.method === 'POST' && path.endsWith('/create_heat_event')) return handleCreateHeatEvent(req);
  if (req.method === 'POST' && path.endsWith('/schedule_breeding_alerts')) return handleScheduleBreedingAlerts(req);
  return new Response('Not found', { status: 404, headers: corsHeaders });
});
