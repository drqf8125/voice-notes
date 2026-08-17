"use client";

import { useState } from "react";
import { Folder, FolderPlus, Trash2, Layers } from "lucide-react";
import { createList, deleteList } from "@/app/actions/lists";

interface List {
  id: string;
  name: string;
}

interface SidebarProps {
  lists: List[];
  selectedListId: string | null;
  onSelectList: (id: string | null) => void;
}

export function Sidebar({ lists, selectedListId, onSelectList }: SidebarProps) {
  const [newListName, setNewListName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

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
          <Layers className="h-4 w-4 text-indigo-500" />
          Meine Listen
        </span>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-slate-500 hover:text-indigo-600 transition-colors p-1"
          title="Neue Liste erstellen"
        >
          <FolderPlus className="h-4 w-4" />
        </button>
      </div>

      {/* Formular für neue Liste */}
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
              className="px-3 py-1 bg-indigo-600 text-white rounded-lg font-medium"
            >
              Speichern
            </button>
          </div>
        </form>
      )}

      {/* Listenübersicht */}
      <nav className="space-y-1">
        <button
          onClick={() => onSelectList(null)}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
            selectedListId === null
              ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
          }`}
        >
          <Folder className="h-4 w-4" />
          <span>Alle Notizen</span>
        </button>

        {lists.map((list) => (
          <div key={list.id} className="group flex items-center justify-between">
            <button
              onClick={() => onSelectList(list.id)}
              className={`flex-1 flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all truncate ${
                selectedListId === list.id
                  ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50"
              }`}
            >
              <Folder className="h-4 w-4 shrink-0 text-slate-400" />
              <span className="truncate">{list.name}</span>
            </button>

            <button
              onClick={() => deleteList(list.id)}
              className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 transition-all"
              title="Liste löschen"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </nav>
    </aside>
  );
}