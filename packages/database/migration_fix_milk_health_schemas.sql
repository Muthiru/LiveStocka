-- Migration: Fix milk_production and health_records schemas
-- This migration adds missing columns required by the Edge Functions

-- ============================================================================
-- 1. MILK PRODUCTION TABLE UPDATES
-- ============================================================================

-- Add midday_yield column for 3-session milking
ALTER TABLE milk_production ADD COLUMN IF NOT EXISTS midday_yield NUMERIC(6,2) DEFAULT 0.00;

-- Add time tracking for each milking session
ALTER TABLE milk_production ADD COLUMN IF NOT EXISTS morning_time TIME;
ALTER TABLE milk_production ADD COLUMN IF NOT EXISTS midday_time TIME;
ALTER TABLE milk_production ADD COLUMN IF NOT EXISTS evening_time TIME;

-- Update the computed total_yield column to include midday_yield
-- First drop the existing computed column
ALTER TABLE milk_production DROP COLUMN IF EXISTS total_yield;

-- Recreate with midday_yield included
ALTER TABLE milk_production ADD COLUMN total_yield NUMERIC(6,2) 
  GENERATED ALWAYS AS (morning_yield + COALESCE(midday_yield, 0) + evening_yield) STORED;

-- ============================================================================
-- 2. HEALTH RECORDS TABLE UPDATES
-- ============================================================================

-- Add 'date' column as an alias for record_date (Edge Function sets both)
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS date DATE;

-- Backfill existing records
UPDATE health_records SET date = record_date WHERE date IS NULL;

-- Create trigger to keep date and record_date in sync
CREATE OR REPLACE FUNCTION sync_health_record_dates()
RETURNS TRIGGER 
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Keep date and record_date synchronized
  IF NEW.record_date IS NOT NULL THEN
    NEW.date = NEW.record_date;
  END IF;
  IF NEW.date IS NOT NULL AND NEW.record_date IS NULL THEN
    NEW.record_date = NEW.date;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_health_record_dates_trigger ON health_records;
CREATE TRIGGER sync_health_record_dates_trigger
  BEFORE INSERT OR UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION sync_health_record_dates();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify milk_production columns
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'milk_production' ORDER BY ordinal_position;

-- Verify health_records columns
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'health_records' ORDER BY ordinal_position;
