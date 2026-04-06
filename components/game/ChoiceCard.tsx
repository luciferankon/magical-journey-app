import type { AvailableChoice } from "@/lib/engine/types";
import type { House } from "@/lib/state";

interface ChoiceCardProps {
  choice: AvailableChoice;
  index: number;
  house: House | null;
  onSelect: (id: string) => void;
  disabled?: boolean;
}

const HOUSE_ACCENT: Record<House, string> = {
  ignis:   "border-l-ignis   group-hover:bg-ignis-deep/40",
  aqualyn: "border-l-aqualyn group-hover:bg-aqualyn-deep/40",
  terram:  "border-l-terram  group-hover:bg-terram-deep/40",
  ventus:  "border-l-ventus  group-hover:bg-ventus-deep/40",
};

const HOUSE_TEXT: Record<House, string> = {
  ignis:   "group-hover:text-ignis-text",
  aqualyn: "group-hover:text-aqualyn-text",
  terram:  "group-hover:text-terram-text",
  ventus:  "group-hover:text-ventus-text",
};

export function ChoiceCard({
  choice,
  index,
  house,
  onSelect,
  disabled = false,
}: ChoiceCardProps) {
  const isLocked    = !choice.available;
  const isDisabled  = disabled || isLocked;

  const accentClass = house ? HOUSE_ACCENT[house] : "border-l-gold group-hover:bg-elevated";
  const textClass   = house ? HOUSE_TEXT[house]   : "group-hover:text-gold-light";

  const delay = `${index * 60}ms`;

  return (
    <button
      onClick={() => !isDisabled && onSelect(choice.id)}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={`
        group choice-enter relative w-full max-w-2xl text-left
        px-5 py-4 rounded
        bg-card border border-border-subtle border-l-2
        transition-all duration-200
        ${accentClass}
        ${isLocked
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:-translate-y-0.5 hover:border-opacity-80 hover:shadow-lg"}
        ${isDisabled && !isLocked ? "opacity-60 cursor-wait" : ""}
      `}
      style={{ animationDelay: delay }}
    >
      <div className="flex items-start gap-3">
        {/* Lock icon for gated choices */}
        {isLocked && (
          <svg
            className="w-4 h-4 text-slate mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-label="Locked"
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path strokeLinecap="round" d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        )}

        {/* Choice label */}
        <span
          className={`
            font-body text-sm leading-relaxed
            ${isLocked ? "text-slate" : `text-parchment ${textClass}`}
            transition-colors duration-200
          `}
        >
          {choice.text}
        </span>
      </div>
    </button>
  );
}
