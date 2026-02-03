-- Enhanced Health Records Table Migration
-- Safe migration script that handles existing data

-- 1) Add new columns (keeps your existing ADD COLUMN IF NOT EXISTS)
ALTER TABLE health_records 
  ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS record_type TEXT CHECK (record_type IN ('vaccination', 'medication', 'disease', 'treatment', 'checkup', 'injury', 'other')),
  ADD COLUMN IF NOT EXISTS record_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS vaccine_name TEXT,
  ADD COLUMN IF NOT EXISTS medication_name TEXT,
  ADD COLUMN IF NOT EXISTS dosage TEXT,
  ADD COLUMN IF NOT EXISTS administered_by TEXT,
  ADD COLUMN IF NOT EXISTS next_due_date DATE,
  ADD COLUMN IF NOT EXISTS disease_name TEXT,
  ADD COLUMN IF NOT EXISTS symptoms TEXT,
  ADD COLUMN IF NOT EXISTS diagnosis TEXT,
  ADD COLUMN IF NOT EXISTS treatment_plan TEXT,
  ADD COLUMN IF NOT EXISTS recovery_status TEXT CHECK (recovery_status IN ('recovering', 'recovered', 'ongoing', 'critical')),
  ADD COLUMN IF NOT EXISTS vet_name TEXT,
  ADD COLUMN IF NOT EXISTS vet_contact TEXT,
  ADD COLUMN IF NOT EXISTS appointment_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- 2) Safe rename / migration for 'type' -> 'record_type'
DO $$
BEGIN
  -- If "type" exists and "record_type" does NOT, rename safely
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'health_records' AND column_name = 'type'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'health_records' AND column_name = 'record_type'
  ) THEN
    EXECUTE 'ALTER TABLE health_records RENAME COLUMN "type" TO record_type';
  
  -- If both exist, migrate data then drop the old column
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'health_records' AND column_name = 'type'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'health_records' AND column_name = 'record_type'
  ) THEN
    -- copy values where record_type is null
    EXECUTE '
      UPDATE health_records
      SET record_type = "type"
      WHERE record_type IS NULL AND "type" IS NOT NULL
    ';
    -- drop the old column if desired
    -- Note: dropping is destructive — only do if you are sure
    EXECUTE 'ALTER TABLE health_records DROP COLUMN IF EXISTS "type"';
  END IF;

  -- Set farm_id from cows if farm_id column exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'health_records' AND column_name = 'farm_id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cows' AND column_name = 'id'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'cows' AND column_name = 'farm_id'
  ) THEN
    EXECUTE '
      UPDATE health_records hr
      SET farm_id = c.farm_id
      FROM cows c
      WHERE hr.cow_id = c.id AND hr.farm_id IS NULL
    ';
  END IF;
END $$;

-- 3) Make columns NOT NULL only when safe
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'health_records' AND column_name = 'record_type'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM health_records WHERE record_type IS NULL LIMIT 1) THEN
      EXECUTE 'ALTER TABLE health_records ALTER COLUMN record_type SET NOT NULL';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'health_records' AND column_name = 'record_date'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM health_records WHERE record_date IS NULL LIMIT 1) THEN
      EXECUTE 'ALTER TABLE health_records ALTER COLUMN record_date SET NOT NULL';
    END IF;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'health_records' AND column_name = 'title'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM health_records WHERE title IS NULL LIMIT 1) THEN
      EXECUTE 'ALTER TABLE health_records ALTER COLUMN title SET NOT NULL';
    END IF;
  END IF;
END $$;

-- 4) Indexes (safe)
CREATE INDEX IF NOT EXISTS idx_health_records_cow_id ON health_records(cow_id);
CREATE INDEX IF NOT EXISTS idx_health_records_farm_id ON health_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_next_due ON health_records(next_due_date) WHERE next_due_date IS NOT NULL;

-- 5) Trigger function and trigger (unchanged)
CREATE OR REPLACE FUNCTION update_health_records_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_health_records_updated_at();

-- 6) View (unchanged)
CREATE OR REPLACE VIEW upcoming_health_events AS
SELECT 
  hr.id,
  hr.cow_id,
  hr.farm_id,
  hr.record_type,
  hr.title,
  hr.next_due_date,
  c.name as cow_name,
  c.tag_id
FROM health_records hr
JOIN cows c ON hr.cow_id = c.id
WHERE hr.next_due_date >= CURRENT_DATE
  AND hr.next_due_date <= CURRENT_DATE + INTERVAL '30 days'
ORDER BY hr.next_due_date ASC;
