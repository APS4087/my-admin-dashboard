-- Quick test to check current RLS status and policies
-- Run this in your Supabase SQL Editor to see what's currently configured

-- Check if RLS is enabled
SELECT 
  schemaname, 
  tablename, 
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'profiles';

-- Show current policies
SELECT 
  policyname, 
  cmd as command,
  permissive,
  qual as using_clause,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- Test if we can see current auth context
SELECT 
  auth.uid() as current_user_id,
  auth.role() as current_role,
  current_setting('request.jwt.claims', true) as jwt_claims;

-- Count total profiles (this should work with service_role)
SELECT COUNT(*) as total_profiles FROM public.profiles;
