create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  phone text,
  role text not null check (role in ('super_admin', 'admin', 'finance', 'telecaller')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check
  check (role in ('super_admin', 'admin', 'finance', 'telecaller'));

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  email text,
  source text,
  priority text not null default 'WARM',
  status text not null default 'new' check (status in ('new', 'assigned', 'interested', 'not_interested', 'callback', 'followup', 'appointment_booked', 'converted')),
  created_at timestamptz not null default now()
);

alter table public.leads add column if not exists priority text not null default 'WARM';

alter table public.leads drop constraint if exists leads_status_check;
alter table public.leads add constraint leads_status_check
  check (status in ('new', 'assigned', 'interested', 'not_interested', 'callback', 'followup', 'appointment_booked', 'converted'));

create table if not exists public.lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null unique references public.leads(id) on delete cascade,
  assigned_to uuid not null references public.profiles(auth_user_id),
  assigned_by uuid references public.profiles(auth_user_id),
  assigned_at timestamptz not null default now()
);

create table if not exists public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null references public.profiles(auth_user_id),
  note text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null references public.profiles(auth_user_id),
  followup_date timestamptz not null,
  followup_type text not null default 'call',
  note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.followups add column if not exists followup_type text not null default 'call';
alter table public.followups add column if not exists note text;

create table if not exists public.call_logs (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null references public.profiles(auth_user_id),
  outcome text not null,
  duration_seconds integer,
  notes text,
  created_at timestamptz not null default now()
);

alter table public.call_logs add column if not exists duration_seconds integer;
alter table public.call_logs add column if not exists notes text;

create table if not exists public.status_history (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  user_id uuid not null references public.profiles(auth_user_id),
  from_status text,
  to_status text not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  customer_name text not null,
  customer_phone text not null,
  created_by uuid not null references public.profiles(auth_user_id),
  assigned_to uuid not null references public.profiles(auth_user_id),
  appointment_date date not null,
  appointment_time text not null,
  appointment_type text not null,
  meeting_mode text not null,
  status text not null default 'scheduled',
  notes text,
  cancellation_reason text,
  reminder_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.appointment_activity_logs (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id) on delete cascade,
  actor_id uuid not null references public.profiles(auth_user_id),
  action text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(auth_user_id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.finance_invoices (
  id uuid primary key default gen_random_uuid(),
  invoice_number text not null unique,
  customer_name text not null,
  customer_email text,
  customer_phone text,
  amount numeric(12,2) not null check (amount >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(12,2) generated always as (amount + tax_amount) stored,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  due_date date not null,
  paid_at timestamptz,
  created_by uuid references public.profiles(auth_user_id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.finance_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references public.finance_invoices(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  method text not null default 'manual',
  reference text,
  recorded_by uuid references public.profiles(auth_user_id),
  created_at timestamptz not null default now()
);

create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists lead_assignments_assigned_to_idx on public.lead_assignments(assigned_to);
create index if not exists lead_notes_user_id_idx on public.lead_notes(user_id);
create index if not exists followups_user_id_idx on public.followups(user_id);
create index if not exists call_logs_user_id_idx on public.call_logs(user_id);
create index if not exists audit_logs_actor_id_idx on public.audit_logs(actor_id);
create index if not exists status_history_lead_id_idx on public.status_history(lead_id);
create index if not exists status_history_user_id_idx on public.status_history(user_id);
create index if not exists appointments_lead_id_idx on public.appointments(lead_id);
create index if not exists appointments_created_by_idx on public.appointments(created_by);
create index if not exists appointments_assigned_to_idx on public.appointments(assigned_to);
create index if not exists appointments_appointment_date_idx on public.appointments(appointment_date);
create index if not exists appointments_status_idx on public.appointments(status);
create index if not exists appointment_activity_logs_appointment_id_idx on public.appointment_activity_logs(appointment_id);
create index if not exists appointment_activity_logs_actor_id_idx on public.appointment_activity_logs(actor_id);
create index if not exists finance_invoices_status_idx on public.finance_invoices(status);
create index if not exists finance_invoices_due_date_idx on public.finance_invoices(due_date);
create index if not exists finance_payments_invoice_id_idx on public.finance_payments(invoice_id);

alter table public.profiles enable row level security;
alter table public.leads enable row level security;
alter table public.lead_assignments enable row level security;
alter table public.lead_notes enable row level security;
alter table public.followups enable row level security;
alter table public.call_logs enable row level security;
alter table public.audit_logs enable row level security;
alter table public.status_history enable row level security;
alter table public.appointments enable row level security;
alter table public.appointment_activity_logs enable row level security;
alter table public.finance_invoices enable row level security;
alter table public.finance_payments enable row level security;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid()
      and role = 'super_admin'
      and is_active = true
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;

create or replace function public.is_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin() or public.is_admin();
$$;

create or replace function public.is_finance()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid()
      and role = 'finance'
      and is_active = true
  );
$$;

create or replace function public.is_finance_operator()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin() or public.is_finance();
$$;

create policy "profiles super admin full access"
on public.profiles for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "profiles users read own profile"
on public.profiles for select
using (auth_user_id = auth.uid() and is_active = true);

create policy "admins read operational profiles"
on public.profiles for select
using (public.is_admin() and role in ('admin', 'telecaller'));

create policy "admins manage telecaller profiles"
on public.profiles for update
using (public.is_admin() and role = 'telecaller')
with check (public.is_admin() and role = 'telecaller');

create policy "leads super admin full access"
on public.leads for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admins manage all leads"
on public.leads for all
using (public.is_admin())
with check (public.is_admin());

create policy "telecallers read assigned leads"
on public.leads for select
using (
  exists (
    select 1 from public.lead_assignments la
    where la.lead_id = leads.id
      and la.assigned_to = auth.uid()
  )
);

create policy "telecallers update assigned lead status"
on public.leads for update
using (
  exists (
    select 1 from public.lead_assignments la
    where la.lead_id = leads.id
      and la.assigned_to = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.lead_assignments la
    where la.lead_id = leads.id
      and la.assigned_to = auth.uid()
  )
);

create policy "lead assignments super admin full access"
on public.lead_assignments for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admins manage lead assignments"
on public.lead_assignments for all
using (public.is_admin())
with check (public.is_admin());

create policy "telecallers read own assignments"
on public.lead_assignments for select
using (assigned_to = auth.uid());

create policy "lead notes super admin full access"
on public.lead_notes for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admins read lead notes"
on public.lead_notes for select
using (public.is_admin());

create policy "telecallers manage notes for assigned leads"
on public.lead_notes for all
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.lead_assignments la
    where la.lead_id = lead_notes.lead_id
      and la.assigned_to = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.lead_assignments la
    where la.lead_id = lead_notes.lead_id
      and la.assigned_to = auth.uid()
  )
);

create policy "followups super admin full access"
on public.followups for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admins manage followups"
on public.followups for all
using (public.is_admin())
with check (public.is_admin());

create policy "telecallers manage own followups"
on public.followups for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "call logs super admin full access"
on public.call_logs for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admins read call logs"
on public.call_logs for select
using (public.is_admin());

create policy "telecallers manage own call logs"
on public.call_logs for all
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "audit logs super admin read"
on public.audit_logs for select
using (public.is_super_admin());

create policy "admins read audit logs"
on public.audit_logs for select
using (public.is_admin());

create policy "audit logs authenticated insert"
on public.audit_logs for insert
with check (actor_id = auth.uid() or public.is_super_admin());

create policy "status history super admin full access"
on public.status_history for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admins read status history"
on public.status_history for select
using (public.is_admin());

create policy "telecallers manage status history for assigned leads"
on public.status_history for all
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.lead_assignments la
    where la.lead_id = status_history.lead_id
      and la.assigned_to = auth.uid()
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.lead_assignments la
    where la.lead_id = status_history.lead_id
      and la.assigned_to = auth.uid()
  )
);

create policy "appointments super admin full access"
on public.appointments for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admins manage appointments"
on public.appointments for all
using (public.is_admin())
with check (public.is_admin());

create policy "telecallers manage assigned appointments"
on public.appointments for all
using (
  created_by = auth.uid()
  or assigned_to = auth.uid()
  or exists (
    select 1 from public.lead_assignments la
    where la.lead_id = appointments.lead_id
      and la.assigned_to = auth.uid()
  )
)
with check (
  created_by = auth.uid()
  and exists (
    select 1 from public.lead_assignments la
    where la.lead_id = appointments.lead_id
      and la.assigned_to = auth.uid()
  )
);

create policy "appointment logs super admin full access"
on public.appointment_activity_logs for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "admins read appointment logs"
on public.appointment_activity_logs for select
using (public.is_admin());

create policy "telecallers manage own appointment logs"
on public.appointment_activity_logs for all
using (actor_id = auth.uid())
with check (actor_id = auth.uid());

create policy "finance invoices super admin full access"
on public.finance_invoices for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "finance users manage invoices"
on public.finance_invoices for all
using (public.is_finance())
with check (public.is_finance());

create policy "finance payments super admin full access"
on public.finance_payments for all
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "finance users manage payments"
on public.finance_payments for all
using (public.is_finance())
with check (public.is_finance());
