/**
 * Engine3D — Main 3D game engine class.
 * Manages the Three.js scene, camera, renderer, player controller,
 * NPCs, particles, and integrates with the story engine.
 *
 * Enhanced with post-processing (bloom), improved tone mapping,
 * and better lighting for visual quality.
 */
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { SCENE_LOCATION_MAP, SCENE_NPCS, HOUSE_COLORS } from './types';
import { LOCATIONS } from './LocationBuilder';
import {
  buildPlayerCharacter,
  buildNPC,
  setNPCHighlight,
  animateCharacter,
  type CharacterAnimState,
} from './CharacterBuilder';
import {
  createAmbientDust,
  updateAmbientDust,
  createFireflies,
  updateFireflies,
  createMagicBurst,
  updateMagicBurst,
  createFractureEffect,
  updateFractureEffect,
  flickerLights,
} from './ParticleSystem';
import {
  initAudio,
  playLocationMusic,
  playFootstep,
  playMagicCast,
  playFractureSound,
  playSceneTransition,
  playChoiceSelect,
  disposeAudio,
} from './AudioEngine';

// ── Types ────────────────────────────────────────────────────────────────────

interface NPCInstance {
  group: THREE.Group;
  anim: CharacterAnimState;
  npcId: string;
}

export interface Engine3DCallbacks {
  onNPCInteract?: (npcId: string) => void;
  onReady?: () => void;
}

// ── Main Engine Class ────────────────────────────────────────────────────────

export class Engine3D {
  // Three.js core
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private clock: THREE.Clock;

  // Post-processing
  private composer: EffectComposer;
  private renderPass: RenderPass;
  private bloomPass: UnrealBloomPass;
  private outputPass: OutputPass;

  // Game objects
  private player: THREE.Group | null = null;
  private playerAnim: CharacterAnimState | null = null;
  private locationGroup: THREE.Group | null = null;
  private npcs: Map<string, NPCInstance> = new Map();

  // Particles (some return Group for multi-layer effects)
  private dustParticles: THREE.Points | null = null;
  private fireflyParticles: THREE.Object3D | null = null;
  private magicBursts: THREE.Object3D[] = [];
  private fractureEffect: THREE.Object3D | null = null;

  // Camera
  private cameraTarget = new THREE.Vector3();
  private cameraOffset = new THREE.Vector3(0, 3, 8);
  private cameraLerpSpeed = 2.0;

  // Controls
  private keys: Set<string> = new Set();
  private mouseX = 0;
  private playerVelocity = new THREE.Vector3();
  private playerRotation = 0;
  private moveSpeed = 4;
  private isControlsEnabled = true;

  // State
  private currentLocationId: string | null = null;
  private currentHouse: string | null = null;
  private animFrameId: number | null = null;
  private disposed = false;
  private lastFootstepTime = 0;

  // Transition
  private transitionFade = 0; // 0 = clear, 1 = black
  private transitionTarget = 0;
  private fadeOverlay: HTMLDivElement | null = null;

  // Callbacks
  private callbacks: Engine3DCallbacks;

  // Raycaster for NPC interaction
  private raycaster = new THREE.Raycaster();
  private interactDistance = 3;
  private nearestNPC: string | null = null;

  // Ambient base lights (always present)
  private baseHemisphereLight: THREE.HemisphereLight;
  private baseFillLight: THREE.DirectionalLight;

  constructor(canvas: HTMLCanvasElement, callbacks: Engine3DCallbacks = {}) {
    this.callbacks = callbacks;

    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(canvas.clientWidth, canvas.clientHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Shadow map size is configured per-light, not on the renderer
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.6;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    // Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog(0x0A0C18, 10, 40);

    // Base hemisphere light (always present, prevents pitch black scenes)
    this.baseHemisphereLight = new THREE.HemisphereLight(0x6688cc, 0x443322, 0.4);
    this.scene.add(this.baseHemisphereLight);

    // Subtle directional fill light
    this.baseFillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    this.baseFillLight.position.set(5, 5, 5);
    this.scene.add(this.baseFillLight);

    // Camera (FOV 50 for more cinematic feel)
    this.camera = new THREE.PerspectiveCamera(
      50,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100,
    );
    this.camera.position.set(0, 3, 8);

    // Clock
    this.clock = new THREE.Clock();

    // Post-processing setup
    this.composer = new EffectComposer(this.renderer);
    this.renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(this.renderPass);

    this.bloomPass = new UnrealBloomPass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      0.4,  // strength
      0.6,  // radius
      0.7   // threshold
    );
    this.composer.addPass(this.bloomPass);

    this.outputPass = new OutputPass();
    this.composer.addPass(this.outputPass);

    // Fade overlay
    this.fadeOverlay = document.createElement('div');
    this.fadeOverlay.style.cssText = `
      position: absolute; inset: 0; background: black;
      pointer-events: none; z-index: 5; opacity: 0;
      transition: opacity 0.6s ease;
    `;
    canvas.parentElement?.appendChild(this.fadeOverlay);

    // Event listeners
    this.onKeyDown = this.onKeyDown.bind(this);
    this.onKeyUp = this.onKeyUp.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onResize = this.onResize.bind(this);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('mousemove', this.onMouseMove);
    window.addEventListener('resize', this.onResize);

    // Init audio
    initAudio();

    // Start loop
    this.animate();

    callbacks.onReady?.();
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  /** Load a scene by its story scene ID */
  async loadScene(sceneId: string, house: string | null): Promise<void> {
    const locationId = SCENE_LOCATION_MAP[sceneId] ?? 'aethermoor_gates';
    this.currentHouse = house;

    // Only rebuild location if it changed
    if (locationId !== this.currentLocationId) {
      await this.transitionToLocation(locationId, house);
    }

    // Place NPCs for this specific scene
    this.placeNPCs(sceneId, locationId);

    // Add scene-specific effects
    this.addSceneEffects(sceneId);
  }

  /** Enable/disable player controls (disable during dialogue) */
  setControlsEnabled(enabled: boolean): void {
    this.isControlsEnabled = enabled;
  }

  /** Trigger a magic cast effect at the player's position */
  triggerMagicCast(): void {
    if (this.player) {
      const burst = createMagicBurst(this.player.position, this.currentHouse);
      this.scene.add(burst);
      this.magicBursts.push(burst);
      playMagicCast(this.currentHouse);
    }
  }

  /** Trigger a choice selection effect */
  triggerChoiceEffect(): void {
    playChoiceSelect();
    if (this.player) {
      const burst = createMagicBurst(
        this.player.position.clone().add(new THREE.Vector3(0, 0.5, 0)),
        this.currentHouse,
        30,
      );
      this.scene.add(burst);
      this.magicBursts.push(burst);
    }
  }

  /** Get the nearest interactable NPC ID (if within range) */
  getNearestNPC(): string | null {
    return this.nearestNPC;
  }

  /** Cleanup everything */
  dispose(): void {
    this.disposed = true;
    if (this.animFrameId != null) cancelAnimationFrame(this.animFrameId);

    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('resize', this.onResize);

    this.fadeOverlay?.remove();
    disposeAudio();

    // Dispose Three.js resources
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material.dispose();
        }
      }
    });

    this.composer.dispose();
    this.renderer.dispose();
  }

  // ── Scene management ───────────────────────────────────────────────────────

  private async transitionToLocation(locationId: string, house: string | null): Promise<void> {
    // Fade to black
    if (this.fadeOverlay) this.fadeOverlay.style.opacity = '1';
    playSceneTransition();
    await this.wait(600);

    // Clear old location
    this.clearLocation();

    // Build new location
    const config = LOCATIONS[locationId];
    if (!config) return;

    this.locationGroup = config.build(house);
    this.scene.add(this.locationGroup);

    // Update fog
    this.scene.fog = new THREE.Fog(config.fogColor, config.fogNear, config.fogFar);
    this.scene.background = new THREE.Color(config.fogColor);

    // Build/move player
    if (!this.player) {
      this.player = buildPlayerCharacter(house);
      this.scene.add(this.player);
    }
    this.player.position.copy(config.playerSpawn);
    this.playerRotation = 0;
    this.player.rotation.y = 0;

    this.playerAnim = {
      group: this.player,
      baseY: config.playerSpawn.y,
      phase: 0,
      speed: 2,
    };

    // Camera
    this.cameraOffset.copy(config.cameraOffset);
    this.camera.position.copy(config.playerSpawn).add(this.cameraOffset);
    this.cameraTarget.copy(config.playerSpawn).add(new THREE.Vector3(0, 1.2, 0));

    // Add ambient particles
    this.addAmbientParticles(locationId);

    // Music
    playLocationMusic(locationId);

    this.currentLocationId = locationId;

    // Fade from black
    await this.wait(200);
    if (this.fadeOverlay) this.fadeOverlay.style.opacity = '0';
  }

  private clearLocation(): void {
    if (this.locationGroup) {
      this.scene.remove(this.locationGroup);
      this.locationGroup = null;
    }
    // Remove NPCs
    this.npcs.forEach((npc) => this.scene.remove(npc.group));
    this.npcs.clear();
    // Remove particles
    if (this.dustParticles) { this.scene.remove(this.dustParticles); this.dustParticles = null; }
    if (this.fireflyParticles) { this.scene.remove(this.fireflyParticles); this.fireflyParticles = null; }
    if (this.fractureEffect) { this.scene.remove(this.fractureEffect); this.fractureEffect = null; }
    this.magicBursts.forEach((b) => this.scene.remove(b));
    this.magicBursts = [];
  }

  private placeNPCs(sceneId: string, locationId: string): void {
    // Remove old NPCs
    this.npcs.forEach((npc) => this.scene.remove(npc.group));
    this.npcs.clear();

    const npcIds = SCENE_NPCS[sceneId] ?? [];
    const config = LOCATIONS[locationId];
    if (!config) return;

    for (const npcId of npcIds) {
      const pos = config.npcPositions[npcId];
      if (!pos) continue;

      const npcGroup = buildNPC(npcId);
      npcGroup.position.copy(pos);

      // Make NPCs face toward center/player
      const dir = new THREE.Vector3().subVectors(
        config.playerSpawn,
        pos,
      );
      if (dir.length() > 0.1) {
        npcGroup.rotation.y = Math.atan2(dir.x, dir.z);
      }

      this.scene.add(npcGroup);
      this.npcs.set(npcId, {
        group: npcGroup,
        anim: {
          group: npcGroup,
          baseY: pos.y,
          phase: Math.random() * Math.PI * 2,
          speed: 1.5 + Math.random() * 0.5,
        },
        npcId,
      });
    }
  }

  private addAmbientParticles(locationId: string): void {
    // Dust motes for interior scenes
    const isInterior = ['common_room', 'casting_hall', 'library', 'aldric_office', 'grand_hall', 'restricted_corridor'].includes(locationId);
    if (isInterior) {
      this.dustParticles = createAmbientDust(60);
      this.scene.add(this.dustParticles);
    }

    // Fireflies for outdoor night
    if (locationId === 'courtyard_night' || locationId === 'aethermoor_gates') {
      this.fireflyParticles = createFireflies(25);
      this.scene.add(this.fireflyParticles);
    }
  }

  private addSceneEffects(sceneId: string): void {
    // Fracture effects for specific scenes
    if (['s06_corridor_incident', 's07_duel_trigger', 's08_chapter_crisis',
         'g04_crisis_courage_gate', 'g05_crisis_tomas_gate'].includes(sceneId)) {
      const config = LOCATIONS[SCENE_LOCATION_MAP[sceneId] ?? ''];
      if (config) {
        // Position Fracture effect at the action point
        const fracturePos = sceneId === 's08_chapter_crisis'
          ? new THREE.Vector3(0, 0, 0) // fountain area
          : new THREE.Vector3(0, 0, -6); // corridor end
        if (this.fractureEffect) this.scene.remove(this.fractureEffect);
        this.fractureEffect = createFractureEffect(fracturePos);
        this.scene.add(this.fractureEffect);
        playFractureSound();
      }
    } else {
      if (this.fractureEffect) {
        this.scene.remove(this.fractureEffect);
        this.fractureEffect = null;
      }
    }
  }

  // ── Animation Loop ─────────────────────────────────────────────────────────

  private animate = (): void => {
    if (this.disposed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    const dt = Math.min(this.clock.getDelta(), 0.05); // cap delta
    const time = this.clock.getElapsedTime();

    // Update player movement
    this.updatePlayerMovement(dt);

    // Update camera
    this.updateCamera(dt);

    // Animate characters
    if (this.playerAnim) animateCharacter(this.playerAnim, time);
    this.npcs.forEach((npc) => animateCharacter(npc.anim, time));

    // Update particles
    if (this.dustParticles) updateAmbientDust(this.dustParticles, time);
    if (this.fireflyParticles) updateFireflies(this.fireflyParticles as THREE.Group, time);
    if (this.fractureEffect) updateFractureEffect(this.fractureEffect as THREE.Group, time);

    // Update magic bursts (remove dead ones)
    this.magicBursts = this.magicBursts.filter((burst) => {
      const alive = updateMagicBurst(burst as THREE.Group, dt);
      if (!alive) this.scene.remove(burst);
      return alive;
    });

    // Flicker torch/candle lights
    flickerLights(this.scene, time);

    // Animate floating books
    this.scene.traverse((obj) => {
      if (obj.userData.floatingBook) {
        obj.position.y += Math.sin(time * 0.5 + obj.id) * 0.002;
        obj.rotation.y += 0.003;
      }
      if (obj.userData.isOrrery) {
        obj.rotation.y += 0.005;
        obj.children.forEach((child, i) => {
          if (child instanceof THREE.Mesh && child.geometry instanceof THREE.TorusGeometry) {
            child.rotation.z += 0.002 * (i + 1);
          }
        });
      }
    });

    // Check NPC proximity
    this.checkNPCProximity();

    // Render with post-processing
    this.composer.render();
  };

  // ── Player Movement ────────────────────────────────────────────────────────

  private updatePlayerMovement(dt: number): void {
    if (!this.player || !this.isControlsEnabled) return;

    const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.playerRotation,
    );
    const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this.playerRotation,
    );

    const moveDir = new THREE.Vector3();
    if (this.keys.has('w') || this.keys.has('arrowup')) moveDir.add(forward);
    if (this.keys.has('s') || this.keys.has('arrowdown')) moveDir.sub(forward);
    if (this.keys.has('a') || this.keys.has('arrowleft')) moveDir.sub(right);
    if (this.keys.has('d') || this.keys.has('arrowright')) moveDir.add(right);

    if (moveDir.length() > 0) {
      moveDir.normalize();
      this.playerVelocity.lerp(moveDir.multiplyScalar(this.moveSpeed), 5 * dt);

      // Face movement direction
      const targetRot = Math.atan2(this.playerVelocity.x, this.playerVelocity.z);
      this.player.rotation.y = THREE.MathUtils.lerp(
        this.player.rotation.y,
        targetRot,
        8 * dt,
      );

      // Footstep sounds
      const now = this.clock.getElapsedTime();
      if (now - this.lastFootstepTime > 0.35) {
        playFootstep();
        this.lastFootstepTime = now;
      }
    } else {
      this.playerVelocity.lerp(new THREE.Vector3(), 8 * dt);
    }

    this.player.position.add(this.playerVelocity.clone().multiplyScalar(dt));
    this.player.position.y = 0; // Keep on ground

    // Mouse rotation
    if (this.mouseX !== 0) {
      this.playerRotation -= this.mouseX * 0.003;
      this.mouseX = 0;
    }
  }

  // ── Camera ─────────────────────────────────────────────────────────────────

  private updateCamera(dt: number): void {
    if (!this.player) return;

    // Target position: behind and above player
    const targetPos = this.player.position.clone().add(
      this.cameraOffset.clone().applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.playerRotation,
      ),
    );

    // Smoothly move camera
    this.camera.position.lerp(targetPos, this.cameraLerpSpeed * dt);

    // Look at player's head area
    this.cameraTarget.lerp(
      this.player.position.clone().add(new THREE.Vector3(0, 1.2, 0)),
      this.cameraLerpSpeed * dt,
    );
    this.camera.lookAt(this.cameraTarget);
  }

  // ── NPC Proximity ──────────────────────────────────────────────────────────

  private checkNPCProximity(): void {
    if (!this.player) return;

    let nearest: string | null = null;
    let nearestDist = this.interactDistance;

    this.npcs.forEach((npc) => {
      const dist = this.player!.position.distanceTo(npc.group.position);
      // Don't check distance for Lira on balcony
      const effectiveDist = npc.group.position.y > 3 ? Infinity : dist;

      if (effectiveDist < nearestDist) {
        nearestDist = effectiveDist;
        nearest = npc.npcId;
      }

      // Highlight nearest
      setNPCHighlight(npc.group, effectiveDist < this.interactDistance);
    });

    this.nearestNPC = nearest;
  }

  // ── Event Handlers ─────────────────────────────────────────────────────────

  private onKeyDown(e: KeyboardEvent): void {
    const key = e.key.toLowerCase();
    this.keys.add(key);

    if (key === 'e' && this.nearestNPC && this.isControlsEnabled) {
      this.callbacks.onNPCInteract?.(this.nearestNPC);
    }
  }

  private onKeyUp(e: KeyboardEvent): void {
    this.keys.delete(e.key.toLowerCase());
  }

  private onMouseMove(e: MouseEvent): void {
    if (document.pointerLockElement) {
      this.mouseX = e.movementX;
    }
  }

  private onResize(): void {
    const parent = this.renderer.domElement.parentElement;
    if (!parent) return;
    const w = parent.clientWidth;
    const h = parent.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
    this.composer.setSize(w, h);
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  private wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
