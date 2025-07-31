-- Create ships table for ship management
create table if not exists public.ships (
  id uuid default gen_random_uuid() primary key,
  ship_number serial unique not null,
  ship_name text unique not null,
  imo_number text unique,
  flag_state text,
  ship_type text,
  year_built integer,
  gross_tonnage integer,
  net_tonnage integer,
  length_overall decimal(10,2),
  beam decimal(10,2),
  draft decimal(10,2),
  engine_make text,
  engine_model text,
  engine_power integer,
  classification_society text,
  management_company text,
  owner_company text,
  current_port text,
  next_port text,
  estimated_arrival timestamp with time zone,
  ship_email text,
  ship_password text, -- Ship's email/system password
  satellite_phone text,
  inmarsat_number text,
  is_active boolean default true,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

-- Set up Row Level Security (RLS)
alter table public.ships enable row level security;

-- Create policies for ship management
-- Only authenticated users can view ships
create policy "Authenticated users can view ships" on public.ships
  for select using (auth.role() = 'authenticated');

-- Only admins can insert, update, or delete ships
create policy "Admins can manage ships" on public.ships
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role in ('admin', 'administrator')
    )
  );

-- Create indexes for better performance
create index if not exists idx_ships_name on public.ships(ship_name);
create index if not exists idx_ships_imo on public.ships(imo_number);
create index if not exists idx_ships_type on public.ships(ship_type);
create index if not exists idx_ships_active on public.ships(is_active);
create index if not exists idx_ships_created_at on public.ships(created_at);
create index if not exists idx_ships_management_company on public.ships(management_company);

-- Create function to update updated_at timestamp
create or replace function public.update_ships_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  new.updated_by = auth.uid();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
drop trigger if exists update_ships_updated_at on public.ships;
create trigger update_ships_updated_at
  before update on public.ships
  for each row execute procedure public.update_ships_updated_at();

-- Create function to set created_by on insert
create or replace function public.set_ships_created_by()
returns trigger as $$
begin
  new.created_by = auth.uid();
  return new;
end;
$$ language plpgsql;

-- Create trigger for created_by
drop trigger if exists set_ships_created_by on public.ships;
create trigger set_ships_created_by
  before insert on public.ships
  for each row execute procedure public.set_ships_created_by();
