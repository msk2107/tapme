import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { EventRow } from "@/lib/types";
import AddCardForm from "./AddCardForm";
import ReceivedCardItem from "./ReceivedCardItem";

interface ReceivedCardRow {
  id: string;
  name: string;
  event_name: string | null;
  received_date: string;
  photo_path: string;
}

export default async function ReceivedCardsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: cards }, { data: events }] = await Promise.all([
    supabase
      .from("received_cards")
      .select("id, name, event_name, received_date, photo_path")
      .eq("owner_id", user.id)
      .order("received_date", { ascending: false })
      .returns<ReceivedCardRow[]>(),
    supabase
      .from("events")
      .select("*")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .returns<EventRow[]>(),
  ]);

  const cardsWithUrls = await Promise.all(
    (cards ?? []).map(async (card) => {
      const { data } = await supabase.storage
        .from("received-cards")
        .createSignedUrl(card.photo_path, 3600);
      return { ...card, photoUrl: data?.signedUrl ?? null };
    })
  );

  return (
    <div className="px-4 pt-3 pb-6">
      <p className="font-heading text-xs tracking-wider text-muted uppercase mb-2.5">
        Add a received card
      </p>
      <AddCardForm events={events ?? []} />

      <p className="font-heading text-xs tracking-wider text-muted uppercase mt-6 mb-2.5">
        My received cards
      </p>
      {cardsWithUrls.length === 0 && (
        <div className="text-center py-8 text-faint font-body text-[12.5px]">
          No cards yet. Snap a photo above when you receive one.
        </div>
      )}
      <div className="grid grid-cols-2 gap-2.5">
        {cardsWithUrls.map((card) => (
          <ReceivedCardItem key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
}
