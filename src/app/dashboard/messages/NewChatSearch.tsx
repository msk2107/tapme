"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { findOrCreateConversation } from "@/lib/conversations";
import { searchUsers, type UserSearchResult } from "./actions";

export default function NewChatSearch({ myId }: { myId: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [searchedQuery, setSearchedQuery] = useState("");
  const [startingId, setStartingId] = useState<string | null>(null);

  const trimmedQuery = query.trim();
  // Derived instead of its own state+effect: "loading" just means the query
  // has changed since the last completed search.
  const loading = trimmedQuery.length >= 2 && trimmedQuery !== searchedQuery;

  useEffect(() => {
    if (trimmedQuery.length < 2) return;
    const timer = setTimeout(async () => {
      const found = await searchUsers(trimmedQuery);
      setResults(found);
      setSearchedQuery(trimmedQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [trimmedQuery]);

  // Derived rather than cleared via setState-in-effect: once the query drops
  // below 2 chars there's simply nothing to show, no need to touch state.
  const visibleResults = trimmedQuery.length >= 2 ? results : [];

  const pick = async (otherId: string) => {
    setStartingId(otherId);
    const supabase = createClient();
    const conversationId = await findOrCreateConversation(supabase, myId, otherId);
    setStartingId(null);
    if (!conversationId) return;
    router.push(`/dashboard/messages/${conversationId}`);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 bg-card border border-border rounded-full px-3.5 py-2.5">
        <Search size={14} className="text-faint shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Find someone to message..."
          className="flex-1 bg-transparent outline-none text-text font-body text-[13px] placeholder:text-faint"
        />
      </div>

      {trimmedQuery.length >= 2 && (
        <div className="flex flex-col gap-1.5 mt-2">
          {loading && (
            <p className="font-body text-[11.5px] text-faint px-1 py-1">Searching...</p>
          )}
          {!loading && visibleResults.length === 0 && (
            <p className="font-body text-[11.5px] text-faint px-1 py-1">No matching users.</p>
          )}
          {!loading && visibleResults.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => pick(r.id)}
              disabled={startingId === r.id}
              className="flex items-center gap-3 bg-card border border-border rounded-xl p-2.5 hover:border-amber/40 cursor-pointer disabled:opacity-60 text-left"
            >
              {r.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={r.avatar_url}
                  alt={r.name}
                  className="w-8 h-8 rounded-full object-cover border border-border shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-bg border border-border shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <p className="font-heading text-[12.5px] font-semibold text-text truncate">
                  {r.name || "TapMe user"}
                </p>
                <p className="font-body text-[11px] text-muted truncate">@{r.username}</p>
              </div>
              {startingId === r.id && (
                <span className="font-body text-[11px] text-faint shrink-0">Opening...</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
