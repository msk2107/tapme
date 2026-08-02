import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";

/**
 * Deterministically buckets a user into a flag's rollout percentage so the
 * same user always gets the same on/off result for a given flag.
 */
export async function isFeatureEnabled(key: string, userId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("feature_flags")
    .select("enabled, rollout_percent")
    .eq("key", key)
    .maybeSingle<{ enabled: boolean; rollout_percent: number }>();

  if (!data || !data.enabled) return false;
  if (data.rollout_percent >= 100) return true;
  if (data.rollout_percent <= 0) return false;

  const hash = createHash("md5").update(`${key}:${userId}`).digest("hex");
  const bucket = parseInt(hash.slice(0, 8), 16) % 100;
  return bucket < data.rollout_percent;
}
