-- View: v_active_breeding_windows
-- Purpose: Expose current and upcoming breeding windows derived from heat events.
-- Notes / assumptions:
--  - A conservative breeding window is defined as [event_time, event_time + 3 days].
--    This is a configurable convention and can be adjusted in functions/edge-logic,
--    but it is computed here (view contains all derived date logic).
--  - `status` = 'open' | 'upcoming' | 'closed'.
--  - `urgency_level` raises 'urgent' when the open window has <= 24 hours left.
--  - All calculations are read-only and preserve `farm_id` for RLS.

-- SECURITY DEFINER removed for safety; default is SECURITY INVOKER
DROP VIEW IF EXISTS v_active_breeding_windows CASCADE;
CREATE OR REPLACE VIEW v_active_breeding_windows
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
  -- seconds until window end (negative when already closed)
  EXTRACT(EPOCH FROM ((he.event_time + INTERVAL '3 days') - now())) AS seconds_to_window_end
FROM heat_events he
WHERE he.deleted_at IS NULL;

COMMENT ON VIEW v_active_breeding_windows IS 'Breeding window per heat_event (3-day window, urgency flags).';
