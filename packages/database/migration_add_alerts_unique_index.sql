-- Migration: add unique index to prevent duplicate alerts per related event
-- Ensures at most one alert of the same type exists for a given related_event and farm
-- Idempotent: uses IF NOT EXISTS where possible

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_unique_breeding_alerts_event_type'
  ) THEN
    -- ensure related_event_id column exists (idempotent)
    BEGIN
      ALTER TABLE public.breeding_alerts ADD COLUMN IF NOT EXISTS related_event_id UUID;
    EXCEPTION WHEN undefined_table THEN
      -- table doesn't exist yet; skip creating index now
      RAISE NOTICE 'breeding_alerts table missing; skipping unique index creation for now';
    END;

    -- only create the index if the column exists
    IF EXISTS (
      SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'breeding_alerts' AND column_name = 'related_event_id'
    ) THEN
      CREATE UNIQUE INDEX idx_unique_breeding_alerts_event_type
      ON public.breeding_alerts (farm_id, related_event_id, alert_type)
      WHERE related_event_id IS NOT NULL;
    ELSE
      RAISE NOTICE 'related_event_id column not found; unique index not created';
    END IF;
  END IF;
END$$;

-- Add comment for clarity (only if the index exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relkind = 'i'
      AND c.relname = 'idx_unique_breeding_alerts_event_type'
  ) THEN
    EXECUTE 'COMMENT ON INDEX public.idx_unique_breeding_alerts_event_type IS ''Prevent duplicate alerts for the same related event and alert type per farm''';
  END IF;
END$$;
