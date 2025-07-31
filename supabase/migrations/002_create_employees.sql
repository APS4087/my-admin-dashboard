-- Create employees table for company employee management
create table if not exists public.employees (
  id uuid default gen_random_uuid() primary key,
  employee_number serial unique not null,
  email_address text unique not null,
  first_name text not null,
  last_name text not null,
  display_name text,
  current_email_password text, -- Consider encrypting this field
  department text,
  office_phone text,
  mobile_phone text,
  job_title text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id)
);

-- Set up Row Level Security (RLS)
alter table public.employees enable row level security;

-- Create policies for employee management
-- Only authenticated users can view employees
create policy "Authenticated users can view employees" on public.employees
  for select using (auth.role() = 'authenticated');

-- Only admins can insert, update, or delete employees
create policy "Admins can manage employees" on public.employees
  for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() 
      and role in ('admin', 'administrator')
    )
  );

-- Create indexes for better performance
create index if not exists idx_employees_email on public.employees(email_address);
create index if not exists idx_employees_department on public.employees(department);
create index if not exists idx_employees_active on public.employees(is_active);
create index if not exists idx_employees_created_at on public.employees(created_at);

-- Create function to update updated_at timestamp
create or replace function public.update_employees_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  new.updated_by = auth.uid();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
drop trigger if exists update_employees_updated_at on public.employees;
create trigger update_employees_updated_at
  before update on public.employees
  for each row execute procedure public.update_employees_updated_at();

-- Create function to set created_by on insert
create or replace function public.set_employees_created_by()
returns trigger as $$
begin
  new.created_by = auth.uid();
  return new;
end;
$$ language plpgsql;

-- Create trigger for created_by
drop trigger if exists set_employees_created_by on public.employees;
create trigger set_employees_created_by
  before insert on public.employees
  for each row execute procedure public.set_employees_created_by();
