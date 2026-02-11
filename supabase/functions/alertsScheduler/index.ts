// Edge Function: Alerts Scheduler
// Runs as a scheduled job (every 5 minutes) using the service role key.
// Detects: breeding window openings (creates window_open/window_close alerts)
//          overdue pregnancy checks (creates pregnancy_check alerts)
// Idempotent: checks for existing alerts before inserting.

import { serve } from "https://deno.land/std@0.170.0/http/server.ts";
import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

// Create alerts for heat events that don't yet have window_open alerts
async function scheduleWindowAlerts() {
  const inserted: Array<any> = [];
  // limit lookback to last 30 days to bound work
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
  const { data: heats, error: hErr } = await supabase.from('heat_events').select('id,cow_id,event_time,farm_id').gte('event_time', since);
  if (hErr) throw hErr;
  if (!heats) return inserted;

  for (const heat of heats) {
    const { data: existing } = await supabase.from('breeding_alerts').select('id').eq('related_event_id', heat.id).eq('alert_type', 'window_open').limit(1);
    if (existing && existing.length > 0) continue;

    const eventTime = new Date(heat.event_time);
    const alerts = [
      { farm_id: heat.farm_id, cow_id: heat.cow_id, alert_type: 'window_open', alert_time: eventTime.toISOString(), status: 'pending', related_event_id: heat.id },
      { farm_id: heat.farm_id, cow_id: heat.cow_id, alert_type: 'window_close', alert_time: new Date(eventTime.getTime() + 3 * 24 * 3600 * 1000).toISOString(), status: 'pending', related_event_id: heat.id }
    ];

    const { data: ins, error: insErr } = await supabase.from('breeding_alerts').insert(alerts).select('id');
    if (insErr) {
      console.error('failed inserting window alerts for heat', heat.id, insErr);
      continue;
    }
    inserted.push({ heat_id: heat.id, inserted: ins?.length || 0 });
  }
  return inserted;
}

// Create pregnancy_check alerts for breeding_attempts older than 30 days with no pregnancy_checks
async function scheduleOverduePregnancyChecks() {
  const inserted: Array<any> = [];
  const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const { data: attempts, error: aErr } = await supabase.from('breeding_attempts').select('id,cow_id,attempt_time,farm_id').lte('attempt_time', cutoff).limit(1000);
  if (aErr) throw aErr;
  if (!attempts) return inserted;

  for (const att of attempts) {
    // skip if a pregnancy_check exists
    const { data: checks } = await supabase.from('pregnancy_checks').select('id').eq('breeding_attempt_id', att.id).limit(1);
    if (checks && checks.length > 0) continue;

    // skip if a pregnancy_check alert already exists
    const { data: existing } = await supabase.from('breeding_alerts').select('id').eq('related_event_id', att.id).eq('alert_type', 'pregnancy_check').limit(1);
    if (existing && existing.length > 0) continue;

    const attemptTime = new Date(att.attempt_time);
    const checkDate = new Date(attemptTime.getTime() + 30 * 24 * 3600 * 1000);

    const { data: ins, error: insErr } = await supabase.from('breeding_alerts').insert({ farm_id: att.farm_id, cow_id: att.cow_id, alert_type: 'pregnancy_check', alert_time: checkDate.toISOString(), status: 'pending', related_event_id: att.id }).select('id');
    if (insErr) { console.error('failed inserting pregnancy_check alert for attempt', att.id, insErr); continue; }
    inserted.push({ attempt_id: att.id, inserted: ins?.length || 0 });
  }

  return inserted;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }
  try {
    const windows = await scheduleWindowAlerts();
    const preg = await scheduleOverduePregnancyChecks();
    return jsonResponse({ scheduled_windows: windows.length, scheduled_pregnancy_checks: preg.length });
  } catch (e) {
    console.error('alertsScheduler failed', e);
    return jsonResponse({ error: 'job_failed', detail: String(e) }, 500);
  }
});

// Cron / Scheduling examples
//
// 1) Supabase Scheduled Job (recommended)
// - In Supabase Dashboard → Edge Functions → Schedule a new job:
//   - URL: your function URL (or choose the function)
//   - Method: POST
//   - Headers: Authorization: Bearer <SERVICE_ROLE_KEY> (or use built-in schedule->function pairing)
//   - Cron expression: "*/5 * * * *" (every 5 minutes)
//
// 2) Standard crontab calling function URL (server or machine):
// */5 * * * * curl -s -X POST -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" https://<project>.functions.supabase.co/alertsScheduler
//
// Security: use the service role key as a secret, do NOT commit it to the repo. Prefer `npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`.
