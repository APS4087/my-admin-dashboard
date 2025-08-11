-- Secure ship credentials seeding script
-- This script should be run manually with real credentials from environment variables
-- DO NOT commit real credentials to version control

-- Example usage (run this in your Supabase SQL editor or through environment):
-- Replace the placeholder values with actual environment variables or secure input

-- Option 1: Use with environment variables (recommended)
-- INSERT INTO public.ships (ship_email, ship_password, app_password) VALUES 
-- (getenv('SHIP_EMAIL_1'), getenv('SHIP_PASSWORD_1'), getenv('APP_PASSWORD_1')),
-- (getenv('SHIP_EMAIL_2'), getenv('SHIP_PASSWORD_2'), getenv('APP_PASSWORD_2')),
-- (getenv('SHIP_EMAIL_3'), getenv('SHIP_PASSWORD_3'), getenv('APP_PASSWORD_3'));

-- Option 2: Manual replacement (use this template and replace values manually)
-- INSERT INTO public.ships (ship_email, ship_password, app_password) VALUES 
-- ('REPLACE_WITH_ACTUAL_EMAIL_1', 'REPLACE_WITH_ACTUAL_PASSWORD_1', 'REPLACE_WITH_ACTUAL_APP_PASSWORD_1'),
-- ('REPLACE_WITH_ACTUAL_EMAIL_2', 'REPLACE_WITH_ACTUAL_PASSWORD_2', 'REPLACE_WITH_ACTUAL_APP_PASSWORD_2'),
-- ('REPLACE_WITH_ACTUAL_EMAIL_3', 'REPLACE_WITH_ACTUAL_PASSWORD_3', 'REPLACE_WITH_ACTUAL_APP_PASSWORD_3');

-- IMPORTANT SECURITY NOTES:
-- 1. Never commit real credentials to version control
-- 2. Use environment variables or secure configuration management
-- 3. Consider encrypting passwords at rest in the database
-- 4. Use app-specific passwords for email accounts
-- 5. Regularly rotate credentials
