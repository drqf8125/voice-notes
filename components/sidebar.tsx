"use client";

import { useState } from "react";
import { Folder, FolderPlus, Trash2, Layers, Share2, Users, LogOut } from "lucide-react";
import { createList, deleteList, leaveList } from "@/app/actions/lists";
import { ShareListModal } from "@/components/share-list-modal";
import { List } from "@/types";

interface SidebarProps {
  lists: List[];
  selectedListId: string | null;
  onSelectList: (id: string | null) => void;
  currentUserId: string;
}

export function Sidebar({ lists, selectedListId, onSelectList, currentUserId }: SidebarProps) {
  const [newListName, setNewListName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [sharingList, setSharingList] = useState<List | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;

    const formData = new FormData();
    formData.append("name", newListName);
    await createList(formData);

    setNewListName("");
    setIsAdding(false);
  };

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 flex flex-col space-y-4 rounded-2xl md:rounded-none shrink-0">
      <div className="flex items-center justify-between font-semibold text-slate-800 dark:text-slate-200 px-2">
        <span className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4 text-violet-500" />
          Meine Listen
        </span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-slate-500 hover:text-violet-600 transition-colors p-1"
          title="Neue Liste erstellen"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="space-y-2">
          <input
            type="text"
            placeholder="Listenname..."
            value={newListName}
            onChange={(e) => setNewListName(e.target.value)}
            autoFocus
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-transparent text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-2 py-1 text-slate-500 hover:underline"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-gradient-to-r from-teal-500 to-violet-600 hover:from-teal-600 hover:to-violet-700 text-white rounded-lg font-medium shadow-sm"
            >
              Speichern
            </button>
          </div>
        </form>
      )}

      <nav className="space-y-1">
        <button
          onClick={() => onSelectList(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            selectedListId === null
              ? "bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border-l-2 border-teal-500 font-semibold pl-2.5"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          <Folder className="h-4 w-4" />
          <span>Alle Notizen</span>
        </button>

        {lists.map((list) => {
          const isOwner = list.user_id === currentUserId;

          return (
            <div key={list.id} className="group flex items-center justify-between">
              <button
                onClick={() => onSelectList(list.id)}
                className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all truncate ${
                  selectedListId === list.id
                    ? "bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 border-l-2 border-teal-500 font-semibold pl-2.5"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <Folder className="h-4 w-4 shrink-0 text-slate-400" />
                <span className="truncate">{list.name}</span>
                {!isOwner && (
                  <Users className="h-3 w-3 shrink-0 text-slate-400" />
                )}
              </button>

              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-all shrink-0">
                {isOwner ? (
                  <>
                    <button
                      onClick={() => setSharingList(list)}
                      className="text-slate-400 hover:text-violet-500 p-1"
                      title="Liste teilen"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => deleteList(list.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                      title="Liste löschen"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => leaveList(list.id)}
                    className="text-slate-400 hover:text-rose-500 p-1"
                    title="Liste verlassen"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </nav>

      {sharingList && (
        <ShareListModal
          listId={sharingList.id}
          listName={sharingList.name}
          onClose={() => setSharingList(null)}
        />
      )}
    </aside>
  );
}
