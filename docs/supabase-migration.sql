-- Migration: Add vesselfinder_url column to ships table
-- Date: 2025-07-31
-- Description: Adds a column to store VesselFinder URLs for each ship

-- Add the vesselfinder_url column to the ships table
ALTER TABLE ships 
ADD COLUMN vesselfinder_url TEXT;

-- Add a comment to describe the column
COMMENT ON COLUMN ships.vesselfinder_url IS 'VesselFinder detail page URL for scraping vessel data';

-- Optional: Add a check constraint to ensure URLs are valid VesselFinder URLs
ALTER TABLE ships 
ADD CONSTRAINT check_vesselfinder_url 
CHECK (
  vesselfinder_url IS NULL OR 
  vesselfinder_url LIKE 'https://www.vesselfinder.com/vessels/details/%'
);

-- Create an index on the vesselfinder_url column for better query performance
CREATE INDEX IF NOT EXISTS idx_ships_vesselfinder_url ON ships(vesselfinder_url);

-- Example: Update existing ships with VesselFinder URLs
-- (Replace these with your actual ship data)

-- Update HY EMERALD with its VesselFinder URL
UPDATE ships 
SET vesselfinder_url = 'https://www.vesselfinder.com/vessels/details/9676307'
WHERE LOWER(name) = 'hy emerald' OR LOWER(name) = 'hyemerald';

-- Example updates for other ships (you can modify these based on your actual data)
UPDATE ships 
SET vesselfinder_url = 'https://www.vesselfinder.com/vessels/details/9234567'
WHERE LOWER(name) LIKE '%anderson%';

UPDATE ships 
SET vesselfinder_url = 'https://www.vesselfinder.com/vessels/details/9345678'
WHERE LOWER(name) LIKE '%pacific%';

-- Verify the changes
SELECT 
  id,
  name,
  vesselfinder_url,
  created_at
FROM ships 
WHERE vesselfinder_url IS NOT NULL
ORDER BY name;
