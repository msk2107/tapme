"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Trash2, ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { buildVCardText, vcardFilename } from "@/lib/vcard";

interface Card {
  id: string;
  name: string;
  event_name: string | null;
  received_date: string;
  photo_path: string;
  photoUrl: string | null;
}

export default function ReceivedCardItem({ card }: { card: Card }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const downloadVCard = () => {
    const text = buildVCardText({ name: card.name, eventName: card.event_name }, {}, []);
    const blob = new Blob([text], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = vcardFilename(card.name);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const remove = async () => {
    setPending(true);
    const supabase = createClient();
    await supabase.storage.from("received-cards").remove([card.photo_path]);
    await supabase.from("received_cards").delete().eq("id", card.id);
    setPending(false);
    router.refresh();
  };

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="aspect-[3/2] bg-bg flex items-center justify-center">
        {card.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.photoUrl} alt={card.name} className="w-full h-full object-cover" />
        ) : (
          <ImageOff size={18} className="text-faint" />
        )}
      </div>
      <div className="p-2.5">
        <p className="font-heading text-[12.5px] font-semibold text-text truncate">{card.name}</p>
        <p className="font-mono text-[10px] text-muted mt-0.5 truncate">
          {card.received_date}
          {card.event_name ? ` · ${card.event_name}` : ""}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={downloadVCard}
            className="flex items-center gap-1 font-body text-[10.5px] font-semibold text-amber cursor-pointer"
          >
            <Download size={11} /> vCard
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            aria-label="Delete card"
            className="ml-auto text-faint hover:text-red-400 cursor-pointer disabled:opacity-50"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
