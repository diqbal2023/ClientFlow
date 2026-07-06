-- ClientFlow MVP database schema
-- Run this file in the Supabase SQL Editor.
-- Safe to re-run: uses IF NOT EXISTS where possible.

-- ---------------------------------------------------------------------------
-- profiles
-- One app profile per authenticated Supabase Auth user.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  role text not null default 'client'
    check (role in ('admin', 'client')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- businesses
-- Branded business profile owned by one admin profile.
-- ---------------------------------------------------------------------------
create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  name text not null,
  business_type text,
  description text,
  logo_url text,
  brand_color text,
  brand_color_2 text,
  brand_color_3 text,
  cover_image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- services
-- Services offered by a business.
-- ---------------------------------------------------------------------------
create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null,
  description text,
  price numeric(10, 2),
  price_range text,
  duration_minutes integer,
  recommended_interval_days integer
    check (recommended_interval_days is null or recommended_interval_days > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- client_requests
-- Requests submitted by clients to a business.
-- service_id is optional.
-- ---------------------------------------------------------------------------
create table if not exists public.client_requests (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.profiles (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  service_id uuid references public.services (id) on delete set null,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'completed', 'canceled', 'reviewed', 'in_progress')),
  request_title text,
  request_details text,
  preferred_date date,
  client_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes for common lookups
create index if not exists businesses_owner_id_idx on public.businesses (owner_id);
create index if not exists services_business_id_idx on public.services (business_id);
create index if not exists client_requests_client_id_idx on public.client_requests (client_id);
create index if not exists client_requests_business_id_idx on public.client_requests (business_id);
create index if not exists client_requests_service_id_idx on public.client_requests (service_id);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS)
-- Simple starter policies for the MVP.
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.services enable row level security;
alter table public.client_requests enable row level security;

-- profiles: users can view and update their own profile
create policy "Users can view own profile"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles
  for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles
  for insert
  with check (auth.uid() = id);

create policy "Business owners can view client profiles for their requests"
  on public.profiles
  for select
  using (
    exists (
      select 1
      from public.client_requests cr
      join public.businesses b on b.id = cr.business_id
      where cr.client_id = profiles.id
        and b.owner_id = auth.uid()
    )
  );

-- businesses: anyone can browse businesses; owners manage their own business
create policy "Anyone can view businesses"
  on public.businesses
  for select
  using (true);

create policy "Owners can insert their business"
  on public.businesses
  for insert
  with check (auth.uid() = owner_id);

create policy "Owners can update their business"
  on public.businesses
  for update
  using (auth.uid() = owner_id);

create policy "Owners can delete their business"
  on public.businesses
  for delete
  using (auth.uid() = owner_id);

-- services: anyone can browse services; business owners manage their services
create policy "Anyone can view services"
  on public.services
  for select
  using (true);

create policy "Owners can insert services for their business"
  on public.services
  for insert
  with check (
    exists (
      select 1
      from public.businesses
      where businesses.id = services.business_id
        and businesses.owner_id = auth.uid()
    )
  );

create policy "Owners can update services for their business"
  on public.services
  for update
  using (
    exists (
      select 1
      from public.businesses
      where businesses.id = services.business_id
        and businesses.owner_id = auth.uid()
    )
  );

create policy "Owners can delete services for their business"
  on public.services
  for delete
  using (
    exists (
      select 1
      from public.businesses
      where businesses.id = services.business_id
        and businesses.owner_id = auth.uid()
    )
  );

-- client_requests: clients manage their own requests; business owners see requests for their business
create policy "Clients can view own requests"
  on public.client_requests
  for select
  using (auth.uid() = client_id);

create policy "Business owners can view requests for their business"
  on public.client_requests
  for select
  using (
    exists (
      select 1
      from public.businesses
      where businesses.id = client_requests.business_id
        and businesses.owner_id = auth.uid()
    )
  );

create policy "Clients can create requests"
  on public.client_requests
  for insert
  with check (auth.uid() = client_id);

create policy "Business owners can update requests for their business"
  on public.client_requests
  for update
  using (
    exists (
      select 1
      from public.businesses
      where businesses.id = client_requests.business_id
        and businesses.owner_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.businesses
      where businesses.id = client_requests.business_id
        and businesses.owner_id = auth.uid()
    )
  );

create policy "Clients can update own requests"
  on public.client_requests
  for update
  using (auth.uid() = client_id)
  with check (auth.uid() = client_id);

create policy "Clients can delete own requests"
  on public.client_requests
  for delete
  using (auth.uid() = client_id);

-- ---------------------------------------------------------------------------
-- Auto-create profile on signup (works with email confirmation enabled)
-- Uses full_name and role from auth.signUp options.data metadata.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
