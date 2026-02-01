-- Migration: Fix age and weight columns to support decimal values
-- Run this in Supabase SQL editor if your database already exists

-- Change age from INTEGER to NUMERIC(4,1) to support values like 3.5
ALTER TABLE public.cows 
ALTER COLUMN age TYPE NUMERIC(4,1) USING age::NUMERIC(4,1);

-- Change weight from INTEGER to NUMERIC(6,1) to support decimal weights
ALTER TABLE public.cows 
ALTER COLUMN weight TYPE NUMERIC(6,1) USING weight::NUMERIC(6,1);
