-- ==============================================================================
-- STORAGE BUCKET & RLS POLICIES FOR AVATARS
-- ==============================================================================

-- 1. Create the 'avatars' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop any existing restrictive policies to avoid conflicts
DROP POLICY IF EXISTS "Public Avatar Viewing" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatars" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatars" ON storage.objects;

-- 3. Create permissive policies for the 'avatars' bucket
-- Allow public viewing
CREATE POLICY "Avatar Viewing"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Allow authenticated users to Insert (upload)
CREATE POLICY "Avatar Uploading"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars');

-- Allow authenticated users to Update (needed for upsert)
CREATE POLICY "Avatar Updating"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars');

-- Allow authenticated users to Delete
CREATE POLICY "Avatar Deleting"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars');
