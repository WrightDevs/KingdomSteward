-- Run this in your Supabase SQL Editor to add the Pledges feature

CREATE TABLE IF NOT EXISTS public.pledges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  category VARCHAR(50) NOT NULL,
  pledge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'redeemed', 'overdue')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_pledges_user_id ON pledges(user_id);
CREATE INDEX IF NOT EXISTS idx_pledges_due_date ON pledges(due_date);
CREATE INDEX IF NOT EXISTS idx_pledges_status ON pledges(status);

-- RLS Policies
ALTER TABLE public.pledges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Own pledges select" ON pledges;
DROP POLICY IF EXISTS "Own pledges insert" ON pledges;
DROP POLICY IF EXISTS "Own pledges update" ON pledges;
DROP POLICY IF EXISTS "Own pledges delete" ON pledges;

CREATE POLICY "Own pledges select" ON pledges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Own pledges insert" ON pledges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Own pledges update" ON pledges FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Own pledges delete" ON pledges FOR DELETE USING (auth.uid() = user_id);
