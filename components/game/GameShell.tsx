"use client";

import { useCallback, useEffect, useReducer, useState } from "react";
import type { PlayerState } from "@/lib/state";
import type {
  SceneView,
  StartResponse,
  ChooseResponse,
  ResumeResponse,
} from "@/lib/engine/types";
import { autosave, loadAutosave } from "@/lib/save";
import manifest from "@/content/manifest.json";
import { initAudio, playLocationMusic, playChoiceSelect } from "@/lib/game3d/AudioEngine";

import { LoadingScreen }    from "./LoadingScreen";
import { ChapterTitleCard } from "./ChapterTitleCard";
import { GameHeader }       from "./GameHeader";
import { StatPanel }        from "./StatPanel";
import { DialogueBox }      from "./DialogueBox";
import { ChoiceList }       from "./ChoiceList";
import { SaveLoadMenu }     from "./SaveLoadMenu";

// Scene ID to location ID mapping
const SCENE_LOCATION_MAP: Record<string, string> = {
  s01_arrival: 'aethermoor_gates',
  s02_first_meeting: 'entrance_courtyard',
  s03_sorting_ceremony: 'grand_hall',
  s04_common_room_night: 'common_room',
  s05_class_morning: 'casting_hall',
  g01_class_courage_gate: 'casting_hall',
  g02_class_cunning_gate: 'casting_hall',
  s06_corridor_incident: 'restricted_corridor',
  s07_duel_trigger: 'restricted_corridor',
  g03_duel_gate: 'restricted_corridor',
  s07b_silent_evening: 'library',
  s07c_aldric_meeting: 'aldric_office',
  s08_chapter_crisis: 'courtyard_night',
  g04_crisis_courage_gate: 'courtyard_night',
  g05_crisis_tomas_gate: 'courtyard_night',
  ending_gate: 'courtyard_night',
  ending_a_marked: 'courtyard_night',
  ending_b_watcher: 'common_room',
  ending_c_fracture: 'courtyard_night',
};

// Scene location to image path mapping
// AI-generated .jpg images take priority; SVG files are the fallback
const AI_IMAGE_MAP: Record<string, string> = {
  aethermoor_gates: '/images/scenes/aethermoor_gates.jpg',
  entrance_courtyard: '/images/scenes/entrance_courtyard.jpg',
  grand_hall: '/images/scenes/grand_hall.jpg',
  common_room: '/images/scenes/common_room.jpg',
  casting_hall: '/images/scenes/casting_hall.jpg',
  restricted_corridor: '/images/scenes/restricted_corridor.jpg',
  library: '/images/scenes/library.jpg',
  aldric_office: '/images/scenes/aldric_office.jpg',
  courtyard_night: '/images/scenes/courtyard_night.jpg',
};

const SVG_FALLBACK_MAP: Record<string, string> = {
  aethermoor_gates: '/images/scenes/aethermoor_gates.svg',
  entrance_courtyard: '/images/scenes/entrance_courtyard.svg',
  grand_hall: '/images/scenes/grand_hall.svg',
  common_room: '/images/scenes/common_room.svg',
  casting_hall: '/images/scenes/casting_hall.svg',
  restricted_corridor: '/images/scenes/restricted_corridor.svg',
  library: '/images/scenes/library.svg',
  aldric_office: '/images/scenes/aldric_office.svg',
  courtyard_night: '/images/scenes/courtyard_night.svg',
};

function getSceneImage(locationId: string): string {
  // Prefer AI-generated JPG; component will onError-fallback to SVG
  return AI_IMAGE_MAP[locationId] ?? SVG_FALLBACK_MAP[locationId] ?? '';
}

const SCENE_IMAGE_MAP: Record<string, string> = Object.fromEntries(
  Object.keys(AI_IMAGE_MAP).map((k) => [k, getSceneImage(k)])
);

// Scene-specific mood overlays — applied ON TOP of the base location image
const SCENE_MOOD: Record<string, {
  overlay: string;       // CSS background for color overlay
  filter: string;        // CSS filter on the background image
  label?: string;        // Optional scene subtitle shown briefly
}> = {
  // Aethermoor Gates
  s01_arrival: {
    overlay: 'linear-gradient(to bottom, rgba(20,5,40,0.3) 0%, rgba(80,20,10,0.2) 100%)',
    filter: 'brightness(0.9) saturate(1.1)',
    label: 'Aethermoor Station',
  },

  // Entrance Courtyard
  s02_first_meeting: {
    overlay: 'linear-gradient(to bottom, rgba(10,5,30,0.2) 0%, rgba(0,0,0,0.4) 100%)',
    filter: 'brightness(1.0) saturate(1.0)',
    label: 'The Entrance Courtyard',
  },

  // Grand Hall — sorting ceremony (formal, golden light)
  s03_sorting_ceremony: {
    overlay: 'linear-gradient(to bottom, rgba(30,10,5,0.4) 0%, rgba(60,30,0,0.2) 50%, rgba(0,0,0,0.5) 100%)',
    filter: 'brightness(0.95) saturate(1.2) sepia(0.1)',
    label: 'The Grand Hall',
  },

  // Common room — night (warm, intimate)
  s04_common_room_night: {
    overlay: 'linear-gradient(to bottom, rgba(40,10,5,0.4) 0%, rgba(80,30,5,0.15) 100%)',
    filter: 'brightness(0.85) saturate(1.3) sepia(0.15)',
    label: 'The Common Room — Night',
  },

  // Casting hall — morning class (cool blue-gold)
  s05_class_morning: {
    overlay: 'linear-gradient(135deg, rgba(50,40,10,0.3) 0%, rgba(10,10,40,0.4) 100%)',
    filter: 'brightness(1.0) saturate(0.9)',
    label: 'The Casting Hall',
  },

  // Casting hall — courage gate (tense, slightly red)
  g01_class_courage_gate: {
    overlay: 'linear-gradient(to bottom, rgba(60,5,5,0.35) 0%, rgba(20,5,5,0.5) 100%)',
    filter: 'brightness(0.9) saturate(1.4) hue-rotate(-10deg)',
  },

  // Casting hall — cunning gate (cold blue)
  g02_class_cunning_gate: {
    overlay: 'linear-gradient(to bottom, rgba(5,5,60,0.35) 0%, rgba(5,20,50,0.4) 100%)',
    filter: 'brightness(0.9) saturate(0.85) hue-rotate(15deg)',
  },

  // Restricted corridor — incident (eerie, green tint)
  s06_corridor_incident: {
    overlay: 'linear-gradient(to bottom, rgba(5,30,10,0.3) 0%, rgba(0,0,0,0.6) 100%)',
    filter: 'brightness(0.8) saturate(1.2) hue-rotate(5deg)',
    label: 'The Restricted Corridor',
  },

  // Restricted corridor — duel trigger (red confrontation)
  s07_duel_trigger: {
    overlay: 'linear-gradient(to bottom, rgba(80,5,5,0.5) 0%, rgba(40,0,0,0.6) 100%)',
    filter: 'brightness(0.75) saturate(1.6) hue-rotate(-15deg)',
  },

  // Corridor duel gate
  g03_duel_gate: {
    overlay: 'radial-gradient(ellipse at center, rgba(100,0,0,0.4) 0%, rgba(20,0,0,0.7) 100%)',
    filter: 'brightness(0.7) saturate(1.8) contrast(1.1)',
  },

  // Library — silent evening (deep amber warmth)
  s07b_silent_evening: {
    overlay: 'linear-gradient(to bottom, rgba(20,10,5,0.35) 0%, rgba(40,20,5,0.2) 60%, rgba(0,0,0,0.5) 100%)',
    filter: 'brightness(0.88) saturate(1.1) sepia(0.2)',
    label: 'The Academy Library',
  },

  // Aldric's office (mystical purple-gold)
  s07c_aldric_meeting: {
    overlay: 'radial-gradient(ellipse at 30% 40%, rgba(60,30,5,0.3) 0%, rgba(20,5,40,0.4) 100%)',
    filter: 'brightness(0.85) saturate(1.3)',
    label: "Professor Aldric's Office",
  },

  // Crisis courtyard — the event
  s08_chapter_crisis: {
    overlay: 'radial-gradient(ellipse at center, rgba(80,0,120,0.5) 0%, rgba(10,0,20,0.7) 100%)',
    filter: 'brightness(0.7) saturate(2.0) hue-rotate(20deg) contrast(1.2)',
    label: 'The Academy Courtyard',
  },

  // Crisis gates — courage
  g04_crisis_courage_gate: {
    overlay: 'radial-gradient(ellipse at center, rgba(120,10,10,0.55) 0%, rgba(20,0,5,0.75) 100%)',
    filter: 'brightness(0.65) saturate(2.2) hue-rotate(-5deg) contrast(1.3)',
  },

  // Crisis gate — tomas
  g05_crisis_tomas_gate: {
    overlay: 'radial-gradient(ellipse at center, rgba(50,0,100,0.6) 0%, rgba(10,0,20,0.8) 100%)',
    filter: 'brightness(0.6) saturate(2.0) contrast(1.3)',
  },

  // Ending gate
  ending_gate: {
    overlay: 'radial-gradient(ellipse at center, rgba(60,20,100,0.5) 0%, rgba(5,0,15,0.8) 100%)',
    filter: 'brightness(0.65) saturate(1.8)',
    label: 'The Reckoning',
  },

  // Ending A — marked (triumphant crimson)
  ending_a_marked: {
    overlay: 'radial-gradient(ellipse at 50% 70%, rgba(150,30,10,0.5) 0%, rgba(30,5,5,0.7) 100%)',
    filter: 'brightness(0.75) saturate(1.9)',
    label: 'Ending: The Marked',
  },

  // Ending B — watcher (bittersweet warm)
  ending_b_watcher: {
    overlay: 'linear-gradient(to bottom, rgba(10,10,40,0.4) 0%, rgba(40,20,5,0.35) 100%)',
    filter: 'brightness(0.85) saturate(0.9) sepia(0.25)',
    label: 'Ending: The Watcher',
  },

  // Ending C — fracture (total darkness, void purple)
  ending_c_fracture: {
    overlay: 'radial-gradient(ellipse at center, rgba(40,0,80,0.7) 0%, rgba(0,0,5,0.95) 100%)',
    filter: 'brightness(0.5) saturate(2.5) contrast(1.4)',
    label: 'Ending: The Fracture',
  },
};

// Get location display name for transition overlay
const LOCATION_NAMES: Record<string, string> = {
  aethermoor_gates: 'Aethermoor Gates',
  entrance_courtyard: 'Entrance Courtyard',
  grand_hall: 'Grand Hall',
  common_room: 'Common Room',
  casting_hall: 'Casting Hall',
  restricted_corridor: 'Restricted Corridor',
  library: 'Library',
  aldric_office: "Aldric's Office",
  courtyard_night: 'Courtyard - Night',
};

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
  /** Previous scene ID to detect transitions */
  lastSceneId:   string | null;
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
  lastSceneId:  null,
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
        lastSceneId:  action.sceneView.scene.id,
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
        lastSceneId:  action.sceneView.scene.id,
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
        lastSceneId:  action.sceneView.scene.id,
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

// ── Scene Background Component ────────────────────────────────────────────────

interface SceneBackgroundProps {
  sceneId: string;
  isTransitioning: boolean;
}

function SceneBackground({ sceneId, isTransitioning }: SceneBackgroundProps) {
  const locationId = SCENE_LOCATION_MAP[sceneId] || 'aethermoor_gates';
  const imagePath = SCENE_IMAGE_MAP[locationId] || '/images/scenes/aethermoor_gates.svg';
  const mood = SCENE_MOOD[sceneId];

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-slate-900 via-purple-950 to-slate-900 -z-10">
      {/* Dark gradient fallback while waiting for images */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-b from-slate-900/80 via-purple-950/80 to-slate-900/80
          transition-opacity duration-500
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}
      />
      {/* Actual scene image (when available) with mood filter applied */}
      <img
        src={imagePath}
        alt={LOCATION_NAMES[locationId]}
        className={`
          w-full h-full object-cover
          transition-opacity duration-500
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}
        style={mood ? { filter: mood.filter } : undefined}
        onError={(e) => {
          // If AI-generated JPG fails, fall back to SVG, then hide
          const img = e.target as HTMLImageElement;
          const svgFallback = SVG_FALLBACK_MAP[locationId];
          if (svgFallback && img.src !== window.location.origin + svgFallback) {
            img.src = svgFallback;
          } else {
            img.style.display = 'none';
          }
        }}
      />
      {/* Scene-specific mood overlay */}
      {mood && (
        <div
          className={`
            absolute inset-0 pointer-events-none
            transition-opacity duration-300
            ${isTransitioning ? 'opacity-0' : 'opacity-100'}
          `}
          style={{
            background: mood.overlay,
          }}
        />
      )}
      {/* Permanent vignette overlay (dark edges) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.4)_100%)] pointer-events-none" />
    </div>
  );
}

// ── Location Label Component ──────────────────────────────────────────────────

interface LocationLabelProps {
  locationId: string;
}

function LocationLabel({ locationId }: LocationLabelProps) {
  const displayName = LOCATION_NAMES[locationId] || 'Unknown Location';

  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 location-label-enter">
      <div className="text-center">
        <p className="font-display text-2xl tracking-widest text-gold uppercase drop-shadow-lg">
          {displayName}
        </p>
      </div>
    </div>
  );
}

// ── VisualNovelShell Component ────────────────────────────────────────────────

interface VisualNovelShellProps {
  sceneId: string;
  house: string | null;
  controlsEnabled: boolean;
  children: React.ReactNode;
}

function VisualNovelShell({
  sceneId,
  house,
  controlsEnabled,
  children,
}: VisualNovelShellProps) {
  return (
    <div className="flex flex-col h-svh overflow-hidden relative">
      <SceneBackground sceneId={sceneId} isTransitioning={false} />
      <div className="flex flex-col flex-1 relative z-10">
        {children}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function GameShell() {
  const [s, dispatch] = useReducer(reducer, initial);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [showLocationLabel, setShowLocationLabel] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  // Initialize audio on first user interaction
  const initializeAudio = useCallback(() => {
    if (!audioInitialized) {
      initAudio();
      setAudioInitialized(true);
    }
  }, [audioInitialized]);

  // Play location music when scene changes
  useEffect(() => {
    if (s.sceneView && audioInitialized) {
      const locationId = SCENE_LOCATION_MAP[s.sceneView.scene.id];
      if (locationId) {
        playLocationMusic(locationId);
      }
    }
  }, [s.sceneView?.scene.id, audioInitialized]);

  const handleChoice = useCallback(
    async (choiceId: string) => {
      if (!s.playerState || s.phase !== "playing") return;
      playChoiceSelect();
      dispatch({ type: "CHOICE_SUBMITTED" });
      try {
        const { newState, nextSceneView } = await apiChoose(choiceId, s.playerState);
        autosave(newState);

        // Trigger scene transition if location changed
        const oldLocationId = SCENE_LOCATION_MAP[s.sceneView?.scene.id ?? ''];
        const newLocationId = SCENE_LOCATION_MAP[nextSceneView.scene.id];
        if (oldLocationId !== newLocationId) {
          setIsTransitioning(true);
          setShowLocationLabel(true);
          setTimeout(() => setIsTransitioning(false), 300);
          setTimeout(() => setShowLocationLabel(false), 1500);
        }

        dispatch({ type: "CHOICE_RESOLVED", playerState: newState, sceneView: nextSceneView });
      } catch (err) {
        dispatch({
          type:    "ERROR",
          message: err instanceof Error ? err.message : "Something went wrong.",
        });
      }
    },
    [s.playerState, s.phase, s.sceneView?.scene.id]
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

  const handleNewGame = useCallback(() => {
    dispatch({ type: "CLOSE_SAVE_MENU" });
    dispatch({ type: "LOAD_STARTED" });
    void apiStart().then(({ state, sceneView }) => {
      dispatch({ type: "GAME_STARTED", playerState: state, sceneView });
    }).catch((err) => {
      dispatch({
        type:    "ERROR",
        message: err instanceof Error ? err.message : "Failed to start new game.",
      });
    });
  }, []);

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

  // Are we in dialogue / choosing (controls should be disabled)
  const isInDialogue = !s.dialogueDone || s.phase === "choosing";
  const isChoosing = s.phase === "choosing";

  // ── Ending screen ───────────────────────────────────────────────────────────

  if (s.phase === "ended") {
    return (
      <VisualNovelShell
        sceneId={scene.id}
        house={house}
        controlsEnabled={false}
      >
        <div className="flex flex-col flex-1 items-center justify-center p-8 text-center">
          <span className="font-display text-xs tracking-[0.4em] uppercase text-gold mb-4">
            End of Chapter {progress.chapter}
          </span>
          <p className="font-body text-lg text-parchment max-w-xl leading-relaxed italic drop-shadow-lg">
            {scene.text}
          </p>
        </div>
      </VisualNovelShell>
    );
  }

  // ── Main playing / choosing phase ───────────────────────────────────────

  return (
    <div
      className="flex flex-col h-svh overflow-hidden"
      onClick={initializeAudio}
      role="main"
    >
      {/* Background scene image with mood overlays and vignette */}
      <SceneBackground
        sceneId={scene.id}
        isTransitioning={isTransitioning}
      />

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

      {/* Location transition label */}
      {showLocationLabel && (
        <LocationLabel
          locationId={SCENE_LOCATION_MAP[scene.id]}
        />
      )}

      {/* Content flex to push dialogue to bottom */}
      <div className="flex-1" />

      {/* Choices — shown after dialogue completes */}
      {s.dialogueDone && !isEnding && (
        <div className="px-4 pb-4 relative z-40">
          <ChoiceList
            choices={availableChoices}
            house={house}
            onSelect={handleChoice}
            disabled={isChoosing}
          />
        </div>
      )}

      {/* Dialogue box */}
      <div className="relative z-40" onClick={initializeAudio}>
        <DialogueBox
          text={scene.text}
          house={house}
          onComplete={() => dispatch({ type: "DIALOGUE_DONE" })}
          completed={s.dialogueDone}
        />
      </div>

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
          onNewGame={handleNewGame}
          onClose={() => dispatch({ type: "CLOSE_SAVE_MENU" })}
        />
      )}
    </div>
  );
}
