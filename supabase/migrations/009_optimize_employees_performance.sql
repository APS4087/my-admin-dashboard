-- Optimize employees table performance
-- This migration adds indexes to improve query performance for employee data retrieval

-- 1. Composite index for active employees sorted by employee_number
CREATE INDEX IF NOT EXISTS idx_employees_active_number 
ON employees (is_active, employee_number) 
WHERE is_active = true;

-- 2. Index for employee_number sorting (primary sort field)
CREATE INDEX IF NOT EXISTS idx_employees_number_asc 
ON employees (employee_number ASC);

-- 3. Index for text search across name and email fields
CREATE INDEX IF NOT EXISTS idx_employees_search_fields 
ON employees USING gin(
  (first_name || ' ' || last_name || ' ' || email_address || ' ' || job_title) gin_trgm_ops
);

-- 4. Index for department filtering
CREATE INDEX IF NOT EXISTS idx_employees_department 
ON employees (department) 
WHERE department IS NOT NULL;

-- 5. Partial index for active employees only
CREATE INDEX IF NOT EXISTS idx_employees_active_only 
ON employees (created_at DESC) 
WHERE is_active = true;

-- 6. Index for updated_at for audit queries
CREATE INDEX IF NOT EXISTS idx_employees_updated_at_desc 
ON employees (updated_at DESC);

-- Enable pg_trgm extension for better text search if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Update table statistics for better query planning
ANALYZE employees;
