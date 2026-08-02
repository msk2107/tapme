import { MessageSquare } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import type { FeedbackRow } from "@/lib/types";

export default async function AdminFeedbackPage() {
  const supabase = createAdminClient();

  const [{ data: feedback }, { data: profiles }] = await Promise.all([
    supabase
      .from("feedback")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<FeedbackRow[]>(),
    supabase.from("profiles").select("id, name, username"),
  ]);

  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p]));

  return (
    <div>
      <h1 className="font-heading text-lg font-bold text-text mb-5">
        Feedback ({feedback?.length ?? 0})
      </h1>
      <div className="flex flex-col gap-2">
        {(feedback ?? []).map((f) => {
          const owner = nameMap.get(f.profile_id);
          return (
            <div key={f.id} className="bg-card border border-border rounded-xl p-3.5">
              <div className="flex items-start gap-2.5">
                <MessageSquare size={14} className="text-amber shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="font-body text-[13px] text-text">{f.message}</p>
                  <p className="font-mono text-[10.5px] text-faint mt-1">
                    on {owner?.name || "unknown"}&apos;s card ·{" "}
                    {new Date(f.created_at).toLocaleString("en-US")}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {(!feedback || feedback.length === 0) && (
          <p className="font-body text-[12.5px] text-faint text-center py-8">No feedback yet.</p>
        )}
      </div>
    </div>
  );
}
