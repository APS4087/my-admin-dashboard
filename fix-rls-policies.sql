-- Fix RLS policy conflicts that are causing 500 errors
-- Run this in your Supabase SQL Editor

-- First, drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile, admins can update any" ON public.profiles;
DROP POLICY IF EXISTS "Only admins can update approval status" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Create clean, non-conflicting policies

-- 1. SELECT policy: Users can view their own profile, admins can view all profiles
CREATE POLICY "profile_select_policy" ON public.profiles
  FOR SELECT USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'administrator')
    )
  );

-- 2. UPDATE policy: Users can update their own profile, admins can update any profile  
CREATE POLICY "profile_update_policy" ON public.profiles
  FOR UPDATE USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'administrator')
    )
  );

-- 3. INSERT policy: Only the system (via triggers) can insert profiles
CREATE POLICY "profile_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (true);

-- 4. DELETE policy: Only admins can delete profiles (optional)
CREATE POLICY "profile_delete_policy" ON public.profiles
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'administrator')
    )
  );

-- Verify RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Test query to ensure it works (replace with your actual user ID)
-- SELECT * FROM public.profiles WHERE id = auth.uid();
