import { NextResponse } from "next/server";
import Groq from "groq-sdk";
import { createClient } from "@/utils/supabase/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Prüfen, ob der Nutzer bei Supabase angemeldet ist
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Nicht autorisiert. Bitte melde dich an." },
        { status: 401 }
      );
    }

    // 2. Audio-Datei aus dem Request extrahieren
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const listId = formData.get("list_id") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "Keine Audiodatei im Request gefunden." },
        { status: 400 }
      );
    }

    // 3. Transkription mit Whisper via Groq
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "json",
      language: "de",
    });

    const transcriptText = transcription.text;

    if (!transcriptText) {
      throw new Error("Transkription war leer oder fehlerhaft.");
    }

    // 4. KI-Analyse mit GPT-OSS (Groq)

    const systemPrompt = `Du bist ein intelligenter Assistent.
Analysiere das folgende Transkript einer Sprachnotiz.
Gib die Antwort AUSSCHLIESSLICH als valides JSON in exakt diesem Format zurück:
{
  "summary": "Eine präzise, kurze Zusammenfassung der Notiz in 1-2 Sätzen.",
  "todos": ["Todo 1", "Todo 2"]
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcriptText },
      ],
      model: "openai/gpt-oss-120b",

      response_format: { type: "json_object" },
      temperature: 0.1,
    });

    const aiResponseContent = completion.choices[0]?.message?.content;

    if (!aiResponseContent) {
      throw new Error("Fehler bei der KI-Textanalyse.");
    }

    const parsedData = JSON.parse(aiResponseContent);

    // 5. Todos von string[] in TodoItem[] umwandeln
    const todos = (parsedData.todos || []).map((t: string) => ({
      text: t,
      done: false,
    }));

    // 6. In der Supabase-Datenbank speichern
    const { data: note, error: dbError } = await supabase
      .from("notes")
      .insert({
        user_id: user.id,
        list_id: listId || null,
        transcript: transcriptText,
        summary: parsedData.summary || "Keine Zusammenfassung.",
        todos: todos,
        done: false,
      })
      .select()
      .single();

    if (dbError) {
      console.error("Datenbank-Fehler beim Speichern:", dbError);
      throw new Error("Fehler beim Speichern der Notiz in der Datenbank.");
    }

    // 6. Gespeicherte Notiz zurückgeben
    return NextResponse.json(note);
  } catch (error: unknown) {
    console.error("API Error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Es ist ein unerwarteter Serverfehler aufgetreten.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}


