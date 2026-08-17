import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { acceptInvite } from "@/app/actions/lists";
import { Users, Sparkles } from "lucide-react";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?redirect=/invite/${token}`);
  }

  const { data, error } = await supabase
    .rpc("get_invite_list", { invite_token: token })
    .maybeSingle();

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center space-y-3">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Ungültiger Einladungslink
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Dieser Link ist abgelaufen oder existiert nicht mehr.
          </p>
        </div>
      </main>
    );
  }

  const listData = data as { list_name: string };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-14 w-14 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center">
            <Users className="h-7 w-7 text-violet-500" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            Einladung zur Liste &bdquo;{listData.list_name}&ldquo;
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Du kannst danach gemeinsam mit anderen Notizen aufnehmen und bearbeiten.
          </p>
        </div>

        <form action={acceptInvite.bind(null, token)}>
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-violet-600 hover:from-teal-600 hover:to-violet-700 text-white font-medium shadow-md transition-all shadow-teal-500/10"
          >
            <Sparkles className="h-4 w-4" />
            Liste beitreten
          </button>
        </form>
      </div>
    </main>
  );
}
