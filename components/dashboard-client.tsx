"use client";

import { useState } from "react";
import { Sidebar } from "@/components/sidebar";
import { AudioRecorder } from "@/components/audio-recorder";
import { NoteCard } from "@/components/note-card";
import { Note, List } from "@/types";

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
        currentUserId={currentUserId}
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
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
              Keine Notizen in dieser Liste vorhanden.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}