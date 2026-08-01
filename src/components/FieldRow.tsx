import { FIELD_META } from "@/lib/fields";
import type { FieldId } from "@/lib/types";

export default function FieldRow({
  id,
  value,
  onChange,
  disabled,
}: {
  id: FieldId;
  value: string;
  onChange: (id: FieldId, value: string) => void;
  disabled?: boolean;
}) {
  const meta = FIELD_META[id];
  const Icon = meta.icon;
  return (
    <div className="flex items-center gap-2.5 mb-2.5">
      <div className="w-[30px] h-[30px] rounded-lg bg-card border border-border flex items-center justify-center shrink-0">
        <Icon size={14} color={meta.color} />
      </div>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder={meta.placeholder}
        className="flex-1 min-w-0 bg-card border border-border rounded-lg px-2.5 py-2 text-text font-body text-[13px] outline-none focus:border-amber/60 disabled:opacity-50"
      />
    </div>
  );
}
