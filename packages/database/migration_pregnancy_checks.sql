-- Migration: pregnancy_checks table
CREATE TABLE IF NOT EXISTS pregnancy_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL,
    cow_id UUID NOT NULL,
    breeding_attempt_id UUID NOT NULL,
    check_time TIMESTAMP WITH TIME ZONE NOT NULL,
    result TEXT NOT NULL,
    checked_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE pregnancy_checks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_pregnancy_checks ON pregnancy_checks;
DROP POLICY IF EXISTS "Users can manage pregnancy checks for their cows" ON pregnancy_checks;
DROP POLICY IF EXISTS insert_pregnancy_checks ON pregnancy_checks;
DROP POLICY IF EXISTS update_pregnancy_checks ON pregnancy_checks;
DROP POLICY IF EXISTS delete_pregnancy_checks ON pregnancy_checks;

CREATE POLICY "Users can manage pregnancy checks for their cows" ON pregnancy_checks
    FOR ALL USING (farm_id = (select auth.uid()));

-- Make migration idempotent: ensure columns exist if table pre-existed
ALTER TABLE pregnancy_checks
    ADD COLUMN IF NOT EXISTS check_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS result TEXT,
    ADD COLUMN IF NOT EXISTS checked_by TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Indexes (created after ensuring columns exist)
CREATE INDEX IF NOT EXISTS idx_pregnancy_checks_farm_id ON pregnancy_checks(farm_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_checks_cow_id ON pregnancy_checks(cow_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_checks_breeding_attempt_id ON pregnancy_checks(breeding_attempt_id);
CREATE INDEX IF NOT EXISTS idx_pregnancy_checks_check_time ON pregnancy_checks(check_time);
-- Remove duplicate indexes
DROP INDEX IF EXISTS pregnancy_checks_breeding_idx;
DROP INDEX IF EXISTS idx_pregnancy_checks_breeding_attempt_id;
DROP INDEX IF EXISTS pregnancy_checks_farm_idx;
DROP INDEX IF EXISTS idx_pregnancy_checks_farm_id;
