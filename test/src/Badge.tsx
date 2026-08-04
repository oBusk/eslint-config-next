import { type BadgeData, formatCount, type Tone } from "./format";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-gray-100 text-gray-900",
  positive: "bg-green-100 text-green-900",
  warning: "bg-amber-100 text-amber-900",
};

export function Badge({ count, label, tone }: BadgeData) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3 py-1 ${toneClasses[tone]}`}
    >
      {label}
      {count > 0 ? <strong>{formatCount(count)}</strong> : null}
    </span>
  );
}
