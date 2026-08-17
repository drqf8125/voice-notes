"use client";

import { useState, useEffect } from "react";
import { X, Copy, Check, Link as LinkIcon, Loader2 } from "lucide-react";
import { createInvite } from "@/app/actions/lists";

interface ShareListModalProps {
  listId: string;
  listName: string;
  onClose: () => void;
}

export function ShareListModal({ listId, listName, onClose }: ShareListModalProps) {
  const [link, setLink] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let active = true;
    createInvite(listId).then((token) => {
      if (!active) return;
      if (token) {
        setLink(`${window.location.origin}/invite/${token}`);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [listId]);

  const handleCopy = async () => {
    if (!link) return;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-lg space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LinkIcon className="h-4 w-4 text-violet-500" />
            &bdquo;{listName}&ldquo; teilen

          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400">
          Jeder mit diesem Link kann der Liste beitreten und gemeinsam mit dir Notizen
          aufnehmen und bearbeiten.
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-4 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : link ? (
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link}
              className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 truncate"
            />
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-medium transition-all shrink-0"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "Kopiert" : "Kopieren"}
            </button>
          </div>
        ) : (
          <p className="text-sm text-rose-500">Link konnte nicht erstellt werden.</p>
        )}
      </div>
    </div>
  );
}
