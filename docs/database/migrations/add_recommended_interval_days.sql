-- Add optional rebooking interval to services.
-- Run in Supabase SQL Editor after the main schema.

alter table public.services
  add column if not exists recommended_interval_days integer;

-- Optional: ensure only positive values when set
alter table public.services
  drop constraint if exists services_recommended_interval_days_positive;

alter table public.services
  add constraint services_recommended_interval_days_positive
  check (recommended_interval_days is null or recommended_interval_days > 0);
