"use client";

import { useState } from "react";
import { Eye, ShieldCheck } from "lucide-react";
import { viewUserContact, type UserContactInfo } from "../actions";
import { FIELD_ORDER, FIELD_META } from "@/lib/fields";
import { foundingLabel } from "@/lib/founding";
import type { FieldId } from "@/lib/types";

export interface AdminUserRow {
  id: string;
  name: string;
  username: string;
  signupNumber: number;
  isAdmin: boolean;
  createdAt: string;
  views: number;
  saves: number;
  referrals: number;
}

export default function AdminUsersTable({ rows }: { rows: AdminUserRow[] }) {
  const [revealed, setRevealed] = useState<Record<string, UserContactInfo["values"] | "loading" | "error">>(
    {}
  );

  const reveal = async (userId: string) => {
    setRevealed((r) => ({ ...r, [userId]: "loading" }));
    const result = await viewUserContact(userId);
    setRevealed((r) => ({
      ...r,
      [userId]: "error" in result ? "error" : result.values,
    }));
  };

  return (
    <div className="flex flex-col gap-2">
      {rows.map((row) => {
        const badge = foundingLabel(row.signupNumber);
        const state = revealed[row.id];
        return (
          <div key={row.id} className="bg-card border border-border rounded-xl p-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-heading text-[13.5px] font-semibold text-text">
                    {row.name || "(no name)"}
                  </span>
                  <span className="font-mono text-[11px] text-muted">@{row.username}</span>
                  {row.isAdmin && (
                    <span className="flex items-center gap-1 font-body text-[10px] font-bold text-amber bg-amber/15 rounded-full px-2 py-0.5">
                      <ShieldCheck size={10} /> Admin
                    </span>
                  )}
                  {badge && (
                    <span className="font-body text-[10px] font-bold text-success bg-success/15 rounded-full px-2 py-0.5">
                      {badge}
                    </span>
                  )}
                </div>
                <p className="font-mono text-[10.5px] text-faint mt-0.5">
                  Joined {new Date(row.createdAt).toLocaleDateString("en-US")}
                </p>
              </div>
              <div className="flex items-center gap-3 font-body text-[11.5px] text-muted">
                <span>{row.views} views</span>
                <span>{row.saves} saves</span>
                <span>{row.referrals} referrals</span>
                <button
                  type="button"
                  onClick={() => reveal(row.id)}
                  disabled={state === "loading"}
                  className="flex items-center gap-1 border border-border rounded-md px-2 py-1 text-text hover:border-amber/60 cursor-pointer disabled:opacity-50"
                >
                  <Eye size={12} /> {state === "loading" ? "Loading..." : "View contact info"}
                </button>
              </div>
            </div>

            {state && state !== "loading" && state !== "error" && (
              <div className="mt-3 pt-3 border-t border-border grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FIELD_ORDER.map((id: FieldId) => {
                  const entry = state[id];
                  if (!entry?.value) return null;
                  const meta = FIELD_META[id];
                  return (
                    <div key={id}>
                      <p className="font-body text-[10px] text-faint uppercase">
                        {meta.label} {!entry.visible && "(hidden)"}
                      </p>
                      <p className="font-mono text-[11.5px] text-text truncate">{entry.value}</p>
                    </div>
                  );
                })}
              </div>
            )}
            {state === "error" && (
              <p className="mt-2 font-body text-[11.5px] text-red-400">Couldn&apos;t load contact info.</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
