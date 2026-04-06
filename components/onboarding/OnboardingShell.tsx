"use client";

import { useCallback, useReducer } from "react";
import {
  createInitialState,
  setPlayerName,
  setPlayerBackground,
  setHouse,
  applyTrait,
  applyRelationship,
} from "@/lib/state";
import type { House, PlayerState, TraitKey, RelationshipKey } from "@/lib/state";
import { autosave } from "@/lib/save";
import type { ChoiceOption } from "./StepChoice";
import { StepName }   from "./StepName";
import { StepChoice } from "./StepChoice";

// ── Onboarding data types ─────────────────────────────────────────────────────

interface ConsequenceDelta {
  type: "trait_delta" | "relationship_delta";
  trait?: string;
  character?: string;
  delta: number;
}

interface OnboardingOption {
  id: string;
  house?: string;
  label?: string;
  text?: string;
  description?: string;
  flavour?: string;
  accentClass?: string;
  glowClass?: string;
  consequences: ConsequenceDelta[];
}

export interface OnboardingData {
  name: { prompt: string; placeholder: string; hint: string; submitLabel: string };
  backgrounds: { prompt: string; hint: string; options: OnboardingOption[] };
  originQuestions: Array<{ id: string; prompt: string; options: OnboardingOption[] }>;
  houseSelection: { prompt: string; hint: string; options: OnboardingOption[] };
}

// ── Step state machine ────────────────────────────────────────────────────────

type StepId =
  | "name"
  | "background"
  | `origin_${number}`
  | "house";

interface OnboardingState {
  step: StepId;
  name: string;
  backgroundId: string;
  originAnswers: string[];
  houseId: House | null;
  accumulatedConsequences: ConsequenceDelta[];
}

type OnboardingAction =
  | { type: "SET_NAME"; name: string }
  | { type: "SET_BACKGROUND"; id: string; consequences: ConsequenceDelta[] }
  | { type: "SET_ORIGIN"; questionIndex: number; id: string; consequences: ConsequenceDelta[]; totalQuestions: number }
  | { type: "SET_HOUSE"; id: House; consequences: ConsequenceDelta[] };

function reducer(state: OnboardingState, action: OnboardingAction): OnboardingState {
  switch (action.type) {
    case "SET_NAME":
      return { ...state, name: action.name, step: "background" };

    case "SET_BACKGROUND":
      return {
        ...state,
        backgroundId: action.id,
        step: "origin_0",
        accumulatedConsequences: [...state.accumulatedConsequences, ...action.consequences],
      };

    case "SET_ORIGIN": {
      const answers = [...state.originAnswers, action.id];
      const nextStep: StepId =
        action.questionIndex + 1 < action.totalQuestions
          ? `origin_${action.questionIndex + 1}`
          : "house";
      return {
        ...state,
        originAnswers: answers,
        step: nextStep,
        accumulatedConsequences: [...state.accumulatedConsequences, ...action.consequences],
      };
    }

    case "SET_HOUSE":
      return {
        ...state,
        houseId: action.id,
        accumulatedConsequences: [...state.accumulatedConsequences, ...action.consequences],
      };

    default:
      return state;
  }
}

const initial: OnboardingState = {
  step: "name",
  name: "",
  backgroundId: "",
  originAnswers: [],
  houseId: null,
  accumulatedConsequences: [],
};

// ── State builder ─────────────────────────────────────────────────────────────

function buildPlayerState(
  name: string,
  backgroundId: string,
  houseId: House,
  consequences: ConsequenceDelta[]
): PlayerState {
  let state = createInitialState();
  state = setPlayerName(state, name);
  state = setPlayerBackground(state, backgroundId);
  state = setHouse(state, houseId);

  for (const c of consequences) {
    if (c.type === "trait_delta" && c.trait) {
      state = applyTrait(state, c.trait as TraitKey, c.delta);
    } else if (c.type === "relationship_delta" && c.character) {
      state = applyRelationship(state, c.character as RelationshipKey, c.delta);
    }
  }

  return state;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface OnboardingShellProps {
  data: OnboardingData;
  onComplete: (state: PlayerState) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function OnboardingShell({ data, onComplete }: OnboardingShellProps) {
  const [s, dispatch] = useReducer(reducer, initial);

  const totalOriginQuestions = data.originQuestions.length;

  const handleHouseSelect = useCallback(
    (id: string) => {
      const opt = data.houseSelection.options.find((o) => o.id === id);
      if (!opt?.house) return;

      const house = opt.house as House;
      dispatch({ type: "SET_HOUSE", id: house, consequences: opt.consequences });

      // Build and persist state immediately
      const builtState = buildPlayerState(
        s.name,
        s.backgroundId,
        house,
        [...s.accumulatedConsequences, ...opt.consequences]
      );
      autosave(builtState);
      onComplete(builtState);
    },
    [data.houseSelection.options, s.name, s.backgroundId, s.accumulatedConsequences, onComplete]
  );

  // Determine current step content
  const stepContent = (() => {
    if (s.step === "name") {
      return (
        <StepName
          prompt={data.name.prompt}
          placeholder={data.name.placeholder}
          hint={data.name.hint}
          submitLabel={data.name.submitLabel}
          onSubmit={(name) => dispatch({ type: "SET_NAME", name })}
        />
      );
    }

    if (s.step === "background") {
      return (
        <StepChoice
          prompt={data.backgrounds.prompt}
          hint={data.backgrounds.hint}
          options={data.backgrounds.options as ChoiceOption[]}
          onSelect={(id) => {
            const opt = data.backgrounds.options.find((o) => o.id === id)!;
            dispatch({ type: "SET_BACKGROUND", id, consequences: opt.consequences });
          }}
        />
      );
    }

    if (s.step.startsWith("origin_")) {
      const idx = parseInt(s.step.replace("origin_", ""), 10);
      const q = data.originQuestions[idx];
      if (!q) return null;
      return (
        <StepChoice
          prompt={q.prompt}
          options={q.options as ChoiceOption[]}
          onSelect={(id) => {
            const opt = q.options.find((o) => o.id === id)!;
            dispatch({
              type: "SET_ORIGIN",
              questionIndex: idx,
              id,
              consequences: opt.consequences,
              totalQuestions: totalOriginQuestions,
            });
          }}
        />
      );
    }

    if (s.step === "house") {
      return (
        <StepChoice
          prompt={data.houseSelection.prompt}
          hint={data.houseSelection.hint}
          options={data.houseSelection.options as ChoiceOption[]}
          onSelect={handleHouseSelect}
          columns={2}
        />
      );
    }

    return null;
  })();

  // Step progress indicator
  const steps: StepId[] = [
    "name",
    "background",
    ...data.originQuestions.map((_, i): StepId => `origin_${i}`),
    "house",
  ];
  const currentIndex = steps.indexOf(s.step);
  const totalSteps   = steps.length;

  return (
    <div className="min-h-svh bg-deep flex flex-col items-center justify-center px-4 py-12">
      {/* Progress dots */}
      <div className="flex gap-2 mb-12" aria-label={`Step ${currentIndex + 1} of ${totalSteps}`}>
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
              i <= currentIndex ? "bg-gold" : "bg-border-subtle"
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Step content — fade in on mount */}
      <div key={s.step} className="anim-fade-in w-full flex flex-col items-center">
        {stepContent}
      </div>

      {/* Skip to game (accessibility / testing escape hatch) */}
      {process.env.NODE_ENV === "development" && (
        <button
          onClick={() => {
            const state = buildPlayerState("Newcomer", "scholarship", "ventus", []);
            autosave(state);
            onComplete(state);
          }}
          className="fixed bottom-4 right-4 font-ui text-xs text-slate hover:text-muted-blue"
        >
          Skip onboarding [dev]
        </button>
      )}
    </div>
  );
}
