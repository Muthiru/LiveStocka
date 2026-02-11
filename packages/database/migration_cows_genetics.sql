-- Migration: cows table (genetics extension)
CREATE TABLE IF NOT EXISTS cows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL,
    tag_number TEXT NOT NULL,
    name TEXT,
    birth_date DATE,
    breed TEXT,
    sire_id UUID,
    dam_id UUID,
    genetic_line TEXT,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE cows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_cows ON cows;
DROP POLICY IF EXISTS "Users can manage cows for their farm" ON cows;
DROP POLICY IF EXISTS insert_cows ON cows;
DROP POLICY IF EXISTS update_cows ON cows;
DROP POLICY IF EXISTS delete_cows ON cows;

CREATE POLICY "Users can manage cows for their farm" ON cows
    FOR ALL USING (farm_id = (select auth.uid()));

-- Make migration idempotent: ensure columns exist if table pre-existed
ALTER TABLE cows
    ADD COLUMN IF NOT EXISTS tag_number TEXT,
    ADD COLUMN IF NOT EXISTS name TEXT,
    ADD COLUMN IF NOT EXISTS birth_date DATE,
    ADD COLUMN IF NOT EXISTS breed TEXT,
    ADD COLUMN IF NOT EXISTS sire_id UUID,
    ADD COLUMN IF NOT EXISTS dam_id UUID,
    ADD COLUMN IF NOT EXISTS genetic_line TEXT,
    ADD COLUMN IF NOT EXISTS status TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Indexes (created after ensuring columns exist)
CREATE INDEX IF NOT EXISTS idx_cows_farm_id ON cows(farm_id);
CREATE INDEX IF NOT EXISTS idx_cows_tag_number ON cows(tag_number);
CREATE INDEX IF NOT EXISTS idx_cows_sire_id ON cows(sire_id);
CREATE INDEX IF NOT EXISTS idx_cows_dam_id ON cows(dam_id);
