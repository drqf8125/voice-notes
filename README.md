# Listen-Sharing-Feature + Mint & Lavendel Duoton-Redesign — Dateien

Diese Dateien 1:1 an der gleichen relativen Position in euer bestehendes
Next.js-Projekt (ai-voice-notes) kopieren bzw. bestehende Dateien ersetzen:

```
app/actions/lists.ts          -> ersetzt bestehende Datei (createList/deleteList + neue Sharing-Funktionen)
app/actions/notes.ts          -> neue Datei (Notiz bearbeiten inkl. Tags)
app/invite/[token]/page.tsx   -> neue Datei (Einladungsseite)
app/login/page.tsx            -> ersetzt bestehende Datei (unterstützt jetzt ?redirect=)
app/dashboard-client.tsx      -> ersetzt bestehende Datei
app/page.tsx                  -> ersetzt bestehende Datei
components/sidebar.tsx        -> ersetzt bestehende Datei
components/share-list-modal.tsx -> neue Datei
supabase/migration_list_sharing.sql -> nur Referenz, bereits in eurer DB ausgeführt
```

Nicht enthalten, weil mir der aktuelle Inhalt nicht vollständig vorliegt:
- components/audio-recorder.tsx -> siehe AUDIO_RECORDER_COLOR_PATCH.md für die
  nötigen Farb-Anpassungen (Mint & Lavendel Duoton)
- utils/supabase/client.ts, utils/supabase/server.ts (unverändert)
- app/api/transcribe/route.ts (unverändert, außer dem bereits von dir selbst
  vorgenommenen Modell-Wechsel auf qwen/qwen3.6-27b)

Nach dem Kopieren: `npm run dev`, eine Liste anlegen, über das Teilen-Icon
den Link erzeugen und in einem zweiten (Inkognito-)Browser mit einem
Test-Account öffnen.
