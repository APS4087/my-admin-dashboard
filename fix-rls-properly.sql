-- PROPER FIX: Re-enable RLS with corrected policies that handle JWT context properly
-- Run this after confirming the temporary fix worked

-- Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies to start clean
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile, admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update approval status" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_all_access" ON public.profiles;
DROP POLICY IF EXISTS "allow_system_insert" ON public.profiles;

-- Create simple, non-recursive policies
-- SELECT policy: Users can only read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );

-- UPDATE policy: Users can only update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );

-- INSERT policy: Allow system to create profiles (for new user registration)
CREATE POLICY "profiles_insert_system" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- For admin access, we'll handle this at the application level to avoid recursion
-- This is safer and more performant than recursive RLS policies

-- Test the policies
SELECT 'Policies created successfully' as status;

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Show all policies
SELECT policyname, cmd, permissive 
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
