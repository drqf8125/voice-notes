-- Migration: Notizlisten teilen (per Invite-Link) + Notizen-Tags
-- Hinweis: Dieses Skript wurde bereits erfolgreich gegen die Datenbank ausgeführt
-- (Stand: alle Komponenten geprüft = true). Es liegt hier nur als Referenz/Dokumentation
-- bei, z.B. falls ihr eine zweite Umgebung (Staging) aufsetzt.

-- ========== 0. Tags-Spalte für Notizen ==========

alter table public.notes
  add column if not exists tags text[] default '{}'::text[];

-- ========== 1. Neue Tabellen ==========

create table if not exists public.list_members (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  role text not null default 'member',
  joined_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (list_id, user_id)
);
alter table public.list_members enable row level security;

create table if not exists public.list_invites (
  id uuid primary key default gen_random_uuid(),
  list_id uuid references public.lists(id) on delete cascade not null,
  token text unique not null default encode(gen_random_bytes(16), 'hex'),
  created_by uuid references auth.users(id) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.list_invites enable row level security;

-- ========== 2. Helper-Funktion für Zugriffsprüfung ==========
-- security definer = bypasst RLS intern, verhindert Rekursion in den Policies unten

create or replace function public.has_list_access(check_list_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.lists l
    where l.id = check_list_id and l.user_id = auth.uid()
  ) or exists (
    select 1 from public.list_members lm
    where lm.list_id = check_list_id and lm.user_id = auth.uid()
  );
$$;

grant execute on function public.has_list_access(uuid) to authenticated;

-- ========== 3. RPC-Funktionen für den Einladungs-Flow ==========
-- Damit muss die eingeladene Person keinen direkten Zugriff auf list_invites haben

create or replace function public.get_invite_list(invite_token text)
returns table (list_id uuid, list_name text)
language sql
security definer
set search_path = public
as $$
  select l.id, l.name
  from public.list_invites li
  join public.lists l on l.id = li.list_id
  where li.token = invite_token;
$$;

grant execute on function public.get_invite_list(text) to authenticated;

create or replace function public.accept_list_invite(invite_token text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  target_list_id uuid;
begin
  select li.list_id into target_list_id
  from public.list_invites li
  where li.token = invite_token;

  if target_list_id is null then
    raise exception 'Ungültiger Einladungslink';
  end if;

  insert into public.list_members (list_id, user_id, role)
  values (target_list_id, auth.uid(), 'member')
  on conflict (list_id, user_id) do nothing;

  return target_list_id;
end;
$$;

grant execute on function public.accept_list_invite(text) to authenticated;

-- ========== 4. Bestehende Policies erweitern ==========
-- Hinweis: Bei einer frischen DB existieren diese Policies bereits aus den
-- vorherigen Migrationsschritten (Notizen/Listen-Grundfunktion) -> ALTER POLICY.
-- Falls sie bei euch noch nicht existieren, müsst ihr stattdessen CREATE POLICY nutzen.

alter policy "User can view own lists" on public.lists
  using (auth.uid() = user_id or public.has_list_access(id));

alter policy "User can view own notes" on public.notes
  using (auth.uid() = user_id or public.has_list_access(list_id));

alter policy "User can insert own notes" on public.notes
  with check (auth.uid() = user_id and (list_id is null or public.has_list_access(list_id)));

alter policy "User can delete own notes" on public.notes
  using (auth.uid() = user_id or public.has_list_access(list_id));

alter policy "User can update own notes" on public.notes
  using (auth.uid() = user_id or public.has_list_access(list_id))
  with check (auth.uid() = user_id or public.has_list_access(list_id));

-- ========== 5. Neue Policies für list_members & list_invites ==========

create policy "Members can view list_members for their lists" on public.list_members
  for select using (
    auth.uid() = user_id or exists (
      select 1 from public.lists l where l.id = list_members.list_id and l.user_id = auth.uid()
    )
  );

create policy "User can join a list as themselves" on public.list_members
  for insert with check (auth.uid() = user_id);

create policy "Owner or member can remove membership" on public.list_members
  for delete using (
    auth.uid() = user_id or exists (
      select 1 from public.lists l where l.id = list_members.list_id and l.user_id = auth.uid()
    )
  );

create policy "Owner can view own invites" on public.list_invites
  for select using (
    exists (select 1 from public.lists l where l.id = list_invites.list_id and l.user_id = auth.uid())
  );

create policy "Owner can create invites" on public.list_invites
  for insert with check (
    auth.uid() = created_by and exists (
      select 1 from public.lists l where l.id = list_invites.list_id and l.user_id = auth.uid()
    )
  );

create policy "Owner can delete invites" on public.list_invites
  for delete using (
    exists (select 1 from public.lists l where l.id = list_invites.list_id and l.user_id = auth.uid())
  );
