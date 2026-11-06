-- Xeroura client portal. Run in the Supabase SQL editor (free project).
-- Then: Authentication → Providers → Email on, "Confirm email" off for the first seed.
-- Disable public sign-ups: Authentication → Providers → Email → Confirm / disable sign-ups
-- (Xeroura adds people; clients do not self-register.)

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  name text not null,
  role text not null default 'Client',
  side text not null default 'client' check (side in ('client', 'xeroura')),
  tone text not null default 'violet'
);

create table if not exists public.projects (
  id text primary key,
  name text not null,
  client text not null,
  prefix text not null,
  phase text not null default 'Discovery',
  started_iso date not null,
  target_iso date not null,
  need_noun text not null default 'the client',
  need_short text not null default 'Client',
  created_at timestamptz not null default now()
);

create table if not exists public.project_members (
  project_id text not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  primary key (project_id, user_id)
);

create table if not exists public.phases (
  project_id text not null references public.projects(id) on delete cascade,
  id text not null,
  name text not null,
  sort int not null default 0,
  primary key (project_id, id)
);

create table if not exists public.people (
  project_id text not null references public.projects(id) on delete cascade,
  id text not null,
  name text not null,
  role text not null,
  side text not null check (side in ('client', 'xeroura')),
  email text not null,
  tone text not null default 'violet',
  user_id uuid references auth.users(id) on delete set null,
  primary key (project_id, id)
);

create table if not exists public.tasks (
  project_id text not null references public.projects(id) on delete cascade,
  id text not null,
  title text not null,
  body text not null default '',
  status text not null default 'todo' check (status in ('todo', 'doing', 'done')),
  phase text not null,
  points int not null default 2,
  assignee text,
  need text,
  due date,
  created_at timestamptz not null default now(),
  done_at timestamptz,
  primary key (project_id, id)
);

create table if not exists public.task_comments (
  id text primary key,
  project_id text not null,
  task_id text not null,
  author text not null,
  side text not null,
  tone text,
  body text not null default '',
  created_at timestamptz not null default now(),
  foreign key (project_id, task_id) references public.tasks(project_id, id) on delete cascade
);

create table if not exists public.task_shots (
  id text primary key,
  project_id text not null,
  task_id text not null,
  comment_id text,
  name text,
  url text not null,
  by_name text,
  created_at timestamptz not null default now(),
  foreign key (project_id, task_id) references public.tasks(project_id, id) on delete cascade
);

create table if not exists public.task_history (
  id text primary key,
  project_id text not null,
  task_id text not null,
  kind text not null,
  author text not null,
  side text,
  body text,
  created_at timestamptz not null default now(),
  foreign key (project_id, task_id) references public.tasks(project_id, id) on delete cascade
);

create table if not exists public.updates (
  id text not null,
  project_id text not null references public.projects(id) on delete cascade,
  date_label text,
  week text,
  author text,
  role text,
  headline text,
  body text,
  shipped jsonb not null default '[]'::jsonb,
  next jsonb not null default '[]'::jsonb,
  sort int not null default 0,
  primary key (project_id, id)
);

create table if not exists public.files (
  id text not null,
  project_id text not null references public.projects(id) on delete cascade,
  name text not null,
  kind text,
  when_label text,
  by_name text,
  primary key (project_id, id)
);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.side = 'xeroura'
  );
$$;

create or replace function public.in_project(pid text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_staff() or exists (
    select 1 from public.project_members m
    where m.project_id = pid and m.user_id = auth.uid()
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role, side, tone)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'Client'),
    case
      when coalesce(new.raw_user_meta_data->>'side', '') = 'xeroura' then 'xeroura'
      when new.email ilike '%@xeroura.com' then 'xeroura'
      else 'client'
    end,
    coalesce(new.raw_user_meta_data->>'tone', 'violet')
  )
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.phases enable row level security;
alter table public.people enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.task_shots enable row level security;
alter table public.task_history enable row level security;
alter table public.updates enable row level security;
alter table public.files enable row level security;

drop policy if exists "profiles self or staff" on public.profiles;
create policy "profiles self or staff" on public.profiles for select using (
  id = auth.uid() or public.is_staff()
);
drop policy if exists "profiles staff write" on public.profiles;
create policy "profiles staff write" on public.profiles for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "projects member" on public.projects;
create policy "projects member" on public.projects for select using (public.in_project(id));
drop policy if exists "projects staff write" on public.projects;
create policy "projects staff write" on public.projects for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "members member" on public.project_members;
create policy "members member" on public.project_members for select using (public.in_project(project_id));
drop policy if exists "members staff write" on public.project_members;
create policy "members staff write" on public.project_members for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "phases member" on public.phases;
create policy "phases member" on public.phases for select using (public.in_project(project_id));
drop policy if exists "phases staff write" on public.phases;
create policy "phases staff write" on public.phases for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "people member" on public.people;
create policy "people member" on public.people for select using (public.in_project(project_id));
drop policy if exists "people staff write" on public.people;
create policy "people staff write" on public.people for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "tasks member read" on public.tasks;
create policy "tasks member read" on public.tasks for select using (public.in_project(project_id));
drop policy if exists "tasks member write" on public.tasks;
create policy "tasks member write" on public.tasks for insert with check (public.in_project(project_id));
drop policy if exists "tasks member update" on public.tasks;
create policy "tasks member update" on public.tasks for update using (public.in_project(project_id)) with check (public.in_project(project_id));
drop policy if exists "tasks member delete" on public.tasks;
create policy "tasks member delete" on public.tasks for delete using (public.is_staff());

drop policy if exists "comments member read" on public.task_comments;
create policy "comments member read" on public.task_comments for select using (public.in_project(project_id));
drop policy if exists "comments member write" on public.task_comments;
create policy "comments member write" on public.task_comments for insert with check (public.in_project(project_id));
drop policy if exists "comments member update" on public.task_comments;
create policy "comments member update" on public.task_comments for update using (public.in_project(project_id)) with check (public.in_project(project_id));

drop policy if exists "shots member read" on public.task_shots;
create policy "shots member read" on public.task_shots for select using (public.in_project(project_id));
drop policy if exists "shots member write" on public.task_shots;
create policy "shots member write" on public.task_shots for insert with check (public.in_project(project_id));
drop policy if exists "shots member update" on public.task_shots;
create policy "shots member update" on public.task_shots for update using (public.in_project(project_id)) with check (public.in_project(project_id));

drop policy if exists "history member read" on public.task_history;
create policy "history member read" on public.task_history for select using (public.in_project(project_id));
drop policy if exists "history member write" on public.task_history;
create policy "history member write" on public.task_history for insert with check (public.in_project(project_id));
drop policy if exists "history member update" on public.task_history;
create policy "history member update" on public.task_history for update using (public.in_project(project_id)) with check (public.in_project(project_id));

drop policy if exists "updates member" on public.updates;
create policy "updates member" on public.updates for select using (public.in_project(project_id));
drop policy if exists "updates staff write" on public.updates;
create policy "updates staff write" on public.updates for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "files member" on public.files;
create policy "files member" on public.files for select using (public.in_project(project_id));
drop policy if exists "files staff write" on public.files;
create policy "files staff write" on public.files for all using (public.is_staff()) with check (public.is_staff());

insert into storage.buckets (id, name, public)
values ('shots', 'shots', true)
on conflict (id) do nothing;

drop policy if exists "shots read" on storage.objects;
create policy "shots read" on storage.objects for select using (bucket_id = 'shots');
drop policy if exists "shots write" on storage.objects;
create policy "shots write" on storage.objects for insert with check (
  bucket_id = 'shots' and public.in_project(split_part(name, '/', 1))
);
drop policy if exists "shots update" on storage.objects;
create policy "shots update" on storage.objects for update using (
  bucket_id = 'shots' and public.in_project(split_part(name, '/', 1))
) with check (
  bucket_id = 'shots' and public.in_project(split_part(name, '/', 1))
);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
