-- Create ship_auth table for ship authentication credentials
create table if not exists public.ship_auth (
  id uuid default gen_random_uuid() primary key,
  ship_id uuid references public.ships(id) on delete cascade,
  ship_email text unique not null,
  ship_password text not null,
  app_password text not null,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

-- Set up Row Level Security (RLS)
alter table public.ship_auth enable row level security;

-- Create policies for ship authentication management
-- Only authenticated users can view ship auth
create policy "Authenticated users can view ship auth" on public.ship_auth
  for select using (auth.role() = 'authenticated');

-- Only admins can insert, update, or delete ship auth
create policy "Admins can manage ship auth" on public.ship_auth
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role in ('admin', 'administrator')
    )
  );

-- Create indexes for performance
create index if not exists ship_auth_ship_id_idx on public.ship_auth(ship_id);
create index if not exists ship_auth_email_idx on public.ship_auth(ship_email);
create index if not exists ship_auth_active_idx on public.ship_auth(is_active);

-- Create trigger to update updated_at column
create or replace function public.update_ship_auth_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_ship_auth_updated_at
  before update on public.ship_auth
  for each row
  execute function public.update_ship_auth_updated_at();

-- Insert sample ship authentication data
-- NOTE: Use environment variables or secure methods to populate real credentials
-- Example:
-- insert into public.ship_auth (ship_email, ship_password, app_password) values 
-- ('example@company.com', 'SECURE_PASSWORD_FROM_ENV', 'APP_SPECIFIC_PASSWORD_FROM_ENV');
