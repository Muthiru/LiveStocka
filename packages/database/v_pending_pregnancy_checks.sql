-- View: v_pending_pregnancy_checks
-- Purpose: List breeding attempts which require (or are overdue for) a pregnancy check.
-- Notes / assumptions:
--  - Recommended pregnancy-check date is computed as attempt_time + 30 days.
--    (This is a convention; the value can be adjusted in backend scheduled logic.)
--  - An attempt is considered pending if there are no associated pregnancy_checks records.
--  - `days_overdue` is positive when recommended_check_date < now().
--  - All computations are read-only and preserve farm_id for RLS enforcement.

-- SECURITY DEFINER removed for safety; default is SECURITY INVOKER
CREATE OR REPLACE VIEW v_pending_pregnancy_checks AS
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
  -- pending flag: true if there are no pregnancy_checks for this attempt
  NOT EXISTS (
    SELECT 1 FROM pregnancy_checks pc
    WHERE pc.breeding_attempt_id = ba.id AND pc.deleted_at IS NULL
  ) AS is_pending
FROM breeding_attempts ba
LEFT JOIN cows c ON c.id = ba.cow_id
WHERE ba.deleted_at IS NULL;

COMMENT ON VIEW v_pending_pregnancy_checks IS 'Breeding attempts with no pregnancy check yet; includes recommended date and overdue days.';
