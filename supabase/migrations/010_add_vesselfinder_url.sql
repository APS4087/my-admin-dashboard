-- Add vesselfinder_url column to ships table
-- This column stores the VesselFinder.com URL for enhanced ship tracking

ALTER TABLE public.ships 
ADD COLUMN vesselfinder_url text;

-- Add comment for documentation
COMMENT ON COLUMN public.ships.vesselfinder_url IS 'VesselFinder.com URL for enhanced ship tracking and data scraping';

-- Create index for vesselfinder_url for faster queries
CREATE INDEX IF NOT EXISTS idx_ships_vesselfinder_url ON public.ships(vesselfinder_url) WHERE vesselfinder_url IS NOT NULL;

-- Update table statistics for query planner
ANALYZE public.ships;
