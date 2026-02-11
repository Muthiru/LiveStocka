CREATE TABLE IF NOT EXISTS public.cows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  breed TEXT,
  tag_id TEXT UNIQUE,
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
CREATE TABLE IF NOT EXISTS public.health_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cow_id UUID REFERENCES public.cows(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

DROP POLICY IF EXISTS "Users can view their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users view their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users can insert their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users insert their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users can update their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users update their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users can delete their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users delete their own cows" ON public.cows;
DROP POLICY IF EXISTS "Users can view health records for their cows" ON public.health_records;
DROP POLICY IF EXISTS "Users view their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can insert health records for their cows" ON public.health_records;
DROP POLICY IF EXISTS "Users insert their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can update health records for their cows" ON public.health_records;
DROP POLICY IF EXISTS "Users update their own health records" ON public.health_records;
DROP POLICY IF EXISTS "Users can delete health records for their cows" ON public.health_records;
DROP POLICY IF EXISTS "Users delete their own health records" ON public.health_records;
-- ...existing code...
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view their own cows" ON public.cows
  FOR SELECT USING ((select auth.uid()) = farm_id);

CREATE POLICY "Users insert their own cows" ON public.cows
  FOR INSERT WITH CHECK ((select auth.uid()) = farm_id);
-- ...existing code...

CREATE POLICY "Users update their own cows" ON public.cows
  FOR UPDATE USING ((select auth.uid()) = farm_id);

CREATE POLICY "Users delete their own cows" ON public.cows
  FOR DELETE USING ((select auth.uid()) = farm_id);

CREATE POLICY "Users view their own health records" ON public.health_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = (select auth.uid())
    )
  );

CREATE POLICY "Users insert their own health records" ON public.health_records
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = (select auth.uid())
    )
  );

CREATE POLICY "Users update their own health records" ON public.health_records
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = (select auth.uid())
    )
  );

CREATE POLICY "Users delete their own health records" ON public.health_records
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.cows
      WHERE cows.id = health_records.cow_id
      AND cows.farm_id = (select auth.uid())
    )
  );