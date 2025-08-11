-- Final cleanup to remove the remaining old policies
-- Drop the old policies that are still there
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Verify we now have only the 3 policies we want
SELECT 
  policyname, 
  cmd as command,
  permissive
FROM pg_policies 
WHERE tablename = 'profiles' 
ORDER BY policyname;

-- Should show only:
-- system_profile_insert (INSERT)
-- user_own_profile_select (SELECT)  
-- user_own_profile_update (UPDATE)
