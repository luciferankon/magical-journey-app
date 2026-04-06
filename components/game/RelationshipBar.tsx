interface RelationshipBarProps {
  npcKey: string;   // e.g. "sera_trust"
  value: number;    // 0–10
  max?: number;
}

// Display labels and colour for each NPC relationship key
const NPC_META: Record<string, { name: string; role: string; color: string }> = {
  sera_trust:      { name: "Sera",    role: "Trust",     color: "bg-aqualyn"  },
  caden_rivalry:   { name: "Caden",   role: "Rivalry",   color: "bg-ignis"    },
  aldric_regard:   { name: "Aldric",  role: "Regard",    color: "bg-gold"     },
  lira_influence:  { name: "Lira",    role: "Influence", color: "bg-fracture" },
  tomas_bond:      { name: "Tomás",   role: "Bond",      color: "bg-terram"   },
  solis_standing:  { name: "Solis",   role: "Standing",  color: "bg-ventus"   },
  ines_contact:    { name: "Ines",    role: "Contact",   color: "bg-fracture" },
};

export function RelationshipBar({ npcKey, value, max = 10 }: RelationshipBarProps) {
  const meta = NPC_META[npcKey] ?? { name: npcKey, role: "", color: "bg-gold" };
  const pct  = Math.round((value / max) * 100);

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <span className="font-ui text-xs text-muted-blue">
          {meta.name}
          {meta.role && (
            <span className="text-slate ml-1">· {meta.role}</span>
          )}
        </span>
        <span className="font-ui text-xs text-parchment tabular-nums">{value}</span>
      </div>
      <div
        className="h-1 rounded-full bg-border-subtle overflow-hidden"
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={`${meta.name} ${meta.role}`}
      >
        <div
          className={`h-full rounded-full stat-bar-fill ${meta.color} opacity-80`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
