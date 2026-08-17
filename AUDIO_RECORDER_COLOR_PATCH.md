# Anpassung an components/audio-recorder.tsx (Mint & Lavendel Duoton)

Mir liegt der vollständige Inhalt dieser Datei nicht vor (nur die JSX-Struktur,
nicht die Aufnahme-Logik), deshalb ist sie NICHT im Zip enthalten. Bitte diese
Farb-Ersetzungen manuell in eurer bestehenden Datei vornehmen (reines
Suchen & Ersetzen, keine Logik betroffen):

1. Start-Aufnahme-Button:
   bg-indigo-600 hover:bg-indigo-700   ->   bg-violet-600 hover:bg-violet-700

2. "KI-Analyse starten"-Button:
   bg-indigo-600 hover:bg-indigo-700   ->   bg-violet-600 hover:bg-violet-700

3. Sparkles-Icon bei "Neue Zusammenfassung":
   text-indigo-500   ->   text-violet-500

4. ListTodo-Icon bei "Neue To-Dos":
   text-emerald-500   ->   text-teal-500

5. CheckCircle2-Icon in der To-Do-Liste:
   text-emerald-500   ->   text-teal-500

Der rote Stop-Button (bg-rose-600) bleibt unverändert — das ist das
"Aufnahme läuft"-Signal, kein Teil des Duoton-Farbsystems.
