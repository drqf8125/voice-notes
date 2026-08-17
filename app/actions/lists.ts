"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createList(formData: FormData) {
  const name = formData.get("name") as string;
  if (!name || name.trim() === "") return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("lists").insert({
    name: name.trim(),
    user_id: user.id,
  });

  revalidatePath("/");
}

export async function deleteList(listId: string) {
  const supabase = await createClient();
  await supabase.from("lists").delete().eq("id", listId);
  revalidatePath("/");
}