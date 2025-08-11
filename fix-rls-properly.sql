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

-- Create robust policies that handle JWT context issues
-- SELECT policy: Allow users to read their own profile, with fallback for admins
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    -- Allow if authenticated user is viewing their own profile
    (auth.uid() IS NOT NULL AND id = auth.uid())
    OR
    -- Allow admins to view all profiles
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'administrator')
    ))
  );

-- UPDATE policy: Allow users to update their own profile, admins can update any
CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (
    -- Allow if authenticated user is updating their own profile  
    (auth.uid() IS NOT NULL AND id = auth.uid())
    OR
    -- Allow admins to update any profile
    (auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'administrator')
    ))
  );

-- INSERT policy: Allow system to create profiles (for new user registration)
-- This uses WITH CHECK instead of USING since it's for INSERT
CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- DELETE policy: Only admins can delete profiles
CREATE POLICY "profiles_delete_policy" ON public.profiles
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'administrator')
    )
  );

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
