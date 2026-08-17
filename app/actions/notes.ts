"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { TodoItem } from "@/types";

export async function updateNote(formData: FormData) {
  const id = formData.get("id") as string;
  const summary = formData.get("summary") as string;
  const transcript = formData.get("transcript") as string;
  const tagsRaw = formData.get("tags") as string;

  if (!id) return;

  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter((t) => t.length > 0)
    : [];

  const supabase = await createClient();

  await supabase
    .from("notes")
    .update({ summary, transcript, tags })
    .eq("id", id);

  revalidatePath("/");
}

// Markiert eine komplette Notiz als erledigt / nicht erledigt
export async function toggleNoteDone(noteId: string) {
  const supabase = await createClient();

  // Aktuellen done-Status lesen
  const { data: note } = await supabase
    .from("notes")
    .select("done")
    .eq("id", noteId)
    .single();

  if (!note) return;

  await supabase
    .from("notes")
    .update({ done: !note.done })
    .eq("id", noteId);

  revalidatePath("/");
}

// Markiert ein einzelnes To-Do als erledigt / nicht erledigt
export async function toggleTodoDone(noteId: string, todoIndex: number) {
  const supabase = await createClient();

  const { data: note } = await supabase
    .from("notes")
    .select("todos")
    .eq("id", noteId)
    .single();

  if (!note || !note.todos || note.todos[todoIndex] === undefined) return;

  const todos: TodoItem[] = [...note.todos];
  todos[todoIndex] = {
    ...todos[todoIndex],
    done: !todos[todoIndex].done,
  };

  await supabase
    .from("notes")
    .update({ todos })
    .eq("id", noteId);

  revalidatePath("/");
}