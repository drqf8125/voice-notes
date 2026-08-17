"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { AudioRecorder } from "@/components/audio-recorder";
import { Sparkles, CheckCircle2, FileText, Trash2 } from "lucide-react";

interface Note {
  id: string;
  list_id: string | null;
  summary: string;
  transcript: string;
  todos: string[];
  created_at: string;
}

interface List {
  id: string;
  name: string;
}

interface DashboardClientProps {
  notes: Note[];
  lists: List[];
  deleteNoteAction: (formData: FormData) => Promise<void>;
}

export function DashboardClient({
  notes,
  lists,
  deleteNoteAction,
}: DashboardClientProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);

  // Notizen filtern basierend auf der ausgewählten Liste
  const filteredNotes = selectedListId
    ? notes.filter((n) => n.list_id === selectedListId)
    : notes;

  const currentListName = selectedListId
    ? lists.find((l) => l.id === selectedListId)?.name
    : "Alle Notizen";

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <Sidebar
        lists={lists}
        selectedListId={selectedListId}
        onSelectList={setSelectedListId}
      />

      <div className="flex-1 w-full space-y-8">
        <AudioRecorder selectedListId={selectedListId} />

        <section className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {currentListName} ({filteredNotes.length})
          </h2>

          {filteredNotes.length > 0 ? (
            <div className="space-y-6">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span>
                      {new Date(note.created_at).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>

                    <form action={deleteNoteAction}>
                      <input type="hidden" name="id" value={note.id} />
                      <button
                        type="submit"
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Notiz löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </form>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
                      <Sparkles className="h-4 w-4 text-indigo-500" />
                      <h3>Zusammenfassung</h3>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 text-sm">
                      {note.summary}
                    </p>
                  </div>

                  {note.todos && note.todos.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 text-sm mb-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                        <h3>To-Dos</h3>
                      </div>
                      <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-300">
                        {note.todos.map((todo, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span>{todo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
                      <FileText className="h-4 w-4 text-slate-400" />
                      <h3>Transkript</h3>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs whitespace-pre-wrap">
                      {note.transcript}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
              Keine Notizen in dieser Liste vorhanden.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}