// Edge Function: Breeding Record Service
// Creates breeding attempt records after heat event
// Endpoint: POST /record_breeding_attempt

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { createEdgeSupabaseClient, getRequiredEnv, getUserAndFarm, jsonResponse } from '../_shared/http.ts';

const supabase = createEdgeSupabaseClient();
const breedingServiceBaseUrl = getRequiredEnv('SUPABASE_URL');

async function handleRecordBreedingAttempt(req: Request) {
  const body = await req.json().catch((e) => { console.error('invalid json body', e); return null; });
  if (!body?.cow_id || !body?.heat_event_id || (!body?.sire_id && !body?.sire_name)) {
    return jsonResponse({ error: 'cow_id_heat_event_id_and_sire_required' }, 400);
  }
  const auth = await getUserAndFarm(req, supabase);
  if ('error' in auth) return jsonResponse({ error: auth.error }, 401);
  const { farm_id } = auth as any;

  // Verify cow and heat event belong to this farm
  const [{ data: cows, error: cErr }, { data: heats, error: hErr }] = await Promise.all([
    supabase.from('cows').select('id').eq('id', body.cow_id).eq('farm_id', farm_id).limit(1),
    supabase.from('heat_events').select('id').eq('id', body.heat_event_id).eq('farm_id', farm_id).limit(1)
  ]);
  if (cErr || hErr) return jsonResponse({ error: 'db_error', detail: cErr?.message || hErr?.message }, 500);
  if (!cows || cows.length === 0) return jsonResponse({ error: 'cow_not_found_or_no_access' }, 404);
  if (!heats || heats.length === 0) return jsonResponse({ error: 'heat_event_not_found_or_no_access' }, 404);

  const attemptTimeRaw = body.breeding_timestamp || body.attempt_time;
  const attemptTime = attemptTimeRaw ? new Date(attemptTimeRaw) : new Date();
  if (Number.isNaN(attemptTime.getTime())) return jsonResponse({ error: 'invalid_attempt_time' }, 400);

  const methodValue = body.breeding_method || body.method || 'ai';

  const insert = {
    farm_id,
    cow_id: body.cow_id,
    heat_event_id: body.heat_event_id,
    sire_id: body.sire_id || null,
    sire_name: body.sire_name || null,
    attempt_time: attemptTime.toISOString(),
    breeding_timestamp: attemptTime.toISOString(),
    method: methodValue,
    breeding_method: methodValue,
    semen_batch: body.semen_batch || null,
    technician: body.technician || null,
    bcs: body.bcs || null,
    cost: body.cost || null,
    notes: body.notes || null
  };

  const { data, error: insertErr } = await supabase.from('breeding_attempts').insert(insert).select('id').limit(1);
  if (insertErr) return jsonResponse({ error: 'insert_failed', detail: insertErr.message }, 500);

  const attemptId = data?.[0]?.id;

  // Synced Health Record
  try {
    const sireDisplay = body.sire_name || (body.sire_id ? `Sire ID: ${body.sire_id}` : 'Unspecified');
    const healthInsert = {
      farm_id,
      cow_id: body.cow_id,
      record_type: 'other',
      title: 'Reproduction: Breeding Attempt',
      description: `Method: ${methodValue.toUpperCase()}. Sire: ${sireDisplay}.`,
      record_date: attemptTime.toISOString().split('T')[0],
      record_time: attemptTime.toTimeString().split(' ')[0],
      cost: body.cost || null,
      notes: body.notes || null,
      created_at: new Date().toISOString()
    };
    await supabase.from('health_records').insert(healthInsert);
  } catch (e) {
    console.error('Failed to create synced health record for breeding', e);
  }

  // Schedule pregnancy check alert for 30 days later
  try {
    await fetch(`${breedingServiceBaseUrl}/functions/v1/breedingService/schedule_pregnancy_check_alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': req.headers.get('authorization') || '' },
      body: JSON.stringify({ breeding_attempt_id: attemptId })
    });
  } catch (e) {
    console.error('schedule_pregnancy_check_alert call failed', e);
  }

  return jsonResponse({ id: attemptId });
}

serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname.replace(/\/+$/, '');
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Content-Type': 'text/plain' } });
  }
  if (req.method === 'POST' && path.endsWith('/record_breeding_attempt')) return handleRecordBreedingAttempt(req);
  return new Response('Not found', { status: 404, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, content-type, apikey, x-client-info', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS' } });
});
