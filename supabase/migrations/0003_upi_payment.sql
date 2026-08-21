-- UPI payment with manual verification (replaces the Razorpay payment link).
-- Run in the Supabase SQL editor on the same project as 0001/0002.
--
-- Flow: the candidate pays the fee to our UPI ID from their own app, then
-- submits the registration with the UTR / transaction ID and a screenshot.
-- payment_status stays 'pending' until an admin checks the proof in /admin
-- and marks it 'paid'. Duplicate UTRs are allowed in the table but flagged
-- in the admin list so reused screenshots get caught.

-- The registrations table was originally created by hand, outside the
-- migrations — create it here so a fresh project works from scripts alone.
create table if not exists public.registrations (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  email           text not null unique,
  phone           text not null,
  linkedin_url    text,
  role_preference text,
  payment_status  text not null default 'pending',  -- 'pending' | 'paid'
  utr             text,
  screenshot_path text,
  created_at      timestamptz not null default now()
);

-- Server-side access only via the service-role key (bypasses RLS); the
-- public anon key gets nothing — same setup as event_days/slot_bookings.
alter table public.registrations enable row level security;

-- Existing projects: add the new payment-proof columns.
alter table public.registrations
  add column if not exists utr text,
  add column if not exists screenshot_path text;

-- Private bucket for payment screenshots. Server-side only: uploads and reads
-- go through the service-role key (signed URLs for the admin page); the anon
-- key gets no access.
insert into storage.buckets (id, name, public)
values ('payment-proofs', 'payment-proofs', false)
on conflict (id) do nothing;
