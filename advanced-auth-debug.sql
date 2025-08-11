-- Advanced debugging for auth context issues
-- Run this in your Supabase SQL Editor

-- Check if you're authenticated at all
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  auth.email() as current_email;

-- Check if the JWT is valid
SELECT 
  current_setting('request.jwt.claims', true) as jwt_claims;

-- Check what headers are being passed
SELECT 
  current_setting('request.headers', true) as headers;

-- Let's see if there are any profiles at all (this should work for service_role)
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- Check the actual RLS policies that are active
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd,
  qual,
  with_check 
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test if we can bypass RLS temporarily to see the data
-- (Only works if you're using service_role key)
SET row_security = off;
SELECT id, email, role, approved FROM public.profiles LIMIT 5;
SET row_security = on;
