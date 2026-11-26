-- Tivva trend suggestions and rights-aware content submissions.
-- Safe to run more than once.
create table if not exists public.trend_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_type text not null default 'link_suggestion',
  title text not null check (char_length(title) between 1 and 100),
  source_url text not null,
  description text not null default '',
  rights_confirmed boolean not null default false,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.trend_submissions
  add column if not exists submission_type text not null default 'link_suggestion';

alter table public.trend_submissions
  alter column rights_confirmed set default false;

alter table public.trend_submissions
  drop constraint if exists trend_submissions_rights_confirmed_check;
alter table public.trend_submissions
  drop constraint if exists trend_submissions_submission_type_check;
alter table public.trend_submissions
  drop constraint if exists trend_submissions_status_check;
alter table public.trend_submissions
  drop constraint if exists trend_submissions_rights_mode_check;

alter table public.trend_submissions
  add constraint trend_submissions_submission_type_check
    check (submission_type in ('link_suggestion', 'licensed_content')),
  add constraint trend_submissions_status_check
    check (status in ('pending', 'approved', 'rejected')),
  add constraint trend_submissions_rights_mode_check
    check (submission_type = 'link_suggestion' or rights_confirmed = true);

alter table public.trend_submissions enable row level security;

drop policy if exists "Users can submit their own trends" on public.trend_submissions;
create policy "Users can submit their own trends"
on public.trend_submissions for insert to authenticated
with check (
  auth.uid() = user_id
  and status = 'pending'
  and (submission_type = 'link_suggestion' or rights_confirmed = true)
);

drop policy if exists "Users can view their own trend submissions" on public.trend_submissions;
create policy "Users can view their own trend submissions"
on public.trend_submissions for select to authenticated
using (auth.uid() = user_id);
