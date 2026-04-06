/**
 * CharacterBuilder — High-fidelity procedural character models built from Three.js primitives.
 * Each character is a detailed Group of meshes: body, head, limbs, hair, clothing, accessories.
 * Supports wizard hats, wands, glasses, and character-specific styling.
 */
import * as THREE from 'three';
import type { NPCAppearance } from './types';
import { HOUSE_COLORS, NPC_APPEARANCES } from './types';

// ── Material Factories ──────────────────────────────────────────────────────

function matSkin(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.7,
    metalness: 0.05,
    emissive: new THREE.Color(color).lerp(new THREE.Color(0xFFDCC8), 0.1).getHex(),
    emissiveIntensity: 0.05,
  });
}

function matRobe(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.0,
  });
}

function matHair(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.6,
    metalness: 0.15,
  });
}

function matMetal(color: number, emissiveColor: number = 0x000000): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.2,
    metalness: 0.8,
    emissive: emissiveColor,
    emissiveIntensity: 0.0,
  });
}

function matAccent(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.4,
    metalness: 0.3,
    emissive: color,
    emissiveIntensity: 0.5,
  });
}

function matGlowWand(color: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.1,
    metalness: 0.9,
    emissive: color,
    emissiveIntensity: 3.0,
  });
}

// ── Build detailed humanoid character ────────────────────────────────────────

function buildHumanoid(
  skinColor: number,
  hairColor: number,
  robeColor: number,
  accentColor: number,
  height: number,
  npcId?: string,
): THREE.Group {
  const group = new THREE.Group();
  const scale = height / 1.7; // normalize around 1.7m

  // ── Legs (visible below robe) ────────────────────────────────────────────
  // Thigh
  const thighGeo = new THREE.CylinderGeometry(0.055 * scale, 0.05 * scale, 0.35 * scale, 8);
  const thighMat = matSkin(skinColor);
  const leftThigh = new THREE.Mesh(thighGeo, thighMat);
  leftThigh.position.set(-0.06 * scale, 0.25 * scale, 0);
  leftThigh.castShadow = true;
  group.add(leftThigh);

  const rightThigh = new THREE.Mesh(thighGeo, thighMat);
  rightThigh.position.set(0.06 * scale, 0.25 * scale, 0);
  rightThigh.castShadow = true;
  group.add(rightThigh);

  // Knee joints (small spheres)
  const kneeGeo = new THREE.SphereGeometry(0.025 * scale, 6, 6);
  const kneeMat = matSkin(skinColor);
  const leftKnee = new THREE.Mesh(kneeGeo, kneeMat);
  leftKnee.position.set(-0.06 * scale, 0.08 * scale, 0);
  group.add(leftKnee);

  const rightKnee = new THREE.Mesh(kneeGeo, kneeMat);
  rightKnee.position.set(0.06 * scale, 0.08 * scale, 0);
  group.add(rightKnee);

  // Shin/calf
  const shinGeo = new THREE.CylinderGeometry(0.035 * scale, 0.03 * scale, 0.3 * scale, 8);
  const shinMat = matSkin(skinColor);
  const leftShin = new THREE.Mesh(shinGeo, shinMat);
  leftShin.position.set(-0.06 * scale, -0.09 * scale, 0);
  leftShin.castShadow = true;
  group.add(leftShin);

  const rightShin = new THREE.Mesh(shinGeo, shinMat);
  rightShin.position.set(0.06 * scale, -0.09 * scale, 0);
  rightShin.castShadow = true;
  group.add(rightShin);

  // Feet (elongated boxes with slight curve)
  const footGeo = new THREE.BoxGeometry(0.08 * scale, 0.08 * scale, 0.18 * scale);
  const footMat = matMetal(0x1A1A1A);
  const leftFoot = new THREE.Mesh(footGeo, footMat);
  leftFoot.position.set(-0.06 * scale, -0.25 * scale, 0.02 * scale);
  leftFoot.rotation.x = 0.15; // slight upward toe curve
  group.add(leftFoot);

  const rightFoot = new THREE.Mesh(footGeo, footMat);
  rightFoot.position.set(0.06 * scale, -0.25 * scale, 0.02 * scale);
  rightFoot.rotation.x = 0.15;
  group.add(rightFoot);

  // ── Torso (upper chest - wider for shoulders) ────────────────────────────
  const chestGeo = new THREE.CylinderGeometry(0.28 * scale, 0.26 * scale, 0.45 * scale, 12, 8);
  const chestMat = matRobe(robeColor);
  const chest = new THREE.Mesh(chestGeo, chestMat);
  chest.position.y = 1.0 * scale;
  chest.rotation.z = 0.02; // subtle forward lean
  chest.castShadow = true;
  group.add(chest);

  // Lower torso/waist (narrower)
  const waistGeo = new THREE.CylinderGeometry(0.24 * scale, 0.26 * scale, 0.35 * scale, 12, 8);
  const waistMat = matRobe(robeColor);
  const waist = new THREE.Mesh(waistGeo, waistMat);
  waist.position.y = 0.62 * scale;
  waist.castShadow = true;
  group.add(waist);

  // ── Robe Skirt (with cloth-like segments) ─────────────────────────────────
  const robeSkirtGeo = new THREE.CylinderGeometry(0.26 * scale, 0.38 * scale, 0.52 * scale, 16, 6);
  // Add vertex displacement for cloth folds
  const posAttr = robeSkirtGeo.getAttribute('position');
  const posArray = posAttr.array as Float32Array;
  for (let i = 0; i < posArray.length; i += 3) {
    const x = posArray[i];
    const z = posArray[i + 2];
    const angle = Math.atan2(z, x);
    const fold = Math.sin(angle * 3) * 0.015 * scale;
    posArray[i] += Math.cos(angle) * fold;
    posArray[i + 2] += Math.sin(angle) * fold;
  }
  posAttr.needsUpdate = true;
  robeSkirtGeo.computeVertexNormals();

  const robeSkirt = new THREE.Mesh(robeSkirtGeo, chestMat);
  robeSkirt.position.y = 0.16 * scale;
  robeSkirt.castShadow = true;
  group.add(robeSkirt);

  // ── Belt/Sash (accent color torus at waist) ──────────────────────────────
  const beltGeo = new THREE.TorusGeometry(0.27 * scale, 0.02 * scale, 6, 32);
  const beltMat = matAccent(accentColor);
  const belt = new THREE.Mesh(beltGeo, beltMat);
  belt.position.y = 0.62 * scale;
  belt.rotation.x = Math.PI / 2;
  group.add(belt);

  // ── Robe Collar (flared accent-colored cylinder at neck) ──────────────────
  const collarGeo = new THREE.CylinderGeometry(0.14 * scale, 0.18 * scale, 0.08 * scale, 12);
  const collarMat = matAccent(accentColor);
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.position.y = 1.28 * scale;
  group.add(collar);

  // ── Neck ──────────────────────────────────────────────────────────────────
  const neckGeo = new THREE.CylinderGeometry(0.08 * scale, 0.1 * scale, 0.12 * scale, 8);
  const neckMat = matSkin(skinColor);
  const neck = new THREE.Mesh(neckGeo, neckMat);
  neck.position.y = 1.35 * scale;
  group.add(neck);

  // ── Head (elongated sphere for more human look) ──────────────────────────
  const headGeo = new THREE.SphereGeometry(0.15 * scale, 16, 12);
  const headMat = matSkin(skinColor);
  const head = new THREE.Mesh(headGeo, headMat);
  head.scale.y = 1.1; // slight vertical elongation
  head.position.y = 1.48 * scale;
  head.castShadow = true;
  group.add(head);

  // Chin detail (small flattened sphere below head)
  const chinGeo = new THREE.SphereGeometry(0.04 * scale, 8, 6);
  const chin = new THREE.Mesh(chinGeo, headMat);
  chin.scale.set(0.8, 0.5, 1.0);
  chin.position.set(0, 1.3 * scale, 0.08 * scale);
  group.add(chin);

  // ── Eyes (detailed with sclera, iris, pupil) ───────────────────────────────
  const eyeDepth = 0.125 * scale;
  const eyeZ = 0.135 * scale;

  // Left eye
  const leftEyeGroup = new THREE.Group();
  leftEyeGroup.position.set(-0.055 * scale, 1.50 * scale, eyeZ);

  const leftScleraGeo = new THREE.SphereGeometry(0.024 * scale, 8, 8);
  const scleraMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.4, metalness: 0.0 });
  const leftSclera = new THREE.Mesh(leftScleraGeo, scleraMat);
  leftEyeGroup.add(leftSclera);

  const leftIrisGeo = new THREE.SphereGeometry(0.015 * scale, 8, 8);
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x2A5A7A, roughness: 0.3, metalness: 0.1 });
  const leftIris = new THREE.Mesh(leftIrisGeo, irisMat);
  leftIris.position.z = 0.01 * scale;
  leftEyeGroup.add(leftIris);

  const leftPupilGeo = new THREE.SphereGeometry(0.007 * scale, 6, 6);
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000, roughness: 0.2, metalness: 0.2 });
  const leftPupil = new THREE.Mesh(leftPupilGeo, pupilMat);
  leftPupil.position.z = 0.015 * scale;
  leftEyeGroup.add(leftPupil);

  group.add(leftEyeGroup);

  // Right eye (mirror)
  const rightEyeGroup = new THREE.Group();
  rightEyeGroup.position.set(0.055 * scale, 1.50 * scale, eyeZ);

  const rightSclera = new THREE.Mesh(leftScleraGeo, scleraMat);
  rightEyeGroup.add(rightSclera);

  const rightIris = new THREE.Mesh(leftIrisGeo, irisMat);
  rightIris.position.z = 0.01 * scale;
  rightEyeGroup.add(rightIris);

  const rightPupil = new THREE.Mesh(leftPupilGeo, pupilMat);
  rightPupil.position.z = 0.015 * scale;
  rightEyeGroup.add(rightPupil);

  group.add(rightEyeGroup);

  // ── Eyebrows (thin arched boxes) ───────────────────────────────────────────
  const browGeo = new THREE.BoxGeometry(0.05 * scale, 0.008 * scale, 0.015 * scale);
  const browMat = matHair(hairColor);
  const leftBrow = new THREE.Mesh(browGeo, browMat);
  leftBrow.position.set(-0.055 * scale, 1.56 * scale, 0.135 * scale);
  leftBrow.rotation.z = 0.2; // slight arch
  group.add(leftBrow);

  const rightBrow = new THREE.Mesh(browGeo, browMat);
  rightBrow.position.set(0.055 * scale, 1.56 * scale, 0.135 * scale);
  rightBrow.rotation.z = -0.2;
  group.add(rightBrow);

  // ── Nose (subtle protruding sphere) ──────────────────────────────────────
  const noseGeo = new THREE.SphereGeometry(0.012 * scale, 6, 6);
  const nose = new THREE.Mesh(noseGeo, headMat);
  nose.position.set(0, 1.44 * scale, 0.145 * scale);
  group.add(nose);

  // ── Mouth (thin curved line) ────────────────────────────────────────────
  const mouthGeo = new THREE.BoxGeometry(0.035 * scale, 0.005 * scale, 0.01 * scale);
  const mouthMat = new THREE.MeshStandardMaterial({ color: 0x4A3030, roughness: 0.7, metalness: 0.0 });
  const mouth = new THREE.Mesh(mouthGeo, mouthMat);
  mouth.position.set(0, 1.36 * scale, 0.14 * scale);
  mouth.rotation.z = 0.15; // slight curve
  group.add(mouth);

  // ── Hair Styles (character-specific) ───────────────────────────────────────
  if (npcId === 'sera') {
    // Sera: Long hair down the back + fringe
    const longHairGeo = new THREE.SphereGeometry(0.16 * scale, 12, 14);
    const longHair = new THREE.Mesh(longHairGeo, matHair(hairColor));
    longHair.scale.set(1.0, 1.4, 0.9);
    longHair.position.y = 1.42 * scale;
    group.add(longHair);

    // Front fringe pieces
    for (let i = 0; i < 3; i++) {
      const fringeGeo = new THREE.SphereGeometry(0.03 * scale, 6, 6);
      const fringe = new THREE.Mesh(fringeGeo, matHair(hairColor));
      fringe.position.set((i - 1) * 0.04 * scale, 1.54 * scale, 0.125 * scale);
      group.add(fringe);
    }
  } else if (npcId === 'caden') {
    // Caden: Short cropped textured look
    const shortHairGeo = new THREE.IcosahedronGeometry(0.16 * scale, 2);
    const shortHair = new THREE.Mesh(shortHairGeo, matHair(hairColor));
    shortHair.position.y = 1.48 * scale;
    group.add(shortHair);
  } else if (npcId === 'aldric') {
    // Aldric: Receding with beard
    const recedingGeo = new THREE.SphereGeometry(0.14 * scale, 10, 8);
    recedingGeo.scale(1.0, 0.6, 1.0);
    const receding = new THREE.Mesh(recedingGeo, matHair(hairColor));
    receding.position.y = 1.52 * scale;
    group.add(receding);

    // Beard
    const beardGeo = new THREE.SphereGeometry(0.07 * scale, 8, 6);
    beardGeo.scale(1.0, 0.5, 1.0);
    const beard = new THREE.Mesh(beardGeo, matHair(hairColor));
    beard.position.set(0, 1.32 * scale, 0.1 * scale);
    group.add(beard);
  } else if (npcId === 'lira') {
    // Lira: Shoulder-length bob
    const bobGeo = new THREE.SphereGeometry(0.16 * scale, 12, 10);
    bobGeo.scale(1.1, 0.9, 1.0);
    const bob = new THREE.Mesh(bobGeo, matHair(hairColor));
    bob.position.y = 1.44 * scale;
    group.add(bob);
  } else if (npcId === 'tomas') {
    // Tomas: Curly/textured with IcosahedronGeometry
    const curlyGeo = new THREE.IcosahedronGeometry(0.16 * scale, 3);
    const curly = new THREE.Mesh(curlyGeo, matHair(hairColor));
    curly.position.y = 1.48 * scale;
    group.add(curly);
  } else {
    // Default: Medium styled with swept fringe
    const defaultHairGeo = new THREE.SphereGeometry(0.16 * scale, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.65);
    const defaultHair = new THREE.Mesh(defaultHairGeo, matHair(hairColor));
    defaultHair.position.y = 1.48 * scale;
    group.add(defaultHair);

    // Swept side fringe
    const fringeGeo = new THREE.SphereGeometry(0.035 * scale, 6, 6);
    const fringe = new THREE.Mesh(fringeGeo, matHair(hairColor));
    fringe.position.set(0.06 * scale, 1.50 * scale, 0.12 * scale);
    group.add(fringe);
  }

  // ── Arms (TWO segments each - upper and forearm) ──────────────────────────
  // Left upper arm
  const upperArmGeo = new THREE.CylinderGeometry(0.045 * scale, 0.038 * scale, 0.32 * scale, 8);
  const armMat = matRobe(robeColor);
  const leftUpperArm = new THREE.Mesh(upperArmGeo, armMat);
  leftUpperArm.position.set(-0.32 * scale, 1.0 * scale, 0);
  leftUpperArm.rotation.z = 0.3; // angled down
  leftUpperArm.castShadow = true;
  group.add(leftUpperArm);

  // Left forearm
  const forearmGeo = new THREE.CylinderGeometry(0.035 * scale, 0.03 * scale, 0.28 * scale, 8);
  const leftForearm = new THREE.Mesh(forearmGeo, armMat);
  leftForearm.position.set(-0.5 * scale, 0.75 * scale, 0);
  leftForearm.rotation.z = 0.2; // slight bend at elbow
  leftForearm.castShadow = true;
  group.add(leftForearm);

  // Right upper arm
  const rightUpperArm = new THREE.Mesh(upperArmGeo, armMat);
  rightUpperArm.position.set(0.32 * scale, 1.0 * scale, 0);
  rightUpperArm.rotation.z = -0.3;
  rightUpperArm.castShadow = true;
  group.add(rightUpperArm);

  // Right forearm
  const rightForearm = new THREE.Mesh(forearmGeo, armMat);
  rightForearm.position.set(0.5 * scale, 0.75 * scale, 0);
  rightForearm.rotation.z = -0.2;
  rightForearm.castShadow = true;
  group.add(rightForearm);

  // ── Sleeves (wider cylinders flaring at wrists) ────────────────────────────
  const sleeveGeo = new THREE.CylinderGeometry(0.058 * scale, 0.048 * scale, 0.32 * scale, 10);
  const sleeveMat = matRobe(robeColor);
  const leftSleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
  leftSleeve.position.set(-0.32 * scale, 1.0 * scale, 0);
  leftSleeve.rotation.z = 0.3;
  group.add(leftSleeve);

  const rightSleeve = new THREE.Mesh(sleeveGeo, sleeveMat);
  rightSleeve.position.set(0.32 * scale, 1.0 * scale, 0);
  rightSleeve.rotation.z = -0.3;
  group.add(rightSleeve);

  // ── Hands (flattened spheres) ──────────────────────────────────────────────
  const handGeo = new THREE.SphereGeometry(0.045 * scale, 8, 8);
  const handMat = matSkin(skinColor);
  const leftHand = new THREE.Mesh(handGeo, handMat);
  leftHand.scale.y = 0.7;
  leftHand.position.set(-0.54 * scale, 0.6 * scale, 0);
  group.add(leftHand);

  const rightHand = new THREE.Mesh(handGeo, handMat);
  rightHand.scale.y = 0.7;
  rightHand.position.set(0.54 * scale, 0.6 * scale, 0);
  group.add(rightHand);

  // ── Cape/Cloak (draped plane behind character) ─────────────────────────────
  const capeGeo = new THREE.PlaneGeometry(0.35 * scale, 0.8 * scale, 6, 8);
  const capeVertices = capeGeo.getAttribute('position') as THREE.BufferAttribute;
  const positions = capeVertices.array as Float32Array;
  // Add slight wave/wrinkle displacement
  for (let i = 2; i < positions.length; i += 3) {
    const x = positions[i - 2];
    const y = positions[i - 1];
    positions[i] -= Math.sin((x + y) * 5) * 0.01 * scale;
  }
  capeVertices.needsUpdate = true;

  const capeMat = new THREE.MeshStandardMaterial({
    color: robeColor,
    roughness: 0.85,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });
  const cape = new THREE.Mesh(capeGeo, capeMat);
  cape.position.set(0, 0.8 * scale, -0.12 * scale);
  cape.castShadow = true;
  group.add(cape);

  // Store cape reference for animation
  group.userData.cape = cape;

  // ── Wizard Hat (for player and Professor Aldric) ───────────────────────────
  if (npcId === 'aldric' || !npcId) {
    // Cone for hat
    const hatGeo = new THREE.ConeGeometry(0.13 * scale, 0.35 * scale, 12);
    const hatMat = matRobe(robeColor);
    const hat = new THREE.Mesh(hatGeo, hatMat);
    hat.position.y = 1.75 * scale;

    // Bend the tip slightly (rotate top portion)
    const hatPositions = hatGeo.getAttribute('position') as THREE.BufferAttribute;
    const hatPos = hatPositions.array as Float32Array;
    for (let i = 0; i < hatPos.length; i += 3) {
      const y = hatPos[i + 1];
      if (y > 0.15 * scale) {
        hatPos[i] += Math.sin(y * 8) * 0.02 * scale;
      }
    }
    hatPositions.needsUpdate = true;
    hatGeo.computeVertexNormals();

    hat.castShadow = true;
    group.add(hat);

    // Hat brim (large flat disc)
    const brimGeo = new THREE.CylinderGeometry(0.18 * scale, 0.18 * scale, 0.02 * scale, 12);
    const brimMat = matRobe(robeColor);
    const brim = new THREE.Mesh(brimGeo, brimMat);
    brim.position.y = 1.62 * scale;
    group.add(brim);

    // Hat accent band
    const bandGeo = new THREE.TorusGeometry(0.13 * scale, 0.015 * scale, 6, 12);
    const bandMat = matAccent(accentColor);
    const band = new THREE.Mesh(bandGeo, bandMat);
    band.position.y = 1.62 * scale;
    band.rotation.x = Math.PI / 2;
    group.add(band);
  }

  // ── Wand (thin tapered cylinder with glowing tip) ──────────────────────────
  if (npcId === 'aldric' || !npcId) {
    const wandGeo = new THREE.CylinderGeometry(0.008 * scale, 0.005 * scale, 0.4 * scale, 6);
    const wandMat = matMetal(0x8B7355);
    const wand = new THREE.Mesh(wandGeo, wandMat);
    wand.position.set(0.55 * scale, 0.45 * scale, 0.05 * scale);
    wand.rotation.z = -0.3;
    group.add(wand);

    // Glowing sphere at wand tip
    const wandTipGeo = new THREE.SphereGeometry(0.015 * scale, 6, 6);
    const wandTipMat = matGlowWand(accentColor);
    const wandTip = new THREE.Mesh(wandTipGeo, wandTipMat);
    const tipDist = 0.22 * scale;
    wandTip.position.set(
      0.55 * scale + Math.sin(-0.3) * tipDist,
      0.45 * scale + Math.cos(-0.3) * tipDist,
      0.05 * scale,
    );
    group.add(wandTip);

    group.userData.wand = { mesh: wand, tip: wandTip };
  }

  // ── Glasses (for Aldric only) ──────────────────────────────────────────────
  if (npcId === 'aldric') {
    const lensGeo = new THREE.TorusGeometry(0.02 * scale, 0.003 * scale, 6, 16);
    const lensMat = matMetal(0xAAAAAA);

    const leftLens = new THREE.Mesh(lensGeo, lensMat);
    leftLens.position.set(-0.035 * scale, 1.50 * scale, 0.14 * scale);
    leftLens.rotation.y = Math.PI / 2;
    group.add(leftLens);

    const rightLens = new THREE.Mesh(lensGeo, lensMat);
    rightLens.position.set(0.035 * scale, 1.50 * scale, 0.14 * scale);
    rightLens.rotation.y = Math.PI / 2;
    group.add(rightLens);

    // Bridge connecting glasses
    const bridgeGeo = new THREE.CylinderGeometry(0.003 * scale, 0.003 * scale, 0.035 * scale, 4);
    const bridge = new THREE.Mesh(bridgeGeo, lensMat);
    bridge.position.y = 1.50 * scale;
    bridge.position.z = 0.14 * scale;
    bridge.rotation.z = Math.PI / 2;
    group.add(bridge);
  }

  return group;
}

// ── Enhanced NPC name label with better readability ─────────────────────────

function createNameLabel(name: string, color: number, height: number): THREE.Sprite {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, 512, 128);

  // Gradient background pill
  const gradient = ctx.createLinearGradient(0, 0, 0, 128);
  gradient.addColorStop(0, 'rgba(20, 24, 35, 0.85)');
  gradient.addColorStop(1, 'rgba(10, 12, 20, 0.9)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 96, 24);
  ctx.fill();

  // Border with accent color
  ctx.strokeStyle = `#${color.toString(16).padStart(6, '0')}`;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(16, 16, 480, 96, 24);
  ctx.stroke();

  // Text with better font
  ctx.fillStyle = '#F5EFE7';
  ctx.font = 'bold 28px "Segoe UI", Tahoma, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, 256, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.position.y = height + 0.35;
  sprite.scale.set(1.8, 0.45, 1);
  return sprite;
}

// ── Idle animation data ─────────────────────────────────────────────────────

export interface CharacterAnimState {
  group: THREE.Group;
  baseY: number;
  phase: number;
  speed: number;
}

export function animateCharacter(state: CharacterAnimState, time: number): void {
  const t = time * state.speed + state.phase;

  // Breathing bob (main body)
  state.group.position.y = state.baseY + Math.sin(t) * 0.025;

  // Subtle arm sway (arms rotate slightly on z-axis)
  state.group.traverse((child) => {
    if (child.userData && child instanceof THREE.Mesh) {
      const name = child.name || '';
      if (name.includes('LeftUpperArm') || name.includes('LeftForearm')) {
        child.rotation.z = (child.rotation.z || 0) + Math.sin(t * 0.8) * 0.02;
      } else if (name.includes('RightUpperArm') || name.includes('RightForearm')) {
        child.rotation.z = (child.rotation.z || 0) + Math.sin(t * 0.8 + Math.PI) * 0.02;
      }
    }
  });

  // Very slight head bob (independent from body)
  state.group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.geometry instanceof THREE.SphereGeometry) {
      // This is a simplistic check; in production you'd track head separately
      const isHead = child.position.y > 1.4;
      if (isHead && Math.abs(child.position.y - state.group.position.y) > 0.3) {
        child.position.y += Math.sin(t * 1.2) * 0.008;
      }
    }
  });

  // Cape flutter (if cape exists)
  if (state.group.userData.cape) {
    const cape = state.group.userData.cape as THREE.Mesh;
    const capeGeo = cape.geometry as THREE.PlaneGeometry;
    const positions = capeGeo.getAttribute('position') as THREE.BufferAttribute;
    const pos = positions.array as Float32Array;
    for (let i = 2; i < pos.length; i += 3) {
      const x = pos[i - 2];
      const y = pos[i - 1];
      const baseZ = (Math.sin((x + y) * 5) * 0.01) || 0;
      pos[i] = baseZ + Math.sin(t + x * 3) * 0.008;
    }
    positions.needsUpdate = true;
  }

  // Wand glow pulse
  if (state.group.userData.wand) {
    const wandData = state.group.userData.wand as { mesh: THREE.Mesh; tip: THREE.Mesh };
    const tipMat = wandData.tip.material as THREE.MeshStandardMaterial;
    if (tipMat.emissiveIntensity !== undefined) {
      tipMat.emissiveIntensity = 2.5 + Math.sin(t * 2) * 0.8;
    }
  }

  // Subtle body sway
  state.group.rotation.y = Math.sin(t * 0.4) * 0.04;
}

// ── Upgraded interaction glow ring ───────────────────────────────────────────

function createGlowRing(color: number): THREE.Group {
  const ringGroup = new THREE.Group();
  ringGroup.userData.isGlowRing = true;
  ringGroup.rotation.x = -Math.PI / 2;
  ringGroup.position.y = 0.02;
  ringGroup.visible = false;

  // Outer ring (larger, more transparent)
  const outerGeo = new THREE.RingGeometry(0.5, 0.58, 32);
  const outerMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const outerRing = new THREE.Mesh(outerGeo, outerMat);
  ringGroup.add(outerRing);

  // Inner ring (smaller, brighter)
  const innerGeo = new THREE.RingGeometry(0.35, 0.42, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color,
    transparent: true,
    opacity: 0.6,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  });
  const innerRing = new THREE.Mesh(innerGeo, innerMat);
  innerRing.position.y = 0.01;
  ringGroup.add(innerRing);

  ringGroup.userData.outerRing = outerRing;
  ringGroup.userData.innerRing = innerRing;

  return ringGroup;
}

// ── Public API ───────────────────────────────────────────────────────────────

/** Build the player character model based on their house */
export function buildPlayerCharacter(house: string | null): THREE.Group {
  const colors = HOUSE_COLORS[house ?? 'ignis'] ?? HOUSE_COLORS.ignis;
  const group = buildHumanoid(0xD4A574, 0x2A1A00, colors.primary, colors.accent, 1.7);
  group.userData.type = 'player';
  return group;
}

/** Build an NPC character model */
export function buildNPC(npcId: string): THREE.Group {
  const appearance = NPC_APPEARANCES[npcId];
  if (!appearance) {
    // Fallback generic NPC
    const group = buildHumanoid(0xBB9970, 0x333333, 0x222233, 0x666666, 1.7, npcId);
    group.userData.type = 'npc';
    group.userData.npcId = npcId;
    return group;
  }

  const group = buildHumanoid(
    appearance.skinColor,
    appearance.hairColor,
    appearance.robeColor,
    appearance.accentColor,
    appearance.height,
    npcId,
  );

  // Add name label
  const label = createNameLabel(appearance.name, appearance.accentColor, appearance.height);
  group.add(label);

  // Add upgraded interaction glow ring
  const ring = createGlowRing(appearance.accentColor);
  group.add(ring);

  group.userData.type = 'npc';
  group.userData.npcId = npcId;
  group.userData.npcName = appearance.name;

  return group;
}

/** Show/hide the interaction glow ring */
export function setNPCHighlight(npcGroup: THREE.Group, visible: boolean): void {
  npcGroup.traverse((child) => {
    if (child.userData.isGlowRing) {
      child.visible = visible;
    }
  });
}
