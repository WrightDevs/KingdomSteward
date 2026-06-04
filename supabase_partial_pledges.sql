-- supabase_partial_pledges.sql

-- 1. Add the redeemed_amount column
ALTER TABLE public.pledges 
ADD COLUMN IF NOT EXISTS redeemed_amount DECIMAL(12, 2) DEFAULT 0;

-- 2. Drop the old status check constraint
-- The constraint name is usually generated automatically, e.g., "pledges_status_check"
-- We use a PL/pgSQL block to dynamically find and drop it to be safe
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.pledges'::regclass AND contype = 'c' AND conname LIKE '%status%';
  
  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.pledges DROP CONSTRAINT ' || quote_ident(constraint_name);
  END IF;
END $$;

-- 3. Add the new status check constraint allowing 'partially_redeemed'
ALTER TABLE public.pledges
ADD CONSTRAINT pledges_status_check 
CHECK (status IN ('pending', 'partially_redeemed', 'redeemed', 'overdue'));

-- 4. Update the "Own pledges insert" policy to allow the new column if needed (usually not required if using superuser or standard insert, but safe)
-- (No change strictly needed for RLS just for adding a column, the default SELECT/UPDATE policies apply to the whole row)
