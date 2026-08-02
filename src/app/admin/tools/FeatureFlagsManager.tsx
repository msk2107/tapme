"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertFeatureFlag } from "../actions";
import type { FeatureFlagRow } from "@/lib/types";

export default function FeatureFlagsManager({ flags }: { flags: FeatureFlagRow[] }) {
  const router = useRouter();
  const [key, setKey] = useState("");
  const [rollout, setRollout] = useState(100);
  const [pending, setPending] = useState(false);

  const create = async () => {
    if (!key.trim()) return;
    setPending(true);
    await upsertFeatureFlag(key, true, rollout);
    setPending(false);
    setKey("");
    setRollout(100);
    router.refresh();
  };

  const toggle = async (flag: FeatureFlagRow) => {
    setPending(true);
    await upsertFeatureFlag(flag.key, !flag.enabled, flag.rollout_percent);
    setPending(false);
    router.refresh();
  };

  const updateRollout = async (flag: FeatureFlagRow, percent: number) => {
    setPending(true);
    await upsertFeatureFlag(flag.key, flag.enabled, percent);
    setPending(false);
    router.refresh();
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <p className="font-body text-[11px] text-muted uppercase tracking-wide mb-3">Feature flags</p>

      <div className="flex flex-col gap-2 mb-3">
        {flags.map((flag) => (
          <div
            key={flag.id}
            className="flex items-center justify-between gap-2 bg-bg border border-border rounded-lg px-3 py-2"
          >
            <div className="min-w-0">
              <p className="font-mono text-[12.5px] text-text">{flag.key}</p>
              <p className="font-body text-[10.5px] text-faint">{flag.rollout_percent}% rollout</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <input
                type="number"
                min={0}
                max={100}
                defaultValue={flag.rollout_percent}
                onBlur={(e) => updateRollout(flag, Math.max(0, Math.min(100, Number(e.target.value))))}
                className="w-14 bg-card border border-border rounded-md px-1.5 py-1 text-text font-mono text-[11px] outline-none focus:border-amber/60"
              />
              <button
                type="button"
                onClick={() => toggle(flag)}
                disabled={pending}
                className={`font-body text-[11px] font-semibold rounded-md px-2 py-1 cursor-pointer disabled:opacity-50 ${
                  flag.enabled ? "bg-success/15 text-success" : "bg-border text-muted"
                }`}
              >
                {flag.enabled ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        ))}
        {flags.length === 0 && <p className="font-body text-[12px] text-faint">No flags yet.</p>}
      </div>

      <div className="flex gap-2">
        <input
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="new-flag-key"
          className="flex-1 bg-bg border border-border rounded-lg px-3 py-2 text-text font-mono text-[12px] outline-none focus:border-amber/60"
        />
        <input
          type="number"
          min={0}
          max={100}
          value={rollout}
          onChange={(e) => setRollout(Number(e.target.value))}
          className="w-16 bg-bg border border-border rounded-lg px-2 py-2 text-text font-mono text-[12px] outline-none focus:border-amber/60"
        />
        <button
          type="button"
          onClick={create}
          disabled={pending || !key.trim()}
          className="bg-amber text-bg font-body text-[12.5px] font-bold rounded-lg px-4 disabled:opacity-50 cursor-pointer"
        >
          Add
        </button>
      </div>
    </div>
  );
}
