-- Supabase SQL setup for LiveStocka
-- Run this in Supabase SQL editor

-- Enable RLS
--ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

-- Create tables
CREATE TABLE public.cows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  tag_id TEXT UNIQUE,
  color TEXT,
  age NUMERIC(4,1),
  weight NUMERIC(6,1),
  status TEXT DEFAULT 'active',
  birth_date DATE,
  sire TEXT,
  dam TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE public.health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cow_id UUID REFERENCES public.cows(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS on tables
ALTER TABLE public.cows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own cows" ON public.cows
  FOR SELECT USING (auth.uid() = farm_id);

CREATE POLICY "Users can insert their own cows" ON public.cows
  FOR INSERT WITH CHECK (auth.uid() = farm_id);

CREATE POLICY "Users can update their own cows" ON public.cows
  FOR UPDATE USING (auth.uid() = farm_id);

CREATE POLICY "Users can delete their own cows" ON public.cows
  FOR DELETE USING (auth.uid() = farm_id);

CREATE POLICY "Users can view health records for their cows" ON public.health_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert health records for their cows" ON public.health_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = auth.uid()
    )
  );

CREATE POLICY "Users can update health records for their cows" ON public.health_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete health records for their cows" ON public.health_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = auth.uid()
    )
  );