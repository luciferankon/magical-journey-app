/**
 * LocationBuilder — Procedural 3D environments for each game location.
 * Each builder returns a THREE.Group with all geometry, materials, and local lights.
 *
 * Art direction: Rich, layered lighting with enhanced materials and procedural detail.
 * Think Firewatch color palette meets Harry Potter architecture with dramatic lighting.
 *
 * MAJOR IMPROVEMENTS:
 * - Advanced material system (physical materials, displacement, color variation)
 * - Rich layered lighting (directional, hemisphere, point, spot lights per location)
 * - Enhanced geometry detail (higher poly counts, displacement mapping, varied colors)
 * - Special effects (god rays, glows, particle halos, animated water)
 * - Better shadows (2048x2048 shadow maps, proper bias)
 */
import * as THREE from 'three';
import type { LocationConfig } from './types';

// ── Advanced Material Helpers ────────────────────────────────────────────────

/** Rich stone material with color variation and bump */
function stone(color = 0x4A4A52, colorVariance = true): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.85,
    metalness: 0.02,
    side: THREE.FrontSide,
  });
  // Slightly vary color for visual interest
  if (colorVariance) {
    const c = new THREE.Color(color);
    const h = c.getHSL({ h: 0, s: 0, l: 0 });
    const varied = new THREE.Color().setHSL(h.h, h.s, Math.max(0, h.l + (Math.random() - 0.5) * 0.08));
    mat.color.copy(varied);
  }
  return mat;
}

/** Warm wood material with higher roughness variation */
function wood(color = 0x5C3A1E, rough = 0.8): THREE.MeshStandardMaterial {
  const variation = new THREE.Color(color);
  // Add slight reddish warmth
  variation.lerp(new THREE.Color(0x8B5A3C), 0.2);
  return new THREE.MeshStandardMaterial({
    color: variation,
    roughness: rough + (Math.random() - 0.5) * 0.2,
    metalness: 0.0,
  });
}

/** Metallic material with high shine */
function metal(color = 0x888890): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 0.15,
    metalness: 0.9,
  });
}

/** Physical glass material with transmission */
function glass(color = 0xAABBCC): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color,
    transmission: 0.9,
    thickness: 0.5,
    roughness: 0.05,
    metalness: 0.1,
    opacity: 0.7,
    transparent: true,
  });
}

/** High-intensity glow material with proper emissive */
function glow(color: number, intensity = 2.0): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: intensity,
    roughness: 0.4,
    metalness: 0.0,
    toneMapped: false, // Preserve glow intensity
  });
  return mat;
}

function grass(): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0x2D5A1E,
    roughness: 0.95,
    metalness: 0.0,
  });
}

function carpet(color = 0x4A1A2A): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    roughness: 1.0,
    metalness: 0.0,
  });
}

// ── Reusable prop builders ──────────────────────────────────────────────────

function buildTorch(x: number, y: number, z: number): THREE.Group {
  const g = new THREE.Group();
  // Bracket
  const bracket = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.03, 0.4, 8), metal(0x664433));
  bracket.position.set(0, 0, 0);
  bracket.castShadow = true;
  g.add(bracket);

  // Flame (taller for visibility)
  const flame = new THREE.Mesh(
    new THREE.ConeGeometry(0.08, 0.18, 8),
    glow(0xFF7722, 1.8),
  );
  flame.position.y = 0.25;
  g.add(flame);

  // Glow halo (larger additive mesh for visual spread)
  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 8, 8),
    new THREE.MeshBasicMaterial({
      color: 0xFF6600,
      transparent: true,
      opacity: 0.3,
      blending: THREE.AdditiveBlending,
    }),
  );
  halo.position.y = 0.25;
  g.add(halo);

  // Primary light
  const light = new THREE.PointLight(0xFF8844, 2.0, 12, 2);
  light.position.y = 0.3;
  light.castShadow = false;
  light.decay = 1.5;
  g.add(light);

  g.position.set(x, y, z);
  return g;
}

function buildCandle(x: number, y: number, z: number, intensity = 0.8): THREE.Group {
  const g = new THREE.Group();
  const stick = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.025, 0.18, 8),
    new THREE.MeshStandardMaterial({ color: 0xFFF8DC, roughness: 0.6 }),
  );
  g.add(stick);

  const flame = new THREE.Mesh(new THREE.ConeGeometry(0.02, 0.06, 6), glow(0xFFDD55, 1.5));
  flame.position.y = 0.13;
  g.add(flame);

  const haloSmall = new THREE.Mesh(
    new THREE.SphereGeometry(0.06, 6, 6),
    new THREE.MeshBasicMaterial({
      color: 0xFFCC44,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    }),
  );
  haloSmall.position.y = 0.13;
  g.add(haloSmall);

  const light = new THREE.PointLight(0xFFBB66, intensity * 1.2, 5, 2);
  light.position.y = 0.15;
  light.decay = 1.8;
  g.add(light);

  g.position.set(x, y, z);
  return g;
}

function buildTree(x: number, z: number, scale = 1): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.12 * scale, 0.18 * scale, 1.8 * scale, 8),
    wood(0x2A1810, 0.85),
  );
  trunk.position.y = 0.9 * scale;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  g.add(trunk);

  // Foliage (layered with varied colors for depth)
  const leafColors = [0x1A5A30, 0x2A6A3A, 0x1A4A28];
  for (let i = 0; i < 4; i++) {
    // Use overlapping dodecahedrons/octahedrons for organic shape
    const foliage = new THREE.Mesh(
      new THREE.OctahedronGeometry((0.7 - i * 0.15) * scale, 2),
      new THREE.MeshStandardMaterial({
        color: leafColors[i % 3],
        roughness: 0.9,
        metalness: 0.0,
      }),
    );
    foliage.position.y = (1.6 + i * 0.45) * scale;
    foliage.castShadow = true;
    foliage.receiveShadow = true;
    g.add(foliage);
  }

  g.position.set(x, 0, z);
  return g;
}

function buildBookshelf(x: number, y: number, z: number, rotY = 0): THREE.Group {
  const g = new THREE.Group();
  // Frame
  const frame = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.4, 0.4), wood(0x3A1810, 0.75));
  frame.position.y = 1.2;
  frame.castShadow = true;
  g.add(frame);

  // Shelves with slight sag
  for (let i = 0; i < 6; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.035, 0.38), wood(0x2A1208, 0.8));
    shelf.position.y = 0.3 + i * 0.4;
    shelf.castShadow = true;
    g.add(shelf);
  }

  // Books (more varied colors and sizes)
  const bookColors = [0x8B0000, 0x1A3A6A, 0x2A5A2A, 0x5A3A1A, 0x4A1A4A, 0x6A5A2A, 0xAA7733, 0x333388];
  for (let s = 0; s < 6; s++) {
    const booksOnShelf = 4 + Math.floor(Math.random() * 5);
    let xOff = -0.45;
    for (let b = 0; b < booksOnShelf; b++) {
      const w = 0.04 + Math.random() * 0.1;
      const h = 0.2 + Math.random() * 0.2;
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, 0.22),
        new THREE.MeshStandardMaterial({
          color: bookColors[Math.floor(Math.random() * bookColors.length)],
          roughness: 0.8,
          metalness: 0.02,
        }),
      );
      book.position.set(xOff + w / 2, 0.3 + s * 0.4 + h / 2 + 0.02, 0);
      book.castShadow = true;
      g.add(book);
      xOff += w + 0.025;
      if (xOff > 0.45) break;
    }
  }

  g.position.set(x, y, z);
  g.rotation.y = rotY;
  return g;
}

function buildPillar(x: number, z: number, height = 4): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(0.22, 0.28, height, 12);
  const pillar = new THREE.Mesh(geo, stone(0x5A5A62, true));
  pillar.position.set(x, height / 2, z);
  pillar.castShadow = true;
  pillar.receiveShadow = true;
  return pillar;
}

function buildFountain(x: number, z: number, isDark = false): THREE.Group {
  const g = new THREE.Group();

  // Base
  const baseColor = isDark ? 0x2A2A32 : 0x606068;
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.5, 0.35, 20), stone(baseColor, true));
  base.position.y = 0.175;
  base.castShadow = true;
  g.add(base);

  // Basin
  const basinColor = isDark ? 0x1A1A24 : 0x555560;
  const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 0.9, 0.6, 20), stone(basinColor, true));
  basin.position.y = 0.65;
  basin.castShadow = true;
  g.add(basin);

  // Water (animated or static)
  const waterColor = isDark ? 0x1A1A44 : 0x2244AA;
  const water = new THREE.Mesh(
    new THREE.CylinderGeometry(1.05, 1.05, 0.06, 20),
    new THREE.MeshStandardMaterial({
      color: waterColor,
      roughness: 0.15,
      metalness: 0.4,
      transparent: true,
      opacity: isDark ? 0.4 : 0.7,
    }),
  );
  water.position.y = 0.85;
  water.userData.isWater = true; // For animation
  g.add(water);

  // Center pillar (ornate)
  const centerGeo = new THREE.CylinderGeometry(0.12, 0.2, 1.2, 10);
  const center = new THREE.Mesh(centerGeo, stone(isDark ? 0x2A2A35 : 0x606068, true));
  center.position.y = 1.1;
  center.castShadow = true;
  g.add(center);

  // Top sphere
  const top = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 12, 12),
    stone(isDark ? 0x1A1A28 : 0x707078, true),
  );
  top.position.y = 1.7;
  top.castShadow = true;
  g.add(top);

  // Finials (small spheres on rim)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 8, 8),
      stone(isDark ? 0x2A2A38 : 0x606068, false),
    );
    finial.position.set(Math.cos(angle) * 1.35, 0.35, Math.sin(angle) * 1.35);
    finial.castShadow = true;
    g.add(finial);
  }

  g.position.set(x, 0, z);
  return g;
}

function buildFireplace(): THREE.Group {
  const g = new THREE.Group();

  // Mantle (stone)
  const mantle = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, 0.7), stone(0x2A2A32, true));
  mantle.position.set(0, 1.0, 0);
  mantle.castShadow = true;
  g.add(mantle);

  // Opening (dark)
  const opening = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.4, 0.75),
    new THREE.MeshStandardMaterial({ color: 0x050505, roughness: 1.0 }),
  );
  opening.position.set(0, 0.7, 0.05);
  g.add(opening);

  // Multiple fire glows for realistic fire effect
  const fireGlows = [
    { pos: [0, 0.4, -0.1], scale: 0.25, color: 0xFF4400, intensity: 2.2 },
    { pos: [-0.2, 0.5, -0.15], scale: 0.2, color: 0xFF6633, intensity: 1.8 },
    { pos: [0.2, 0.6, -0.12], scale: 0.22, color: 0xFF5500, intensity: 2.0 },
  ];

  fireGlows.forEach((fg) => {
    const fireGlow = new THREE.Mesh(
      new THREE.SphereGeometry(fg.scale, 8, 8),
      glow(fg.color as number, fg.intensity),
    );
    fireGlow.position.set(fg.pos[0], fg.pos[1], fg.pos[2]);
    g.add(fireGlow);
  });

  // Fire halo
  const fireHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 12, 12),
    new THREE.MeshBasicMaterial({
      color: 0xFF4400,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
    }),
  );
  fireHalo.position.set(0, 0.5, -0.1);
  g.add(fireHalo);

  // Fire lights (multiple point lights for warm glow)
  const fireLight1 = new THREE.PointLight(0xFF6633, 3.0, 14, 2);
  fireLight1.position.set(0, 0.7, 0.3);
  fireLight1.castShadow = true;
  fireLight1.shadow.mapSize.set(512, 512);
  fireLight1.decay = 2.0;
  g.add(fireLight1);

  const fireLight2 = new THREE.PointLight(0xFF8844, 1.5, 8, 2);
  fireLight2.position.set(-0.3, 0.5, -0.2);
  fireLight2.decay = 2.0;
  g.add(fireLight2);

  return g;
}

function buildChair(x: number, z: number, rotY = 0): THREE.Group {
  const g = new THREE.Group();
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.55), wood(0x5A3520, 0.75));
  seat.position.y = 0.45;
  seat.castShadow = true;
  g.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.08), wood(0x5A3520, 0.75));
  back.position.set(0, 0.8, -0.27);
  back.castShadow = true;
  g.add(back);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.45, 6);
  const legMat = wood(0x3A1A0A, 0.85);
  [[-0.22, -0.22], [0.22, -0.22], [-0.22, 0.22], [0.22, 0.22]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lx, 0.225, lz);
    leg.castShadow = true;
    g.add(leg);
  });

  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
}

function buildDesk(x: number, z: number, rotY = 0): THREE.Group {
  const g = new THREE.Group();
  const top = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.08, 0.7), wood(0x4A2A0E, 0.7));
  top.position.y = 0.8;
  top.castShadow = true;
  g.add(top);

  const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.8, 6);
  const legMat = wood(0x3A1A0A, 0.85);
  [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lx, 0.4, lz);
    leg.castShadow = true;
    g.add(leg);
  });

  g.position.set(x, 0, z);
  g.rotation.y = rotY;
  return g;
}

// ── Location Builders ────────────────────────────────────────────────────────

function buildAethermoorGates(): THREE.Group {
  const g = new THREE.Group();

  // Gradient sky dome
  const skyGeo = new THREE.SphereGeometry(80, 32, 32);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `varying vec3 vPos; void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec3 vPos;
      void main() {
        float t = normalize(vPos).y * 0.5 + 0.5;
        vec3 skyColor = mix(vec3(0.4, 0.2, 0.6), vec3(1.0, 0.7, 0.3), t);
        gl_FragColor = vec4(skyColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  sky.castShadow = false;
  g.add(sky);

  // Ground with vertex displacement
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80, 64, 64),
    grass(),
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;

  const posAttr = ground.geometry.getAttribute('position');
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = Math.sin(x * 0.3) * 0.5 + Math.cos(y * 0.2) * 0.4 + Math.sin(x * 0.7 + y * 0.5) * 0.25;
    posAttr.setZ(i, z);
  }
  posAttr.needsUpdate = true;
  ground.geometry.computeVertexNormals();
  g.add(ground);

  // Cobblestone path (individual stones)
  for (let i = 0; i < 20; i++) {
    for (let j = -2; j <= 2; j++) {
      const stone_block = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.08, 0.6),
        stone(Math.random() > 0.5 ? 0x606068 : 0x555560, false),
      );
      stone_block.position.set(j * 0.65, 0.04 + Math.sin(i * 0.5) * 0.02, -2 + i * 0.8);
      stone_block.castShadow = true;
      stone_block.receiveShadow = true;
      g.add(stone_block);
    }
  }

  // Gate pillars (ornate with finials)
  for (const [sx, sz] of [[-2.8, -10], [2.8, -10]]) {
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.45, 0.55, 7, 10),
      stone(0x4A4A55, true),
    );
    pillar.position.set(sx, 3.5, sz);
    pillar.castShadow = true;
    g.add(pillar);

    // Finial
    const finial = new THREE.Mesh(
      new THREE.SphereGeometry(0.25, 12, 12),
      stone(0x555560, false),
    );
    finial.position.set(sx, 7.5, sz);
    finial.castShadow = true;
    g.add(finial);
  }

  // Gate arch
  const archGeo = new THREE.TorusGeometry(3.0, 0.4, 10, 32, Math.PI);
  const arch = new THREE.Mesh(archGeo, stone(0x4A4A55, true));
  arch.position.set(0, 6.5, -10);
  arch.rotation.x = Math.PI / 2;
  arch.castShadow = true;
  g.add(arch);

  // Iron gate bars
  for (let i = -5; i <= 5; i++) {
    const bar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.04, 6.0, 6),
      metal(0x333340),
    );
    bar.position.set(i * 0.55, 3.0, -10);
    bar.castShadow = true;
    g.add(bar);
  }

  // Ornate cross-bars on gate
  for (let i = 0; i < 2; i++) {
    const crossBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 5.5, 6),
      metal(0x444450),
    );
    crossBar.rotation.z = Math.PI / 2;
    crossBar.position.set(0, 2.0 + i * 2.0, -10);
    crossBar.castShadow = true;
    g.add(crossBar);
  }

  // Academy towers with window glows
  const towers = [
    [-9, -22, 13],
    [9, -22, 11],
    [-5, -28, 15],
    [5, -28, 12],
    [0, -32, 18],
  ] as const;

  towers.forEach(([tx, tz, h]) => {
    const tower = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 1.4, h, 10),
      stone(0x3A3A48, true),
    );
    tower.position.set(tx, h / 2, tz);
    tower.castShadow = true;
    g.add(tower);

    // Tower roof
    const roof = new THREE.Mesh(
      new THREE.ConeGeometry(1.7, 3.5, 10),
      new THREE.MeshStandardMaterial({ color: 0x0A1A2A, roughness: 0.75 }),
    );
    roof.position.set(tx, h + 1.75, tz);
    roof.castShadow = true;
    g.add(roof);

    // Multiple window glows
    for (let w = 0; w < 3; w++) {
      const win = new THREE.Mesh(
        new THREE.PlaneGeometry(0.5, 0.7),
        glow(0xFFAA44, 1.5),
      );
      win.position.set(tx + 1.15, h * (0.3 + w * 0.3), tz);
      win.rotation.y = -Math.PI / 2;
      g.add(win);

      const winLight = new THREE.PointLight(0xFFAA44, 1.0, 6);
      winLight.position.copy(win.position);
      winLight.decay = 2.0;
      g.add(winLight);
    }

    // Flying buttresses (diagonal supports)
    const buttress = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, h * 0.6, 0.3),
      stone(0x4A4A55, false),
    );
    buttress.position.set(tx + 1.8, h * 0.4, tz);
    buttress.rotation.z = Math.PI / 6;
    buttress.castShadow = true;
    g.add(buttress);
  });

  // Firefly particles along path
  const flyGeo = new THREE.BufferGeometry();
  const flyPositions: number[] = [];
  for (let i = 0; i < 150; i++) {
    flyPositions.push(
      (Math.random() - 0.5) * 6,
      1.5 + Math.random() * 3,
      -2 + Math.random() * 25,
    );
  }
  flyGeo.setAttribute('position', new THREE.Float32BufferAttribute(flyPositions, 3));
  const flyMat = new THREE.PointsMaterial({
    color: 0x88FFAA,
    size: 0.12,
    transparent: true,
    opacity: 0.6,
  });
  g.add(new THREE.Points(flyGeo, flyMat));

  // Trees with better foliage
  const treePositions = [[-6, -4], [6, -4], [-7, 3], [7, 3], [-8, -15], [8, -15], [-5, 6], [5, 7]];
  treePositions.forEach(([tx, tz]) => {
    g.add(buildTree(tx, tz, 0.9 + Math.random() * 0.6));
  });

  // Platform (train stop)
  const platform = new THREE.Mesh(
    new THREE.BoxGeometry(7, 0.35, 4),
    stone(0x555560, true),
  );
  platform.position.set(0, 0.175, 8);
  platform.castShadow = true;
  g.add(platform);

  // Rich lighting setup
  const sunLight = new THREE.DirectionalLight(0xFFCC99, 1.2);
  sunLight.position.set(-15, 12, 8);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.set(2048, 2048);
  sunLight.shadow.camera.far = 100;
  sunLight.shadow.bias = -0.001;
  g.add(sunLight);

  const hemisphereLight = new THREE.HemisphereLight(0x556699, 0x1A1A2A, 0.7);
  g.add(hemisphereLight);

  const ambientLight = new THREE.AmbientLight(0x4A4A66, 0.35);
  g.add(ambientLight);

  // Sunset glow point light
  const sunsetGlow = new THREE.PointLight(0xFF8844, 1.0, 50);
  sunsetGlow.position.set(-20, 15, 15);
  sunsetGlow.decay = 2.0;
  g.add(sunsetGlow);

  // Atmospheric fog
  const fogMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `void main() { gl_FragColor = vec4(0.2, 0.15, 0.3, 0.1); }`,
  });

  return g;
}

function buildEntranceCourtyard(): THREE.Group {
  const g = new THREE.Group();

  // Ornate cobblestone ground (grid pattern)
  for (let x = -15; x <= 15; x += 1.5) {
    for (let z = -15; z <= 15; z += 1.5) {
      const stone_block = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.1, 1.4),
        stone(
          ((Math.abs(x) + Math.abs(z)) % 3 === 0) ? 0x6A6A72 : 0x4A4A52,
          false,
        ),
      );
      stone_block.position.set(x, 0.05, z);
      stone_block.receiveShadow = true;
      g.add(stone_block);
    }
  }

  // Fountain at center
  g.add(buildFountain(0, 0));

  // Arched colonnades with proper arches
  for (let i = -3; i <= 3; i++) {
    // Left arcade
    g.add(buildPillar(-9, i * 3.5, 4.5));

    // Right arcade
    g.add(buildPillar(9, i * 3.5, 4.5));

    // Arch beams between pillars
    if (i < 3) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.25, 3.2),
        stone(0x505058, true),
      );
      beam.position.set(-9, 4.7, i * 3.5 + 1.75);
      beam.castShadow = true;
      g.add(beam);

      const beam2 = beam.clone();
      beam2.position.x = 9;
      g.add(beam2);

      // Arch (curved)
      const archGeometry = new THREE.TorusGeometry(1.8, 0.2, 8, 16, Math.PI);
      const archLeft = new THREE.Mesh(archGeometry, stone(0x505058, true));
      archLeft.rotation.x = Math.PI / 2;
      archLeft.position.set(-9, 4.8, i * 3.5 + 1.75);
      archLeft.castShadow = true;
      g.add(archLeft);

      const archRight = archLeft.clone();
      archRight.position.x = 9;
      g.add(archRight);
    }
  }

  // Walls behind pillars
  const wallMat = stone(0x2A2A35, true);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 28), wallMat);
  leftWall.position.set(-10.5, 3, 0);
  leftWall.castShadow = true;
  g.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 6, 28), wallMat);
  rightWall.position.set(10.5, 3, 0);
  rightWall.castShadow = true;
  g.add(rightWall);

  // Vines/ivy on walls (green meshes)
  for (let x = -10; x <= 10; x += 2) {
    for (let y = 1; y <= 5; y += 0.8) {
      const ivy = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.15, 0.1),
        new THREE.MeshStandardMaterial({ color: 0x338833, roughness: 0.9 }),
      );
      ivy.position.set(x, y, -10.2);
      ivy.receiveShadow = true;
      g.add(ivy);
    }
  }

  // Hanging lanterns between pillars
  for (let i = -2; i <= 2; i++) {
    const lanternLight = new THREE.PointLight(0xFFCC77, 2.0, 8);
    lanternLight.position.set(0, 4.2, i * 3.5);
    lanternLight.decay = 1.8;
    g.add(lanternLight);

    const lanternMesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      glow(0xFFCC77, 1.5),
    );
    lanternMesh.position.copy(lanternLight.position);
    g.add(lanternMesh);
  }

  // Star-like ambient particles overhead
  const starGeo = new THREE.BufferGeometry();
  const starPositions: number[] = [];
  for (let i = 0; i < 80; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 25,
      6 + Math.random() * 2,
      (Math.random() - 0.5) * 25,
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xFFFFDD,
    size: 0.08,
    transparent: true,
    opacity: 0.6,
  });
  g.add(new THREE.Points(starGeo, starMat));

  // Rich lighting
  const sun = new THREE.DirectionalLight(0xFFDD99, 1.3);
  sun.position.set(8, 12, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.001;
  g.add(sun);

  const hemisphereLight = new THREE.HemisphereLight(0xFFEEDD, 0x2A2A3E, 0.8);
  g.add(hemisphereLight);

  const ambientLight = new THREE.AmbientLight(0xFFDDCC, 0.4);
  g.add(ambientLight);

  return g;
}

function buildGrandHall(): THREE.Group {
  const g = new THREE.Group();

  // Checkered floor (alternating stone colors)
  for (let x = -10; x <= 10; x += 1) {
    for (let z = -20; z <= 20; z += 1) {
      const isLight = (x + z) % 2 === 0;
      const floorTile = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.08, 0.95),
        stone(isLight ? 0x6A6A72 : 0x2A2A35, false),
      );
      floorTile.position.set(x * 0.975, 0.04, z * 0.975);
      floorTile.receiveShadow = true;
      g.add(floorTile);
    }
  }

  // Walls
  const wallMat = stone(0x2A2A35, true);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 9, 42), wallMat);
  leftWall.position.set(-10.5, 4.5, 0);
  leftWall.castShadow = true;
  g.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, 9, 42), wallMat);
  rightWall.position.set(10.5, 4.5, 0);
  rightWall.castShadow = true;
  g.add(rightWall);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(21, 9, 0.5), wallMat);
  backWall.position.set(0, 4.5, -21);
  backWall.castShadow = true;
  g.add(backWall);

  // Barrel vault ceiling (half-cylinder)
  const vaultGeo = new THREE.CylinderGeometry(10.5, 10.5, 42, 16, 1, true);
  const vaultMat = stone(0x1A1A25, true);
  const vault = new THREE.Mesh(vaultGeo, vaultMat);
  vault.rotation.z = Math.PI / 2;
  vault.position.y = 8.5;
  vault.receiveShadow = true;
  g.add(vault);

  // Vaulted ceiling beams
  for (let i = -4; i <= 4; i++) {
    const beam = new THREE.Mesh(
      new THREE.BoxGeometry(21, 0.3, 0.4),
      wood(0x2A1A0A, 0.8),
    );
    beam.position.set(0, 8.0, i * 4.5);
    beam.castShadow = true;
    g.add(beam);
  }

  // Four house tables with enhanced geometry
  const tableColors = [0x8B1A1A, 0x1A4A5E, 0x2D4A1A, 0x2A3A5E];
  for (let i = 0; i < 4; i++) {
    const table = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.12, 15),
      new THREE.MeshStandardMaterial({
        color: tableColors[i],
        roughness: 0.65,
        metalness: 0.05,
      }),
    );
    table.position.set(-7.5 + i * 5, 0.9, -2);
    table.castShadow = true;
    g.add(table);

    // Table legs
    for (const [lx, lz] of [[-1.4, -6.5], [1.4, -6.5], [-1.4, 6.5], [1.4, 6.5]]) {
      const leg = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.9, 6),
        wood(0x3A1A0A, 0.9),
      );
      leg.position.set(-7.5 + i * 5 + lx, 0.45, -2 + lz);
      leg.castShadow = true;
      g.add(leg);
    }

    // Benches
    for (const side of [-1, 1]) {
      const bench = new THREE.Mesh(
        new THREE.BoxGeometry(2.8, 0.08, 0.5),
        wood(0x4A2A10, 0.8),
      );
      bench.position.set(-7.5 + i * 5, 0.5, -2 + side * 2.0);
      bench.castShadow = true;
      g.add(bench);
    }

    // Goblets and plates on table (simple geometry)
    for (let p = 0; p < 3; p++) {
      const goblet = new THREE.Mesh(
        new THREE.ConeGeometry(0.08, 0.12, 6),
        metal(0xDDAA44),
      );
      goblet.position.set(-7.5 + i * 5 - 0.8 + p * 0.8, 1.05, -2);
      goblet.castShadow = true;
      g.add(goblet);
    }
  }

  // Massive chandeliers (rings with candles)
  for (let z = -12; z <= 12; z += 6) {
    const chandelier = new THREE.Group();

    // Ring structure
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.08, 8, 24),
      metal(0xBB8844),
    );
    ring.position.y = 7.5;
    chandelier.add(ring);

    // Candles around the ring
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const candleLight = new THREE.PointLight(0xFFCC77, 2.5, 12);
      candleLight.position.set(
        Math.cos(angle) * 1.2,
        7.3,
        Math.sin(angle) * 1.2,
      );
      candleLight.decay = 1.8;
      chandelier.add(candleLight);

      const candle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 0.15, 6),
        glow(0xFFDD88, 1.3),
      );
      candle.position.copy(candleLight.position);
      candleLight.add(candle);
    }

    chandelier.position.z = z;
    g.add(chandelier);
  }

  // Star ceiling (glowing particles on vault)
  const starGeo = new THREE.BufferGeometry();
  const starPositions: number[] = [];
  for (let i = 0; i < 500; i++) {
    starPositions.push(
      (Math.random() - 0.5) * 20,
      7.5 + Math.random() * 1.2,
      (Math.random() - 0.5) * 40,
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xFFFFDD,
    size: 0.05,
    transparent: true,
    opacity: 0.8,
  });
  g.add(new THREE.Points(starGeo, starMat));

  // Stained glass windows on walls with colored light
  const windowColors = [
    { color: 0xFF4444, pos: -9 as const },
    { color: 0x4444FF, pos: 9 as const },
  ];

  windowColors.forEach((w) => {
    for (let z = -8; z <= 8; z += 5) {
      const window_mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 2.5),
        glass(w.color),
      );
      window_mesh.position.set(w.pos === -9 ? -10.25 : 10.25, 5, z);
      window_mesh.rotation.y = w.pos === -9 ? Math.PI / 2 : -Math.PI / 2;
      g.add(window_mesh);

      const windowLight = new THREE.SpotLight(w.color, 2.0, 20, Math.PI / 6, 0.8, 1.5);
      windowLight.position.set(w.pos === -9 ? -9 : 9, 5, z);
      windowLight.target.position.set(0, 2, z);
      windowLight.castShadow = true;
      g.add(windowLight);
    }
  });

  // Sorting orb at the front
  const orb = new THREE.Mesh(
    new THREE.SphereGeometry(0.4, 20, 20),
    new THREE.MeshPhysicalMaterial({
      color: 0xDDDDFF,
      emissive: 0x8888FF,
      emissiveIntensity: 2.0,
      transmission: 0.8,
      thickness: 0.3,
      roughness: 0.05,
    }),
  );
  orb.position.set(0, 1.5, -18);
  orb.castShadow = true;
  g.add(orb);

  // Orb glow halo
  const orbHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.6, 16, 16),
    new THREE.MeshBasicMaterial({
      color: 0x8888FF,
      transparent: true,
      opacity: 0.2,
      blending: THREE.AdditiveBlending,
    }),
  );
  orbHalo.position.copy(orb.position);
  g.add(orbHalo);

  const orbLight = new THREE.PointLight(0x8888FF, 3.0, 12);
  orbLight.position.set(0, 1.8, -18);
  orbLight.castShadow = true;
  orbLight.decay = 1.5;
  g.add(orbLight);

  const orbSpotlight = new THREE.SpotLight(0x8888FF, 3.0, 20, Math.PI / 4, 0.8, 1.5);
  orbSpotlight.position.set(0, 6, -18);
  orbSpotlight.target.position.copy(orb.position);
  orbSpotlight.castShadow = true;
  g.add(orbSpotlight);

  // Podium for sorting
  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(1.0, 1.2, 0.4, 16),
    stone(0x4A4A55, true),
  );
  podium.position.set(0, 0.2, -18);
  podium.castShadow = true;
  g.add(podium);

  // House banners (planes with colors)
  const houseColors = [
    { color: 0x8B1A1A, pos: [-5, -19] as const },
    { color: 0x1A4A5E, pos: [-5, -17] as const },
    { color: 0x2D4A1A, pos: [5, -19] as const },
    { color: 0x2A3A5E, pos: [5, -17] as const },
  ];

  houseColors.forEach((h) => {
    const banner = new THREE.Mesh(
      new THREE.PlaneGeometry(1.0, 1.5),
      new THREE.MeshStandardMaterial({
        color: h.color,
        roughness: 0.7,
        metalness: 0.05,
      }),
    );
    banner.position.set(h.pos[0], 4, h.pos[1]);
    g.add(banner);
  });

  // Rich multi-layered lighting
  const mainLight = new THREE.DirectionalLight(0xFFEEDD, 1.4);
  mainLight.position.set(0, 10, 10);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(2048, 2048);
  mainLight.shadow.camera.far = 60;
  mainLight.shadow.bias = -0.001;
  g.add(mainLight);

  const hemisphereLight = new THREE.HemisphereLight(0x334455, 0x0A0A14, 0.6);
  g.add(hemisphereLight);

  const ambientLight = new THREE.AmbientLight(0x2A2A44, 0.4);
  g.add(ambientLight);

  return g;
}

function buildCommonRoom(): THREE.Group {
  const g = new THREE.Group();

  // Wood floor
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), wood(0x2A1808, 0.7));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  // Plush carpet with texture variation
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(7, 9), carpet(0x5A2A3A));
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(0, 0.01, 0);
  rug.receiveShadow = true;
  g.add(rug);

  // Walls
  const wallMat = stone(0x2A2A35, true);
  const walls = [
    { geo: new THREE.BoxGeometry(15, 4.5, 0.4), pos: new THREE.Vector3(0, 2.25, -7.5) },
    { geo: new THREE.BoxGeometry(15, 4.5, 0.4), pos: new THREE.Vector3(0, 2.25, 7.5) },
    { geo: new THREE.BoxGeometry(0.4, 4.5, 15), pos: new THREE.Vector3(-7.5, 2.25, 0) },
    { geo: new THREE.BoxGeometry(0.4, 4.5, 15), pos: new THREE.Vector3(7.5, 2.25, 0) },
  ];

  walls.forEach((w) => {
    const wall = new THREE.Mesh(w.geo, wallMat);
    wall.position.copy(w.pos);
    wall.castShadow = true;
    g.add(wall);
  });

  // Ceiling
  const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(15, 15), stone(0x1A1A25, true));
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.5;
  ceiling.receiveShadow = true;
  g.add(ceiling);

  // Fireplace — the centerpiece
  const fireplace = buildFireplace();
  fireplace.position.set(0, 0, -7.0);
  g.add(fireplace);

  // Round armchairs with cushions (using sphere halves)
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const chairX = Math.cos(angle) * 3;
    const chairZ = Math.sin(angle) * 3;

    g.add(buildChair(chairX, chairZ, angle + Math.PI / 2));

    // Cushion
    const cushion = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2),
      carpet(0x6A2A4A),
    );
    cushion.position.set(chairX, 0.5, chairZ);
    cushion.castShadow = true;
    g.add(cushion);
  }

  // Bookshelves on walls
  g.add(buildBookshelf(-7.0, 0, -2, Math.PI / 2));
  g.add(buildBookshelf(-7.0, 0, 2, Math.PI / 2));

  // Window seat
  const windowSeat = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 0.5, 1.0),
    wood(0x4A2A0E, 0.7),
  );
  windowSeat.position.set(6.9, 0.25, 0);
  windowSeat.castShadow = true;
  g.add(windowSeat);

  // Window with blue moonlight
  const windowMesh = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 2.5), glass(0x223366));
  windowMesh.position.set(7.3, 2, 0);
  windowMesh.rotation.y = -Math.PI / 2;
  g.add(windowMesh);

  const windowLight = new THREE.SpotLight(0x4488CC, 2.5, 15, Math.PI / 4, 0.8, 1.5);
  windowLight.position.set(7, 3, 0);
  windowLight.target.position.set(0, 1, 0);
  windowLight.castShadow = true;
  g.add(windowLight);

  // Candelabra on fireplace mantle
  for (let i = -1; i <= 1; i++) {
    g.add(buildCandle(i * 0.5, 1.8, -6.8, 0.8));
  }

  // Rich warm lighting
  const fireLight = new THREE.PointLight(0xFF8844, 2.0, 12);
  fireLight.position.set(0, 1.2, -6.5);
  fireLight.castShadow = true;
  fireLight.decay = 1.8;
  g.add(fireLight);

  const ambientWarm = new THREE.HemisphereLight(0x884422, 0x0A0A0A, 0.7);
  g.add(ambientWarm);

  const rimLight = new THREE.PointLight(0xFF6633, 1.5, 10);
  rimLight.position.set(-5, 3, 5);
  rimLight.decay = 2.0;
  g.add(rimLight);

  return g;
}

function buildCastingHall(): THREE.Group {
  const g = new THREE.Group();

  // Detailed stone floor
  for (let x = -8; x <= 8; x++) {
    for (let z = -10; z <= 10; z++) {
      const floorTile = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.08, 1.9),
        stone((x + z) % 2 === 0 ? 0x5A5A62 : 0x4A4A52, false),
      );
      floorTile.position.set(x * 2, 0.04, z * 2);
      floorTile.receiveShadow = true;
      g.add(floorTile);
    }
  }

  // Scorch marks with glow
  for (let i = 0; i < 12; i++) {
    const scorch = new THREE.Mesh(
      new THREE.CircleGeometry(0.35 + Math.random() * 0.5, 12),
      new THREE.MeshStandardMaterial({
        color: 0x0A0A0A,
        emissive: 0x440000,
        emissiveIntensity: 0.5,
        roughness: 1,
      }),
    );
    scorch.rotation.x = -Math.PI / 2;
    scorch.position.set((Math.random() - 0.5) * 12, 0.01, (Math.random() - 0.5) * 16);
    scorch.receiveShadow = true;
    g.add(scorch);

    // Glow ring around scorch
    const ring = new THREE.Mesh(
      new THREE.RingGeometry(scorch.geometry.parameters.radius, scorch.geometry.parameters.radius + 0.2, 8),
      new THREE.MeshBasicMaterial({
        color: 0xFF3300,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.copy(scorch.position);
    ring.position.y += 0.02;
    g.add(ring);
  }

  // Walls
  const wallMat = stone(0x2A2A35, true);
  const walls = [
    { geo: new THREE.BoxGeometry(17, 7, 0.4), pos: new THREE.Vector3(0, 3.5, -12) },
    { geo: new THREE.BoxGeometry(17, 7, 0.4), pos: new THREE.Vector3(0, 3.5, 12) },
    { geo: new THREE.BoxGeometry(0.4, 7, 24), pos: new THREE.Vector3(-9, 3.5, 0) },
    { geo: new THREE.BoxGeometry(0.4, 7, 24), pos: new THREE.Vector3(9, 3.5, 0) },
  ];

  walls.forEach((w) => {
    const wall = new THREE.Mesh(w.geo, wallMat);
    wall.position.copy(w.pos);
    wall.castShadow = true;
    g.add(wall);
  });

  // Clerestory windows with dramatic god rays
  for (let i = -2; i <= 2; i++) {
    // Window
    const win = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 3.5), glass(0x99BBDD));
    win.position.set(-8.7, 4.5, i * 3.5);
    win.rotation.y = Math.PI / 2;
    g.add(win);

    // Dramatic sunbeam through window
    const beamGeo = new THREE.CylinderGeometry(0.4, 1.2, 6, 8);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFEE,
      transparent: true,
      opacity: 0.08,
      blending: THREE.AdditiveBlending,
    });
    const beam = new THREE.Mesh(beamGeo, beamMat);
    beam.position.set(-5, 1.5, i * 3.5);
    beam.rotation.z = -Math.PI / 5;
    g.add(beam);

    // Light source for sunbeam
    const sunBeamLight = new THREE.SpotLight(0xFFFFCC, 2.5, 20, Math.PI / 8, 0.7, 1.5);
    sunBeamLight.position.set(-8.5, 5.5, i * 3.5);
    sunBeamLight.target.position.set(-4, 0, i * 3.5);
    sunBeamLight.castShadow = true;
    g.add(sunBeamLight);
  }

  // Instructor's podium
  const podium = new THREE.Mesh(
    new THREE.CylinderGeometry(0.6, 0.8, 0.4, 12),
    stone(0x555560, true),
  );
  podium.position.set(0, 0.2, -9.5);
  podium.castShadow = true;
  g.add(podium);

  // Lectern on podium
  const lectern = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 1.2, 0.3),
    wood(0x3A1810, 0.8),
  );
  lectern.position.set(0, 0.8, -9.5);
  lectern.castShadow = true;
  g.add(lectern);

  // Practice dummies (simple humanoid T-poses)
  for (let i = 0; i < 4; i++) {
    const dummyX = -6 + i * 4;
    const dummyZ = 6;

    // Body
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(0.3, 1.0, 0.2),
      wood(0x5A3520, 0.8),
    );
    body.position.set(dummyX, 0.5, dummyZ);
    body.castShadow = true;
    g.add(body);

    // Head
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(0.2, 8, 8),
      wood(0x6A4530, 0.75),
    );
    head.position.set(dummyX, 1.15, dummyZ);
    head.castShadow = true;
    g.add(head);

    // Arms
    for (const side of [-1, 1]) {
      const arm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.7, 6),
        wood(0x5A3520, 0.8),
      );
      arm.position.set(dummyX + side * 0.3, 0.7, dummyZ);
      arm.rotation.z = Math.PI / 2.5;
      arm.castShadow = true;
      g.add(arm);
    }
  }

  // Chalk circle markings (glowing rings)
  for (let i = 0; i < 5; i++) {
    const circleZ = -8 + i * 3;
    const circle = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.08, 8, 32),
      new THREE.MeshStandardMaterial({
        color: 0xCCCCCC,
        emissive: 0x444444,
        emissiveIntensity: 0.3,
        roughness: 0.9,
      }),
    );
    circle.rotation.x = -Math.PI / 2;
    circle.position.set(0, 0.02, circleZ);
    circle.receiveShadow = true;
    g.add(circle);
  }

  // Dramatic overhead lighting
  const mainLight = new THREE.DirectionalLight(0xFFEECC, 1.5);
  mainLight.position.set(-8, 9, 2);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(2048, 2048);
  mainLight.shadow.camera.far = 50;
  mainLight.shadow.bias = -0.001;
  g.add(mainLight);

  const rimLight = new THREE.PointLight(0xFF6644, 1.8, 15);
  rimLight.position.set(6, 4, -8);
  rimLight.decay = 1.8;
  g.add(rimLight);

  const hemisphereLight = new THREE.HemisphereLight(0x556677, 0x1A1A22, 0.5);
  g.add(hemisphereLight);

  return g;
}

function buildRestrictedCorridor(): THREE.Group {
  const g = new THREE.Group();

  // Dark stone floor
  for (let i = 0; i < 20; i++) {
    const tile = new THREE.Mesh(
      new THREE.BoxGeometry(3.8, 0.08, 1.8),
      stone(0x1A1A25, false),
    );
    tile.position.set(0, 0.04, -10 + i * 2);
    tile.receiveShadow = true;
    g.add(tile);
  }

  // Narrow claustrophobic walls
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 4.5, 25),
    stone(0x0A0A15, true),
  );
  leftWall.position.set(-2, 2.25, 0);
  leftWall.castShadow = true;
  g.add(leftWall);

  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 4.5, 25),
    stone(0x0A0A15, true),
  );
  rightWall.position.set(2, 2.25, 0);
  rightWall.castShadow = true;
  g.add(rightWall);

  // Ceiling
  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(4, 25),
    stone(0x050510, true),
  );
  ceiling.rotation.x = Math.PI / 2;
  ceiling.position.y = 4.5;
  ceiling.receiveShadow = true;
  g.add(ceiling);

  // Flickering torches with longer flames
  for (let i = -4; i <= 4; i++) {
    g.add(buildTorch(-1.7, 2.8, i * 2.5));
    g.add(buildTorch(1.7, 2.8, i * 2.5));
  }

  // Cobwebs in corners
  for (let z = -8; z <= 8; z += 3) {
    for (const side of [-1, 1]) {
      const webPoints = [
        new THREE.Vector3(side * 1.8, 3.8, z),
        new THREE.Vector3(side * 1.8, 3.0, z),
        new THREE.Vector3(side * 1.2, 3.8, z),
      ];
      const webGeo = new THREE.BufferGeometry().setFromPoints(webPoints);
      const web = new THREE.Mesh(
        webGeo,
        new THREE.MeshBasicMaterial({
          color: 0xAAAAA8,
          transparent: true,
          opacity: 0.25,
          side: THREE.DoubleSide,
        }),
      );
      g.add(web);

      // Additional web lines
      for (let j = 0; j < 2; j++) {
        const webLine = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints([
            webPoints[j],
            webPoints[2],
          ]),
          new THREE.LineBasicMaterial({
            color: 0xAAAAA8,
            transparent: true,
            opacity: 0.2,
          }),
        );
        g.add(webLine);
      }
    }
  }

  // Forbidden sigils (glowing rune circles)
  for (let z = -6; z <= 6; z += 4) {
    const sigilBase = new THREE.Mesh(
      new THREE.CircleGeometry(1.2, 12),
      new THREE.MeshBasicMaterial({
        color: 0x2A0066,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide,
      }),
    );
    sigilBase.rotation.x = -Math.PI / 2;
    sigilBase.position.set(0, 0.02, z);
    g.add(sigilBase);

    // Sigil glow ring
    const sigilGlow = new THREE.Mesh(
      new THREE.TorusGeometry(1.2, 0.1, 8, 32),
      new THREE.MeshBasicMaterial({
        color: 0xAA00FF,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    sigilGlow.rotation.x = -Math.PI / 2;
    sigilGlow.position.set(0, 0.03, z);
    g.add(sigilGlow);
  }

  // Dripping water effect (particles)
  const dropGeo = new THREE.BufferGeometry();
  const dropPositions: number[] = [];
  for (let i = 0; i < 50; i++) {
    dropPositions.push(
      (Math.random() - 0.5) * 3.5,
      4.2 - Math.random() * 3,
      (Math.random() - 0.5) * 20,
    );
  }
  dropGeo.setAttribute('position', new THREE.Float32BufferAttribute(dropPositions, 3));
  const dropMat = new THREE.PointsMaterial({
    color: 0x4488CC,
    size: 0.05,
    transparent: true,
    opacity: 0.4,
  });
  g.add(new THREE.Points(dropGeo, dropMat));

  // Eerie mixed lighting
  const torchAmbient = new THREE.HemisphereLight(0x664422, 0x001144, 0.4);
  g.add(torchAmbient);

  const eeryGreen = new THREE.PointLight(0x00AA44, 0.8, 8);
  eeryGreen.position.set(0, 2.5, 0);
  eeryGreen.decay = 2.0;
  g.add(eeryGreen);

  const ambientDark = new THREE.AmbientLight(0x0A0A1A, 0.3);
  g.add(ambientDark);

  return g;
}

function buildLibrary(): THREE.Group {
  const g = new THREE.Group();

  // Wooden floor (parquet pattern)
  for (let x = -8; x <= 8; x += 1) {
    for (let z = -6; z <= 6; z += 1) {
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.08, 0.95),
        wood((x + z) % 2 === 0 ? 0x4A2A10 : 0x3A1A08, 0.75),
      );
      plank.position.set(x * 1, 0.04, z * 1);
      plank.receiveShadow = true;
      g.add(plank);
    }
  }

  // Walls
  const wallMat = stone(0x2A2A35, true);
  const walls = [
    { geo: new THREE.BoxGeometry(17, 7, 0.4), pos: new THREE.Vector3(0, 3.5, -7) },
    { geo: new THREE.BoxGeometry(17, 7, 0.4), pos: new THREE.Vector3(0, 3.5, 7) },
    { geo: new THREE.BoxGeometry(0.4, 7, 14), pos: new THREE.Vector3(-9, 3.5, 0) },
    { geo: new THREE.BoxGeometry(0.4, 7, 14), pos: new THREE.Vector3(9, 3.5, 0) },
  ];

  walls.forEach((w) => {
    const wall = new THREE.Mesh(w.geo, wallMat);
    wall.position.copy(w.pos);
    wall.castShadow = true;
    g.add(wall);
  });

  // Towering bookshelves (floor to ceiling)
  const shelfPositions = [
    [-8, 0, -5, Math.PI / 2],
    [-8, 0, 5, Math.PI / 2],
    [8, 0, -5, -Math.PI / 2],
    [8, 0, 5, -Math.PI / 2],
    [-2, 0, -6, 0],
    [0, 0, -6, 0],
    [2, 0, -6, 0],
  ] as const;

  shelfPositions.forEach((pos) => {
    g.add(buildBookshelf(pos[0], pos[1], pos[2], pos[3]));
  });

  // Reading desks with proper setup
  for (const [dx, dz] of [[-3, 0], [3, 0]]) {
    g.add(buildDesk(dx, dz));
    g.add(buildChair(dx, dz + 1, Math.PI));
    g.add(buildCandle(dx + 0.2, 0.8, dz, 0.8));
  }

  // Floating books (with userData marker for animation)
  const floatBookColors = [0x8B0000, 0x1A3A6A, 0x2A5A2A, 0x5A3A1A, 0xAA4433];
  for (let i = 0; i < 5; i++) {
    const book = new THREE.Mesh(
      new THREE.BoxGeometry(0.15, 0.25, 0.03),
      new THREE.MeshStandardMaterial({
        color: floatBookColors[i % floatBookColors.length],
        roughness: 0.8,
        metalness: 0.02,
        emissive: floatBookColors[i % floatBookColors.length],
        emissiveIntensity: 0.3,
      }),
    );
    const angle = (i / 5) * Math.PI * 2;
    book.position.set(Math.cos(angle) * 2, 3.5 + Math.sin(i * 0.7) * 0.5, Math.sin(angle) * 2);
    book.rotation.set(Math.random() * 0.5, Math.random() * Math.PI, Math.random() * 0.3);
    book.userData.floatingBook = true;
    g.add(book);
  }

  // Spiral staircase (visible but not accessible)
  const stairCase = new THREE.Group();
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 * 2;
    const step = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 0.08, 0.3),
      wood(0x3A1A08, 0.8),
    );
    step.position.set(Math.cos(angle) * 0.6, i * 0.25, Math.sin(angle) * 0.6);
    step.rotation.y = angle;
    step.castShadow = true;
    stairCase.add(step);
  }
  stairCase.position.set(7, 0, 4);
  g.add(stairCase);

  // Large stained glass rose window on back wall
  const roseWindow = new THREE.Mesh(
    new THREE.CircleGeometry(2.0, 12),
    glass(0xFF6655),
  );
  roseWindow.position.set(0, 4.5, 6.8);
  g.add(roseWindow);

  const roseLight = new THREE.SpotLight(0xFF6655, 3.0, 20, Math.PI / 3, 0.8, 1.5);
  roseLight.position.set(0, 5, 8);
  roseLight.target.position.set(0, 2, 0);
  roseLight.castShadow = true;
  g.add(roseLight);

  // Globe on stand
  const globeStand = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.2, 1.0, 8),
    wood(0x3A1A08, 0.8),
  );
  globeStand.position.set(-4, 0.5, 4);
  globeStand.castShadow = true;
  g.add(globeStand);

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.3, 16, 16),
    new THREE.MeshStandardMaterial({
      color: 0x4488CC,
      roughness: 0.3,
      metalness: 0.1,
    }),
  );
  globe.position.set(-4, 1.6, 4);
  globe.castShadow = true;
  g.add(globe);

  // Warm scholarly lighting
  const readingLights = [
    [-3, 1.2, 0],
    [3, 1.2, 0],
  ];

  readingLights.forEach((pos) => {
    const light = new THREE.PointLight(0xFFDD99, 2.0, 8);
    light.position.set(pos[0], pos[1], pos[2]);
    light.decay = 1.8;
    light.castShadow = true;
    g.add(light);
  });

  const mainLight = new THREE.DirectionalLight(0xFFEECC, 1.1);
  mainLight.position.set(0, 8, 5);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(2048, 2048);
  mainLight.shadow.bias = -0.001;
  g.add(mainLight);

  const ambientWarm = new THREE.HemisphereLight(0x775533, 0x1A1A22, 0.5);
  g.add(ambientWarm);

  return g;
}

function buildAldricOffice(): THREE.Group {
  const g = new THREE.Group();

  // Wooden floor
  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(9, 9),
    wood(0x3A1A08, 0.75),
  );
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  g.add(floor);

  // Walls
  const wallMat = stone(0x2A2A35, true);
  const walls = [
    { geo: new THREE.BoxGeometry(9, 4, 0.4), pos: new THREE.Vector3(0, 2, -4.5) },
    { geo: new THREE.BoxGeometry(9, 4, 0.4), pos: new THREE.Vector3(0, 2, 4.5) },
    { geo: new THREE.BoxGeometry(0.4, 4, 9), pos: new THREE.Vector3(-4.5, 2, 0) },
    { geo: new THREE.BoxGeometry(0.4, 4, 9), pos: new THREE.Vector3(4.5, 2, 0) },
  ];

  walls.forEach((w) => {
    const wall = new THREE.Mesh(w.geo, wallMat);
    wall.position.copy(w.pos);
    wall.castShadow = true;
    g.add(wall);
  });

  // Heavy oak desk
  g.add(buildDesk(0, -2));

  // Chairs
  g.add(buildChair(0, -3.2));
  g.add(buildChair(0, 0.5, Math.PI));

  // Bookshelves
  g.add(buildBookshelf(-4.0, 0, -1, Math.PI / 2));
  g.add(buildBookshelf(4.0, 0, -1, -Math.PI / 2));

  // Fireplace (scaled down)
  const fireplace = buildFireplace();
  fireplace.position.set(0, 0, 4.0);
  fireplace.rotation.y = Math.PI;
  fireplace.scale.setScalar(0.8);
  g.add(fireplace);

  // Spinning brass orrery (THE centerpiece)
  const orreryGroup = new THREE.Group();
  orreryGroup.userData.isOrrery = true;

  // Central sphere
  const center = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 12, 12),
    metal(0xDDAA55),
  );
  orreryGroup.add(center);

  // Three orbiting rings with planets
  const ringColors = [0x4488FF, 0xFF8844, 0x88FF44];
  for (let i = 0; i < 3; i++) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.18 + i * 0.12, 0.015, 6, 24),
      metal(0xCC9933),
    );
    ring.rotation.x = Math.PI / 2.5 + i * 0.5;
    ring.rotation.y = i * 0.8;
    orreryGroup.add(ring);

    // Planet on ring
    const planet = new THREE.Mesh(
      new THREE.SphereGeometry(0.04, 8, 8),
      glow(ringColors[i], 1.5),
    );
    planet.position.set(0.18 + i * 0.12, 0, 0);
    ring.add(planet);

    // Planet glow
    const planetGlow = new THREE.Mesh(
      new THREE.SphereGeometry(0.065, 8, 8),
      new THREE.MeshBasicMaterial({
        color: ringColors[i],
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending,
      }),
    );
    planetGlow.position.copy(planet.position);
    ring.add(planetGlow);
  }

  const orbLightInner = new THREE.PointLight(0xDDAA55, 1.5, 4);
  orbLightInner.position.set(0, 0, 0);
  orreryGroup.add(orbLightInner);

  orreryGroup.position.set(0, 2.7, -2);
  g.add(orreryGroup);

  // Specimen jars with colored glows (on shelves)
  const jarColors = [
    { color: 0x44FF88, label: 'Life' },
    { color: 0xFF44AA, label: 'Death' },
    { color: 0x44AAFF, label: 'Magic' },
  ];

  jarColors.forEach((j, idx) => {
    const jar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.08, 0.2, 10),
      new THREE.MeshPhysicalMaterial({
        color: j.color,
        emissive: j.color,
        emissiveIntensity: 1.5,
        transmission: 0.8,
        thickness: 0.2,
        roughness: 0.1,
      }),
    );
    jar.position.set(-4.2 + idx * 0.35, 1.85, -1);
    jar.castShadow = true;
    g.add(jar);

    const jarLight = new THREE.PointLight(j.color, 1.2, 6);
    jarLight.position.copy(jar.position);
    jarLight.decay = 2.0;
    g.add(jarLight);
  });

  // Arcane charts on walls (emissive planes)
  for (const side of [-1, 1]) {
    const chart = new THREE.Mesh(
      new THREE.PlaneGeometry(1.5, 2),
      new THREE.MeshBasicMaterial({
        color: 0x4488FF,
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    );
    chart.position.set(side * 4.2, 2.5, -1);
    chart.rotation.y = side === -1 ? -Math.PI / 2 : Math.PI / 2;
    g.add(chart);
  }

  // Telescope at window (skylight)
  const telescopeTube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8),
    metal(0x666677),
  );
  telescopeTube.rotation.z = Math.PI / 3;
  telescopeTube.position.set(3.5, 2.5, -4.2);
  telescopeTube.castShadow = true;
  g.add(telescopeTube);

  const telescopeEye = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 8, 8),
    metal(0x777788),
  );
  telescopeEye.position.set(3.8, 2, -4.5);
  telescopeEye.castShadow = true;
  g.add(telescopeEye);

  // Candle on desk
  g.add(buildCandle(0.5, 0.8, -2, 1.0));

  // Moody mixed warm/cool lighting
  const warmLight = new THREE.PointLight(0xFF9966, 2.0, 10);
  warmLight.position.set(-2, 2.5, -2);
  warmLight.castShadow = true;
  warmLight.decay = 1.8;
  g.add(warmLight);

  const coolLight = new THREE.PointLight(0x6688FF, 1.5, 10);
  coolLight.position.set(2, 2.5, 2);
  coolLight.decay = 1.8;
  g.add(coolLight);

  const ambientMoody = new THREE.HemisphereLight(0x664488, 0x1A1A22, 0.4);
  g.add(ambientMoody);

  return g;
}

function buildCourtyardNight(): THREE.Group {
  const g = new THREE.Group();

  // Dark starry sky dome
  const skyGeo = new THREE.SphereGeometry(100, 32, 32);
  const skyMat = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: `varying vec3 vPos; void main() { vPos = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      varying vec3 vPos;
      void main() {
        float t = normalize(vPos).y * 0.5 + 0.5;
        vec3 skyColor = mix(vec3(0.05, 0.02, 0.15), vec3(0.1, 0.05, 0.25), t);
        gl_FragColor = vec4(skyColor, 1.0);
      }
    `,
    side: THREE.BackSide,
  });
  const sky = new THREE.Mesh(skyGeo, skyMat);
  g.add(sky);

  // Stars
  const starGeo = new THREE.BufferGeometry();
  const starPositions: number[] = [];
  for (let i = 0; i < 300; i++) {
    const radius = 80;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    starPositions.push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta),
    );
  }
  starGeo.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const starMat = new THREE.PointsMaterial({
    color: 0xFFFFFF,
    size: 0.3,
    transparent: true,
    opacity: 0.8,
  });
  g.add(new THREE.Points(starGeo, starMat));

  // Dark cobblestone ground
  for (let x = -15; x <= 15; x += 1.5) {
    for (let z = -15; z <= 15; z += 1.5) {
      const stone_block = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.1, 1.4),
        stone(0x1A1A25, false),
      );
      stone_block.position.set(x, 0.05, z);
      stone_block.receiveShadow = true;
      g.add(stone_block);
    }
  }

  // Fountain (dark and corrupted)
  g.add(buildFountain(0, 0, true));

  // Fracture corruption visual (purple veins of light)
  for (let i = 0; i < 12; i++) {
    const veins = new THREE.LineSegments(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.random() * 3 - 1.5, 0.1, Math.random() * 3 - 1.5),
      ]),
      new THREE.LineBasicMaterial({
        color: 0xAA00FF,
        transparent: true,
        opacity: 0.5,
        linewidth: 2,
      }),
    );
    veins.position.set(Math.random() * 3 - 1.5, 0, Math.random() * 3 - 1.5);
    g.add(veins);
  }

  // Dark patches (corruption)
  for (let i = 0; i < 8; i++) {
    const patch = new THREE.Mesh(
      new THREE.CircleGeometry(0.5 + Math.random() * 0.8, 10),
      new THREE.MeshStandardMaterial({
        color: 0x0A0008,
        emissive: 0x330033,
        emissiveIntensity: 0.6,
        roughness: 1,
      }),
    );
    patch.rotation.x = -Math.PI / 2;
    patch.position.set((Math.random() - 0.5) * 5, 0.02, (Math.random() - 0.5) * 5);
    g.add(patch);
  }

  // Pillars
  for (let i = -3; i <= 3; i++) {
    g.add(buildPillar(-9, i * 3.5, 4.5));
    g.add(buildPillar(9, i * 3.5, 4.5));
  }

  // Walls
  const wallMat = stone(0x0A0A15, true);
  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 28), wallMat);
  leftWall.position.set(-10.5, 2.75, 0);
  leftWall.castShadow = true;
  g.add(leftWall);

  const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.4, 5.5, 28), wallMat);
  rightWall.position.set(10.5, 2.75, 0);
  rightWall.castShadow = true;
  g.add(rightWall);

  // Elevated balcony (where Lira stands during crisis)
  const balcony = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.2, 2.0),
    stone(0x1A1A28, true),
  );
  balcony.position.set(9, 8.2, 4);
  balcony.castShadow = true;
  g.add(balcony);

  const balconyRail = new THREE.Mesh(
    new THREE.BoxGeometry(3.5, 0.8, 0.1),
    metal(0x333340),
  );
  balconyRail.position.set(9, 8.8, 4.95);
  balconyRail.castShadow = true;
  g.add(balconyRail);

  // East wing wall (behind balcony)
  const eastWing = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 14, 10),
    stone(0x0A0A18, true),
  );
  eastWing.position.set(10.5, 7, 4);
  eastWing.castShadow = true;
  g.add(eastWing);

  // Crisis lighting — dramatic purple and red
  const moonLight = new THREE.DirectionalLight(0x5566BB, 0.4);
  moonLight.position.set(8, 15, 10);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.far = 80;
  moonLight.shadow.bias = -0.001;
  g.add(moonLight);

  // Purple fracture light
  const fractureLight = new THREE.PointLight(0xAA00FF, 2.5, 15);
  fractureLight.position.set(0, 1.0, 0);
  fractureLight.decay = 1.8;
  g.add(fractureLight);

  // Red emergency underglow
  const emergencyLight = new THREE.PointLight(0xFF2200, 1.5, 12);
  emergencyLight.position.set(0, 0.5, -5);
  emergencyLight.decay = 2.0;
  g.add(emergencyLight);

  const ambientDark = new THREE.AmbientLight(0x0A0A20, 0.25);
  g.add(ambientDark);

  const hemisphereLight = new THREE.HemisphereLight(0x1A1A44, 0x0A0A0A, 0.3);
  g.add(hemisphereLight);

  return g;
}

// ── Location Registry ────────────────────────────────────────────────────────

export const LOCATIONS: Record<string, LocationConfig> = {
  aethermoor_gates: {
    id: 'aethermoor_gates',
    build: buildAethermoorGates,
    fogColor: 0x0A0C18,
    fogNear: 15,
    fogFar: 80,
    ambientColor: 0x334466,
    ambientIntensity: 0.4,
    playerSpawn: new THREE.Vector3(0, 0, 4),
    cameraOffset: new THREE.Vector3(0, 4, 10),
    npcPositions: {},
  },
  entrance_courtyard: {
    id: 'entrance_courtyard',
    build: buildEntranceCourtyard,
    fogColor: 0x1A1510,
    fogNear: 15,
    fogFar: 50,
    ambientColor: 0xFFEECC,
    ambientIntensity: 0.4,
    playerSpawn: new THREE.Vector3(0, 0, 5),
    cameraOffset: new THREE.Vector3(0, 3, 8),
    npcPositions: {
      sera: new THREE.Vector3(-2, 0, 2),
      caden: new THREE.Vector3(2, 0, 2),
    },
  },
  grand_hall: {
    id: 'grand_hall',
    build: buildGrandHall,
    fogColor: 0x0A0A14,
    fogNear: 10,
    fogFar: 50,
    ambientColor: 0x334455,
    ambientIntensity: 0.3,
    playerSpawn: new THREE.Vector3(0, 0, 8),
    cameraOffset: new THREE.Vector3(0, 3, 12),
    npcPositions: {
      sera: new THREE.Vector3(-3, 0, 4),
      caden: new THREE.Vector3(3, 0, 4),
    },
  },
  common_room: {
    id: 'common_room',
    build: buildCommonRoom,
    fogColor: 0x1A1008,
    fogNear: 6,
    fogFar: 20,
    ambientColor: 0x332211,
    ambientIntensity: 0.3,
    playerSpawn: new THREE.Vector3(0, 0, 3),
    cameraOffset: new THREE.Vector3(0, 2.5, 6),
    npcPositions: {
      sera: new THREE.Vector3(5, 0, 0),
      tomas: new THREE.Vector3(-4, 0, -3),
      lira: new THREE.Vector3(0, 0, 5.5),
    },
  },
  casting_hall: {
    id: 'casting_hall',
    build: buildCastingHall,
    fogColor: 0x0A0A12,
    fogNear: 10,
    fogFar: 35,
    ambientColor: 0x445566,
    ambientIntensity: 0.35,
    playerSpawn: new THREE.Vector3(0, 0, 4),
    cameraOffset: new THREE.Vector3(0, 3, 8),
    npcPositions: {
      aldric: new THREE.Vector3(0, 0, -7),
      caden: new THREE.Vector3(3, 0, -4),
    },
  },
  restricted_corridor: {
    id: 'restricted_corridor',
    build: buildRestrictedCorridor,
    fogColor: 0x0A0A15,
    fogNear: 4,
    fogFar: 18,
    ambientColor: 0x111122,
    ambientIntensity: 0.2,
    playerSpawn: new THREE.Vector3(0, 0, 5),
    cameraOffset: new THREE.Vector3(0, 2, 8),
    npcPositions: {
      lira: new THREE.Vector3(0, 0, -6),
      tomas: new THREE.Vector3(-0.8, 0, 4),
      caden: new THREE.Vector3(0, 0, 7),
    },
  },
  library: {
    id: 'library',
    build: buildLibrary,
    fogColor: 0x1A1008,
    fogNear: 6,
    fogFar: 22,
    ambientColor: 0x443322,
    ambientIntensity: 0.3,
    playerSpawn: new THREE.Vector3(0, 0, 3),
    cameraOffset: new THREE.Vector3(0, 2.5, 6),
    npcPositions: {
      tomas: new THREE.Vector3(2, 0, 0),
    },
  },
  aldric_office: {
    id: 'aldric_office',
    build: buildAldricOffice,
    fogColor: 0x1A1008,
    fogNear: 5,
    fogFar: 15,
    ambientColor: 0x332211,
    ambientIntensity: 0.3,
    playerSpawn: new THREE.Vector3(0, 0, 1.5),
    cameraOffset: new THREE.Vector3(0, 2, 4),
    npcPositions: {
      aldric: new THREE.Vector3(0, 0, -2.5),
    },
  },
  courtyard_night: {
    id: 'courtyard_night',
    build: buildCourtyardNight,
    fogColor: 0x050510,
    fogNear: 10,
    fogFar: 50,
    ambientColor: 0x0A0A1A,
    ambientIntensity: 0.2,
    playerSpawn: new THREE.Vector3(-3, 0, 5),
    cameraOffset: new THREE.Vector3(0, 3.5, 10),
    npcPositions: {
      sera: new THREE.Vector3(-4, 0, -3),
      caden: new THREE.Vector3(-5, 0, 2),
      tomas: new THREE.Vector3(4, 0, 3),
      lira: new THREE.Vector3(7, 8.15, 3),
    },
  },
};
