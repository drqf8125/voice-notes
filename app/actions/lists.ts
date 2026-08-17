"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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

// Erstellt einen Einladungslink für eine Liste (oder gibt einen bestehenden zurück)
export async function createInvite(listId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: existing } = await supabase
    .from("list_invites")
    .select("token")
    .eq("list_id", listId)
    .eq("created_by", user.id)
    .maybeSingle();

  if (existing) return existing.token;

  const { data, error } = await supabase
    .from("list_invites")
    .insert({ list_id: listId, created_by: user.id })
    .select("token")
    .single();

  if (error) return null;
  return data.token;
}

// Nimmt eine Einladung an und tritt der Liste bei
export async function acceptInvite(token: string) {

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/invite/${token}`);
  }

  const { error } = await supabase.rpc("accept_list_invite", {
    invite_token: token,
  });

  if (error) {
    redirect("/?invite=invalid");
  }

  redirect("/");
}

// Geteilte Liste wieder verlassen (nur für nicht-Besitzer)
export async function leaveList(listId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("list_members")
    .delete()
    .eq("list_id", listId)
    .eq("user_id", user.id);

  revalidatePath("/");
}
