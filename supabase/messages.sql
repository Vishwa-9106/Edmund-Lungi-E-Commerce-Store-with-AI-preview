create extension if not exists "pgcrypto";

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_name text,
  sender_email text,
  subject text,
  message text,
  created_at timestamptz not null default now(),
  read_status text not null default 'unread'
);

alter table public.messages enable row level security;

drop policy if exists "messages_insert_anyone" on public.messages;
create policy "messages_insert_anyone" on public.messages
for insert
to anon, authenticated
with check (true);

drop policy if exists "messages_select_authenticated" on public.messages;
create policy "messages_select_authenticated" on public.messages
for select
to authenticated
using (true);

drop policy if exists "messages_update_authenticated" on public.messages;
create policy "messages_update_authenticated" on public.messages
for update
to authenticated
using (true)
with check (true);
