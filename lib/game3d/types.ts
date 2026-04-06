/**
 * Shared types for the 3D game engine.
 */
import * as THREE from 'three';

/** Scene-to-location mapping */
export const SCENE_LOCATION_MAP: Record<string, string> = {
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

/** NPCs present in each scene */
export const SCENE_NPCS: Record<string, string[]> = {
  s01_arrival: [],
  s02_first_meeting: ['sera', 'caden'],
  s03_sorting_ceremony: ['sera', 'caden'],
  s04_common_room_night: ['sera', 'tomas', 'lira'],
  s05_class_morning: ['aldric', 'caden'],
  g01_class_courage_gate: ['aldric', 'caden'],
  g02_class_cunning_gate: ['aldric', 'caden'],
  s06_corridor_incident: ['lira', 'tomas'],
  s07_duel_trigger: ['lira', 'caden'],
  g03_duel_gate: ['lira', 'caden'],
  s07b_silent_evening: ['tomas'],
  s07c_aldric_meeting: ['aldric'],
  s08_chapter_crisis: ['sera', 'caden', 'tomas', 'lira'],
  g04_crisis_courage_gate: ['sera', 'caden', 'tomas', 'lira'],
  g05_crisis_tomas_gate: ['sera', 'caden', 'tomas', 'lira'],
  ending_gate: ['sera', 'caden', 'tomas', 'lira'],
  ending_a_marked: [],
  ending_b_watcher: ['tomas'],
  ending_c_fracture: ['lira'],
};

/** Location configuration */
export interface LocationConfig {
  id: string;
  build: (house?: string | null) => THREE.Group;
  fogColor: number;
  fogNear: number;
  fogFar: number;
  ambientColor: number;
  ambientIntensity: number;
  playerSpawn: THREE.Vector3;
  cameraOffset: THREE.Vector3;
  npcPositions: Record<string, THREE.Vector3>;
}

/** NPC appearance data */
export interface NPCAppearance {
  id: string;
  name: string;
  skinColor: number;
  hairColor: number;
  robeColor: number;
  accentColor: number;
  height: number;
}

/** House color palette */
export const HOUSE_COLORS: Record<string, { primary: number; accent: number; glow: number }> = {
  ignis:   { primary: 0x8B1A1A, accent: 0xFF4444, glow: 0xFF6600 },
  aqualyn: { primary: 0x1A4A5E, accent: 0x44BBCC, glow: 0x00CCFF },
  terram:  { primary: 0x2D4A1A, accent: 0x66AA44, glow: 0x88CC44 },
  ventus:  { primary: 0x2A3A5E, accent: 0x7799CC, glow: 0x99BBFF },
};

/** NPC appearance definitions */
export const NPC_APPEARANCES: Record<string, NPCAppearance> = {
  sera: {
    id: 'sera',
    name: 'Sera Voss',
    skinColor: 0xD4A574,
    hairColor: 0x1A0A00,
    robeColor: 0x1A4A5E,
    accentColor: 0x44BBCC,
    height: 1.6,
  },
  caden: {
    id: 'caden',
    name: 'Caden Miral',
    skinColor: 0xC4956A,
    hairColor: 0x2A1500,
    robeColor: 0x8B1A1A,
    accentColor: 0xFF4444,
    height: 1.75,
  },
  aldric: {
    id: 'aldric',
    name: 'Professor Aldric',
    skinColor: 0xBB9970,
    hairColor: 0x888888,
    robeColor: 0x1A1A2E,
    accentColor: 0xC9A84C,
    height: 1.85,
  },
  lira: {
    id: 'lira',
    name: 'Lira Thane',
    skinColor: 0xD8B494,
    hairColor: 0x2A2A2A,
    robeColor: 0x333344,
    accentColor: 0xAAAAAA,
    height: 1.72,
  },
  tomas: {
    id: 'tomas',
    name: 'Tomás Reeve',
    skinColor: 0xA0704A,
    hairColor: 0x0A0A0A,
    robeColor: 0x2D4A1A,
    accentColor: 0x66AA44,
    height: 1.68,
  },
};
