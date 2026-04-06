/**
 * AudioEngine — Procedural audio using Web Audio API.
 * Generates ambient music, spell SFX, footsteps, and UI sounds entirely in code.
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let currentDrone: OscillatorNode | null = null;
let currentDrone2: OscillatorNode | null = null;
let currentLFO: OscillatorNode | null = null;
let initialized = false;

// ── Location music configs ──────────────────────────────────────────────────

interface MusicConfig {
  baseFreq: number;
  secondFreq: number;
  lfoRate: number;
  volume: number;
  waveform: OscillatorType;
  waveform2: OscillatorType;
}

const LOCATION_MUSIC: Record<string, MusicConfig> = {
  aethermoor_gates: {
    baseFreq: 110, secondFreq: 165, lfoRate: 0.1,
    volume: 0.08, waveform: 'sine', waveform2: 'triangle',
  },
  entrance_courtyard: {
    baseFreq: 130.81, secondFreq: 196, lfoRate: 0.15,
    volume: 0.06, waveform: 'sine', waveform2: 'sine',
  },
  grand_hall: {
    baseFreq: 98, secondFreq: 146.83, lfoRate: 0.08,
    volume: 0.07, waveform: 'sine', waveform2: 'triangle',
  },
  common_room: {
    baseFreq: 146.83, secondFreq: 220, lfoRate: 0.12,
    volume: 0.05, waveform: 'sine', waveform2: 'sine',
  },
  casting_hall: {
    baseFreq: 123.47, secondFreq: 185, lfoRate: 0.1,
    volume: 0.06, waveform: 'sine', waveform2: 'triangle',
  },
  restricted_corridor: {
    baseFreq: 73.42, secondFreq: 110, lfoRate: 0.05,
    volume: 0.09, waveform: 'sawtooth', waveform2: 'sine',
  },
  library: {
    baseFreq: 164.81, secondFreq: 246.94, lfoRate: 0.18,
    volume: 0.04, waveform: 'sine', waveform2: 'sine',
  },
  aldric_office: {
    baseFreq: 138.59, secondFreq: 207.65, lfoRate: 0.14,
    volume: 0.05, waveform: 'sine', waveform2: 'triangle',
  },
  courtyard_night: {
    baseFreq: 82.41, secondFreq: 123.47, lfoRate: 0.06,
    volume: 0.1, waveform: 'sawtooth', waveform2: 'sine',
  },
};

// ── Init ─────────────────────────────────────────────────────────────────────

function ensureContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.5;
    masterGain.connect(audioCtx.destination);

    musicGain = audioCtx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(masterGain);

    sfxGain = audioCtx.createGain();
    sfxGain.gain.value = 0.7;
    sfxGain.connect(masterGain);
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function initAudio(): void {
  if (initialized) return;
  ensureContext();
  initialized = true;
}

// ── Ambient Music ────────────────────────────────────────────────────────────

export function playLocationMusic(locationId: string): void {
  const ctx = ensureContext();
  const config = LOCATION_MUSIC[locationId] ?? LOCATION_MUSIC.aethermoor_gates;

  // Fade out old
  stopMusic();

  // Create drone oscillators
  currentDrone = ctx.createOscillator();
  currentDrone.type = config.waveform;
  currentDrone.frequency.value = config.baseFreq;

  currentDrone2 = ctx.createOscillator();
  currentDrone2.type = config.waveform2;
  currentDrone2.frequency.value = config.secondFreq;

  // LFO for gentle modulation
  currentLFO = ctx.createOscillator();
  currentLFO.type = 'sine';
  currentLFO.frequency.value = config.lfoRate;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 3;
  currentLFO.connect(lfoGain);
  lfoGain.connect(currentDrone.frequency);

  // Filter for warmth
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 400;
  filter.Q.value = 1;

  const filter2 = ctx.createBiquadFilter();
  filter2.type = 'lowpass';
  filter2.frequency.value = 600;
  filter2.Q.value = 0.5;

  const droneGain = ctx.createGain();
  droneGain.gain.value = config.volume;

  const droneGain2 = ctx.createGain();
  droneGain2.gain.value = config.volume * 0.6;

  currentDrone.connect(filter);
  filter.connect(droneGain);
  droneGain.connect(musicGain!);

  currentDrone2.connect(filter2);
  filter2.connect(droneGain2);
  droneGain2.connect(musicGain!);

  currentDrone.start();
  currentDrone2.start();
  currentLFO.start();

  // Fade in
  musicGain!.gain.setValueAtTime(0, ctx.currentTime);
  musicGain!.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
}

export function stopMusic(): void {
  if (!audioCtx || !musicGain) return;
  musicGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1);
  const oldDrone = currentDrone;
  const oldDrone2 = currentDrone2;
  const oldLFO = currentLFO;
  setTimeout(() => {
    try { oldDrone?.stop(); } catch { /* already stopped */ }
    try { oldDrone2?.stop(); } catch { /* already stopped */ }
    try { oldLFO?.stop(); } catch { /* already stopped */ }
  }, 1200);
  currentDrone = null;
  currentDrone2 = null;
  currentLFO = null;
}

// ── SFX ──────────────────────────────────────────────────────────────────────

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', volume = 0.15): void {
  const ctx = ensureContext();
  const osc = ctx.createOscillator();
  osc.type = type;
  osc.frequency.value = freq;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(sfxGain!);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export function playFootstep(): void {
  const ctx = ensureContext();
  // Brown noise burst for footstep
  const bufferSize = ctx.sampleRate * 0.08;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastVal = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastVal + 0.02 * white) / 1.02;
    lastVal = data[i];
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.12, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(sfxGain!);
  source.start();
}

export function playMagicCast(house: string | null): void {
  // Rising tone + shimmer
  const freqs: Record<string, number> = {
    ignis: 440, aqualyn: 523.25, terram: 329.63, ventus: 659.25,
  };
  const base = freqs[house ?? 'ignis'] ?? 440;
  playTone(base, 0.6, 'sine', 0.12);
  setTimeout(() => playTone(base * 1.5, 0.4, 'triangle', 0.08), 100);
  setTimeout(() => playTone(base * 2, 0.3, 'sine', 0.05), 200);
}

export function playFractureSound(): void {
  // Dissonant low rumble
  playTone(55, 1.5, 'sawtooth', 0.1);
  playTone(58, 1.5, 'sawtooth', 0.08);
  setTimeout(() => playTone(73.42, 0.8, 'square', 0.05), 300);
}

export function playUIClick(): void {
  playTone(880, 0.08, 'sine', 0.06);
}

export function playUIHover(): void {
  playTone(660, 0.05, 'sine', 0.03);
}

export function playChoiceSelect(): void {
  playTone(523.25, 0.15, 'sine', 0.08);
  setTimeout(() => playTone(659.25, 0.12, 'sine', 0.06), 80);
}

export function playSceneTransition(): void {
  playTone(220, 0.8, 'sine', 0.06);
  setTimeout(() => playTone(277.18, 0.6, 'triangle', 0.04), 200);
  setTimeout(() => playTone(329.63, 0.5, 'sine', 0.03), 400);
}

export function playEndingChime(): void {
  const notes = [261.63, 329.63, 392, 523.25];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 1.5 - i * 0.2, 'sine', 0.1 - i * 0.015), i * 300);
  });
}

// ── Master volume ────────────────────────────────────────────────────────────

export function setMasterVolume(v: number): void {
  if (masterGain) masterGain.gain.value = Math.max(0, Math.min(1, v));
}

export function disposeAudio(): void {
  stopMusic();
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  initialized = false;
}
