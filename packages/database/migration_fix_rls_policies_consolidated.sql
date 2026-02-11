-- ============================================================================
-- CONSOLIDATED RLS POLICY FIX MIGRATION
-- ============================================================================
-- Purpose: Consolidate duplicate RLS policies and optimize auth function calls
-- This migration:
--   1. Drops ALL existing duplicate policies
--   2. Creates single consolidated policies per table
--   3. Uses SELECT-wrapped auth functions for better performance
--   4. Applies to all tables: cows, health_records, milk_production,
--      heat_events, breeding_attempts, breeding_alerts, pregnancy_checks,
--      genetic_relationships, genetic_lines
-- ============================================================================

-- ============================================================================
-- 1. COWS TABLE - Consolidated Policy
-- ============================================================================
DROP POLICY IF EXISTS "Users view their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users insert their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users update their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users delete their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users can view their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users can insert their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users can update their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users can delete their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users view own cows" ON public.cows;
DROP POLICY IF EXISTS "Users insert own cows" ON public.cows;
DROP POLICY IF EXISTS "Users update own cows" ON public.cows;
DROP POLICY IF EXISTS "Users delete own cows" ON public.cows;
DROP POLICY IF EXISTS select_cows ON public.cows;
DROP POLICY IF EXISTS insert_cows ON public.cows;
DROP POLICY IF EXISTS update_cows ON public.cows;
DROP POLICY IF EXISTS delete_cows ON public.cows;
DROP POLICY IF EXISTS "Users can manage cows for their farm" ON public.cows;

ALTER TABLE public.cows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage cows for their farm"
  ON public.cows
  FOR ALL
  USING (farm_id = (SELECT auth.uid()))
  WITH CHECK (farm_id = (SELECT auth.uid()));

-- ============================================================================
-- 2. HEALTH_RECORDS TABLE - Consolidated Policy
-- ============================================================================
DROP POLICY IF EXISTS "Users view their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users insert their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users update their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users delete their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can view their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can insert their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can update their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can delete their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can view health records for their cows" ON public.health_records;
DROP POLICY IF EXISTS "Users can insert health records for their cows" ON public.health_records;
DROP POLICY IF EXISTS "Users can update health records for their cows" ON public.health_records;
DROP POLICY IF EXISTS "Users can delete health records for their cows" ON public.health_records;
DROP POLICY IF EXISTS "Users view own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users insert own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users update own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users delete own health records" ON public.health_records;

ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage health records for their farm"
  ON public.health_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- 3. MILK_PRODUCTION TABLE - Consolidated Policy
-- ============================================================================
DROP POLICY IF EXISTS "Users view own production" ON public.milk_production;
DROP POLICY IF EXISTS "Users insert own production" ON public.milk_production;
DROP POLICY IF EXISTS "Users update own production" ON public.milk_production;
DROP POLICY IF EXISTS "Users delete own production" ON public.milk_production;
DROP POLICY IF EXISTS "Users can view milk production for their farm" ON public.milk_production;
DROP POLICY IF EXISTS "Users can insert milk production for their farm" ON public.milk_production;
DROP POLICY IF EXISTS "Users can update milk production for their farm" ON public.milk_production;
DROP POLICY IF EXISTS "Users can delete milk production for their farm" ON public.milk_production;

ALTER TABLE public.milk_production ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage milk production for their farm"
  ON public.milk_production
  FOR ALL
  USING (farm_id = (SELECT auth.uid()))
  WITH CHECK (farm_id = (SELECT auth.uid()));

-- ============================================================================
-- 4. HEAT_EVENTS TABLE - Consolidated Policy
-- ============================================================================
DROP POLICY IF EXISTS select_heat_events ON public.heat_events;
DROP POLICY IF EXISTS insert_heat_events ON public.heat_events;
DROP POLICY IF EXISTS update_heat_events ON public.heat_events;
DROP POLICY IF EXISTS delete_heat_events ON public.heat_events;
DROP POLICY IF EXISTS "Users can manage heat events for their cows" ON public.heat_events;

ALTER TABLE public.heat_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage heat events for their farm"
  ON public.heat_events
  FOR ALL
  USING (farm_id = (SELECT auth.uid()))
  WITH CHECK (farm_id = (SELECT auth.uid()));

-- ============================================================================
-- 5. BREEDING_ATTEMPTS TABLE - Consolidated Policy
-- ============================================================================
DROP POLICY IF EXISTS select_breeding_attempts ON public.breeding_attempts;
DROP POLICY IF EXISTS insert_breeding_attempts ON public.breeding_attempts;
DROP POLICY IF EXISTS update_breeding_attempts ON public.breeding_attempts;
DROP POLICY IF EXISTS delete_breeding_attempts ON public.breeding_attempts;
DROP POLICY IF EXISTS "Users can manage breeding attempts for their cows" ON public.breeding_attempts;

ALTER TABLE public.breeding_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage breeding attempts for their farm"
  ON public.breeding_attempts
  FOR ALL
  USING (farm_id = (SELECT auth.uid()))
  WITH CHECK (farm_id = (SELECT auth.uid()));

-- ============================================================================
-- 6. BREEDING_ALERTS TABLE - Consolidated Policy
-- ============================================================================
DROP POLICY IF EXISTS select_breeding_alerts ON public.breeding_alerts;
DROP POLICY IF EXISTS insert_breeding_alerts ON public.breeding_alerts;
DROP POLICY IF EXISTS update_breeding_alerts ON public.breeding_alerts;
DROP POLICY IF EXISTS delete_breeding_alerts ON public.breeding_alerts;
DROP POLICY IF EXISTS "Users can manage breeding alerts for their farm" ON public.breeding_alerts;

ALTER TABLE public.breeding_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage breeding alerts for their farm"
  ON public.breeding_alerts
  FOR ALL
  USING (farm_id = (SELECT auth.uid()))
  WITH CHECK (farm_id = (SELECT auth.uid()));

-- ============================================================================
-- 7. PREGNANCY_CHECKS TABLE - Consolidated Policy
-- ============================================================================
DROP POLICY IF EXISTS select_pregnancy_checks ON public.pregnancy_checks;
DROP POLICY IF EXISTS insert_pregnancy_checks ON public.pregnancy_checks;
DROP POLICY IF EXISTS update_pregnancy_checks ON public.pregnancy_checks;
DROP POLICY IF EXISTS delete_pregnancy_checks ON public.pregnancy_checks;
DROP POLICY IF EXISTS "Users can manage pregnancy checks for their cows" ON public.pregnancy_checks;

ALTER TABLE public.pregnancy_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage pregnancy checks for their farm"
  ON public.pregnancy_checks
  FOR ALL
  USING (farm_id = (SELECT auth.uid()))
  WITH CHECK (farm_id = (SELECT auth.uid()));

-- ============================================================================
-- 8. GENETIC_RELATIONSHIPS TABLE - Consolidated Policy (if exists)
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage genetic relationships for their farm" ON public.genetic_relationships;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'genetic_relationships') THEN
    ALTER TABLE public.genetic_relationships ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage genetic relationships for their farm"
      ON public.genetic_relationships
      FOR ALL
      USING (farm_id = (SELECT auth.uid()))
      WITH CHECK (farm_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- 9. GENETIC_LINES TABLE - Consolidated Policy (if exists)
-- ============================================================================
DROP POLICY IF EXISTS "Users can manage genetic lines for their farm" ON public.genetic_lines;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'genetic_lines') THEN
    ALTER TABLE public.genetic_lines ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Users can manage genetic lines for their farm"
      ON public.genetic_lines
      FOR ALL
      USING (farm_id = (SELECT auth.uid()))
      WITH CHECK (farm_id = (SELECT auth.uid()));
  END IF;
END $$;

-- ============================================================================
-- Verification
-- ============================================================================
-- Run these queries to verify policies were correctly consolidated:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
-- ============================================================================
