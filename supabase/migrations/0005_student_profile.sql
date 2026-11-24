-- Student details collected on the registration form.
-- No new table: adds columns to public.registrations.
alter table public.registrations
  add column if not exists college_name text,
  add column if not exists course_year text,
  add column if not exists recruitment_type text;  -- 'Full Time Job' | 'Internship'
