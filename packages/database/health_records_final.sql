-- Health Records Table - Final Schema
-- This migration ensures all form fields are properly supported in the database

-- Drop existing table and recreate (CAUTION: This will delete existing data)
-- If you want to preserve data, use the ALTER TABLE statements below instead

-- Option 1: Create fresh table (use if no existing data matters)
/*
DROP TABLE IF EXISTS health_records CASCADE;

CREATE TABLE health_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cow_id UUID NOT NULL REFERENCES cows(id) ON DELETE CASCADE,
  farm_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Core fields
  record_type TEXT NOT NULL CHECK (record_type IN ('vaccination', 'medication', 'disease', 'treatment', 'checkup', 'injury', 'other')),
  title TEXT NOT NULL,
  record_date DATE NOT NULL DEFAULT CURRENT_DATE,
  record_time TIME,
  description TEXT,
  
  -- Vaccination/Medication fields
  vaccine_name TEXT,
  medication_name TEXT,
  dosage TEXT,
  administered_by TEXT,
  
  -- Disease/Treatment fields
  disease_name TEXT,
  symptoms TEXT,
  diagnosis TEXT,
  treatment_plan TEXT,
  recovery_status TEXT CHECK (recovery_status IS NULL OR recovery_status IN ('recovering', 'recovered', 'ongoing', 'critical')),
  
  -- Veterinarian fields
  vet_name TEXT,
  vet_contact TEXT,
  next_due_date DATE,
  
  -- Additional fields
  cost DECIMAL(10, 2),
  attachments JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);
*/

-- Option 2: Safe migration (preserves existing data)
-- Add missing columns if they don't exist

-- Add record_time column (this is likely the missing field causing the 400 error)
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS record_time TIME;

-- Ensure all other columns exist
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS farm_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS record_type TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS record_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS vaccine_name TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS medication_name TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS dosage TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS administered_by TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS disease_name TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS symptoms TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS diagnosis TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS treatment_plan TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS recovery_status TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS vet_name TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS vet_contact TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS next_due_date DATE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS cost DECIMAL(10, 2);
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW());

-- Completion tracking fields
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE health_records ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- Add constraints if missing (run separately if needed)
-- ALTER TABLE health_records ADD CONSTRAINT health_records_record_type_check 
--   CHECK (record_type IN ('vaccination', 'medication', 'disease', 'treatment', 'checkup', 'injury', 'other'));
-- ALTER TABLE health_records ADD CONSTRAINT health_records_recovery_status_check 
--   CHECK (recovery_status IS NULL OR recovery_status IN ('recovering', 'recovered', 'ongoing', 'critical'));

CREATE INDEX IF NOT EXISTS idx_health_records_cow_id ON health_records(cow_id);
CREATE INDEX IF NOT EXISTS idx_health_records_farm_id ON health_records(farm_id);
CREATE INDEX IF NOT EXISTS idx_health_records_date ON health_records(record_date DESC);
CREATE INDEX IF NOT EXISTS idx_health_records_type ON health_records(record_type);
CREATE INDEX IF NOT EXISTS idx_health_records_next_due ON health_records(next_due_date) WHERE next_due_date IS NOT NULL;

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_health_records_updated_at()
RETURNS TRIGGER 
SET search_path = public  -- Explicit search_path prevents security vulnerabilities
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_health_records_updated_at ON health_records;
CREATE TRIGGER update_health_records_updated_at
  BEFORE UPDATE ON health_records
  FOR EACH ROW
  EXECUTE FUNCTION update_health_records_updated_at();

-- View for upcoming health events
-- SECURITY DEFINER removed for safety; default is SECURITY INVOKER
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

ALTER TABLE health_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own health records" ON health_records;
DROP POLICY IF EXISTS "Users view their own health records" ON health_records;
CREATE POLICY "Users view their own health records" ON health_records
  FOR SELECT USING ((select auth.uid()) = farm_id);

DROP POLICY IF EXISTS "Users can insert their own health records" ON health_records;
DROP POLICY IF EXISTS "Users insert their own health records" ON health_records;
CREATE POLICY "Users insert their own health records" ON health_records
  FOR INSERT WITH CHECK ((select auth.uid()) = farm_id);

DROP POLICY IF EXISTS "Users can update their own health records" ON health_records;
DROP POLICY IF EXISTS "Users update their own health records" ON health_records;
CREATE POLICY "Users update their own health records" ON health_records
  FOR UPDATE USING ((select auth.uid()) = farm_id);

DROP POLICY IF EXISTS "Users can delete their own health records" ON health_records;
DROP POLICY IF EXISTS "Users delete their own health records" ON health_records;
CREATE POLICY "Users delete their own health records" ON health_records
  FOR DELETE USING ((select auth.uid()) = farm_id);
