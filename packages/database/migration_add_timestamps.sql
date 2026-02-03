-- Migration: Add timestamp fields to health_records and milk_production tables
-- This allows tracking the exact time of health events and milk production
-- Also adds support for 3x daily milking (midday)

-- Add record_time and next_checkup_date to health_records
ALTER TABLE health_records 
ADD COLUMN IF NOT EXISTS record_time TIME DEFAULT '00:00:00',
ADD COLUMN IF NOT EXISTS next_checkup_date DATE;

-- Add morning_time, midday fields, and evening_time to milk_production
ALTER TABLE milk_production 
ADD COLUMN IF NOT EXISTS morning_time TIME DEFAULT '06:00:00',
ADD COLUMN IF NOT EXISTS midday_yield DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS midday_time TIME DEFAULT '12:00:00',
ADD COLUMN IF NOT EXISTS evening_time TIME DEFAULT '18:00:00';

-- Add comments for documentation
COMMENT ON COLUMN health_records.record_time IS 'Time of the health record event';
COMMENT ON COLUMN health_records.next_checkup_date IS 'Next scheduled checkup/follow-up date for alerts';
COMMENT ON COLUMN milk_production.morning_time IS 'Time of morning milking';
COMMENT ON COLUMN milk_production.midday_yield IS 'Midday milking yield for 3x daily milking';
COMMENT ON COLUMN milk_production.midday_time IS 'Time of midday milking';
COMMENT ON COLUMN milk_production.evening_time IS 'Time of evening milking';
