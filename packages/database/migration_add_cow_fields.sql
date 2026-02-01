-- Migration: Add missing columns to cows table
-- Run this in Supabase SQL editor if you already have the cows table

-- Add missing columns to cows table
ALTER TABLE public.cows 
ADD COLUMN IF NOT EXISTS birth_date DATE,
ADD COLUMN IF NOT EXISTS sire TEXT,
ADD COLUMN IF NOT EXISTS dam TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Note: The 'status' column should already exist, but if it doesn't:
-- ALTER TABLE public.cows ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
