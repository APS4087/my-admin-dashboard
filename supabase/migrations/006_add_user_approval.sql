-- Add user approval system to profiles table
-- This migration adds an 'approved' column to track user approval status

-- Add approved column to profiles table (if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND column_name = 'approved'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN approved boolean DEFAULT false;
  END IF;
END $$;

-- Update existing admin users to be approved automatically
UPDATE public.profiles 
SET approved = true 
WHERE role IN ('admin', 'administrator');

-- Add index for performance on approval queries
CREATE INDEX IF NOT EXISTS idx_profiles_approved ON public.profiles(approved);

-- Create a function to auto-approve admin users
CREATE OR REPLACE FUNCTION public.auto_approve_admin_users()
RETURNS trigger AS $$
BEGIN
  -- Auto-approve users with admin roles
  IF NEW.role IN ('admin', 'administrator') THEN
    NEW.approved = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-approve admin users
DROP TRIGGER IF EXISTS auto_approve_admin_users ON public.profiles;
CREATE TRIGGER auto_approve_admin_users
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.auto_approve_admin_users();

-- Create RLS policy for user approval management
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile, admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile, admins can update any" ON public.profiles;

-- Simple policy: Users can only view their own profile
-- Admins will use service role key to bypass RLS entirely
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

-- Simple policy: Users can only update their own profile  
-- Admins will use service role key to bypass RLS entirely
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.approved IS 'Whether the user has been approved by an admin to access the system';
