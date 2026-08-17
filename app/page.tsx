import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardClient } from "./dashboard-client";
import { LogOut } from "lucide-react";
import { revalidatePath } from "next/cache";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Notizen & Listen laden
  const { data: notes } = await supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  const { data: lists } = await supabase
    .from("lists")
    .select("*")
    .order("created_at", { ascending: true });

  const handleSignOut = async () => {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  const deleteNote = async (formData: FormData) => {
    "use server";
    const id = formData.get("id") as string;
    const supabase = await createClient();
    await supabase.from("notes").delete().eq("id", id);
    revalidatePath("/");
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
              Smart AI Voice & Notes
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Angemeldet als <span className="font-medium text-slate-700 dark:text-slate-300">{user.email}</span>
            </p>
          </div>

          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
            >
              <LogOut className="h-4 w-4" />
              Abmelden
            </button>
          </form>
        </header>

        <DashboardClient
          notes={notes || []}
          lists={lists || []}
          deleteNoteAction={deleteNote}
        />
      </div>
    </main>
  );
}