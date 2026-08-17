import { AudioRecorder } from "@/components/audio-recorder";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 sm:text-4xl">
            Smart AI Voice & Notes
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Nimm deine Sprachnotizen auf und lass sie blitzschnell von KI zusammenfassen.
          </p>
        </header>

        <AudioRecorder />
      </div>
    </main>
  );
}