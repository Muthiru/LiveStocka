-- Migration: Add missing columns to cows table
-- Run this in the Supabase SQL editor to fix the 500 error when adding a cow.

ALTER TABLE public.cows
  ADD COLUMN IF NOT EXISTS color TEXT,
  ADD COLUMN IF NOT EXISTS genetic_line TEXT;
