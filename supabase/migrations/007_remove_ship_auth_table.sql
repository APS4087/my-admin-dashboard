-- Migration to clean up ship_auth table
-- Since we're consolidating everything into the simplified ships table, we no longer need ship_auth

-- Drop the ship_auth table if it exists
DROP TABLE IF EXISTS public.ship_auth CASCADE;

-- Note: This will permanently delete the ship_auth table
-- All ship authentication data should now be in the simplified ships table
