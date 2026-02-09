-- ============================================================================
-- INDEXES OPTIMIZATION MIGRATION
-- ============================================================================
-- Purpose:
--   1. Add covering indexes for unindexed foreign keys (12 warnings)
--   2. Remove legacy unused indexes that are never queried (17 warnings)
--
-- IMPORTANT: The newly created foreign key indexes may appear as "unused"
-- in Supabase linter, but this is a false positive. These indexes are
-- ESSENTIAL for foreign key performance and will be heavily used in
-- production once there is actual query traffic and data. Do NOT drop them.
-- ============================================================================

-- ============================================================================
-- PART 1: ADD INDEXES FOR UNINDEXED FOREIGN KEYS
-- ============================================================================

-- breeding_alerts.cow_id_fkey
CREATE INDEX IF NOT EXISTS idx_breeding_alerts_cow_id ON public.breeding_alerts(cow_id);

-- breeding_attempts.farm_id_fkey
CREATE INDEX IF NOT EXISTS idx_breeding_attempts_farm_id ON public.breeding_attempts(farm_id);

-- breeding_attempts.heat_event_id_fkey
CREATE INDEX IF NOT EXISTS idx_breeding_attempts_heat_event_id ON public.breeding_attempts(heat_event_id);

-- genetic_relationships.animal_2_id_fkey
CREATE INDEX IF NOT EXISTS idx_genetic_relationships_animal_2_id ON public.genetic_relationships(animal_2_id);

-- health_records.cow_id_fkey
CREATE INDEX IF NOT EXISTS idx_health_records_cow_id ON public.health_records(cow_id);

-- health_records.farm_id_fkey
CREATE INDEX IF NOT EXISTS idx_health_records_farm_id ON public.health_records(farm_id);

-- heat_events.farm_id_fkey
CREATE INDEX IF NOT EXISTS idx_heat_events_farm_id ON public.heat_events(farm_id);

-- pregnancy_checks.breeding_attempt_id_fkey
CREATE INDEX IF NOT EXISTS idx_pregnancy_checks_breeding_attempt_id ON public.pregnancy_checks(breeding_attempt_id);

-- pregnancy_checks.farm_id_fkey
CREATE INDEX IF NOT EXISTS idx_pregnancy_checks_farm_id ON public.pregnancy_checks(farm_id);

-- cows.farm_id_fkey
CREATE INDEX IF NOT EXISTS idx_cows_farm_id ON public.cows(farm_id);

-- cows.sire_id_fkey
CREATE INDEX IF NOT EXISTS idx_cows_sire_id ON public.cows(sire_id);

-- cows.dam_id_fkey
CREATE INDEX IF NOT EXISTS idx_cows_dam_id ON public.cows(dam_id);

-- ============================================================================
-- PART 2: REMOVE UNUSED INDEXES
-- ============================================================================

-- Unused indexes on breeding_attempts
DROP INDEX IF EXISTS idx_breeding_attempts_attempt_time;
DROP INDEX IF EXISTS breeding_attempts_cow_idx;
DROP INDEX IF EXISTS breeding_attempts_preg_due_idx;

-- Legacy unused indexes on cows (keep the new FK indexes)
-- idx_cows_farm_id, idx_cows_sire_id, idx_cows_dam_id are FK indexes - KEEP them
DROP INDEX IF EXISTS idx_cows_tag_number;

-- Unused indexes on heat_events
DROP INDEX IF EXISTS idx_heat_events_cow_id;
DROP INDEX IF EXISTS idx_heat_events_event_time;
DROP INDEX IF EXISTS heat_events_optimal_window_idx;
DROP INDEX IF EXISTS heat_events_alert_pending_idx;

-- Unused indexes on pregnancy_checks
DROP INDEX IF EXISTS idx_pregnancy_checks_check_time;
DROP INDEX IF EXISTS pregnancy_checks_cow_idx;
DROP INDEX IF EXISTS pregnancy_checks_result_idx;
DROP INDEX IF EXISTS pregnancy_checks_calving_idx;

-- Unused indexes on breeding_alerts
DROP INDEX IF EXISTS breeding_alerts_status_date_idx;
DROP INDEX IF EXISTS idx_breeding_alerts_alert_time;

-- Unused indexes on genetic tables
DROP INDEX IF EXISTS genetic_relationships_type_idx;
DROP INDEX IF EXISTS genetic_relationships_canbreed_idx;
DROP INDEX IF EXISTS genetic_lines_foundation_idx;

-- Unused indexes on health_records
DROP INDEX IF EXISTS idx_health_records_date;
DROP INDEX IF EXISTS idx_health_records_next_due;

-- ============================================================================
-- Verification Queries
-- ============================================================================
-- After running this migration, verify the indexes:
--
-- SELECT
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
-- ORDER BY tablename, indexname;
--
-- All foreign keys should now have covering indexes.
-- ============================================================================
