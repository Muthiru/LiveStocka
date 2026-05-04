-- Migration: Fix Security Definer Views (REVISED)
-- Description: Updates views to use SECURITY INVOKER property.
-- Uses DROP VIEW ... CASCADE to avoid redefinition errors.
-- Date: 2026-02-19

BEGIN;

-- 1. v_breeding_success_rates
DROP VIEW IF EXISTS public.v_breeding_success_rates CASCADE;
CREATE VIEW public.v_breeding_success_rates
WITH (security_invoker = true)
AS
SELECT
  ba.farm_id,
  ba.sire_id,
  COUNT(*)::int AS attempts,
  SUM(CASE WHEN (
        EXISTS (
          SELECT 1 FROM pregnancy_checks pc
          WHERE pc.breeding_attempt_id = ba.id
            AND pc.deleted_at IS NULL
            AND pc.result ILIKE '%preg%'
        ) )
      THEN 1 ELSE 0 END) AS successful_attempts,
  CASE WHEN COUNT(*) = 0 THEN NULL
       ELSE ROUND(100.0 * SUM(CASE WHEN (
             EXISTS (
               SELECT 1 FROM pregnancy_checks pc2
               WHERE pc2.breeding_attempt_id = ba.id
                 AND pc2.deleted_at IS NULL
                 AND pc2.result ILIKE '%preg%'
             ) ) THEN 1 ELSE 0 END) / COUNT(*)::numeric, 2)
  END AS success_percent
FROM breeding_attempts ba
WHERE ba.deleted_at IS NULL
GROUP BY ba.farm_id, ba.sire_id;

-- 2. v_active_breeding_windows
DROP VIEW IF EXISTS public.v_active_breeding_windows CASCADE;
CREATE VIEW public.v_active_breeding_windows
WITH (security_invoker = true)
AS
SELECT
  he.id AS heat_event_id,
  he.farm_id,
  he.cow_id,
  he.event_time AS window_start,
  (he.event_time + INTERVAL '3 days') AS window_end,
  CASE
    WHEN now() BETWEEN he.event_time AND (he.event_time + INTERVAL '3 days') THEN 'open'
    WHEN now() < he.event_time THEN 'upcoming'
    ELSE 'closed'
  END AS status,
  CASE
    WHEN now() BETWEEN he.event_time AND (he.event_time + INTERVAL '3 days')
         AND ((he.event_time + INTERVAL '3 days') - now()) <= INTERVAL '24 hours' THEN 'urgent'
    WHEN now() BETWEEN he.event_time AND (he.event_time + INTERVAL '3 days') THEN 'normal'
    WHEN now() < he.event_time THEN 'upcoming'
    ELSE 'closed'
  END AS urgency_level,
  EXTRACT(EPOCH FROM ((he.event_time + INTERVAL '3 days') - now())) AS seconds_to_window_end
FROM heat_events he
WHERE he.deleted_at IS NULL;

-- 3. upcoming_health_events
DROP VIEW IF EXISTS public.upcoming_health_events CASCADE;
CREATE VIEW public.upcoming_health_events
WITH (security_invoker = true)
AS
SELECT 
  hr.id,
  hr.cow_id,
  hr.farm_id,
  hr.record_type,
  hr.title,
  hr.next_due_date,
  c.name as cow_name,
  c.tag_id
FROM health_records hr
JOIN cows c ON hr.cow_id = c.id
WHERE hr.next_due_date >= CURRENT_DATE
  AND hr.next_due_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY hr.next_due_date ASC;

-- 4. v_pending_pregnancy_checks
DROP VIEW IF EXISTS public.v_pending_pregnancy_checks CASCADE;
CREATE VIEW public.v_pending_pregnancy_checks
WITH (security_invoker = true)
AS
SELECT
  ba.id AS breeding_attempt_id,
  ba.farm_id,
  ba.cow_id,
  c.name AS cow_name,
  c.tag_id AS cow_tag_id,
  ba.attempt_time,
  (ba.attempt_time + INTERVAL '30 days') AS recommended_check_date,
  CASE WHEN now() > (ba.attempt_time + INTERVAL '30 days')
       THEN EXTRACT(DAY FROM (now() - (ba.attempt_time + INTERVAL '30 days')))
       ELSE 0 END AS days_overdue,
  NOT EXISTS (
    SELECT 1 FROM pregnancy_checks pc
    WHERE pc.breeding_attempt_id = ba.id AND pc.deleted_at IS NULL
  ) AS is_pending
FROM breeding_attempts ba
LEFT JOIN cows c ON c.id = ba.cow_id
WHERE ba.deleted_at IS NULL;

-- 5. v_expected_heats
DROP VIEW IF EXISTS public.v_expected_heats CASCADE;
CREATE VIEW public.v_expected_heats
WITH (security_invoker = true)
AS
SELECT
  h.cow_id,
  c.farm_id,
  h.last_heat,
  h.avg_cycle_days,
  CASE WHEN h.avg_cycle_days IS NOT NULL
       THEN (h.last_heat + (h.avg_cycle_days || ' days')::interval)
       ELSE NULL END AS expected_heat,
  CASE WHEN h.avg_cycle_days IS NOT NULL
       THEN EXTRACT(EPOCH FROM ((h.last_heat + (h.avg_cycle_days || ' days')::interval) - now()))
       ELSE NULL END AS seconds_until_expected
FROM (
  SELECT
    he.cow_id,
    MAX(he.event_time) AS last_heat,
    AVG(EXTRACT(EPOCH FROM (he.event_time - lag_event.prev_event)) / 86400.0) AS avg_cycle_days
  FROM (
    SELECT
      cow_id,
      event_time,
      LAG(event_time) OVER (PARTITION BY cow_id ORDER BY event_time) AS prev_event
    FROM heat_events
    WHERE deleted_at IS NULL
  ) AS lag_event
  JOIN heat_events he
    ON he.cow_id = lag_event.cow_id AND he.event_time = lag_event.event_time
  WHERE lag_event.prev_event IS NOT NULL
  GROUP BY he.cow_id
) h
LEFT JOIN cows c ON c.id = h.cow_id;

COMMIT;
