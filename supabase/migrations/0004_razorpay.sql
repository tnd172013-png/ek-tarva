-- Razorpay payments (replaces the manual UPI + screenshot flow for new
-- registrations). Run in the Supabase SQL editor on the same project as 0001-0003.
--
-- No new table: this only adds columns to public.registrations.
-- Existing UPI rows keep their utr / screenshot_path and stay verifiable by hand.
--
-- payment_status values: 'pending' (legacy UPI, awaiting manual check),
-- 'awaiting_payment' (Razorpay order created, not paid yet), 'paid', 'failed'.

alter table public.registrations
  add column if not exists payment_method text not null default 'upi',
  add column if not exists razorpay_order_id text,
  add column if not exists razorpay_payment_id text;

create unique index if not exists registrations_razorpay_order_id_key
  on public.registrations (razorpay_order_id) where razorpay_order_id is not null;
create index if not exists registrations_razorpay_payment_id_idx
  on public.registrations (razorpay_payment_id) where razorpay_payment_id is not null;
