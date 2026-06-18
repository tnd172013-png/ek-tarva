-- Pitch to Hire — event days + company slot bookings
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
--
-- Model:
--   event_days     : admin-created Friday/Saturday event dates with a time range
--                    and minutes-per-person. Slots are NOT stored — they are
--                    derived from (start_time, end_time, slot_duration_min).
--   slot_bookings  : one row per company that books a slot. The partial unique
--                    index makes double-booking a slot impossible, even under
--                    concurrent submits (this is why Sheets can't do it).

create table if not exists public.event_days (
  id                uuid primary key default gen_random_uuid(),
  event_date        date        not null,
  start_time        time        not null,
  end_time          time        not null,
  slot_duration_min integer     not null default 10 check (slot_duration_min > 0),
  is_published      boolean     not null default false,
  created_at        timestamptz not null default now(),
  constraint end_after_start check (end_time > start_time)
);

create table if not exists public.slot_bookings (
  id                 uuid primary key default gen_random_uuid(),
  event_day_id       uuid not null references public.event_days(id) on delete cascade,
  slot_index         integer not null check (slot_index >= 0),
  slot_start         text,            -- denormalised "HH:MM" for easy CSV export
  slot_end           text,
  company_name       text not null,
  contact_name       text not null,
  location           text,
  mobile             text not null,
  email              text not null,
  team_full_time     text,
  team_part_time     text,
  team_freelance     text,
  roles              jsonb,           -- { "Frontend Developer": { count, package, skills }, ... }
  hire_other_domain  boolean default false,
  other_domains      jsonb,           -- [{ name, count, package }]
  hire_interns       boolean default false,
  intern_domain      text,
  intern_count       text,
  intern_stipend     text,
  intern_duration    text,
  notes              text,
  status             text not null default 'booked',  -- 'booked' | 'cancelled'
  created_at         timestamptz not null default now()
);

-- No two active bookings can hold the same slot on the same day.
create unique index if not exists slot_bookings_unique_slot
  on public.slot_bookings (event_day_id, slot_index)
  where status = 'booked';

-- One active booking per company email per event day.
create unique index if not exists slot_bookings_unique_email_per_day
  on public.slot_bookings (event_day_id, lower(email))
  where status = 'booked';

create index if not exists slot_bookings_event_day_idx
  on public.slot_bookings (event_day_id);

create index if not exists event_days_published_date_idx
  on public.event_days (is_published, event_date);

-- Access is server-side only via the service-role key (see src/lib/supabase.ts),
-- which BYPASSES RLS. Enable RLS and add NO policies: the service role keeps
-- full access, while the public anon key gets none — which is what we want,
-- since these tables hold company contact details (email, phone).
alter table public.event_days   enable row level security;
alter table public.slot_bookings enable row level security;
