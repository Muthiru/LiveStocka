-- Milk Production Tracking Table
-- This table tracks daily milk production for each cow

CREATE TABLE IF NOT EXISTS milk_production (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL,
  production_date DATE NOT NULL,
  morning_yield NUMERIC(6,2) DEFAULT 0.00,
  evening_yield NUMERIC(6,2) DEFAULT 0.00,
  total_yield NUMERIC(6,2) GENERATED ALWAYS AS (morning_yield + evening_yield) STORED,
  quality TEXT CHECK (quality IN ('excellent', 'good', 'fair', 'poor')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cow_id, production_date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_milk_production_cow_id ON milk_production(cow_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_farm_id ON milk_production(farm_id);
CREATE INDEX IF NOT EXISTS idx_milk_production_date ON milk_production(production_date DESC);

-- Enable Row Level Security
ALTER TABLE milk_production ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see milk production records for their farm
DROP POLICY IF EXISTS "Users can view milk production for their farm" ON milk_production;
DROP POLICY IF EXISTS "Users view own production" ON milk_production;
DROP POLICY IF EXISTS "Users can insert milk production for their farm" ON milk_production;
DROP POLICY IF EXISTS "Users insert own production" ON milk_production;
DROP POLICY IF EXISTS "Users can update milk production for their farm" ON milk_production;
DROP POLICY IF EXISTS "Users update own production" ON milk_production;
DROP POLICY IF EXISTS "Users can delete milk production for their farm" ON milk_production;
DROP POLICY IF EXISTS "Users delete own production" ON milk_production;

CREATE POLICY "Users view own production"
  ON milk_production FOR SELECT
  USING (farm_id = (select auth.uid()));

CREATE POLICY "Users insert own production"
  ON milk_production FOR INSERT
  WITH CHECK (farm_id = (select auth.uid()));

CREATE POLICY "Users update own production"
  ON milk_production FOR UPDATE
  USING (farm_id = (select auth.uid()))
  WITH CHECK (farm_id = (select auth.uid()));

CREATE POLICY "Users delete own production"
  ON milk_production FOR DELETE
  USING (farm_id = (select auth.uid()));

CREATE OR REPLACE FUNCTION update_milk_production_updated_at()
RETURNS TRIGGER 
SET search_path = public  -- Explicit search_path prevents security vulnerabilities
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_milk_production_updated_at_trigger ON milk_production;
CREATE TRIGGER update_milk_production_updated_at_trigger
  BEFORE UPDATE ON milk_production
  FOR EACH ROW
  EXECUTE FUNCTION update_milk_production_updated_at();

-- Commented out sample data for testing
-- INSERT INTO milk_production (cow_id, farm_id, production_date, morning_yield, evening_yield, quality, notes)
-- VALUES 
--   ('cow-uuid-1', 'farm-uuid', '2026-02-02', 12.50, 11.80, 'excellent', 'Good health'),
--   ('cow-uuid-2', 'farm-uuid', '2026-02-02', 10.20, 9.50, 'good', 'Normal production');
