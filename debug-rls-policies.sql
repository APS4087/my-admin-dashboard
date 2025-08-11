-- Debug and fix RLS policies for profile access
-- Run this in your Supabase SQL Editor

-- First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Let's also check if there are any issues with the auth.uid() function
-- This should return the current user's ID when executed by an authenticated user
SELECT auth.uid() as current_user_id;

-- Drop existing policies and recreate with better error handling
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile, admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update approval status" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "profile_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profile_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profile_delete_policy" ON public.profiles;

-- Create a simple, reliable SELECT policy
CREATE POLICY "allow_own_profile_select" ON public.profiles
  FOR SELECT USING (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );

-- Create a simple UPDATE policy for own profile
CREATE POLICY "allow_own_profile_update" ON public.profiles
  FOR UPDATE USING (
    auth.uid() IS NOT NULL AND id = auth.uid()
  );

-- Create admin policies separately
CREATE POLICY "allow_admin_all_access" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'administrator')
    )
  );

-- Allow system to insert profiles (for new user registration)
CREATE POLICY "allow_system_insert" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- Test the policies work
-- This should return rows for the current user
SELECT id, email, role, approved FROM public.profiles WHERE id = auth.uid();
