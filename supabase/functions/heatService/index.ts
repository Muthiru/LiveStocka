// Edge Function: Heat Service
// Exposes endpoints:
//  - POST /validate_heat_event
//  - POST /create_heat_event
//  - POST /schedule_breeding_alerts
// Strict validation and idempotency applied.

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

// Route handlers
async function handleValidateHeatEvent(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body || !body.cow_id) return jsonResponse({ error: 'cow_id_required' }, 400);
  const auth = await getUserAndFarm(req);
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
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const { data: cows, error: cowErr } = await supabase.from('cows').select('id').eq('id', body.cow_id).eq('farm_id', farm_id).limit(1);
  if (cowErr) return jsonResponse({ error: 'db_error', detail: cowErr.message }, 500);
  if (!cows || cows.length === 0) return jsonResponse({ error: 'cow_not_found_or_no_access' }, 404);

  const heatDetectedAt = body.event_time ? new Date(body.event_time) : new Date();
  if (Number.isNaN(heatDetectedAt.getTime())) return jsonResponse({ error: 'invalid_event_time' }, 400);

  const { data: existing } = await supabase.from('heat_events').select('id').eq('cow_id', body.cow_id).eq('heat_detected_at', heatDetectedAt.toISOString()).limit(1);
  if (existing && existing.length > 0) return jsonResponse({ id: existing[0].id, already_existed: true });

  const insert = { farm_id, cow_id: body.cow_id, heat_detected_at: heatDetectedAt.toISOString(), intensity: body.intensity || null, signs: body.signs || null, detected_by: body.detected_by || null, notes: body.notes || null };
  const { data, error: insertErr } = await supabase.from('heat_events').insert(insert).select('id').limit(1);
  if (insertErr) return jsonResponse({ error: 'insert_failed', detail: insertErr.message }, 500);

  const heatId = data?.[0]?.id;

  // Synced Health Record
  try {
    const signsText = body.signs && body.signs.length > 0 ? ` Signs: ${body.signs.join(', ')}.` : '';
    const healthInsert = {
      farm_id,
      cow_id: body.cow_id,
      record_type: 'other',
      title: 'Reproduction: Heat Detected',
      description: `Heat intensity: ${body.intensity || 'unspecified'}.${signsText}`,
      record_date: heatDetectedAt.toISOString().split('T')[0],
      record_time: heatDetectedAt.toTimeString().split(' ')[0],
      notes: body.notes || null,
      created_at: new Date().toISOString()
    };
    await supabase.from('health_records').insert(healthInsert);
  } catch (e) {
    console.error('Failed to create synced health record for heat', e);
  }

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
  const auth = await getUserAndFarm(req);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  const { data: heats, error: heatErr } = await supabase.from('heat_events').select('id, cow_id, heat_detected_at').eq('id', body.heat_event_id).eq('farm_id', farm_id).limit(1);
  if (heatErr) return jsonResponse({ error: 'db_error', detail: heatErr.message }, 500);
  if (!heats || heats.length === 0) return jsonResponse({ error: 'heat_event_not_found' }, 404);

  const heat = heats[0];
  const heatDetectedAt = new Date(heat.heat_detected_at);
  const alerts = [
    { alert_type: 'window_open', alert_time: heatDetectedAt.toISOString(), status: 'pending', related_event_id: heat.id },
    { alert_type: 'window_close', alert_time: new Date(heatDetectedAt.getTime() + 3 * 24 * 3600 * 1000).toISOString(), status: 'pending', related_event_id: heat.id }
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
