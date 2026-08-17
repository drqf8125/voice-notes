"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mic,
  Square,
  Sparkles,
  Loader2,
  RotateCcw,
  ListTodo,
  AlertCircle,
  Play,
  Pause,
  CheckCircle2,
} from "lucide-react";
import { TranscriptionResult } from "@/types";

interface AudioRecorderProps {
  selectedListId?: string | null;
}

export function AudioRecorder({ selectedListId }: AudioRecorderProps) {
  const router = useRouter();

  // State Management
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TranscriptionResult | null>(null);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Timer steuern
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Mikrofonsignal stoppen und aufräumen
  const stopMicrophone = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  // Aufnahme starten
  const startRecording = async () => {
    setError(null);
    setResult(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "audio/mp4",
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorder.mimeType || "audio/webm";
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stopMicrophone();
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setIsPaused(false);
    } catch (err: unknown) {
      console.error("Mikrofon-Zugriff fehlgeschlagen:", err);
      setError(
        "Mikrofonzugriff verweigert oder nicht unterstützt. Bitte erlaube den Mikrofonzugriff in deinem Browser."
      );
    }
  };


  // Aufnahme stoppen
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  // Aufnahme pausieren / fortsetzen
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      setIsPaused(false);
    } else {
      mediaRecorderRef.current.pause();
      setIsPaused(true);
    }
  };

  // Aufnahme zurücksetzen
  const resetAll = () => {
    stopRecording();
    stopMicrophone();
    setIsRecording(false);
    setIsPaused(false);
    setDuration(0);
    setAudioBlob(null);
    setAudioUrl(null);
    setResult(null);
    setError(null);
  };

  // Audio an Backend-API schicken, analysieren & UI aktualisieren
  const processAudio = async () => {
    if (!audioBlob) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      if (selectedListId) {
        formData.append("list_id", selectedListId);
      }

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fehler bei der Sprachverarbeitung.");
      }

      // API gibt die Note aus der DB zurück (todos als TodoItem[]),
      // aber das UI erwartet TranscriptionResult (todos als string[]).
      // Daher konvertieren:
      const convertedResult: TranscriptionResult = {
        text: data.transcript || "",
        summary: data.summary || "",
        todos: Array.isArray(data.todos)
          ? data.todos.map((t: { text?: string; done?: boolean } | string) =>
              typeof t === "string" ? t : t.text || ""
            )
          : [],
      };
      setResult(convertedResult);

      // Aktualisiert die Server-Daten auf page.tsx
      router.refresh();
    } catch (err: unknown) {
      console.error("Transkriptionsfehler:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Es ist ein unerwarteter Fehler aufgetreten.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };


  // Formatiert Sekunden in 00:00 Format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-6">
      {/* Recorder Control Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center transition-all">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">
          Sprachnotiz aufnehmen
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Klicke auf das Mikrofon, um deine Gedanken einzusprechen.
        </p>

        {/* Dynamic Waveform / Status Area */}
        <div className="flex flex-col items-center justify-center space-y-4 mb-8">
          <div className="text-4xl font-mono font-bold text-slate-700 dark:text-slate-200 tracking-wider">
            {formatTime(duration)}
          </div>

          {isRecording && (
            <div className="flex items-center space-x-2 text-rose-500 animate-pulse text-sm font-medium">
              <span className="h-3 w-3 rounded-full bg-rose-500"></span>
              <span>{isPaused ? "Aufnahme pausiert" : "Aufnahme läuft..."}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-4">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-teal-500 to-violet-600 hover:from-teal-600 hover:to-violet-700 text-white shadow-lg hover:scale-105 active:scale-95 transition-all shadow-teal-500/10 hover:shadow-teal-500/20"
              title="Aufnahme starten"
            >
              <Mic className="h-8 w-8" />
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={togglePause}
                className="flex items-center justify-center h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
                title={isPaused ? "Fortsetzen" : "Pausieren"}
              >
                {isPaused ? <Play className="h-5 w-5 ml-0.5" /> : <Pause className="h-5 w-5" />}
              </button>

              <button
                onClick={stopRecording}
                className="flex items-center justify-center h-16 w-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg hover:scale-105 active:scale-95 transition-all"
                title="Aufnahme stoppen"
              >
                <Square className="h-6 w-6" />
              </button>
            </>
          )}

          {audioBlob && !isRecording && (
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
              <button
                onClick={resetAll}
                disabled={isLoading}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 w-full sm:w-auto text-sm font-medium transition-all"
              >
                <RotateCcw className="h-4 w-4" />
                Neu aufnehmen
              </button>

              <button
                onClick={processAudio}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 hover:from-teal-600 hover:to-violet-700 disabled:opacity-50 text-white font-medium shadow-md transition-all text-sm shadow-teal-500/10"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verarbeite mit KI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>KI-Analyse starten</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Audio Preview Player */}
        {audioUrl && !isRecording && (
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <audio controls src={audioUrl} className="w-full h-10 rounded-lg" />
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-start gap-3 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Live-Ergebnisanzeige nach Upload */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-3">
              <Sparkles className="h-5 w-5 text-violet-500" />
              <h3>Neue Zusammenfassung</h3>
            </div>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
              {result.summary}
            </p>
          </div>

          {result.todos && result.todos.length > 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200 mb-3">
                <ListTodo className="h-5 w-5 text-teal-500" />
                <h3>Neue To-Dos</h3>
              </div>
              <ul className="space-y-2">
                {result.todos.map((todo, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 className="h-4 w-4 text-teal-500 shrink-0 mt-0.5" />
                    <span>{todo}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}