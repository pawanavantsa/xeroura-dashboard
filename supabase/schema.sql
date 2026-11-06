-- Xeroura client workspace — run in the Supabase SQL editor (free project).
-- Auth users map 1:1 to members. RLS keeps each workspace private.

create table if not exists workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  plan text not null default 'studio',
  region text not null default 'ap-south-1',
  created_at timestamptz not null default now()
);

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references workspaces(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'member',
  unique (workspace_id, user_id)
);

create table if not exists products (
  id text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  name text not null,
  tag text,
  blurb text,
  seats int not null default 0,
  used int not null default 0,
  health numeric(5,2) not null default 100,
  status text not null default 'live'
);

create table if not exists tickets (
  id text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  title text not null,
  product text,
  pri text not null default 'med',
  status text not null default 'open',
  owner text,
  created_at timestamptz not null default now()
);

create table if not exists invoices (
  id text primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  period text not null,
  amount_paise int not null,
  status text not null default 'due',
  due_on date
);

create table if not exists usage_points (
  id bigint generated always as identity primary key,
  workspace_id uuid not null references workspaces(id) on delete cascade,
  week_start date not null,
  api_calls int not null default 0,
  seats int not null default 0
);

alter table workspaces enable row level security;
alter table members enable row level security;
alter table products enable row level security;
alter table tickets enable row level security;
alter table invoices enable row level security;
alter table usage_points enable row level security;

-- Members can read their own workspace rows. Writes stay with service role until the portal grows.
create policy "members read workspace" on workspaces for select using (
  exists (select 1 from members m where m.workspace_id = workspaces.id and m.user_id = auth.uid())
);
create policy "members read members" on members for select using (
  exists (select 1 from members m where m.workspace_id = members.workspace_id and m.user_id = auth.uid())
);
create policy "members read products" on products for select using (
  exists (select 1 from members m where m.workspace_id = products.workspace_id and m.user_id = auth.uid())
);
create policy "members read tickets" on tickets for select using (
  exists (select 1 from members m where m.workspace_id = tickets.workspace_id and m.user_id = auth.uid())
);
create policy "members write tickets" on tickets for insert with check (
  exists (select 1 from members m where m.workspace_id = tickets.workspace_id and m.user_id = auth.uid())
);
create policy "members read invoices" on invoices for select using (
  exists (select 1 from members m where m.workspace_id = invoices.workspace_id and m.user_id = auth.uid())
);
create policy "members read usage" on usage_points for select using (
  exists (select 1 from members m where m.workspace_id = usage_points.workspace_id and m.user_id = auth.uid())
);
