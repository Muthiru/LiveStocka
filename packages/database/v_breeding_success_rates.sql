-- View: v_breeding_success_rates
-- Purpose: Aggregate breeding attempt success metrics for monitoring and dashboards.
-- Notes / assumptions:
--  - Success is inferred when an associated pregnancy_check contains a result
--    that matches ILIKE '%preg%'. This is intentionally permissive to match
--    varying result values like 'pregnant' or 'positive'. Adjust the pattern
--    later if your codebase uses stricter enumeration values.
--  - The view provides per-farm and per-sire aggregated metrics. Grouping by
--    `sire_id` is useful for evaluating bull/sire performance; absence of a
--    sire will show as NULL.
--  - The view is read-only and uses EXISTS-subqueries to correctly treat
--    attempts with multiple checks: an attempt counts as successful if any
--    associated check indicates pregnancy.

-- SECURITY DEFINER removed for safety; default is SECURITY INVOKER
CREATE OR REPLACE VIEW v_breeding_success_rates AS
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

COMMENT ON VIEW v_breeding_success_rates IS 'Aggregated breeding success (per farm, per sire). Success detected by pregnancy_check result ILIKE ''%preg%''.';
