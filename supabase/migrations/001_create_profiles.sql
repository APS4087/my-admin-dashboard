-- Create profiles table
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin', 'administrator')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Create function to handle user creation
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for new user creation
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create function to handle profile updates
create or replace function public.handle_user_update()
returns trigger as $$
begin
  update public.profiles
  set
    email = new.email,
    full_name = new.raw_user_meta_data->>'full_name',
    avatar_url = new.raw_user_meta_data->>'avatar_url',
    updated_at = timezone('utc'::text, now())
  where id = new.id;
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger for user updates
drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update on auth.users
  for each row execute procedure public.handle_user_update();

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.update_updated_at_column();

-- Function to promote user to admin (can only be called by existing admins)
create or replace function public.promote_user_to_admin(user_email text, new_role text default 'admin')
returns void as $$
declare
  current_user_role text;
begin
  -- Check if the current user is an admin
  select role into current_user_role 
  from public.profiles 
  where id = auth.uid();
  
  if current_user_role not in ('admin', 'administrator') then
    raise exception 'Only admins can promote users';
  end if;
  
  -- Validate the new role
  if new_role not in ('user', 'admin', 'administrator') then
    raise exception 'Invalid role. Must be user, admin, or administrator';
  end if;
  
  -- Update the user's role
  update public.profiles 
  set role = new_role, updated_at = timezone('utc'::text, now())
  where email = user_email;
  
  if not found then
    raise exception 'User with email % not found', user_email;
  end if;
end;
$$ language plpgsql security definer;

-- Optional: Make the first user an administrator
-- Uncomment and update the email below to automatically set admin role
-- UPDATE public.profiles 
-- SET role = 'administrator' 
-- WHERE email = 'your-email@example.com';
