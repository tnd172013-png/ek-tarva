-- Add the candidate's role preference to registrations.
-- Run in the Supabase SQL editor on the same project as 0001.
alter table public.registrations
  add column if not exists role_preference text;
