-- Migration: Notizen und To-Dos als erledigt markieren
-- Hinweis: Die todos-Spalte ist bereits jsonb (siehe DB-Schema), daher
-- wird hier nur die done-Spalte ergänzt und bestehende String-Einträge
-- in das {text, done}-Format umgewandelt.

-- ========== 1. done-Spalte für Notizen hinzufügen ==========
alter table public.notes
  add column if not exists done boolean not null default false;

-- ========== 2. Bestehende todos von ["a", "b"] nach [{"text":"a","done":false}, ...] konvertieren ==========
-- Nur Strings werden umgewandelt; bereits vorhandene {text, done}-Objekte bleiben unverändert.
update public.notes
set todos = (
  select jsonb_agg(
    case
      when jsonb_typeof(elem) = 'string' then jsonb_build_object('text', elem, 'done', false)
      else elem
    end
  )
  from jsonb_array_elements(todos) as elem
)
where todos is not null;

-- ========== 3. Index für bessere Performance ==========
create index if not exists idx_notes_done on public.notes(done);
create index if not exists idx_notes_user_done on public.notes(user_id, done);