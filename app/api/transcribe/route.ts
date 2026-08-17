import { NextResponse } from "next/server";
import Groq from "groq-sdk";

// Groq Client initialisieren (zieht sich den Key automatisch aus process.env.GROQ_API_KEY)
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    // 1. Audio-Datei aus dem Request extrahieren
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Keine Audiodatei im Request gefunden." },
        { status: 400 }
      );
    }

    // 2. Transkription mit Whisper via Groq
    // Wir nutzen whisper-large-v3-turbo für maximale Geschwindigkeit
    const transcription = await groq.audio.transcriptions.create({
      file: file,
      model: "whisper-large-v3-turbo",
      response_format: "json",
      language: "de", // Setzt Deutsch als Hauptsprache
    });

    const transcriptText = transcription.text;

    if (!transcriptText) {
      throw new Error("Transkription war leer oder fehlerhaft.");
    }

    // 3. Analyse mit Llama 3 (Zusammenfassung & To-Dos)
    // Wir zwingen das Modell durch den 'json_object' response_format, 
    // uns ein sauberes JSON zurückzugeben, das wir im Frontend direkt nutzen können.
    const systemPrompt = `Du bist ein intelligenter Assistent.
Analysiere das folgende Transkript einer Sprachnotiz.
Gib die Antwort AUSSCHLIESSLICH als valides JSON in exakt diesem Format zurück:
{
  "summary": "Eine präzise, kurze Zusammenfassung der Notiz in 1-2 Sätzen.",
  "todos": ["Todo 1", "Todo 2"] // Ein Array aus Aufgaben. Lass es leer [], falls keine Aufgaben erwähnt wurden.
}`;

    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: transcriptText },
      ],
      model: "llama-3.3-70b-versatile", // Starkes Modell für Logik & Extraktion
      response_format: { type: "json_object" }, 
      temperature: 0.1, // Niedrige Temperatur für deterministischere, präzisere Ergebnisse
    });

    const aiResponseContent = completion.choices[0]?.message?.content;
    
    if (!aiResponseContent) {
      throw new Error("Fehler bei der KI-Textanalyse.");
    }

    // JSON-String in ein JavaScript-Objekt umwandeln
    const parsedData = JSON.parse(aiResponseContent);

    // 4. Kombiniertes Ergebnis an das Frontend zurücksenden
    return NextResponse.json({
      text: transcriptText,
      summary: parsedData.summary || "Keine Zusammenfassung generiert.",
      todos: parsedData.todos || [],
    });

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: error.message || "Es ist ein unerwarteter Serverfehler aufgetreten." },
      { status: 500 }
    );
  }
}