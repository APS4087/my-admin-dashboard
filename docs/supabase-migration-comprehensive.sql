-- Alternative Migration Approaches for VesselFinder URL Column
-- Choose the approach that best fits your current database schema

-- ==========================================
-- APPROACH 1: Simple Column Addition
-- ==========================================
-- Use this if you just want to add the column without constraints

ALTER TABLE ships ADD COLUMN vesselfinder_url TEXT;

-- ==========================================
-- APPROACH 2: Column with Validation
-- ==========================================
-- Use this if you want to ensure data quality

ALTER TABLE ships ADD COLUMN vesselfinder_url TEXT;

-- Add constraint to validate VesselFinder URLs
ALTER TABLE ships 
ADD CONSTRAINT check_vesselfinder_url_format 
CHECK (
  vesselfinder_url IS NULL OR 
  (vesselfinder_url ~ '^https://www\.vesselfinder\.com/vessels/details/[0-9]+$')
);

-- Add comment for documentation
COMMENT ON COLUMN ships.vesselfinder_url IS 'VesselFinder vessel detail page URL (format: https://www.vesselfinder.com/vessels/details/{vessel_id})';

-- ==========================================
-- APPROACH 3: Complete Migration with Data
-- ==========================================
-- Use this if you want to populate some initial data

-- Add the column
ALTER TABLE ships ADD COLUMN vesselfinder_url TEXT;

-- Add validation
ALTER TABLE ships 
ADD CONSTRAINT check_vesselfinder_url_format 
CHECK (
  vesselfinder_url IS NULL OR 
  vesselfinder_url LIKE 'https://www.vesselfinder.com/vessels/details/%'
);

-- Add index for performance
CREATE INDEX idx_ships_vesselfinder_url ON ships(vesselfinder_url) 
WHERE vesselfinder_url IS NOT NULL;

-- Populate known VesselFinder URLs
-- HY EMERALD (known vessel)
UPDATE ships 
SET vesselfinder_url = 'https://www.vesselfinder.com/vessels/details/9676307'
WHERE LOWER(TRIM(name)) IN ('hy emerald', 'hyemerald');

-- Add more ships as you discover their VesselFinder URLs
-- UPDATE ships 
-- SET vesselfinder_url = 'https://www.vesselfinder.com/vessels/details/VESSEL_ID'
-- WHERE LOWER(TRIM(name)) = 'ship_name';

-- ==========================================
-- APPROACH 4: Safe Migration with Rollback
-- ==========================================
-- Use this for production environments

-- Start transaction
BEGIN;

-- Add column
ALTER TABLE ships ADD COLUMN vesselfinder_url TEXT;

-- Add constraint
ALTER TABLE ships 
ADD CONSTRAINT check_vesselfinder_url_format 
CHECK (
  vesselfinder_url IS NULL OR 
  vesselfinder_url ~ '^https://www\.vesselfinder\.com/vessels/details/[0-9]+$'
);

-- Add index
CREATE INDEX CONCURRENTLY idx_ships_vesselfinder_url ON ships(vesselfinder_url) 
WHERE vesselfinder_url IS NOT NULL;

-- Test the migration
SELECT 
  COUNT(*) as total_ships,
  COUNT(vesselfinder_url) as ships_with_urls,
  COUNT(*) - COUNT(vesselfinder_url) as ships_without_urls
FROM ships;

-- If everything looks good, commit
COMMIT;

-- If something goes wrong, rollback with:
-- ROLLBACK;

-- ==========================================
-- UTILITY QUERIES
-- ==========================================

-- Check which ships don't have VesselFinder URLs
SELECT id, name, created_at 
FROM ships 
WHERE vesselfinder_url IS NULL 
ORDER BY name;

-- Validate existing URLs
SELECT id, name, vesselfinder_url 
FROM ships 
WHERE vesselfinder_url IS NOT NULL 
  AND vesselfinder_url !~ '^https://www\.vesselfinder\.com/vessels/details/[0-9]+$';

-- Count ships by URL status
SELECT 
  CASE 
    WHEN vesselfinder_url IS NULL THEN 'No URL'
    ELSE 'Has URL'
  END as url_status,
  COUNT(*) as count
FROM ships 
GROUP BY 
  CASE 
    WHEN vesselfinder_url IS NULL THEN 'No URL'
    ELSE 'Has URL'
  END;

-- ==========================================
-- EXAMPLE DATA INSERTS
-- ==========================================

-- Insert new ship with VesselFinder URL
INSERT INTO ships (name, type, flag, captain_email, vesselfinder_url)
VALUES (
  'HY EMERALD',
  'Container Ship',
  'Panama',
  'captain.emerald@hyline.com',
  'https://www.vesselfinder.com/vessels/details/9676307'
);

-- Bulk update multiple ships (adjust names and URLs as needed)
UPDATE ships SET vesselfinder_url = CASE 
  WHEN LOWER(name) = 'hy emerald' THEN 'https://www.vesselfinder.com/vessels/details/9676307'
  WHEN LOWER(name) LIKE '%anderson%' THEN 'https://www.vesselfinder.com/vessels/details/9234567'
  WHEN LOWER(name) LIKE '%pacific%' THEN 'https://www.vesselfinder.com/vessels/details/9345678'
  ELSE vesselfinder_url
END;
