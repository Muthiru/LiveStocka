-- View: v_expected_heats
-- Purpose: Estimate each cow's next expected heat based on historical heat_events.
-- Notes / assumptions:
--  - Uses the average interval between consecutive heat events per cow.
--  - If a cow has fewer than 2 recorded heat events, `avg_cycle_days` and `expected_heat`
--    will be NULL (no implicit/default cycle length is assumed).
--  - All timestamp calculations use `timestamptz` and `now()` (UTC in DB).
--  - This view performs only read operations and is safe for RLS (farm_id preserved).

-- SECURITY DEFINER removed for safety; default is SECURITY INVOKER
DROP VIEW IF EXISTS v_expected_heats CASCADE;
CREATE OR REPLACE VIEW v_expected_heats
WITH (security_invoker = true)
AS
SELECT
  h.cow_id,
  c.farm_id,
  h.last_heat,
  h.avg_cycle_days,
  -- expected_heat is null when avg_cycle_days is null
  CASE WHEN h.avg_cycle_days IS NOT NULL
       THEN (h.last_heat + (h.avg_cycle_days || ' days')::interval)
       ELSE NULL END AS expected_heat,
  -- seconds until expected heat (can be negative when overdue)
  CASE WHEN h.avg_cycle_days IS NOT NULL
       THEN EXTRACT(EPOCH FROM ((h.last_heat + (h.avg_cycle_days || ' days')::interval) - now()))
       ELSE NULL END AS seconds_until_expected
FROM (
  -- compute last heat and average cycle in days per cow
  SELECT
    he.cow_id,
    MAX(he.event_time) AS last_heat,
    -- average interval between consecutive heats in days
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
LEFT JOIN cows c ON c.id = h.cow_id
;

COMMENT ON VIEW v_expected_heats IS 'Estimates next heat per cow using historical heat_events (avg interval).';
