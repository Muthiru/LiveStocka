-- Migration: breeding_alerts table
CREATE TABLE IF NOT EXISTS breeding_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL,
    cow_id UUID NOT NULL,
    alert_type TEXT NOT NULL,
    alert_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL,
    related_event_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE breeding_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS select_breeding_alerts ON breeding_alerts;
DROP POLICY IF EXISTS insert_breeding_alerts ON breeding_alerts;
DROP POLICY IF EXISTS update_breeding_alerts ON breeding_alerts;
DROP POLICY IF EXISTS delete_breeding_alerts ON breeding_alerts;

CREATE POLICY select_breeding_alerts ON breeding_alerts
    FOR SELECT USING (farm_id = (select auth.uid()));
CREATE POLICY insert_breeding_alerts ON breeding_alerts
    FOR INSERT WITH CHECK (farm_id = (select auth.uid()));
CREATE POLICY update_breeding_alerts ON breeding_alerts
    FOR UPDATE USING (farm_id = (select auth.uid()));
CREATE POLICY delete_breeding_alerts ON breeding_alerts
    FOR DELETE USING (farm_id = (select auth.uid()));

-- Make migration idempotent: ensure columns exist if table pre-existed
ALTER TABLE breeding_alerts
    ADD COLUMN IF NOT EXISTS alert_time TIMESTAMP WITH TIME ZONE,
    ADD COLUMN IF NOT EXISTS status TEXT,
    ADD COLUMN IF NOT EXISTS related_event_id UUID,
    ADD COLUMN IF NOT EXISTS notes TEXT,
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Indexes (created after ensuring columns exist)
CREATE INDEX IF NOT EXISTS idx_breeding_alerts_farm_id ON breeding_alerts(farm_id);
CREATE INDEX IF NOT EXISTS idx_breeding_alerts_cow_id ON breeding_alerts(cow_id);
CREATE INDEX IF NOT EXISTS idx_breeding_alerts_alert_time ON breeding_alerts(alert_time);
CREATE INDEX IF NOT EXISTS idx_breeding_alerts_alert_type ON breeding_alerts(alert_type);
-- Remove duplicate indexes
DROP INDEX IF EXISTS breeding_alerts_type_idx;
DROP INDEX IF EXISTS idx_breeding_alerts_alert_type;
DROP INDEX IF EXISTS breeding_alerts_cow_idx;
DROP INDEX IF EXISTS idx_breeding_alerts_cow_id;
DROP INDEX IF EXISTS breeding_alerts_farm_idx;
DROP INDEX IF EXISTS idx_breeding_alerts_farm_id;
