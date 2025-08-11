-- CLEAN UP DUPLICATE POLICIES - Run this first
-- This will remove ALL policies and start completely fresh

-- Drop ALL existing policies on profiles table
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile, admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update approval status" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_select" ON public.profiles;
DROP POLICY IF EXISTS "allow_own_profile_update" ON public.profiles;
DROP POLICY IF EXISTS "allow_admin_all_access" ON public.profiles;
DROP POLICY IF EXISTS "allow_system_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_system" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;

-- Verify all policies are gone
SELECT COUNT(*) as remaining_policies FROM pg_policies WHERE tablename = 'profiles';

-- Re-enable RLS (just to be sure)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Now create ONLY the policies we need - simple and clean
CREATE POLICY "user_own_profile_select" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );

CREATE POLICY "user_own_profile_update" ON public.profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );

CREATE POLICY "system_profile_insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Final verification
SELECT 'Setup complete' as status;

SELECT 
  policyname, 
  cmd as command,
  permissive
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;
