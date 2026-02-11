-- Migration: breeding_attempts table
CREATE TABLE IF NOT EXISTS breeding_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL,
    cow_id UUID NOT NULL,
    heat_event_id UUID NOT NULL,
    attempt_time TIMESTAMP WITH TIME ZONE NOT NULL,
    method TEXT,
    sire_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_breeding_attempts_farm_id ON breeding_attempts(farm_id);
CREATE INDEX IF NOT EXISTS idx_breeding_attempts_cow_id ON breeding_attempts(cow_id);
CREATE INDEX IF NOT EXISTS idx_breeding_attempts_heat_event_id ON breeding_attempts(heat_event_id);
-- attempt_time index created after ensuring column exists to avoid errors

ALTER TABLE breeding_attempts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_breeding_attempts ON breeding_attempts;
DROP POLICY IF EXISTS "Users can manage breeding attempts for their cows" ON breeding_attempts;
DROP POLICY IF EXISTS insert_breeding_attempts ON breeding_attempts;
DROP POLICY IF EXISTS update_breeding_attempts ON breeding_attempts;
DROP POLICY IF EXISTS delete_breeding_attempts ON breeding_attempts;

CREATE POLICY "Users can manage breeding attempts for their cows" ON breeding_attempts
    FOR ALL USING (farm_id = (select auth.uid()));

-- Make migration idempotent: add commonly-missing columns if table existed without them
ALTER TABLE breeding_attempts
    ADD COLUMN IF NOT EXISTS attempt_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS method TEXT,
    ADD COLUMN IF NOT EXISTS sire_id UUID,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Create index for attempt_time now that the column exists (idempotent)
CREATE INDEX IF NOT EXISTS idx_breeding_attempts_attempt_time ON breeding_attempts(attempt_time);
-- Remove duplicate indexes
DROP INDEX IF EXISTS breeding_attempts_farm_idx;
DROP INDEX IF EXISTS idx_breeding_attempts_farm_id;
DROP INDEX IF EXISTS breeding_attempts_heat_idx;
DROP INDEX IF EXISTS idx_breeding_attempts_heat_event_id;
