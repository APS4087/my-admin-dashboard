-- Performance optimization for ships table
-- Add indexes for faster queries and better search performance

-- Composite index for filtering and searching
CREATE INDEX IF NOT EXISTS idx_ships_active_email ON public.ships(is_active, ship_email);

-- Index for faster ordering by created_at
CREATE INDEX IF NOT EXISTS idx_ships_created_at_desc ON public.ships(created_at DESC);

-- Partial index for active ships only (most common query)
CREATE INDEX IF NOT EXISTS idx_ships_active_only ON public.ships(ship_email, created_at DESC) WHERE is_active = true;

-- Text search index for ship_email (case-insensitive search)
CREATE INDEX IF NOT EXISTS idx_ships_email_search ON public.ships USING gin(to_tsvector('english', ship_email));

-- Add table statistics for query planner
ANALYZE public.ships;
