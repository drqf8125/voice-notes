"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Erzwingt einen Refresh beim Öffnen der App.
 * Speichert den letzten Besuchszeitpunkt in localStorage.
 * Wenn der letzte Besuch länger als 30 Sekunden her ist, wird die Seite neu geladen.
 */
export function ForceRefresh() {
  const router = useRouter();

  useEffect(() => {
    const STORAGE_KEY = "voice-notes-last-visit";
    const REFRESH_INTERVAL = 30 * 1000; // 30 Sekunden

    const now = Date.now();
    const lastVisit = localStorage.getItem(STORAGE_KEY);
    const lastVisitTime = lastVisit ? parseInt(lastVisit, 10) : 0;

    // Aktuellen Besuch speichern
    localStorage.setItem(STORAGE_KEY, String(now));

    // Wenn der letzte Besuch länger als das Intervall her ist → Refresh
    if (now - lastVisitTime > REFRESH_INTERVAL) {
      router.refresh();
    }
  }, [router]);

  return null;
}