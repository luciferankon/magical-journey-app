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
  ignis:   "border-l-ignis hover:border-ignis-glow",
  aqualyn: "border-l-aqualyn hover:border-aqualyn-glow",
  terram:  "border-l-terram hover:border-terram-glow",
  ventus:  "border-l-ventus hover:border-ventus-glow",
};

const HOUSE_HOVER: Record<House, string> = {
  ignis:   "hover:bg-ignis-deep/20 hover:text-ignis-text",
  aqualyn: "hover:bg-aqualyn-deep/20 hover:text-aqualyn-text",
  terram:  "hover:bg-terram-deep/20 hover:text-terram-text",
  ventus:  "hover:bg-ventus-deep/20 hover:text-ventus-text",
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

  const accentClass = house ? HOUSE_ACCENT[house] : "border-l-gold hover:border-gold-light";
  const hoverClass  = house ? HOUSE_HOVER[house]   : "hover:bg-gold/10 hover:text-gold-light";

  const delay = `${index * 100}ms`;

  return (
    <button
      onClick={() => !isDisabled && onSelect(choice.id)}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={`
        choice-enter relative w-full text-left
        px-5 py-4 rounded
        border-l-4 border-t border-r border-b
        transition-all duration-200
        ${accentClass}
        ${hoverClass}
        ${isLocked
          ? "opacity-40 cursor-not-allowed"
          : "cursor-pointer hover:translate-y-0.5 hover:shadow-lg"}
        ${isDisabled && !isLocked ? "opacity-60 cursor-wait" : ""}
      `}
      style={{
        animationDelay: delay,
        backgroundColor: isLocked ? 'rgba(60, 64, 100, 0.15)' : 'rgba(28, 31, 51, 0.6)',
        borderTopColor: 'rgba(120, 60, 180, 0.2)',
        borderRightColor: 'rgba(120, 60, 180, 0.2)',
        borderBottomColor: 'rgba(120, 60, 180, 0.2)',
      }}
    >
      <div className="flex items-start gap-3">
        {/* Lock icon for gated choices */}
        {isLocked && (
          <svg
            className="w-4 h-4 mt-0.5 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-label="Locked"
            style={{ color: '#9A9EB8' }}
          >
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path strokeLinecap="round" d="M8 11V7a4 4 0 018 0v4" />
          </svg>
        )}

        {/* Choice label */}
        <span
          className={`
            font-body text-sm leading-relaxed
            ${isLocked ? 'opacity-60' : ''}
            transition-colors duration-200
          `}
          style={{ color: isLocked ? '#9A9EB8' : '#e8dcc8' }}
        >
          {choice.text}
        </span>
      </div>
    </button>
  );
}
