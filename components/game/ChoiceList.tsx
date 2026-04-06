import type { AvailableChoice } from "@/lib/engine/types";
import type { House } from "@/lib/state";
import { ChoiceCard } from "./ChoiceCard";

interface ChoiceListProps {
  choices: AvailableChoice[];
  house: House | null;
  onSelect: (choiceId: string) => void;
  disabled?: boolean;
}

export function ChoiceList({ choices, house, onSelect, disabled }: ChoiceListProps) {
  if (choices.length === 0) return null;

  return (
    <div
      className="flex flex-col items-center gap-2 w-full px-4"
      role="group"
      aria-label="Available choices"
    >
      {choices.map((choice, i) => (
        <ChoiceCard
          key={choice.id}
          choice={choice}
          index={i}
          house={house}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
