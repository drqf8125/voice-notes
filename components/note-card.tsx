"use client";

import { Sparkles, Trash2, Pencil, X, Save, Tag, CheckCircle2, Circle, CheckSquare } from "lucide-react";

import { Note, TodoItem } from "@/types";

interface NoteCardProps {
  note: Note;
  isEditing: boolean;
  onEdit: (id: string | null) => void;
  onDeleteAction: (formData: FormData) => Promise<void>;
  onUpdateAction: (formData: FormData) => Promise<void>;
  toggleNoteDoneAction: (noteId: string) => Promise<void>;
  toggleTodoDoneAction: (noteId: string, todoIndex: number) => Promise<void>;
}

export function NoteCard({
  note,
  isEditing,
  onEdit,
  onDeleteAction,
  onUpdateAction,
  toggleNoteDoneAction,
  toggleTodoDoneAction,
}: NoteCardProps) {
  const allTodosDone = note.todos && note.todos.length > 0 && note.todos.every((t) => t.done);

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm space-y-4 transition-all ${
      note.done
        ? "border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/30 dark:bg-emerald-950/20"
        : "border-slate-200 dark:border-slate-800"
    }`}>
      {/* Header: Datum + Actions */}
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          {/* Note-Done Checkbox */}
          <button
            onClick={() => toggleNoteDoneAction(note.id)}
            className={`transition-all p-0.5 ${
              note.done
                ? "text-emerald-500 hover:text-emerald-600"
                : "text-slate-300 hover:text-emerald-500 dark:text-slate-600"
            }`}
            title={note.done ? "Als nicht erledigt markieren" : "Als erledigt markieren"}
          >
            <CheckSquare className={`h-4 w-4 ${note.done ? "fill-emerald-500" : ""}`} />
          </button>
          <span className={note.done ? "line-through text-slate-300 dark:text-slate-600" : ""}>
            {new Date(note.created_at).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {!isEditing && (
            <button
              onClick={() => onEdit(note.id)}
              className="text-slate-400 hover:text-violet-500 transition-colors p-1"
              title="Notiz bearbeiten"
            >
              <Pencil className="h-4 w-4" />
            </button>
          )}

          <form action={onDeleteAction}>
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
      </div>

      {isEditing ? (
        <form
          action={async (formData) => {
            await onUpdateAction(formData);
            onEdit(null);
          }}
          className="space-y-4"
        >
          <input type="hidden" name="id" value={note.id} />

          <div>
            <label className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
              <Sparkles className="h-4 w-4 text-violet-500" />
              Zusammenfassung
            </label>
            <textarea
              name="summary"
              defaultValue={note.summary}
              rows={2}
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
              <Tag className="h-4 w-4 text-slate-400" />
              Tags (Komma-getrennt)
            </label>
            <input
              name="tags"
              defaultValue={note.tags?.join(", ") ?? ""}
              placeholder="z. B. Arbeit, Idee, Wichtig"
              className="w-full text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 hover:from-teal-600 hover:to-violet-700 text-white text-sm font-medium transition-all shadow-md shadow-teal-500/10"
            >
              <Save className="h-4 w-4" />
              Speichern
            </button>
            <button
              type="button"
              onClick={() => onEdit(null)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
            >
              <X className="h-4 w-4" />
              Abbrechen
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Summary */}
          <div>
            <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 text-sm mb-1">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <h3>Zusammenfassung</h3>
            </div>
            <p className={`text-sm ${note.done ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-600 dark:text-slate-300"}`}>
              {note.summary}
            </p>
          </div>

          {/* To-Dos mit Checkboxen */}
          {note.todos && note.todos.length > 0 && (
            <div>
              <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-200 text-sm mb-2">
                <CheckCircle2 className="h-4 w-4 text-teal-500" />
                <h3>To-Dos {allTodosDone && !note.done && <span className="text-xs text-emerald-500 font-normal">(alle erledigt ✓)</span>}</h3>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                {note.todos.map((todo: TodoItem, idx: number) => (
                  <li key={idx} className="flex items-center gap-2 group">
                    <button
                      onClick={() => toggleTodoDoneAction(note.id, idx)}
                      className={`shrink-0 transition-all ${
                        todo.done
                          ? "text-emerald-500"
                          : "text-slate-300 hover:text-emerald-500 dark:text-slate-600"
                      }`}
                      title={todo.done ? "Als nicht erledigt" : "Als erledigt"}
                    >
                      {todo.done ? (
                        <CheckCircle2 className="h-4 w-4 fill-emerald-500 text-white" />
                      ) : (
                        <Circle className="h-4 w-4" />
                      )}
                    </button>
                    <span className={`${todo.done ? "line-through text-slate-400 dark:text-slate-500" : ""} transition-all`}>
                      {todo.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {note.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${
                    note.done
                      ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Erledigt-Badge */}
          {note.done && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Erledigt
            </div>
          )}
        </>
      )}
    </div>
  );
}