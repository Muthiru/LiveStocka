-- Migration: heat_events table
CREATE TABLE IF NOT EXISTS heat_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL,
    cow_id UUID NOT NULL,
    event_time TIMESTAMP WITH TIME ZONE NOT NULL,
    detected_by TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE heat_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_heat_events ON heat_events;
DROP POLICY IF EXISTS insert_heat_events ON heat_events;
DROP POLICY IF EXISTS update_heat_events ON heat_events;
DROP POLICY IF EXISTS delete_heat_events ON heat_events;

CREATE POLICY select_heat_events ON heat_events
    FOR SELECT USING (farm_id = (select auth.uid()));
CREATE POLICY insert_heat_events ON heat_events
    FOR INSERT WITH CHECK (farm_id = (select auth.uid()));
CREATE POLICY update_heat_events ON heat_events
    FOR UPDATE USING (farm_id = (select auth.uid()));
CREATE POLICY delete_heat_events ON heat_events
    FOR DELETE USING (farm_id = (select auth.uid()));

-- Make migration idempotent: ensure columns exist if table pre-existed
ALTER TABLE heat_events
    ADD COLUMN IF NOT EXISTS event_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS detected_by TEXT,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Indexes (created after ensuring columns exist)
CREATE INDEX IF NOT EXISTS idx_heat_events_farm_id ON heat_events(farm_id);
CREATE INDEX IF NOT EXISTS idx_heat_events_cow_id ON heat_events(cow_id);
CREATE INDEX IF NOT EXISTS idx_heat_events_event_time ON heat_events(event_time);
-- Remove duplicate indexes
DROP INDEX IF EXISTS heat_events_farm_idx;
DROP INDEX IF EXISTS idx_heat_events_farm_id;
