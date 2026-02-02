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
CREATE POLICY "Users can view milk production for their farm"
  ON milk_production FOR SELECT
  USING (farm_id = auth.uid());

-- Policy: Users can insert milk production records for their farm
CREATE POLICY "Users can insert milk production for their farm"
  ON milk_production FOR INSERT
  WITH CHECK (farm_id = auth.uid());

-- Policy: Users can update milk production records for their farm
CREATE POLICY "Users can update milk production for their farm"
  ON milk_production FOR UPDATE
  USING (farm_id = auth.uid())
  WITH CHECK (farm_id = auth.uid());

-- Policy: Users can delete milk production records for their farm
CREATE POLICY "Users can delete milk production for their farm"
  ON milk_production FOR DELETE
  USING (farm_id = auth.uid());

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_milk_production_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER update_milk_production_updated_at_trigger
  BEFORE UPDATE ON milk_production
  FOR EACH ROW
  EXECUTE FUNCTION update_milk_production_updated_at();

-- Commented out sample data for testing
-- INSERT INTO milk_production (cow_id, farm_id, production_date, morning_yield, evening_yield, quality, notes)
-- VALUES 
--   ('cow-uuid-1', 'farm-uuid', '2026-02-02', 12.50, 11.80, 'excellent', 'Good health'),
--   ('cow-uuid-2', 'farm-uuid', '2026-02-02', 10.20, 9.50, 'good', 'Normal production');
