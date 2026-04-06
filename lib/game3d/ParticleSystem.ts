/**
 * ParticleSystem — Professional-quality magic effects, ambient particles, and spell visuals.
 * Features procedural textures, multi-layer effects, advanced physics, and volumetric lighting.
 */
import * as THREE from 'three';
import { HOUSE_COLORS } from './types';

// ────────────────────────────────────────────────────────────────────────────
// TEXTURE GENERATION
// ────────────────────────────────────────────────────────────────────────────

/**
 * Create a soft circular gradient texture for particles.
 * Produces a procedural canvas with radial gradient for smooth, professional appearance.
 */
function createParticleTexture(color: string = '#ffffff', size = 64): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  // Radial gradient: opaque at center, transparent at edges
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, color);
  gradient.addColorStop(0.4, color);
  gradient.addColorStop(1, 'transparent');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

// ────────────────────────────────────────────────────────────────────────────
// AMBIENT DUST (Enhanced)
// ────────────────────────────────────────────────────────────────────────────

export function createAmbientDust(count = 200): THREE.Points {
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  // Golden-warm dust palette
  const dustColor = new THREE.Color(0xFFFDD0);

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    positions[idx] = (Math.random() - 0.5) * 30;
    positions[idx + 1] = Math.random() * 8;
    positions[idx + 2] = (Math.random() - 0.5) * 30;

    // Per-particle opacity via vertex colors (alpha channel stored separately in userData)
    const opacity = 0.3 + Math.random() * 0.5;
    colors[idx] = dustColor.r;
    colors[idx + 1] = dustColor.g;
    colors[idx + 2] = dustColor.b;

    // Store per-particle data in userData
    if (!geo.userData.particleOpacity) geo.userData.particleOpacity = [];
    geo.userData.particleOpacity[i] = opacity;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const texture = createParticleTexture('#FFFDD0', 64);

  const mat = new THREE.PointsMaterial({
    color: 0xFFFDD0,
    size: 0.06,
    transparent: true,
    opacity: 0.5,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: texture,
    alphaTest: 0.01,
  });

  const points = new THREE.Points(geo, mat);
  points.userData.type = 'ambientDust';
  points.userData.frequency = new Float32Array(count); // Per-particle oscillation frequency
  points.userData.phase = new Float32Array(count); // Per-particle phase offset

  // Initialize individual oscillation frequencies
  for (let i = 0; i < count; i++) {
    points.userData.frequency[i] = 0.3 + Math.random() * 0.4;
    points.userData.phase[i] = Math.random() * Math.PI * 2;
  }

  return points;
}

export function updateAmbientDust(points: THREE.Points, time: number): void {
  const pos = points.geometry.getAttribute('position') as THREE.BufferAttribute;
  const frequency = points.userData.frequency as Float32Array;
  const phase = points.userData.phase as Float32Array;

  for (let i = 0; i < pos.count; i++) {
    const t = time * frequency[i] + phase[i];

    // Sinusoidal movement in all 3 axes with different frequencies
    const y = pos.getY(i);
    const newY = y + Math.sin(t) * 0.003 + Math.cos(t * 1.3) * 0.002;
    pos.setY(i, newY);

    const x = pos.getX(i) + Math.sin(t * 0.7 + i * 0.5) * 0.002;
    pos.setX(i, x);

    const z = pos.getZ(i) + Math.cos(t * 0.9 + i * 0.3) * 0.002;
    pos.setZ(i, z);

    // Drift upward slowly and recycle
    if (newY > 8) {
      pos.setY(i, -0.5);
    }
  }

  pos.needsUpdate = true;
}

// ────────────────────────────────────────────────────────────────────────────
// FIREFLIES (Enhanced with Lissajous curves and trails)
// ────────────────────────────────────────────────────────────────────────────

export function createFireflies(count = 60): THREE.Group {
  const group = new THREE.Group();
  group.userData.type = 'fireflies';

  // Main firefly points
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    positions[idx] = (Math.random() - 0.5) * 30;
    positions[idx + 1] = 1 + Math.random() * 4;
    positions[idx + 2] = (Math.random() - 0.5) * 30;
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  // Alternate between warm yellow-green and cool green
  const colors = [0xCCFF88, 0x88FFAA];
  const texture = createParticleTexture('#CCFF88', 64);

  const mat = new THREE.PointsMaterial({
    color: colors[0],
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: texture,
    alphaTest: 0.01,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  group.add(points);

  // Trail particles (lower opacity, slightly behind)
  const trailGeo = geo.clone();
  const trailMat = new THREE.PointsMaterial({
    color: colors[1],
    size: 0.05,
    transparent: true,
    opacity: 0.4,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: texture,
    alphaTest: 0.01,
    sizeAttenuation: true,
  });

  const trailPoints = new THREE.Points(trailGeo, trailMat);
  group.add(trailPoints);

  // Store individual blink phases and animation data
  group.userData.blinkPhases = new Float32Array(count);
  group.userData.colors = colors;
  group.userData.positions = new Float32Array(count * 3); // Previous positions for trail
  group.userData.lissajouFrequencies = new Float32Array(count * 2); // Separate x,z frequencies

  // Initialize blink phases and Lissajous frequencies
  for (let i = 0; i < count; i++) {
    group.userData.blinkPhases[i] = Math.random() * Math.PI * 2;
    group.userData.lissajouFrequencies[i * 2] = 0.3 + Math.random() * 0.5; // x frequency
    group.userData.lissajouFrequencies[i * 2 + 1] = 0.4 + Math.random() * 0.6; // z frequency
  }

  // Copy initial positions
  const initialPos = points.geometry.getAttribute('position') as THREE.BufferAttribute;
  for (let i = 0; i < count; i++) {
    group.userData.positions[i * 3] = initialPos.getX(i);
    group.userData.positions[i * 3 + 1] = initialPos.getY(i);
    group.userData.positions[i * 3 + 2] = initialPos.getZ(i);
  }

  return group;
}

export function updateFireflies(group: THREE.Group, time: number): void {
  const children = group.children;
  if (children.length < 2) return;

  const mainPoints = children[0] as THREE.Points;
  const trailPoints = children[1] as THREE.Points;
  const mainPos = mainPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const trailPos = trailPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const trailPreviousPos = group.userData.positions as Float32Array;
  const blinkPhases = group.userData.blinkPhases as Float32Array;
  const lissajouFreq = group.userData.lissajouFrequencies as Float32Array;

  for (let i = 0; i < mainPos.count; i++) {
    // Lissajous (figure-8) movement
    const freqX = lissajouFreq[i * 2];
    const freqZ = lissajouFreq[i * 2 + 1];
    const centerX = (Math.random() - 0.5) * 30;
    const centerZ = (Math.random() - 0.5) * 30;
    const amplitude = 3;

    const x = centerX + Math.sin(time * freqX + i) * amplitude;
    const z = centerZ + Math.cos(time * freqZ + i * 0.7) * amplitude;
    const y = 1.5 + Math.sin(time * 0.5 + i * 0.3) * 0.8;

    mainPos.setXYZ(i, x, y, z);

    // Store previous for trail
    trailPreviousPos[i * 3] = mainPos.getX(i);
    trailPreviousPos[i * 3 + 1] = mainPos.getY(i);
    trailPreviousPos[i * 3 + 2] = mainPos.getZ(i);

    // Trail is slightly behind and slightly lower
    const trailOffset = 0.15;
    trailPos.setXYZ(
      i,
      x - Math.sin(time * freqX + i) * trailOffset,
      y - 0.1,
      z - Math.cos(time * freqZ + i * 0.7) * trailOffset,
    );

    // Per-particle blink timing
    const blinkIntensity = 0.5 + Math.sin(time * 3 + blinkPhases[i]) * 0.4;
    mainPoints.material = mainPoints.material as THREE.PointsMaterial;
    (mainPoints.material as THREE.PointsMaterial).opacity = blinkIntensity;
  }

  mainPos.needsUpdate = true;
  trailPos.needsUpdate = true;
}

// ────────────────────────────────────────────────────────────────────────────
// MAGIC BURST (Multi-layer with sparkles and spiral motion)
// ────────────────────────────────────────────────────────────────────────────

export function createMagicBurst(
  position: THREE.Vector3,
  house: string | null,
  count = 120,
): THREE.Group {
  const group = new THREE.Group();
  group.userData.type = 'magicBurst';

  const colors = HOUSE_COLORS[house ?? 'ignis'] ?? HOUSE_COLORS.ignis;

  // Main burst layer
  const mainGeo = new THREE.BufferGeometry();
  const mainPositions = new Float32Array(count * 3);
  const mainVelocities = new Float32Array(count * 3);

  // Sparkle layer (smaller, white particles)
  const sparkleCount = Math.floor(count * 0.4);
  const sparkleGeo = new THREE.BufferGeometry();
  const sparklePositions = new Float32Array(sparkleCount * 3);
  const sparkleVelocities = new Float32Array(sparkleCount * 3);

  // Initialize main burst particles
  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    mainPositions[idx] = position.x;
    mainPositions[idx + 1] = position.y + 1;
    mainPositions[idx + 2] = position.z;

    // Spherical velocity with spiral component
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.03 + Math.random() * 0.06;
    const spinSpeed = 0.02 + Math.random() * 0.03;

    mainVelocities[idx] = Math.sin(phi) * Math.cos(theta) * speed;
    mainVelocities[idx + 1] = Math.cos(phi) * speed + 0.03;
    mainVelocities[idx + 2] = Math.sin(phi) * Math.sin(theta) * speed;

    // Store angular velocity for spiral
    if (!mainGeo.userData.angularVelocities) mainGeo.userData.angularVelocities = [];
    mainGeo.userData.angularVelocities[i] = spinSpeed;
  }

  // Initialize sparkle particles
  for (let i = 0; i < sparkleCount; i++) {
    const idx = i * 3;
    sparklePositions[idx] = position.x;
    sparklePositions[idx + 1] = position.y + 1;
    sparklePositions[idx + 2] = position.z;

    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    const speed = 0.04 + Math.random() * 0.08;

    sparkleVelocities[idx] = Math.sin(phi) * Math.cos(theta) * speed;
    sparkleVelocities[idx + 1] = Math.cos(phi) * speed + 0.04;
    sparkleVelocities[idx + 2] = Math.sin(phi) * Math.sin(theta) * speed;
  }

  mainGeo.setAttribute('position', new THREE.BufferAttribute(mainPositions, 3));
  sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));

  // Main burst material
  const mainTexture = createParticleTexture(
    '#' + colors.glow.toString(16).padStart(6, '0'),
    64,
  );
  const mainMat = new THREE.PointsMaterial({
    color: colors.glow,
    size: 0.1,
    transparent: true,
    opacity: 1.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: mainTexture,
    alphaTest: 0.01,
    sizeAttenuation: true,
  });

  const mainPoints = new THREE.Points(mainGeo, mainMat);
  group.add(mainPoints);

  // Sparkle material (bright white)
  const sparkleTexture = createParticleTexture('#FFFFFF', 64);
  const sparkleMat = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.06,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: sparkleTexture,
    alphaTest: 0.01,
    sizeAttenuation: true,
  });

  const sparklePoints = new THREE.Points(sparkleGeo, sparkleMat);
  group.add(sparklePoints);

  // Store physics data
  group.userData.mainVelocities = mainVelocities;
  group.userData.sparkleVelocities = sparkleVelocities;
  group.userData.life = 1.0;
  group.userData.color = colors.glow;
  group.userData.centerPosition = position.clone();

  return group;
}

export function updateMagicBurst(group: THREE.Group, dt: number): boolean {
  const children = group.children;
  if (children.length < 2) return false;

  const mainPoints = children[0] as THREE.Points;
  const sparklePoints = children[1] as THREE.Points;
  const mainPos = mainPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const sparklePos = sparklePoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const mainVel = group.userData.mainVelocities as Float32Array;
  const sparkleVel = group.userData.sparkleVelocities as Float32Array;
  const mainMat = mainPoints.material as THREE.PointsMaterial;
  const sparkleMat = sparklePoints.material as THREE.PointsMaterial;

  group.userData.life -= dt * 0.6;
  if (group.userData.life <= 0) return false;

  // Shrink main particles and update opacity
  const lifeProgress = group.userData.life;
  mainMat.opacity = lifeProgress;
  sparkleMat.opacity = lifeProgress * 0.7;
  mainMat.size = 0.1 * lifeProgress;
  sparkleMat.size = 0.06 * lifeProgress;

  const drag = 0.98;

  // Update main burst particles
  for (let i = 0; i < mainPos.count; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    // Apply velocity with drag
    mainPos.setX(i, mainPos.getX(i) + mainVel[ix] * drag);
    mainPos.setY(i, mainPos.getY(i) + mainVel[iy] * drag);
    mainPos.setZ(i, mainPos.getZ(i) + mainVel[iz] * drag);

    // Gravity
    mainVel[iy] -= 0.0008;

    // Apply drag to velocity
    mainVel[ix] *= drag;
    mainVel[iy] *= drag;
    mainVel[iz] *= drag;
  }

  // Update sparkle particles
  for (let i = 0; i < sparklePos.count; i++) {
    const ix = i * 3;
    const iy = ix + 1;
    const iz = ix + 2;

    sparklePos.setX(i, sparklePos.getX(i) + sparkleVel[ix]);
    sparklePos.setY(i, sparklePos.getY(i) + sparkleVel[iy]);
    sparklePos.setZ(i, sparklePos.getZ(i) + sparkleVel[iz]);

    // Stronger gravity on sparkles
    sparkleVel[iy] -= 0.001;
  }

  mainPos.needsUpdate = true;
  sparklePos.needsUpdate = true;
  return true;
}

// ────────────────────────────────────────────────────────────────────────────
// FRACTURE EFFECT (Vortex, cracks, arcs, column)
// ────────────────────────────────────────────────────────────────────────────

export function createFractureEffect(position: THREE.Vector3, count = 200): THREE.Group {
  const group = new THREE.Group();
  group.userData.type = 'fracture';

  // Main vortex particles (purple-black, swirling inward)
  const mainCount = Math.floor(count * 0.5);
  const mainGeo = new THREE.BufferGeometry();
  const mainPositions = new Float32Array(mainCount * 3);

  for (let i = 0; i < mainCount; i++) {
    const idx = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 3;
    mainPositions[idx] = position.x + Math.cos(angle) * r;
    mainPositions[idx + 1] = position.y + Math.random() * 1.5;
    mainPositions[idx + 2] = position.z + Math.sin(angle) * r;
  }

  mainGeo.setAttribute('position', new THREE.BufferAttribute(mainPositions, 3));

  const mainTexture = createParticleTexture('#8800FF', 64);
  const mainMat = new THREE.PointsMaterial({
    color: 0x8800FF,
    size: 0.08,
    transparent: true,
    opacity: 0.7,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: mainTexture,
    alphaTest: 0.01,
  });

  const mainPoints = new THREE.Points(mainGeo, mainMat);
  group.add(mainPoints);

  // Red crack particles (ground level, spreading outward)
  const crackCount = Math.floor(count * 0.3);
  const crackGeo = new THREE.BufferGeometry();
  const crackPositions = new Float32Array(crackCount * 3);

  for (let i = 0; i < crackCount; i++) {
    const idx = i * 3;
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * 2;
    crackPositions[idx] = position.x + Math.cos(angle) * r;
    crackPositions[idx + 1] = Math.max(0, position.y - 0.3);
    crackPositions[idx + 2] = position.z + Math.sin(angle) * r;
  }

  crackGeo.setAttribute('position', new THREE.BufferAttribute(crackPositions, 3));

  const crackTexture = createParticleTexture('#FF3333', 64);
  const crackMat = new THREE.PointsMaterial({
    color: 0xFF3333,
    size: 0.06,
    transparent: true,
    opacity: 0.6,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: crackTexture,
    alphaTest: 0.01,
  });

  const crackPoints = new THREE.Points(crackGeo, crackMat);
  group.add(crackPoints);

  // Electric arc particles (brief white/bright flashes)
  const arcCount = Math.floor(count * 0.2);
  const arcGeo = new THREE.BufferGeometry();
  const arcPositions = new Float32Array(arcCount * 3);

  for (let i = 0; i < arcCount; i++) {
    const idx = i * 3;
    arcPositions[idx] = position.x + (Math.random() - 0.5) * 2;
    arcPositions[idx + 1] = position.y + Math.random() * 2;
    arcPositions[idx + 2] = position.z + (Math.random() - 0.5) * 2;
  }

  arcGeo.setAttribute('position', new THREE.BufferAttribute(arcPositions, 3));

  const arcTexture = createParticleTexture('#FFFFFF', 64);
  const arcMat = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.04,
    transparent: true,
    opacity: 0.0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    map: arcTexture,
    alphaTest: 0.01,
  });

  const arcPoints = new THREE.Points(arcGeo, arcMat);
  group.add(arcPoints);

  group.userData.center = position.clone();
  group.userData.arcFlashTiming = new Float32Array(arcCount);
  group.userData.pulsePhase = 0;

  // Initialize arc flash timing (random, staggered)
  for (let i = 0; i < arcCount; i++) {
    group.userData.arcFlashTiming[i] = Math.random() * Math.PI * 2;
  }

  return group;
}

export function updateFractureEffect(group: THREE.Group, time: number): void {
  const children = group.children;
  if (children.length < 3) return;

  const mainPoints = children[0] as THREE.Points;
  const crackPoints = children[1] as THREE.Points;
  const arcPoints = children[2] as THREE.Points;

  const mainPos = mainPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const crackPos = crackPoints.geometry.getAttribute('position') as THREE.BufferAttribute;
  const arcPos = arcPoints.geometry.getAttribute('position') as THREE.BufferAttribute;

  const center = group.userData.center as THREE.Vector3;
  const arcFlashTiming = group.userData.arcFlashTiming as Float32Array;
  const mainMat = mainPoints.material as THREE.PointsMaterial;
  const crackMat = crackPoints.material as THREE.PointsMaterial;
  const arcMat = arcPoints.material as THREE.PointsMaterial;

  // Pulsating heartbeat intensity (fast-slow-fast)
  const heartbeat = Math.sin(time * 2) * 0.5 + Math.sin(time * 8) * 0.3;
  mainMat.opacity = Math.max(0.3, 0.6 + heartbeat);
  crackMat.opacity = Math.max(0.3, 0.5 + heartbeat * 0.8);

  // Main vortex: spiral inward
  for (let i = 0; i < mainPos.count; i++) {
    const angle = time * 0.8 + (i / mainPos.count) * Math.PI * 2;
    const spiral = Math.sin(time * 2 + i * 0.1) * 1.5 + 0.5;
    const r = spiral;

    mainPos.setX(i, center.x + Math.cos(angle) * r);
    mainPos.setY(i, center.y + Math.sin(time * 1.5 + i * 0.3) * 0.7);
    mainPos.setZ(i, center.z + Math.sin(angle) * r);
  }

  // Cracks spread outward and stay low
  for (let i = 0; i < crackPos.count; i++) {
    const angle = (i / crackPos.count) * Math.PI * 2 + time * 0.3;
    const spreadRadius = 0.5 + Math.sin(time * 2 + i * 0.2) * 2;

    crackPos.setX(i, center.x + Math.cos(angle) * spreadRadius);
    crackPos.setY(i, Math.max(0, center.y - 0.2));
    crackPos.setZ(i, center.z + Math.sin(angle) * spreadRadius);
  }

  // Electric arc flashes (rapid appearance/disappearance)
  for (let i = 0; i < arcPos.count; i++) {
    const flashPhase = time * 6 + arcFlashTiming[i];
    const flashIntensity = Math.max(0, Math.sin(flashPhase) * 0.9 - 0.7);

    arcMat.opacity = flashIntensity;

    // Random jitter in position during flash
    if (flashIntensity > 0.1) {
      arcPos.setX(i, center.x + (Math.random() - 0.5) * 2);
      arcPos.setY(i, center.y + Math.random() * 2);
      arcPos.setZ(i, center.z + (Math.random() - 0.5) * 2);
    }
  }

  mainPos.needsUpdate = true;
  crackPos.needsUpdate = true;
  arcPos.needsUpdate = true;
}

// ────────────────────────────────────────────────────────────────────────────
// TORCH/CANDLE LIGHT FLICKER (Enhanced organic)
// ────────────────────────────────────────────────────────────────────────────

export function flickerLights(scene: THREE.Scene, time: number): void {
  scene.traverse((obj) => {
    if (obj instanceof THREE.PointLight && obj.parent) {
      // Identify torch/candle lights by intensity range
      if (obj.intensity > 0.3 && obj.intensity < 3) {
        const base = obj.userData.baseIntensity ?? obj.intensity;
        obj.userData.baseIntensity = base;

        // Multiple overlapping sine waves with prime frequencies for organic flicker
        const flicker1 = Math.sin(time * 7 + obj.id * 1.3) * base * 0.12;
        const flicker2 = Math.sin(time * 11 + obj.id * 2.7) * base * 0.08;
        const flicker3 = Math.sin(time * 13.7 + obj.id * 3.1) * base * 0.06;

        // Occasional random intensity spikes (flame crackle)
        let crackle = 0;
        const cracklePhase = (time * 3 + obj.id) % 10;
        if (cracklePhase < 0.2) {
          crackle = Math.random() * base * 0.2;
        }

        // Smooth interpolation toward target intensity
        const targetIntensity = base + flicker1 + flicker2 + flicker3 + crackle;
        obj.intensity += (targetIntensity - obj.intensity) * 0.1;

        // Subtle color temperature shift (orange <-> yellow)
        if (obj.color) {
          const colorPhase = Math.sin(time * 2 + obj.id) * 0.15 + 0.85;
          const baseColor = new THREE.Color(obj.userData.baseColor ?? 0xFFAA44);
          const warmColor = new THREE.Color(0xFFDD66);
          obj.color.lerpColors(baseColor, warmColor, colorPhase);
        }
      }
    }
  });
}

// ────────────────────────────────────────────────────────────────────────────
// VOLUMETRIC LIGHT BEAMS (God Rays)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Create a volumetric light beam (god ray) between two points.
 * Renders as a tapered cylinder with additive blending for dramatic window shafts.
 */
export function createLightBeam(
  from: THREE.Vector3,
  to: THREE.Vector3,
  color: number = 0xFFFFFF,
  width: number = 0.5,
): THREE.Mesh {
  // Calculate direction and length
  const direction = new THREE.Vector3().subVectors(to, from);
  const length = direction.length();
  const midpoint = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

  // Create tapered cylinder geometry
  const geometry = new THREE.CylinderGeometry(width, width * 0.1, length, 8, 8);

  // Material with additive blending for god ray effect
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.12,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.userData.type = 'lightBeam';

  // Position at midpoint and align with direction
  mesh.position.copy(midpoint);
  mesh.lookAt(to);
  mesh.rotateX(Math.PI / 2); // Cylinder is vertical by default, align to beam direction

  return mesh;
}
