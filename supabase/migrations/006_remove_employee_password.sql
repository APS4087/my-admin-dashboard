-- Migration to remove password field from employees table
-- This removes the current_email_password field since employees don't need authentication

-- Remove the password column from employees table
ALTER TABLE public.employees DROP COLUMN IF EXISTS current_email_password;

-- Note: This migration will permanently remove the current_email_password column
-- Make sure to backup any important data before running this migration
