-- Tivva notifications: likes, comments and follows
create table if not exists public.tivva_notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references auth.users(id) on delete cascade,
  actor_id uuid not null references auth.users(id) on delete cascade,
  actor_name text not null default 'Tivva user',
  type text not null check (type in ('like','comment','follow')),
  message text not null,
  video_id text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create index if not exists tivva_notifications_recipient_created_idx on public.tivva_notifications(recipient_id, created_at desc);
alter table public.tivva_notifications enable row level security;
drop policy if exists "Users can read their notifications" on public.tivva_notifications;
create policy "Users can read their notifications" on public.tivva_notifications for select to authenticated using (auth.uid() = recipient_id);
drop policy if exists "Users can create notifications as actor" on public.tivva_notifications;
create policy "Users can create notifications as actor" on public.tivva_notifications for insert to authenticated with check (auth.uid() = actor_id and recipient_id <> actor_id);
drop policy if exists "Users can mark own notifications read" on public.tivva_notifications;
create policy "Users can mark own notifications read" on public.tivva_notifications for update to authenticated using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);
grant select, insert, update on public.tivva_notifications to authenticated;
