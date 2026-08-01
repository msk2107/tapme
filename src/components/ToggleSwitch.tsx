export default function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      aria-pressed={checked}
      className={`w-[38px] h-[22px] rounded-full relative shrink-0 transition-colors ${
        checked ? "bg-amber" : "bg-border"
      }`}
    >
      <div
        className="w-4 h-4 rounded-full bg-bg absolute top-[3px] transition-all"
        style={{ left: checked ? 19 : 3 }}
      />
    </button>
  );
}
