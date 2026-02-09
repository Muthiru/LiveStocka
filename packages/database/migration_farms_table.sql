-- Migration: Create farms table
-- Purpose: Support multi-farm functionality and edge function authentication
-- Date: 2026-02-09

CREATE TABLE IF NOT EXISTS farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create index on owner_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_farms_owner_id ON farms(owner_id);

-- Enable RLS
ALTER TABLE farms ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS select_farms ON farms;
DROP POLICY IF EXISTS insert_farms ON farms;
DROP POLICY IF EXISTS update_farms ON farms;
DROP POLICY IF EXISTS delete_farms ON farms;

CREATE POLICY select_farms ON farms
    FOR SELECT USING (owner_id = (select auth.uid()));

CREATE POLICY insert_farms ON farms
    FOR INSERT WITH CHECK (owner_id = (select auth.uid()));

CREATE POLICY update_farms ON farms
    FOR UPDATE USING (owner_id = (select auth.uid()));

CREATE POLICY delete_farms ON farms
    FOR DELETE USING (owner_id = (select auth.uid()));

-- Auto-create a default farm for existing users
-- This ensures backward compatibility
INSERT INTO farms (owner_id, name)
SELECT 
    id as owner_id,
    COALESCE(email, 'My Farm') as name
FROM auth.users
WHERE NOT EXISTS (
    SELECT 1 FROM farms WHERE farms.owner_id = auth.users.id
)
ON CONFLICT DO NOTHING;

COMMENT ON TABLE farms IS 'Farms table - each user can have one or more farms';
COMMENT ON COLUMN farms.owner_id IS 'References auth.users(id) - the farm owner';
COMMENT ON COLUMN farms.name IS 'Farm name for display';
