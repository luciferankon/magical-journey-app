"use client";

export interface ChoiceOption {
  id: string;
  /** Short label shown as the card heading. */
  label?: string;
  /** Primary descriptive text (shown in full on the card). */
  text?: string;
  /** Long description used for background/house cards. */
  description?: string;
  /** Italic flavour line shown below description. */
  flavour?: string;
  /** Tailwind classes for the card accent (border + bg + text colour). */
  accentClass?: string;
  /** Tailwind class for the accent glow text colour. */
  glowClass?: string;
}

interface StepChoiceProps {
  prompt: string;
  hint?: string;
  options: ChoiceOption[];
  onSelect: (id: string) => void;
  columns?: 1 | 2;
}

export function StepChoice({ prompt, hint, options, onSelect, columns = 1 }: StepChoiceProps) {
  const gridClass = columns === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-3" : "flex flex-col gap-3";

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
      <div className="text-center px-4">
        <h2 className="font-display text-2xl text-parchment mb-2">{prompt}</h2>
        {hint && <p className="font-flavour italic text-muted-blue text-sm">{hint}</p>}
      </div>

      <div className={`w-full ${gridClass}`} role="group" aria-label={prompt}>
        {options.map((opt, i) => (
          <button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            className={`
              group text-left px-5 py-4 rounded border-l-2 border border-border-subtle
              bg-card hover:-translate-y-0.5 hover:border-opacity-80 hover:shadow-lg
              transition-all duration-200 cursor-pointer
              choice-enter
              ${opt.accentClass ?? "border-l-gold hover:bg-elevated"}
            `}
            style={{ animationDelay: `${i * 80}ms` }}
            aria-label={opt.label ?? opt.text ?? opt.id}
          >
            {/* Label / heading */}
            {opt.label && (
              <p className={`font-display text-sm tracking-wider mb-1.5 ${opt.glowClass ?? "text-gold"}`}>
                {opt.label}
              </p>
            )}

            {/* Main text (for simple question options) */}
            {opt.text && !opt.description && (
              <p className="font-body text-sm leading-relaxed text-parchment">
                {opt.text}
              </p>
            )}

            {/* Long description (for background / house cards) */}
            {opt.description && (
              <p className="font-body text-sm leading-relaxed text-parchment">
                {opt.description}
              </p>
            )}

            {/* Flavour line */}
            {opt.flavour && (
              <p className="font-flavour italic text-xs text-muted-blue mt-2">
                {opt.flavour}
              </p>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
