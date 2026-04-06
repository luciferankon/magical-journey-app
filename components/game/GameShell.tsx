"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { PlayerState } from "@/lib/state";
import type {
  SceneView,
  StartResponse,
  ChooseResponse,
  ResumeResponse,
} from "@/lib/engine/types";
import { autosave, loadAutosave } from "@/lib/save";
import manifest from "@/content/manifest.json";

import { LoadingScreen }    from "./LoadingScreen";
import { ChapterTitleCard } from "./ChapterTitleCard";
import { GameHeader }       from "./GameHeader";
import { StatPanel }        from "./StatPanel";
import { SceneDisplay }     from "./SceneDisplay";
import { DialogueBox }      from "./DialogueBox";
import { ChoiceList }       from "./ChoiceList";
import { SaveLoadMenu }     from "./SaveLoadMenu";

// ── State machine ─────────────────────────────────────────────────────────────

type Phase =
  | "loading"        // initial load / API in flight on startup
  | "chapter-title"  // full-screen chapter announcement
  | "playing"        // main game loop
  | "choosing"       // choice API call in flight
  | "ended";         // chapter / game ending screen

interface Shell {
  phase:         Phase;
  playerState:   PlayerState | null;
  sceneView:     SceneView   | null;
  dialogueDone:  boolean;
  statsOpen:     boolean;
  saveMenuOpen:  boolean;
  error:         string | null;
  /** Previous chapter — used to detect chapter advances and show title card */
  lastChapter:   number;
}

type Action =
  | { type: "LOAD_STARTED" }
  | { type: "GAME_STARTED"; playerState: PlayerState; sceneView: SceneView }
  | { type: "CHAPTER_TITLE_DONE" }
  | { type: "DIALOGUE_DONE" }
  | { type: "CHOICE_SUBMITTED" }
  | { type: "CHOICE_RESOLVED"; playerState: PlayerState; sceneView: SceneView }
  | { type: "STATE_LOADED"; playerState: PlayerState; sceneView: SceneView }
  | { type: "TOGGLE_STATS" }
  | { type: "CLOSE_STATS" }
  | { type: "OPEN_SAVE_MENU" }
  | { type: "CLOSE_SAVE_MENU" }
  | { type: "ERROR"; message: string };

const initial: Shell = {
  phase:        "loading",
  playerState:  null,
  sceneView:    null,
  dialogueDone: false,
  statsOpen:    false,
  saveMenuOpen: false,
  error:        null,
  lastChapter:  1,
};

function reducer(state: Shell, action: Action): Shell {
  switch (action.type) {
    case "LOAD_STARTED":
      return { ...state, phase: "loading", error: null };

    case "GAME_STARTED": {
      const chapter = action.playerState.progress.chapter;
      return {
        ...state,
        phase:        "chapter-title",
        playerState:  action.playerState,
        sceneView:    action.sceneView,
        dialogueDone: false,
        lastChapter:  chapter,
        error:        null,
      };
    }

    case "CHAPTER_TITLE_DONE":
      return { ...state, phase: "playing" };

    case "DIALOGUE_DONE":
      return { ...state, dialogueDone: true };

    case "CHOICE_SUBMITTED":
      return { ...state, phase: "choosing" };

    case "CHOICE_RESOLVED": {
      const prevChapter = state.playerState?.progress.chapter ?? 1;
      const newChapter  = action.playerState.progress.chapter;
      const chapterAdvanced = newChapter > prevChapter;
      const isEnding = action.sceneView.isEnding;

      return {
        ...state,
        phase:        isEnding ? "ended" : chapterAdvanced ? "chapter-title" : "playing",
        playerState:  action.playerState,
        sceneView:    action.sceneView,
        dialogueDone: false,
        lastChapter:  newChapter,
        error:        null,
      };
    }

    case "STATE_LOADED":
      return {
        ...state,
        phase:        "playing",
        playerState:  action.playerState,
        sceneView:    action.sceneView,
        dialogueDone: false,
        error:        null,
      };

    case "TOGGLE_STATS":
      return { ...state, statsOpen: !state.statsOpen };

    case "CLOSE_STATS":
      return { ...state, statsOpen: false };

    case "OPEN_SAVE_MENU":
      return { ...state, saveMenuOpen: true };

    case "CLOSE_SAVE_MENU":
      return { ...state, saveMenuOpen: false };

    case "ERROR":
      return { ...state, phase: "playing", error: action.message };

    default:
      return state;
  }
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function apiStart(): Promise<StartResponse> {
  const res = await fetch("/api/engine/start", { method: "POST" });
  if (!res.ok) throw new Error(`Engine start failed: ${res.status}`);
  return res.json() as Promise<StartResponse>;
}

async function apiChoose(
  choiceId: string,
  playerState: PlayerState
): Promise<ChooseResponse> {
  const res = await fetch("/api/engine/choose", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ choiceId, state: playerState }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error: string }).error ?? `Choose failed: ${res.status}`);
  }
  return res.json() as Promise<ChooseResponse>;
}

async function apiResume(playerState: PlayerState): Promise<ResumeResponse> {
  const res = await fetch("/api/engine/resume", {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ state: playerState }),
  });
  if (!res.ok) throw new Error(`Engine resume failed: ${res.status}`);
  return res.json() as Promise<ResumeResponse>;
}

const CHAPTER_TITLES = manifest.chapterTitles as Record<string, string>;

// ── Component ─────────────────────────────────────────────────────────────────

export function GameShell() {
  const [s, dispatch] = useReducer(reducer, initial);

  // On mount: try autosave first, fall back to new game
  useEffect(() => {
    async function boot() {
      dispatch({ type: "LOAD_STARTED" });
      try {
        const saved = loadAutosave();
        if (saved) {
          const sceneView = await apiResume(saved);
          dispatch({ type: "STATE_LOADED", playerState: saved, sceneView });
        } else {
          const { state, sceneView } = await apiStart();
          dispatch({ type: "GAME_STARTED", playerState: state, sceneView });
        }
      } catch (err) {
        // If resume/start fails (engine not yet deployed), show error state
        dispatch({
          type:    "ERROR",
          message: err instanceof Error ? err.message : "Failed to start game.",
        });
      }
    }
    void boot();
  }, []);

  const handleChoice = useCallback(
    async (choiceId: string) => {
      if (!s.playerState || s.phase !== "playing") return;
      dispatch({ type: "CHOICE_SUBMITTED" });
      try {
        const { newState, nextSceneView } = await apiChoose(choiceId, s.playerState);
        autosave(newState);
        dispatch({ type: "CHOICE_RESOLVED", playerState: newState, sceneView: nextSceneView });
      } catch (err) {
        dispatch({
          type:    "ERROR",
          message: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    },
    [s.playerState, s.phase]
  );

  const handleSaveLoad = useCallback(
    (loaded: PlayerState) => {
      void apiResume(loaded).then((sceneView) => {
        dispatch({ type: "STATE_LOADED", playerState: loaded, sceneView });
      }).catch((err) => {
        dispatch({
          type:    "ERROR",
          message: err instanceof Error ? err.message : "Load failed.",
        });
      });
    },
    []
  );

  // ── Render phases ───────────────────────────────────────────────────────────

  if (s.phase === "loading") {
    return <LoadingScreen />;
  }

  // Error without any scene yet
  if (s.error && !s.sceneView) {
    return (
      <div className="fixed inset-0 bg-deep flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="font-display text-lg text-danger">Something went wrong</p>
        <p className="font-body text-sm text-muted-blue max-w-sm">{s.error}</p>
        <button
          onClick={() => window.location.reload()}
          className="font-ui text-sm px-4 py-2 rounded bg-gold text-on-gold hover:bg-gold-light transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (s.phase === "chapter-title" && s.playerState) {
    const chapter = s.playerState.progress.chapter;
    return (
      <ChapterTitleCard
        chapter={chapter}
        title={CHAPTER_TITLES[chapter] ?? `Chapter ${chapter}`}
        house={s.playerState.identity.house}
        onComplete={() => dispatch({ type: "CHAPTER_TITLE_DONE" })}
      />
    );
  }

  if (!s.sceneView || !s.playerState) return <LoadingScreen />;

  const { scene, availableChoices, isEnding } = s.sceneView;
  const { identity, progress }                = s.playerState;
  const house                                 = identity.house;

  // ── Ending screen ───────────────────────────────────────────────────────────

  if (s.phase === "ended") {
    return (
      <SceneDisplay sceneId={scene.id}>
        <div className="flex flex-col flex-1 items-center justify-center p-8 text-center">
          <span className="font-display text-xs tracking-[0.4em] uppercase text-gold mb-4">
            End of Chapter {progress.chapter}
          </span>
          <p className="font-body text-lg text-parchment max-w-xl leading-relaxed italic">
            {scene.text}
          </p>
        </div>
      </SceneDisplay>
    );
  }

  // ── Main playing / choosing phase ───────────────────────────────────────────

  const isChoosing = s.phase === "choosing";

  return (
    <div className="flex flex-col h-svh overflow-hidden">
      {/* Top bar */}
      <GameHeader
        playerName={identity.name}
        house={house}
        chapter={progress.chapter}
        onSaveLoad={() => dispatch({ type: "OPEN_SAVE_MENU" })}
        onToggleStats={() => dispatch({ type: "TOGGLE_STATS" })}
        statsOpen={s.statsOpen}
      />

      {/* Stats panel (slides in from right) */}
      <StatPanel
        state={s.playerState}
        open={s.statsOpen}
        onClose={() => dispatch({ type: "CLOSE_STATS" })}
      />

      {/* Scene area */}
      <SceneDisplay sceneId={scene.id}>
        {/* Spacer pushes content to bottom */}
        <div className="flex-1 pt-14" />

        {/* Choices — shown after dialogue completes */}
        {s.dialogueDone && !isEnding && (
          <div className="pb-4">
            <ChoiceList
              choices={availableChoices}
              house={house}
              onSelect={handleChoice}
              disabled={isChoosing}
            />
          </div>
        )}

        {/* Dialogue box */}
        <DialogueBox
          text={scene.text}
          house={house}
          onComplete={() => dispatch({ type: "DIALOGUE_DONE" })}
          completed={s.dialogueDone}
        />
      </SceneDisplay>

      {/* Error toast */}
      {s.error && (
        <div
          role="alert"
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-danger text-parchment text-sm font-ui px-4 py-2 rounded shadow-lg"
        >
          {s.error}
        </div>
      )}

      {/* Save / Load modal */}
      {s.saveMenuOpen && (
        <SaveLoadMenu
          currentState={s.playerState}
          onLoad={handleSaveLoad}
          onClose={() => dispatch({ type: "CLOSE_SAVE_MENU" })}
        />
      )}
    </div>
  );
}
