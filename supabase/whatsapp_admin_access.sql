create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
  );
$$;

alter table if exists public.whatsapp_users enable row level security;
alter table if exists public.whatsapp_orders enable row level security;

grant usage on schema public to authenticated;
grant select on table public.whatsapp_users to authenticated;
grant select on table public.whatsapp_orders to authenticated;
grant update (order_status, updated_at) on table public.whatsapp_orders to authenticated;

drop policy if exists whatsapp_users_select_admin on public.whatsapp_users;
create policy whatsapp_users_select_admin
on public.whatsapp_users
for select
to authenticated
using (public.is_admin());

drop policy if exists whatsapp_orders_select_admin on public.whatsapp_orders;
create policy whatsapp_orders_select_admin
on public.whatsapp_orders
for select
to authenticated
using (public.is_admin());

drop policy if exists whatsapp_orders_update_admin on public.whatsapp_orders;
create policy whatsapp_orders_update_admin
on public.whatsapp_orders
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
