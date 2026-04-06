/**
 * Public API for the player state module.
 *
 * Import from "@/lib/state" — do not import from sub-modules directly.
 * This ensures the engine, UI, and save-load layers only use the intended surface.
 */

// Types & constants
export type {
  PlayerState,
  PlayerIdentity,
  PlayerStateMeta,
  Traits,
  Relationships,
  Flags,
  ChapterExports,
  Progress,
  House,
  TraitKey,
  RelationshipKey,
  FlagKey,
  CrisisOutcome,
  ChapterReputation,
  LiraStatus,
  Chapter2SolisStance,
  InesStatus,
  LiraChapter2Status,
} from "./schema";
export { SCHEMA_VERSION } from "./schema";

// Defaults & factory
export {
  createInitialState,
  TRAIT_DEFAULT,
  TRAIT_MIN,
  TRAIT_MAX,
  RELATIONSHIP_MIN,
  RELATIONSHIP_MAX,
  STARTING_NODE_ID,
  STARTING_CHAPTER,
} from "./defaults";

// Mutations (engine use only)
export {
  applyTrait,
  applyRelationship,
  setFlag,
  setHouse,
  setPlayerName,
  setPlayerBackground,
  setChapterExports,
  advanceToNode,
  advanceChapter,
  applyConsequences,
} from "./mutations";

// Selectors (engine GATE evaluation + UI)
export {
  getTrait,
  passesTraitGate,
  getRelationship,
  passesRelationshipGate,
  getFlag,
  hasVisited,
  resolveChapter1Ending,
  deriveChapter1Reputation,
  deriveLiraStatus,
} from "./selectors";

// Migrations (save-load-engineer use only)
export { migrate, isCurrentVersion } from "./migrations";
