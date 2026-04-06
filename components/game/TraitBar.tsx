import type { House } from "@/lib/state";

interface TraitBarProps {
  label: string;
  value: number;  // 0–10
  max?: number;
  house: House | null;
}

const HOUSE_FILL: Record<House, string> = {
  ignis:   "bg-ignis",
  aqualyn: "bg-aqualyn",
  terram:  "bg-terram",
  ventus:  "bg-ventus",
};

const TRAIT_ICON: Record<string, string> = {
  courage:   "🔥",
  cunning:   "👁",
  empathy:   "🤝",
  ambition:  "↑",
  wisdom:    "📜",
};

export function TraitBar({ label, value, max = 10, house }: TraitBarProps) {
  const pct = Math.round((value / max) * 100);
  const fillClass = house ? HOUSE_FILL[house] : "bg-gold";
  const icon = TRAIT_ICON[label.toLowerCase()] ?? "•";

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-ui text-xs text-muted-blue flex items-center gap-1.5">
          <span aria-hidden="true">{icon}</span>
          <span className="capitalize">{label}</span>
        </span>
        <span className="font-ui text-xs text-parchment tabular-nums">{value}</span>
      </div>
      <div
        className="h-1.5 rounded-full bg-border-subtle overflow-hidden"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div
          className={`h-full rounded-full stat-bar-fill ${fillClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
