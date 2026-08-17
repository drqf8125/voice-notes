# 🎙️ Smart AI Voice & Notes App

Eine moderne, blitzschnelle Web-Anwendung zur Aufnahme von Sprachnotizen, automatischen Transkription und KI-gestützten Analyse. Wandle gesprochene Gedanken im Handumdrehen in strukturierte Zusammenfassungen und konkrete To-Do-Listen um!

![Next.js](https://img.shields.io/badge/Next.js-14%2B-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Groq](https://img.shields.io/badge/Groq_API-Whisper_%26_Llama_3-f55036?style=for-the-badge)
![Vercel](https://img.shields.io/badge/Vercel-Hosted-000000?style=for-the-badge&logo=vercel&logoColor=white)

---

## ✨ Features

- 🎤 **In-Browser Audio-Aufnahme**: Direkte Sprachaufnahme über die MediaRecorder API mit visueller Zeit- und Statusanzeige.
- ⏯️ **Audio-Vorschau**: Integrierter Player zum Anhören der Aufnahme vor der KI-Verarbeitung.
- ⚡ **Ultra-schnelle Transkription**: Erstellung von präzisen deutschen Transkripten in Sekundenbruchteilen mit `whisper-large-v3-turbo` via Groq API.
- 🧠 **Intelligente KI-Analyse**: Automatische Extraktion von:
  - 📝 **Kurzzusammenfassungen** (1–2 prägnante Sätze)
  - ✅ **Aktionsbereiten To-Do-Listen** (Structured JSON Output)
- 🎨 **Modernes UI/UX**: Cleaned Design mit Tailwind CSS, Lucide Icons, Responsive Layout & Dark-Mode Support.
- 🚀 **Serverless Architecture**: Next.js App Router API-Routes optimiert für Vercel.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **KI Provider**: [Groq API](https://groq.com/)
  - Audio-Transkription: `whisper-large-v3-turbo`
  - Text-Analyse & Extraktion: `llama-3.3-70b-versatile`
- **Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 Quick Start

### 1. Repository klonen & Abhängigkeiten installieren

```bash
git clone [https://github.com/DEIN-BENUTZERNAME/ai-voice-notes.git](https://github.com/DEIN-BENUTZERNAME/ai-voice-notes.git)
cd ai-voice-notes
npm install