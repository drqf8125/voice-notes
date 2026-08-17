"use client";

import { useState, useMemo } from "react";
import { Sidebar } from "@/components/sidebar";
import { AudioRecorder } from "@/components/audio-recorder";
import { NoteCard } from "@/components/note-card";
import { Note, List } from "@/types";
import { Search, X, CheckCircle2, Circle, ListFilter, Tag as TagIcon } from "lucide-react";

type StatusFilter = "all" | "open" | "done";

interface DashboardClientProps {
  notes: Note[];
  lists: List[];
  deleteNoteAction: (formData: FormData) => Promise<void>;
  updateNoteAction: (formData: FormData) => Promise<void>;
  toggleNoteDoneAction: (noteId: string) => Promise<void>;
  toggleTodoDoneAction: (noteId: string, todoIndex: number) => Promise<void>;
  currentUserId: string;
}

export function DashboardClient({
  notes,
  lists,
  deleteNoteAction,
  updateNoteAction,
  toggleNoteDoneAction,
  toggleTodoDoneAction,
  currentUserId,
}: DashboardClientProps) {
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  // Filter & Such-Zustände
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Alle eindeutigen Tags der aktuellen Listenansicht sammeln
  const listNotes = useMemo(() => {
    return selectedListId
      ? notes.filter((n) => n.list_id === selectedListId)
      : notes;
  }, [notes, selectedListId]);

  const allTags = useMemo(() => {
    const tagsSet = new Set<string>();
    listNotes.forEach((n) => {
      n.tags?.forEach((tag) => {
        if (tag.trim()) tagsSet.add(tag.trim());
      });
    });
    return Array.from(tagsSet).sort((a, b) => a.localeCompare(b));
  }, [listNotes]);

  // Gefilterte Notizen berechnen
  const filteredNotes = useMemo(() => {
    return listNotes.filter((note) => {
      // 1. Status-Filter
      if (statusFilter === "open" && note.done) return false;
      if (statusFilter === "done" && !note.done) return false;

      // 2. Tag-Filter
      if (selectedTag && (!note.tags || !note.tags.includes(selectedTag))) {
        return false;
      }

      // 3. Volltext-Suche (Zusammenfassung, Transkript, Todos, Tags)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inSummary = note.summary?.toLowerCase().includes(query);
        const inTranscript = note.transcript?.toLowerCase().includes(query);
        const inTags = note.tags?.some((t) => t.toLowerCase().includes(query));
        const inTodos = note.todos?.some((t) => t.text.toLowerCase().includes(query));

        if (!inSummary && !inTranscript && !inTags && !inTodos) {
          return false;
        }
      }

      return true;
    });
  }, [listNotes, statusFilter, selectedTag, searchQuery]);

  const currentListName = selectedListId
    ? lists.find((l) => l.id === selectedListId)?.name
    : "Alle Notizen";

  const hasActiveFilters = searchQuery.trim() !== "" || statusFilter !== "all" || selectedTag !== null;

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setSelectedTag(null);
  };

  // Zähler für die Status-Tabs
  const openCount = listNotes.filter((n) => !n.done).length;
  const doneCount = listNotes.filter((n) => n.done).length;

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      <Sidebar
        lists={lists}
        selectedListId={selectedListId}
        onSelectList={(id) => {
          setSelectedListId(id);
          setSelectedTag(null); // Tag zurücksetzen beim Listenwechsel
        }}
        currentUserId={currentUserId}
      />

      <div className="flex-1 w-full space-y-6">
        <AudioRecorder selectedListId={selectedListId} />

        {/* Filter- & Suchleiste */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
          {/* Suchfeld */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Notizen, Aufgaben oder Tags durchsuchen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-9 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Suche leeren"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Status-Filter & Tags-Reihe */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-slate-800">
            {/* Status-Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/70 p-1 rounded-xl">
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "all"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <ListFilter className="h-3.5 w-3.5" />
                <span>Alle</span>
                <span className="text-[10px] opacity-60">({listNotes.length})</span>
              </button>

              <button
                onClick={() => setStatusFilter("open")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "open"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <Circle className="h-3.5 w-3.5 text-teal-500" />
                <span>Offen</span>
                <span className="text-[10px] opacity-60">({openCount})</span>
              </button>

              <button
                onClick={() => setStatusFilter("done")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  statusFilter === "done"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>Erledigt</span>
                <span className="text-[10px] opacity-60">({doneCount})</span>
              </button>
            </div>

            {/* Filter zurücksetzen Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 flex items-center gap-1 hover:underline ml-auto"
              >
                <X className="h-3.5 w-3.5" />
                Filter zurücksetzen
              </button>
            )}
          </div>

          {/* Tag-Pills Leiste (falls Tags vorhanden) */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/60">
              <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 mr-1">
                <TagIcon className="h-3 w-3" />
                Tags:
              </span>
              {allTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(isSelected ? null : tag)}
                    className={`text-xs px-2.5 py-0.5 rounded-full border transition-all ${
                      isSelected
                        ? "bg-violet-600 text-white border-violet-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-600"
                    }`}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Notizen-Liste */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
              {currentListName} ({filteredNotes.length})
            </h2>

            {hasActiveFilters && (
              <span className="text-xs text-slate-400">
                Gefiltert aus {listNotes.length} Notizen
              </span>
            )}
          </div>

          {filteredNotes.length > 0 ? (
            <div className="space-y-6">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  isEditing={editingNoteId === note.id}
                  onEdit={setEditingNoteId}
                  onDeleteAction={deleteNoteAction}
                  onUpdateAction={updateNoteAction}
                  toggleNoteDoneAction={toggleNoteDoneAction}
                  toggleTodoDoneAction={toggleTodoDoneAction}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm space-y-2">
              <p>
                {hasActiveFilters
                  ? "Keine Notizen entsprechen deinen Filtern."
                  : "Keine Notizen in dieser Liste vorhanden."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-violet-600 hover:underline inline-block font-medium"
                >
                  Alle Filter aufheben
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}