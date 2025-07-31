-- Migration to simplify ships table to only 3 authentication fields
-- This will drop the old complex ships table and create a new simplified one

-- Drop the old ships table and related objects
DROP TABLE IF EXISTS public.ships CASCADE;

-- Create the new simplified ships table with only 3 authentication fields
CREATE TABLE public.ships (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ship_email text UNIQUE NOT NULL,
  ship_password text NOT NULL,
  app_password text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  updated_by uuid REFERENCES auth.users(id)
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.ships ENABLE ROW LEVEL SECURITY;

-- Create policies for ship management
-- Only authenticated users can view ships
CREATE POLICY "Authenticated users can view ships" ON public.ships
  FOR SELECT USING (auth.role() = 'authenticated');

-- Only admins can insert, update, or delete ships
CREATE POLICY "Admins can manage ships" ON public.ships
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() 
      AND role IN ('admin', 'administrator')
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ships_email ON public.ships(ship_email);
CREATE INDEX IF NOT EXISTS idx_ships_active ON public.ships(is_active);
CREATE INDEX IF NOT EXISTS idx_ships_created_at ON public.ships(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_ships_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_ships_updated_at ON public.ships;
CREATE TRIGGER update_ships_updated_at
  BEFORE UPDATE ON public.ships
  FOR EACH ROW EXECUTE PROCEDURE public.update_ships_updated_at();

-- Create function to set created_by on insert
CREATE OR REPLACE FUNCTION public.set_ships_created_by()
RETURNS trigger AS $$
BEGIN
  NEW.created_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for created_by
DROP TRIGGER IF EXISTS set_ships_created_by ON public.ships;
CREATE TRIGGER set_ships_created_by
  BEFORE INSERT ON public.ships
  FOR EACH ROW EXECUTE PROCEDURE public.set_ships_created_by();

-- Insert your sample ship authentication data
INSERT INTO public.ships (ship_email, ship_password, app_password) VALUES 
('hy.emerald@gmail.com', 'Hyemerald@87204827', 'hhxrnbkuxcvieofr'),
('hypartner02@gmail.com', 'Hypartner@87204825', 'tpmk jmtv ypwz xhhw'),
('hychampion03@gmail.com', 'Hychampion@87204820', 'xhlv mhqa etdo yhsv');

-- Note: This migration will delete all existing ship data and recreate the table
-- Make sure to backup any important data before running this migration
