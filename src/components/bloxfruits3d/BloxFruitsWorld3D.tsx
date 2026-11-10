import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { BloxFruit, BloxSword, BloxAccessory, FruitSkill } from '../../types';
import {
  playSwordSlashSound,
  playDashSound,
  playExplosionSound,
  playHakiSound,
  playStarSound,
  playCriticalHitSound,
  playAttackMissSound,
  playBattleVictorySound,
} from '../../services/soundEffects';

interface BloxFruitsWorld3DProps {
  equippedFruit: BloxFruit;
  equippedSword: BloxSword;
  equippedAccessory: BloxAccessory;
  playerLevel: number;
  playerStats?: { melee: number; defense: number; sword: number; bloxFruit: number };
  hakiActive: boolean;
  playerGender?: 'boy' | 'girl';
  onOpenChestQuiz?: (chestId: string, rewardStars: number) => void;
  openedChestTrigger?: { id: string; time: number } | null;
  onEnemyDefeated: (
    enemyType: 'bandit' | 'baboon' | 'marine' | 'desert' | 'sky' | 'boss',
    isBoss: boolean,
    rewardStars: number,
    rewardExp: number
  ) => void;
  onChestCollected: (starsReward: number) => void;
  onCoinCollected: (starsReward: number) => void;
  onOpenShop: (shopType: 'dealer' | 'blacksmith' | 'accessories' | 'quests' | 'map') => void;
  onOpenStats: () => void;
  onDamageTaken: (amount: number) => void;
  onRequestAttack?: (type: 'sword' | 'melee' | 'skill', skill?: FruitSkill) => void;
  attackTrigger: { type: 'sword' | 'melee' | 'skill'; skill?: FruitSkill; id: number } | null;
  dashTrigger: number;
  hakiToggleTrigger: number;
  teleportTarget: { x: number; z: number; name: string } | null;
  movementInput: { forward: number; strafe: number; jump: boolean; sprint: boolean };
  isPaused?: boolean;
  smoothMode?: boolean;
}

interface Enemy3D {
  mesh: THREE.Group;
  type: 'bandit' | 'baboon' | 'marine' | 'desert' | 'sky' | 'boss';
  hp: number;
  maxHp: number;
  isBoss: boolean;
  name: string;
  speed: number;
  atk: number;
  patrolCenter: THREE.Vector3;
  patrolRadius: number;
  hpBarMesh: THREE.Sprite;
  state: 'idle' | 'chase' | 'attack' | 'casting' | 'dead';
  attackCooldown: number;
  skillCooldown: number;
  maxSkillCooldown: number;
  skillName: string;
  skillCastTimer: number;
  isCasting: boolean;
  telegraphMesh?: THREE.Mesh | null;
  respawnTimer: number;
  originalScale: number;
  takeHitAnim: number;
  leftArm?: THREE.Group;
  rightArm?: THREE.Group;
  leftLeg?: THREE.Group;
  rightLeg?: THREE.Group;
  walkCycleAnim?: number;
}

interface Chest3D {
  mesh: THREE.Group;
  lid: THREE.Mesh;
  opened: boolean;
  rewardStars: number;
  id: string;
  respawnTimer: number;
  beaconBeam: THREE.Mesh;
  quizCooldown: number;
}

interface StarCoin3D {
  mesh: THREE.Group;
  collected: boolean;
  respawnTimer: number;
  originalY: number;
  value: number;
}

interface EnemyProjectile {
  mesh: THREE.Group | THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  damage: number;
  radius: number;
  color: string;
  name: string;
}

interface FloatingText3D {
  sprite: THREE.Sprite;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
}

interface SparkParticle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
}

interface ActiveEffect3D {
  mesh: THREE.Group;
  type: 'sword_slash' | 'skill_z' | 'skill_x' | 'skill_c' | 'skill_v' | 'decal';
  velocity: THREE.Vector3;
  lifetime: number;
  maxLifetime: number;
  damage: number;
  aoeRadius: number;
  color: string;
  effectType: string;
  hasHit: Set<Enemy3D>;
  isPeriodic?: boolean;
  periodicInterval?: number;
  periodicTimer?: number;
  isAoe?: boolean;
  light?: THREE.PointLight;
  onUpdate?: (dt: number, effect: ActiveEffect3D) => void;
  onExpire?: (effect: ActiveEffect3D) => void;
}

let sharedSkillAudioCtx: AudioContext | null = null;
function getSkillAudioCtx(): AudioContext | null {
  try {
    if (!sharedSkillAudioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) sharedSkillAudioCtx = new AudioCtxClass();
    }
    if (sharedSkillAudioCtx && sharedSkillAudioCtx.state === 'suspended') {
      sharedSkillAudioCtx.resume().catch(() => {});
    }
    return sharedSkillAudioCtx;
  } catch {
    return null;
  }
}

const BloxFruitsWorld3DComponent: React.FC<BloxFruitsWorld3DProps> = ({
  equippedFruit,
  equippedSword,
  equippedAccessory,
  playerLevel,
  playerStats,
  hakiActive,
  playerGender = 'boy',
  onOpenChestQuiz,
  openedChestTrigger,
  onEnemyDefeated,
  onChestCollected,
  onCoinCollected,
  onOpenShop,
  onDamageTaken,
  onRequestAttack,
  attackTrigger,
  dashTrigger,
  hakiToggleTrigger,
  teleportTarget,
  movementInput,
  isPaused = false,
  smoothMode = true,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Unconditionally keep latest props in a mutable ref so the 60fps RAF loop always reads fresh data
  const propsRef = useRef({
    equippedFruit,
    equippedSword,
    equippedAccessory,
    playerLevel,
    playerStats,
    hakiActive,
    playerGender,
    onOpenChestQuiz,
    openedChestTrigger,
    attackTrigger,
    dashTrigger,
    hakiToggleTrigger,
    teleportTarget,
    movementInput,
    isPaused,
    smoothMode,
    onEnemyDefeated,
    onChestCollected,
    onCoinCollected,
    onOpenShop,
    onDamageTaken,
    onRequestAttack,
  });

  propsRef.current = {
    equippedFruit,
    equippedSword,
    equippedAccessory,
    playerLevel,
    playerStats,
    hakiActive,
    playerGender,
    onOpenChestQuiz,
    openedChestTrigger,
    attackTrigger,
    dashTrigger,
    hakiToggleTrigger,
    teleportTarget,
    movementInput,
    isPaused,
    smoothMode,
    onEnemyDefeated,
    onChestCollected,
    onCoinCollected,
    onOpenShop,
    onDamageTaken,
    onRequestAttack,
  };

  // Tracking IDs for external one-shot triggers
  const lastAttackId = useRef<number>(0);
  const lastDashId = useRef<number>(0);
  const lastHakiId = useRef<number>(0);
  const lastTeleportName = useRef<string>('');
  const lastOpenedChestTime = useRef<number>(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // =========================================================================
    // 1. THREE.JS SCENE, CAMERA, RENDERER
    // =========================================================================
    const scene = new THREE.Scene();
    const skyColor = '#38bdf8'; // Bright Roblox tropical sky
    scene.background = new THREE.Color(skyColor);
    scene.fog = new THREE.FogExp2(skyColor, 0.0032);

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1500);
    camera.position.set(0, 12, 22);

    const isSmooth = propsRef.current.smoothMode !== false;
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSmooth,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isSmooth ? 1.0 : Math.min(window.devicePixelRatio, 1.25));
    renderer.shadowMap.enabled = !isSmooth;
    if (!isSmooth) {
      renderer.shadowMap.type = THREE.PCFShadowMap;
    }
    container.appendChild(renderer.domElement);

    // =========================================================================
    // 2. LIGHTING SETUP
    // =========================================================================
    const ambientLight = new THREE.AmbientLight('#ffffff', 1.35);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight('#fffbeb', 1.85);
    sunLight.position.set(80, 140, 60);
    sunLight.castShadow = !isSmooth;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 500;
    sunLight.shadow.camera.left = -160;
    sunLight.shadow.camera.right = 160;
    sunLight.shadow.camera.top = 160;
    sunLight.shadow.camera.bottom = -160;
    scene.add(sunLight);

    const seaBounceLight = new THREE.DirectionalLight('#0284c7', 0.45);
    seaBounceLight.position.set(-50, -50, -50);
    scene.add(seaBounceLight);

    // Front-high specular gloss highlight light for ultra-shiny round LEGO minifig heads
    const specularKeyLight = new THREE.DirectionalLight('#ffffff', 1.1);
    specularKeyLight.position.set(-50, 90, 70);
    scene.add(specularKeyLight);

    // Warm rim light for crisp specular edge glints
    const rimGlintLight = new THREE.DirectionalLight('#fed7aa', 0.65);
    rimGlintLight.position.set(70, 70, -60);
    scene.add(rimGlintLight);

    // =========================================================================
    // 3. ARCHIPELAGO ISLANDS & TERRAIN
    // =========================================================================
    // Endless Ocean
    const oceanGeo = new THREE.PlaneGeometry(1600, 1600, 16, 16);
    const oceanMat = new THREE.MeshStandardMaterial({
      color: '#0284c7',
      roughness: 0.15,
      metalness: 0.75,
      transparent: true,
      opacity: 0.88,
    });
    const ocean = new THREE.Mesh(oceanGeo, oceanMat);
    ocean.rotation.x = -Math.PI / 2;
    ocean.position.y = 0.0;
    scene.add(ocean);

    interface SolidZone {
      x: number;
      z: number;
      radius: number;
      topY: number;
    }
    const solidZones: SolidZone[] = [];

    // Helper: Authentic Ultra-Shiny Round LEGO Minifigure Head (Continuous Lathe Geometry)
    const createShinyLegoHeadMesh = (color: string, withStud = true) => {
      const headGroup = new THREE.Group();
      headGroup.position.y = 5.8;

      // Ultra-shiny glossy ABS injection-molded LEGO plastic with liquid clearcoat luster
      const shinyMat = new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.02,
        metalness: 0.02,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        reflectivity: 1.0,
        specularIntensity: 1.0,
        specularColor: new THREE.Color('#ffffff'),
      });

      // Construct smooth continuous cross-section contour of authentic round LEGO Minifigure head
      const points: THREE.Vector2[] = [];

      // 1. Center of bottom neck socket (recessed inside cavity)
      points.push(new THREE.Vector2(0, -0.55));
      // 2. Inner neck socket cylinder wall
      points.push(new THREE.Vector2(0.44, -0.55));
      // 3. Inner lip of bottom neck rim
      points.push(new THREE.Vector2(0.44, -0.72));

      // 4. Smooth rounded bottom chin bevel arc (smooth 7-point curve out to cylindrical face wall)
      for (let i = 6; i >= 0; i--) {
        const angle = (Math.PI / 2) * (i / 6);
        const r = 0.64 + 0.19 * Math.cos(angle);
        const y = -0.55 - 0.17 * Math.sin(angle);
        points.push(new THREE.Vector2(r, y));
      }

      // 5. Cylindrical smooth round main head/face wall
      points.push(new THREE.Vector2(0.83, 0.0));
      points.push(new THREE.Vector2(0.83, 0.55));

      // 6. Smooth rounded top shoulder bevel arc (smooth 7-point curve inward from face to top shoulder)
      for (let i = 0; i <= 6; i++) {
        const angle = (Math.PI / 2) * (i / 6);
        const r = 0.64 + 0.19 * Math.cos(angle);
        const y = 0.55 + 0.17 * Math.sin(angle);
        points.push(new THREE.Vector2(r, y));
      }

      // 7. Top shoulder flat surface
      points.push(new THREE.Vector2(0.38, 0.72));

      if (withStud) {
        // 8. Outer vertical wall of iconic top stud
        points.push(new THREE.Vector2(0.38, 1.05));
        // 9. Top rounded bevel / lip of stud
        points.push(new THREE.Vector2(0.35, 1.07));
        points.push(new THREE.Vector2(0.19, 1.07));
        // 10. Inner hollow recess wall going down into stud
        points.push(new THREE.Vector2(0.18, 1.05));
        points.push(new THREE.Vector2(0.18, 0.85));
        // 11. Center floor of hollow stud
        points.push(new THREE.Vector2(0, 0.85));
      } else {
        // Flat top closed cap when hat or hair sits on top
        points.push(new THREE.Vector2(0, 0.72));
      }

      // Generate continuous 48-segment lathe geometry with smooth interpolated vertex normals
      const headGeo = new THREE.LatheGeometry(points, 48);
      headGeo.computeVertexNormals();

      const headMesh = new THREE.Mesh(headGeo, shinyMat);
      headMesh.castShadow = true;
      headMesh.receiveShadow = true;
      headGroup.add(headMesh);

      if (withStud) {
        // Classic dark recess disk inside the hollow stud
        const holeMat = new THREE.MeshBasicMaterial({ color: '#09090b' });
        const hole = new THREE.Mesh(new THREE.CircleGeometry(0.17, 24), holeMat);
        hole.rotation.x = -Math.PI / 2;
        hole.position.y = 0.86;
        headGroup.add(hole);
      }

      return { headGroup, headMesh, shinyMat };
    };

    // Helper: Palm Tree
    const createPalmTree = (x: number, z: number, groundY: number = 4) => {
      const tree = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(0.7, 1.1, 13, 7);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 6.5;
      trunk.rotation.z = (Math.random() - 0.5) * 0.25;
      trunk.castShadow = true;
      tree.add(trunk);

      for (let i = 0; i < 6; i++) {
        const leafGeo = new THREE.ConeGeometry(2.2, 9, 4);
        const leafMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.6 });
        const leaf = new THREE.Mesh(leafGeo, leafMat);
        leaf.rotation.x = Math.PI / 2.3;
        leaf.rotation.z = (i * Math.PI) / 3;
        leaf.position.set(0, 12.5, 0);
        tree.add(leaf);
      }
      tree.position.set(x, groundY, z);
      scene.add(tree);
    };

    // Helper: Jungle Tree
    const createJungleTree = (x: number, z: number, groundY: number = 4) => {
      const tree = new THREE.Group();
      const trunkGeo = new THREE.CylinderGeometry(1.2, 1.8, 16, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeo, trunkMat);
      trunk.position.y = 8;
      trunk.castShadow = true;
      tree.add(trunk);

      const leafMat = new THREE.MeshStandardMaterial({ color: '#166534', roughness: 0.7 });
      const crown1 = new THREE.Mesh(new THREE.DodecahedronGeometry(6.5), leafMat);
      crown1.position.set(0, 16, 0);
      crown1.castShadow = true;
      tree.add(crown1);

      const crown2 = new THREE.Mesh(new THREE.DodecahedronGeometry(4.5), leafMat);
      crown2.position.set(3, 14, 2);
      tree.add(crown2);

      tree.position.set(x, groundY, z);
      scene.add(tree);
    };

    // -------------------------------------------------------------------------
    // ISLAND 1: PIRATE STARTER ISLAND (Center: 0, 0)
    // -------------------------------------------------------------------------
    const starterRadius = 58;
    const starterHeight = 8;
    const starterTopY = 4.0;
    solidZones.push({ x: 0, z: 0, radius: starterRadius, topY: starterTopY });

    const starterIslandGeo = new THREE.CylinderGeometry(starterRadius - 4, starterRadius + 14, starterHeight, 36);
    const starterIslandMat = new THREE.MeshStandardMaterial({
      color: '#22c55e',
      roughness: 0.8,
    });
    const starterIsland = new THREE.Mesh(starterIslandGeo, starterIslandMat);
    starterIsland.position.set(0, 0, 0);
    starterIsland.receiveShadow = true;
    scene.add(starterIsland);

    // Sand Shore Ring
    const sandRingGeo = new THREE.RingGeometry(starterRadius - 8, starterRadius + 16, 36);
    const sandRingMat = new THREE.MeshStandardMaterial({
      color: '#fde047',
      roughness: 0.9,
      side: THREE.DoubleSide,
    });
    const sandRing = new THREE.Mesh(sandRingGeo, sandRingMat);
    sandRing.rotation.x = -Math.PI / 2;
    sandRing.position.y = starterTopY + 0.02;
    sandRing.receiveShadow = true;
    scene.add(sandRing);

    // Cobblestone Plaza
    const plazaGeo = new THREE.CircleGeometry(22, 32);
    const plazaMat = new THREE.MeshStandardMaterial({
      color: '#94a3b8',
      roughness: 0.7,
      side: THREE.DoubleSide,
    });
    const plaza = new THREE.Mesh(plazaGeo, plazaMat);
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.y = starterTopY + 0.05;
    plaza.receiveShadow = true;
    scene.add(plaza);

    // Town Monument Fountain (With Gold LEGO Studs)
    const monumentGeo = new THREE.CylinderGeometry(2.5, 3.2, 5, 8);
    const monumentMat = new THREE.MeshStandardMaterial({ color: '#64748b', roughness: 0.6 });
    const monument = new THREE.Mesh(monumentGeo, monumentMat);
    monument.position.set(0, starterTopY + 2.5, 0);
    monument.castShadow = true;
    scene.add(monument);

    // Decorative Golden LEGO Studs around Fountain Base
    const fStudMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.85, roughness: 0.2 });
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI * 2) / 6;
      const fStud = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12), fStudMat);
      fStud.position.set(Math.cos(angle) * 2.8, starterTopY + 0.15, Math.sin(angle) * 2.8);
      scene.add(fStud);
    }

    const starOrbGeo = new THREE.SphereGeometry(1.2, 16, 16);
    const starOrbMat = new THREE.MeshStandardMaterial({
      color: '#facc15',
      emissive: '#eab308',
      emissiveIntensity: 0.9,
    });
    const starOrb = new THREE.Mesh(starOrbGeo, starOrbMat);
    starOrb.position.set(0, starterTopY + 6.0, 0);
    scene.add(starOrb);

    // Houses (LEGO Brick-Built Style with Studs)
    const houseConfigs = [
      { x: -16, z: -16, rot: 0.4, color: '#f97316' },
      { x: 16, z: -16, rot: -0.4, color: '#0ea5e9' },
      { x: -24, z: 8, rot: 1.2, color: '#eab308' },
      { x: 24, z: 8, rot: -1.2, color: '#84cc16' },
    ];
    houseConfigs.forEach((hp) => {
      const houseGroup = new THREE.Group();
      const bodyGeo = new THREE.BoxGeometry(9, 7.5, 9);
      const bodyMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4, metalness: 0.05 });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = starterTopY + 3.75;
      body.castShadow = true;
      body.receiveShadow = true;
      houseGroup.add(body);

      const roofGeo = new THREE.ConeGeometry(7.5, 4.5, 4);
      const roofMat = new THREE.MeshStandardMaterial({ color: hp.color, roughness: 0.3, metalness: 0.05 });
      const roof = new THREE.Mesh(roofGeo, roofMat);
      roof.rotation.y = Math.PI / 4;
      roof.position.y = starterTopY + 9.75;
      roof.castShadow = true;
      houseGroup.add(roof);

      // Top Roof LEGO Stud
      const roofStud = new THREE.Mesh(
        new THREE.CylinderGeometry(0.75, 0.75, 0.6, 16),
        roofMat
      );
      roofStud.position.y = starterTopY + 12.2;
      houseGroup.add(roofStud);

      // Parapet Corner LEGO Studs
      const studPositions = [
        [-4, 4], [4, 4], [-4, -4], [4, -4]
      ];
      studPositions.forEach(([sx, sz]) => {
        const cStud = new THREE.Mesh(
          new THREE.CylinderGeometry(0.4, 0.4, 0.3, 12),
          bodyMat
        );
        cStud.position.set(sx, starterTopY + 7.6, sz);
        houseGroup.add(cStud);
      });

      const doorGeo = new THREE.BoxGeometry(2.4, 4.2, 0.2);
      const doorMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
      const door = new THREE.Mesh(doorGeo, doorMat);
      door.position.set(0, starterTopY + 2.1, 4.55);
      houseGroup.add(door);

      houseGroup.position.set(hp.x, 0, hp.z);
      houseGroup.rotation.y = hp.rot;
      scene.add(houseGroup);
    });

    // Harbor Pier
    const pierGeo = new THREE.BoxGeometry(10, 1.2, 34);
    const pierMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 });
    const pier = new THREE.Mesh(pierGeo, pierMat);
    pier.position.set(0, starterTopY - 0.4, 55);
    pier.castShadow = true;
    pier.receiveShadow = true;
    scene.add(pier);
    solidZones.push({ x: 0, z: 55, radius: 10, topY: starterTopY });

    // Moored Pirate Galleon
    const galleonGroup = new THREE.Group();
    const hullGeo = new THREE.BoxGeometry(16, 12, 40);
    const hullMat = new THREE.MeshStandardMaterial({ color: '#451a03', roughness: 0.7 });
    const hull = new THREE.Mesh(hullGeo, hullMat);
    hull.position.set(0, 3.5, 88);
    hull.castShadow = true;
    galleonGroup.add(hull);

    const mastGeo = new THREE.CylinderGeometry(0.6, 0.8, 30);
    const mastMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
    const mast = new THREE.Mesh(mastGeo, mastMat);
    mast.position.set(0, 18, 88);
    mast.castShadow = true;
    galleonGroup.add(mast);

    const sailGeo = new THREE.BoxGeometry(18, 11, 0.4);
    const sailMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.9 });
    const sail = new THREE.Mesh(sailGeo, sailMat);
    sail.position.set(0, 18, 88.5);
    galleonGroup.add(sail);
    scene.add(galleonGroup);

    // Trees
    [
      [-36, -26], [-40, 12], [-18, 38], [36, -28], [40, 16], [22, 42],
      [-48, -8], [48, -4], [10, -48], [-12, -50]
    ].forEach(([tx, tz]) => createPalmTree(tx, tz, starterTopY));

    // Bridges
    const bridgePlankMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
    const bridgePlankGeo = new THREE.BoxGeometry(4.8, 0.4, 1.4);

    // Bridge to Jungle
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const bx = THREE.MathUtils.lerp(-44, -94, t);
      const bz = THREE.MathUtils.lerp(-20, -48, t);
      const sag = Math.sin(t * Math.PI) * 0.9;
      const by = starterTopY - 0.2 - sag;
      const plank = new THREE.Mesh(bridgePlankGeo, bridgePlankMat);
      plank.position.set(bx, by, bz);
      plank.rotation.y = Math.atan2(-48 - -20, -94 - -44);
      scene.add(plank);
      solidZones.push({ x: bx, z: bz, radius: 3.5, topY: by + 0.2 });
    }

    // Bridge to Marineford
    for (let i = 0; i <= 28; i++) {
      const t = i / 28;
      const bx = THREE.MathUtils.lerp(44, 94, t);
      const bz = THREE.MathUtils.lerp(-20, -48, t);
      const sag = Math.sin(t * Math.PI) * 0.9;
      const by = starterTopY - 0.2 - sag;
      const plank = new THREE.Mesh(bridgePlankGeo, bridgePlankMat);
      plank.position.set(bx, by, bz);
      plank.rotation.y = Math.atan2(-48 - -20, 94 - 44);
      scene.add(plank);
      solidZones.push({ x: bx, z: bz, radius: 3.5, topY: by + 0.2 });
    }

    // -------------------------------------------------------------------------
    // ISLAND 2: JUNGLE OF THE PRIMATES (Center: -135, -65)
    // -------------------------------------------------------------------------
    const jungleCenterX = -135;
    const jungleCenterZ = -65;
    const jungleRadius = 48;
    const jungleTopY = 4.0;
    solidZones.push({ x: jungleCenterX, z: jungleCenterZ, radius: jungleRadius, topY: jungleTopY });

    const jungleIslandGeo = new THREE.CylinderGeometry(jungleRadius - 4, jungleRadius + 10, starterHeight, 32);
    const jungleIslandMat = new THREE.MeshStandardMaterial({ color: '#15803d', roughness: 0.85 });
    const jungleIsland = new THREE.Mesh(jungleIslandGeo, jungleIslandMat);
    jungleIsland.position.set(jungleCenterX, 0, jungleCenterZ);
    jungleIsland.receiveShadow = true;
    scene.add(jungleIsland);

    // Colosseum Pillars
    const colosseumPillars = new THREE.Group();
    for (let i = 0; i < 10; i++) {
      const angle = (i * Math.PI * 2) / 10;
      const px = Math.cos(angle) * 22;
      const pz = Math.sin(angle) * 22;
      const pillarGeo = new THREE.CylinderGeometry(1.6, 2.0, 14, 8);
      const pillarMat = new THREE.MeshStandardMaterial({ color: '#57534e', roughness: 0.9 });
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(px, 7, pz);
      pillar.castShadow = true;
      colosseumPillars.add(pillar);
    }
    colosseumPillars.position.set(jungleCenterX, jungleTopY, jungleCenterZ);
    scene.add(colosseumPillars);

    // Temple Pyramid
    const templeGroup = new THREE.Group();
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(18, 3, 18), new THREE.MeshStandardMaterial({ color: '#78716c' }));
    step1.position.y = jungleTopY + 1.5;
    templeGroup.add(step1);
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(12, 3, 12), new THREE.MeshStandardMaterial({ color: '#78716c' }));
    step2.position.y = jungleTopY + 4.5;
    templeGroup.add(step2);
    const step3 = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 6), new THREE.MeshStandardMaterial({ color: '#a8a29e' }));
    step3.position.y = jungleTopY + 7.0;
    templeGroup.add(step3);
    templeGroup.position.set(jungleCenterX + 24, 0, jungleCenterZ - 20);
    scene.add(templeGroup);
    solidZones.push({ x: jungleCenterX + 24, z: jungleCenterZ - 20, radius: 10, topY: jungleTopY + 8 });

    // Jungle Trees
    [
      [jungleCenterX - 22, jungleCenterZ - 22],
      [jungleCenterX - 30, jungleCenterZ + 12],
      [jungleCenterX + 16, jungleCenterZ + 25],
      [jungleCenterX - 18, jungleCenterZ + 30],
      [jungleCenterX + 30, jungleCenterZ + 10],
      [jungleCenterX - 32, jungleCenterZ - 10],
    ].forEach(([jx, jz]) => createJungleTree(jx, jz, jungleTopY));

    // -------------------------------------------------------------------------
    // ISLAND 3: MARINEFORD FORTRESS (Center: 135, -65)
    // -------------------------------------------------------------------------
    const marineCenterX = 135;
    const marineCenterZ = -65;
    const marineRadius = 48;
    const marineTopY = 4.0;
    solidZones.push({ x: marineCenterX, z: marineCenterZ, radius: marineRadius, topY: marineTopY });

    const marineIslandGeo = new THREE.CylinderGeometry(marineRadius - 4, marineRadius + 10, starterHeight, 32);
    const marineIslandMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.7 });
    const marineIsland = new THREE.Mesh(marineIslandGeo, marineIslandMat);
    marineIsland.position.set(marineCenterX, 0, marineCenterZ);
    marineIsland.receiveShadow = true;
    scene.add(marineIsland);

    const fortressWall = new THREE.Mesh(
      new THREE.BoxGeometry(38, 8, 3.5),
      new THREE.MeshStandardMaterial({ color: '#334155' })
    );
    fortressWall.position.set(marineCenterX, marineTopY + 4, marineCenterZ + 18);
    fortressWall.castShadow = true;
    scene.add(fortressWall);

    const keep = new THREE.Mesh(
      new THREE.BoxGeometry(16, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#1e293b' })
    );
    keep.position.set(marineCenterX, marineTopY + 8, marineCenterZ - 10);
    keep.castShadow = true;
    scene.add(keep);
    solidZones.push({ x: marineCenterX, z: marineCenterZ - 10, radius: 10, topY: marineTopY + 16 });

    // -------------------------------------------------------------------------
    // ISLAND 4: ALABASTA SAND DUNES (Center: 0, 190)
    // -------------------------------------------------------------------------
    const desertCenterX = 0;
    const desertCenterZ = 190;
    const desertRadius = 60;
    const desertTopY = 4.0;
    solidZones.push({ x: desertCenterX, z: desertCenterZ, radius: desertRadius, topY: desertTopY });

    const desertIslandGeo = new THREE.CylinderGeometry(desertRadius - 4, desertRadius + 14, starterHeight, 36);
    const desertIslandMat = new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.95 });
    const desertIsland = new THREE.Mesh(desertIslandGeo, desertIslandMat);
    desertIsland.position.set(desertCenterX, 0, desertCenterZ);
    desertIsland.receiveShadow = true;
    scene.add(desertIsland);

    // Desert Great Step Pyramid of Pharaoh
    const pyramidGroup = new THREE.Group();
    const pyr1 = new THREE.Mesh(new THREE.BoxGeometry(26, 4, 26), new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.9 }));
    pyr1.position.y = desertTopY + 2;
    pyr1.castShadow = true;
    pyramidGroup.add(pyr1);

    const pyr2 = new THREE.Mesh(new THREE.BoxGeometry(18, 4, 18), new THREE.MeshStandardMaterial({ color: '#d97706', roughness: 0.9 }));
    pyr2.position.y = desertTopY + 6;
    pyr2.castShadow = true;
    pyramidGroup.add(pyr2);

    const pyr3 = new THREE.Mesh(new THREE.BoxGeometry(10, 3, 10), new THREE.MeshStandardMaterial({ color: '#f59e0b', roughness: 0.8 }));
    pyr3.position.y = desertTopY + 9.5;
    pyr3.castShadow = true;
    pyramidGroup.add(pyr3);

    // Golden Pyramidion Cap
    const cap = new THREE.Mesh(new THREE.ConeGeometry(3, 4, 4), new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.2 }));
    cap.position.y = desertTopY + 13;
    cap.rotation.y = Math.PI / 4;
    pyramidGroup.add(cap);

    pyramidGroup.position.set(desertCenterX, 0, desertCenterZ);
    scene.add(pyramidGroup);
    solidZones.push({ x: desertCenterX, z: desertCenterZ, radius: 14, topY: desertTopY + 11 });

    // Oasis Water Spring
    const oasisGeo = new THREE.CircleGeometry(12, 24);
    const oasisMat = new THREE.MeshStandardMaterial({ color: '#06b6d4', roughness: 0.1, metalness: 0.8 });
    const oasis = new THREE.Mesh(oasisGeo, oasisMat);
    oasis.rotation.x = -Math.PI / 2;
    oasis.position.set(desertCenterX + 28, desertTopY + 0.05, desertCenterZ - 16);
    scene.add(oasis);
    createPalmTree(desertCenterX + 24, desertCenterZ - 22, desertTopY);
    createPalmTree(desertCenterX + 35, desertCenterZ - 14, desertTopY);

    // Desert Obelisks
    [
      [desertCenterX - 20, desertCenterZ - 20],
      [desertCenterX + 20, desertCenterZ + 20],
      [desertCenterX - 20, desertCenterZ + 20],
    ].forEach(([ox, oz]) => {
      const obelisk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.8, 1.4, 12, 4),
        new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.85 })
      );
      obelisk.position.set(ox, desertTopY + 6, oz);
      obelisk.castShadow = true;
      scene.add(obelisk);
    });

    // -------------------------------------------------------------------------
    // ISLAND 5: SKYLANDS CLOUD SANCTUM (Center: 0, -215, Elevated Y = 22)
    // -------------------------------------------------------------------------
    const skyCenterX = 0;
    const skyCenterZ = -215;
    const skyRadius = 55;
    const skyTopY = 22.0;
    solidZones.push({ x: skyCenterX, z: skyCenterZ, radius: skyRadius, topY: skyTopY });

    // Floating Island Marble Base
    const skyIslandGeo = new THREE.CylinderGeometry(skyRadius, skyRadius - 12, 10, 32);
    const skyIslandMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4 });
    const skyIsland = new THREE.Mesh(skyIslandGeo, skyIslandMat);
    skyIsland.position.set(skyCenterX, skyTopY - 5, skyCenterZ);
    skyIsland.receiveShadow = true;
    scene.add(skyIsland);

    // Fluffy cloud puffs underneath
    const cloudMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, opacity: 0.95 });
    for (let c = 0; c < 16; c++) {
      const ang = (c / 16) * Math.PI * 2;
      const r = skyRadius * (0.6 + Math.random() * 0.4);
      const cpuff = new THREE.Mesh(new THREE.SphereGeometry(10 + Math.random() * 6, 8, 8), cloudMat);
      cpuff.position.set(skyCenterX + Math.cos(ang) * r, skyTopY - 9, skyCenterZ + Math.sin(ang) * r);
      scene.add(cpuff);
    }

    // Sacred Golden Bell Temple & Shrine
    const bellGroup = new THREE.Group();
    for (let p = 0; p < 8; p++) {
      const colAng = (p / 8) * Math.PI * 2;
      const colMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.9, 1.1, 14, 12),
        new THREE.MeshStandardMaterial({ color: '#f1f5f9', roughness: 0.3 })
      );
      colMesh.position.set(Math.cos(colAng) * 16, 7, Math.sin(colAng) * 16);
      colMesh.castShadow = true;
      bellGroup.add(colMesh);
    }
    // Giant Golden Shandora Bell
    const bellMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(2.5, 4.2, 6, 16),
      new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#ca8a04', emissiveIntensity: 0.9, metalness: 0.9 })
    );
    bellMesh.position.set(0, 9, 0);
    bellGroup.add(bellMesh);

    bellGroup.position.set(skyCenterX, skyTopY, skyCenterZ);
    scene.add(bellGroup);
    solidZones.push({ x: skyCenterX, z: skyCenterZ, radius: 18, topY: skyTopY + 2 });

    // -------------------------------------------------------------------------
    // ISLAND 6: NAGYEYELONG KASTILYO (FROZEN CASTLE) - Center: -165, 155
    // -------------------------------------------------------------------------
    const frozenCenterX = -165;
    const frozenCenterZ = 155;
    const frozenRadius = 46;
    const frozenTopY = 4.0;
    solidZones.push({ x: frozenCenterX, z: frozenCenterZ, radius: frozenRadius, topY: frozenTopY });

    const frozenIslandGeo = new THREE.CylinderGeometry(frozenRadius - 4, frozenRadius + 10, starterHeight, 32);
    const frozenIslandMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', roughness: 0.25, metalness: 0.4 });
    const frozenIsland = new THREE.Mesh(frozenIslandGeo, frozenIslandMat);
    frozenIsland.position.set(frozenCenterX, 0, frozenCenterZ);
    frozenIsland.receiveShadow = true;
    scene.add(frozenIsland);

    // Glacial Ice Spikes & Castle Gates
    for (let s = 0; s < 8; s++) {
      const spkAngle = (s / 8) * Math.PI * 2;
      const spkR = frozenRadius * 0.72;
      const spikeGeo = new THREE.ConeGeometry(2.2 + (s % 3) * 0.6, 14 + (s % 4) * 3, 5);
      const spikeMat = new THREE.MeshStandardMaterial({ color: '#e0f2fe', roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.9 });
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.set(frozenCenterX + Math.cos(spkAngle) * spkR, frozenTopY + 7, frozenCenterZ + Math.sin(spkAngle) * spkR);
      spike.rotation.x = 0.15;
      spike.castShadow = true;
      scene.add(spike);
    }

    const icePalace = new THREE.Mesh(
      new THREE.BoxGeometry(18, 14, 18),
      new THREE.MeshStandardMaterial({ color: '#bae6fd', roughness: 0.2, metalness: 0.6 })
    );
    icePalace.position.set(frozenCenterX, frozenTopY + 7, frozenCenterZ);
    icePalace.castShadow = true;
    scene.add(icePalace);
    solidZones.push({ x: frozenCenterX, z: frozenCenterZ, radius: 11, topY: frozenTopY + 14 });

    // -------------------------------------------------------------------------
    // ISLAND 7: BULKANG NAG-AAPOY (MAGMA CALDERA) - Center: 165, 155
    // -------------------------------------------------------------------------
    const magmaCenterX = 165;
    const magmaCenterZ = 155;
    const magmaRadius = 46;
    const magmaTopY = 5.0;
    solidZones.push({ x: magmaCenterX, z: magmaCenterZ, radius: magmaRadius, topY: magmaTopY });

    const magmaIslandGeo = new THREE.CylinderGeometry(magmaRadius - 4, magmaRadius + 12, starterHeight + 2, 32);
    const magmaIslandMat = new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.95 });
    const magmaIsland = new THREE.Mesh(magmaIslandGeo, magmaIslandMat);
    magmaIsland.position.set(magmaCenterX, 0, magmaCenterZ);
    magmaIsland.receiveShadow = true;
    scene.add(magmaIsland);

    // Glowing Lava Crater Core
    const lavaPoolGeo = new THREE.CircleGeometry(16, 24);
    const lavaPoolMat = new THREE.MeshStandardMaterial({
      color: '#ea580c',
      emissive: '#dc2626',
      emissiveIntensity: 1.8,
      roughness: 0.2,
    });
    const lavaPool = new THREE.Mesh(lavaPoolGeo, lavaPoolMat);
    lavaPool.rotation.x = -Math.PI / 2;
    lavaPool.position.set(magmaCenterX, magmaTopY + 0.1, magmaCenterZ);
    scene.add(lavaPool);

    // Volcanic Basalt Rock Formations
    for (let b = 0; b < 7; b++) {
      const bAngle = (b / 7) * Math.PI * 2;
      const bR = 24;
      const rockGeo = new THREE.BoxGeometry(6, 12 + (b % 3) * 4, 6);
      const rockMat = new THREE.MeshStandardMaterial({ color: '#292524', roughness: 0.9 });
      const rock = new THREE.Mesh(rockGeo, rockMat);
      rock.position.set(magmaCenterX + Math.cos(bAngle) * bR, magmaTopY + 6, magmaCenterZ + Math.sin(bAngle) * bR);
      rock.rotation.y = bAngle;
      rock.castShadow = true;
      scene.add(rock);
    }

    // -------------------------------------------------------------------------
    // ISLAND 8: BARKO NG MGA MULTO (HAUNTED GHOST BARK) - Center: -200, 40
    // -------------------------------------------------------------------------
    const ghostCenterX = -200;
    const ghostCenterZ = 40;
    const ghostRadius = 42;
    const ghostTopY = 4.0;
    solidZones.push({ x: ghostCenterX, z: ghostCenterZ, radius: ghostRadius, topY: ghostTopY });

    const ghostIslandGeo = new THREE.CylinderGeometry(ghostRadius - 4, ghostRadius + 8, starterHeight, 30);
    const ghostIslandMat = new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.9 });
    const ghostIsland = new THREE.Mesh(ghostIslandGeo, ghostIslandMat);
    ghostIsland.position.set(ghostCenterX, 0, ghostCenterZ);
    ghostIsland.receiveShadow = true;
    scene.add(ghostIsland);

    // Haunted Ship Hull & Crypt Deck
    const ghostShipGroup = new THREE.Group();
    const gDeck = new THREE.Mesh(new THREE.BoxGeometry(26, 4, 14), new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.95 }));
    gDeck.position.y = 2;
    ghostShipGroup.add(gDeck);

    const gMast = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, 24), new THREE.MeshStandardMaterial({ color: '#27272a' }));
    gMast.position.set(0, 14, 0);
    ghostShipGroup.add(gMast);

    const gSail = new THREE.Mesh(new THREE.BoxGeometry(14, 8, 0.2), new THREE.MeshStandardMaterial({ color: '#581c87', roughness: 0.9 }));
    gSail.position.set(0, 15, 0);
    ghostShipGroup.add(gSail);

    // Spectral Orbs
    for (let o = 0; o < 4; o++) {
      const orbMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.8, 12, 12),
        new THREE.MeshStandardMaterial({ color: '#c084fc', emissive: '#9333ea', emissiveIntensity: 1.5 })
      );
      orbMesh.position.set((o % 2 === 0 ? 8 : -8), 5, (o < 2 ? 5 : -5));
      ghostShipGroup.add(orbMesh);
    }
    ghostShipGroup.position.set(ghostCenterX, ghostTopY, ghostCenterZ);
    scene.add(ghostShipGroup);
    solidZones.push({ x: ghostCenterX, z: ghostCenterZ, radius: 14, topY: ghostTopY + 4 });

    // -------------------------------------------------------------------------
    // ISLAND 9: COLISEO NG MGA KAMPEON (GLADIATOR ARENA) - Center: 200, 40
    // -------------------------------------------------------------------------
    const arenaCenterX = 200;
    const arenaCenterZ = 40;
    const arenaRadius = 44;
    const arenaTopY = 4.0;
    solidZones.push({ x: arenaCenterX, z: arenaCenterZ, radius: arenaRadius, topY: arenaTopY });

    const arenaIslandGeo = new THREE.CylinderGeometry(arenaRadius - 4, arenaRadius + 8, starterHeight, 32);
    const arenaIslandMat = new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.8 });
    const arenaIsland = new THREE.Mesh(arenaIslandGeo, arenaIslandMat);
    arenaIsland.position.set(arenaCenterX, 0, arenaCenterZ);
    arenaIsland.receiveShadow = true;
    scene.add(arenaIsland);

    // Golden Imperial Amphitheater Pillars
    const arenaGroup = new THREE.Group();
    for (let p = 0; p < 12; p++) {
      const pAng = (p / 12) * Math.PI * 2;
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(1.2, 1.4, 16, 10),
        new THREE.MeshStandardMaterial({ color: '#fef08a', metalness: 0.6, roughness: 0.3 })
      );
      col.position.set(Math.cos(pAng) * 26, 8, Math.sin(pAng) * 26);
      col.castShadow = true;
      arenaGroup.add(col);
    }
    const throneBase = new THREE.Mesh(new THREE.BoxGeometry(10, 4, 8), new THREE.MeshStandardMaterial({ color: '#dc2626' }));
    throneBase.position.set(0, 2, -18);
    arenaGroup.add(throneBase);
    arenaGroup.position.set(arenaCenterX, arenaTopY, arenaCenterZ);
    scene.add(arenaGroup);
    solidZones.push({ x: arenaCenterX, z: arenaCenterZ - 18, radius: 6, topY: arenaTopY + 4 });

    // -------------------------------------------------------------------------
    // ISLAND 10: BUNGANGA NG DRAGON (ONIGASHIMA SKULL PEAK) - NIGHTMARE TIER 1
    // Center: 0, 380
    // -------------------------------------------------------------------------
    const onigashimaCenterX = 0;
    const onigashimaCenterZ = 380;
    const onigashimaRadius = 48;
    const onigashimaTopY = 4.0;
    solidZones.push({ x: onigashimaCenterX, z: onigashimaCenterZ, radius: onigashimaRadius, topY: onigashimaTopY });

    const onigashimaGeo = new THREE.CylinderGeometry(onigashimaRadius - 4, onigashimaRadius + 8, starterHeight, 32);
    const onigashimaMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.95 });
    const onigashimaIsland = new THREE.Mesh(onigashimaGeo, onigashimaMat);
    onigashimaIsland.position.set(onigashimaCenterX, 0, onigashimaCenterZ);
    scene.add(onigashimaIsland);

    // Giant Demon Skull & Massive Dragon Horns
    const oniGroup = new THREE.Group();
    const skullDome = new THREE.Mesh(
      new THREE.SphereGeometry(14, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.7),
      new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.85 })
    );
    skullDome.position.set(0, 10, 0);
    oniGroup.add(skullDome);

    // Horns
    const dragonHornMat = new THREE.MeshStandardMaterial({ color: '#7e22ce', emissive: '#581c87', emissiveIntensity: 0.6 });
    const leftHorn = new THREE.Mesh(new THREE.ConeGeometry(3.0, 22, 10), dragonHornMat);
    leftHorn.rotation.z = -0.45;
    leftHorn.rotation.x = -0.2;
    leftHorn.position.set(-11, 24, 0);
    oniGroup.add(leftHorn);

    const rightHorn = new THREE.Mesh(new THREE.ConeGeometry(3.0, 22, 10), dragonHornMat);
    rightHorn.rotation.z = 0.45;
    rightHorn.rotation.x = -0.2;
    rightHorn.position.set(11, 24, 0);
    oniGroup.add(rightHorn);

    // Glowing Purple Dragon Fire Braziers
    for (let f = 0; f < 4; f++) {
      const bAngle = (f / 4) * Math.PI * 2;
      const bFire = new THREE.Mesh(
        new THREE.DodecahedronGeometry(2.0),
        new THREE.MeshStandardMaterial({ color: '#c084fc', emissive: '#a855f7', emissiveIntensity: 2.2 })
      );
      bFire.position.set(Math.cos(bAngle) * 28, 4, Math.sin(bAngle) * 28);
      oniGroup.add(bFire);
    }
    oniGroup.position.set(onigashimaCenterX, onigashimaTopY, onigashimaCenterZ);
    scene.add(oniGroup);
    solidZones.push({ x: onigashimaCenterX, z: onigashimaCenterZ, radius: 16, topY: onigashimaTopY + 12 });

    // -------------------------------------------------------------------------
    // ISLAND 11: KAHARIAN NG MATATAMIS (WHOLE CAKE SWEET METROPOLIS) - NIGHTMARE TIER 2
    // Center: -280, -180
    // -------------------------------------------------------------------------
    const wholeCakeCenterX = -280;
    const wholeCakeCenterZ = -180;
    const wholeCakeRadius = 46;
    const wholeCakeTopY = 4.0;
    solidZones.push({ x: wholeCakeCenterX, z: wholeCakeCenterZ, radius: wholeCakeRadius, topY: wholeCakeTopY });

    const wholeCakeGeo = new THREE.CylinderGeometry(wholeCakeRadius - 4, wholeCakeRadius + 8, starterHeight, 32);
    const wholeCakeMat = new THREE.MeshStandardMaterial({ color: '#fbcfe8', roughness: 0.6 });
    const wholeCakeIsland = new THREE.Mesh(wholeCakeGeo, wholeCakeMat);
    wholeCakeIsland.position.set(wholeCakeCenterX, 0, wholeCakeCenterZ);
    scene.add(wholeCakeIsland);

    // Giant 3-Tier Birthday Cake Citadel
    const cakeGroup = new THREE.Group();
    const tier1 = new THREE.Mesh(
      new THREE.CylinderGeometry(20, 22, 6, 24),
      new THREE.MeshStandardMaterial({ color: '#f472b6', roughness: 0.4 })
    );
    tier1.position.y = 3;
    cakeGroup.add(tier1);

    const tier2 = new THREE.Mesh(
      new THREE.CylinderGeometry(14, 15, 6, 20),
      new THREE.MeshStandardMaterial({ color: '#fdf2f8', roughness: 0.3 })
    );
    tier2.position.y = 9;
    cakeGroup.add(tier2);

    const tier3 = new THREE.Mesh(
      new THREE.CylinderGeometry(8, 9, 6, 16),
      new THREE.MeshStandardMaterial({ color: '#fb7185', roughness: 0.4 })
    );
    tier3.position.y = 15;
    cakeGroup.add(tier3);

    // Giant Candle & Flame
    const candle = new THREE.Mesh(
      new THREE.CylinderGeometry(1.0, 1.0, 8, 8),
      new THREE.MeshStandardMaterial({ color: '#ffffff' })
    );
    candle.position.y = 22;
    cakeGroup.add(candle);

    const flame = new THREE.Mesh(
      new THREE.SphereGeometry(1.6, 10, 10),
      new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#ea580c', emissiveIntensity: 2.0 })
    );
    flame.position.y = 27;
    cakeGroup.add(flame);

    cakeGroup.position.set(wholeCakeCenterX, wholeCakeTopY, wholeCakeCenterZ);
    scene.add(cakeGroup);
    solidZones.push({ x: wholeCakeCenterX, z: wholeCakeCenterZ, radius: 15, topY: wholeCakeTopY + 12 });

    // -------------------------------------------------------------------------
    // ISLAND 12: ANG LIHIM NA PULO NG RAFTEL (LAUGH TALE / VOID CENTURY) - NIGHTMARE TIER 3 (MAXIMUM)
    // Center: 280, -180
    // -------------------------------------------------------------------------
    const laughTaleCenterX = 280;
    const laughTaleCenterZ = -180;
    const laughTaleRadius = 46;
    const laughTaleTopY = 4.0;
    solidZones.push({ x: laughTaleCenterX, z: laughTaleCenterZ, radius: laughTaleRadius, topY: laughTaleTopY });

    const laughTaleGeo = new THREE.CylinderGeometry(laughTaleRadius - 4, laughTaleRadius + 8, starterHeight, 32);
    const laughTaleMat = new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 });
    const laughTaleIsland = new THREE.Mesh(laughTaleGeo, laughTaleMat);
    laughTaleIsland.position.set(laughTaleCenterX, 0, laughTaleCenterZ);
    scene.add(laughTaleIsland);

    // Ancient Astral Temple Pillars & 4 Glowing Red Road Poneglyphs
    const voidGroup = new THREE.Group();
    for (let c = 0; c < 8; c++) {
      const cAngle = (c / 8) * Math.PI * 2;
      const col = new THREE.Mesh(
        new THREE.BoxGeometry(2.5, 20, 2.5),
        new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.6, metalness: 0.8 })
      );
      col.position.set(Math.cos(cAngle) * 26, 10, Math.sin(cAngle) * 26);
      voidGroup.add(col);
    }

    // 4 Sacred Red Road Poneglyph Cubes
    const poneglyphMat = new THREE.MeshStandardMaterial({
      color: '#dc2626',
      emissive: '#991b1b',
      emissiveIntensity: 1.5,
      metalness: 0.4,
      roughness: 0.2
    });
    const pCoords = [
      { x: -14, z: -14 },
      { x: 14, z: -14 },
      { x: -14, z: 14 },
      { x: 14, z: 14 },
    ];
    pCoords.forEach((pc) => {
      const cube = new THREE.Mesh(new THREE.BoxGeometry(4.5, 4.5, 4.5), poneglyphMat);
      cube.position.set(pc.x, 2.25, pc.z);
      voidGroup.add(cube);
    });

    // Central Void Monolith
    const centerEye = new THREE.Mesh(
      new THREE.SphereGeometry(3.5, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#b91c1c', emissiveIntensity: 2.5 })
    );
    centerEye.position.set(0, 16, 0);
    voidGroup.add(centerEye);

    voidGroup.position.set(laughTaleCenterX, laughTaleTopY, laughTaleCenterZ);
    scene.add(voidGroup);
    solidZones.push({ x: laughTaleCenterX, z: laughTaleCenterZ, radius: 14, topY: laughTaleTopY + 6 });

    // Solid ground height calculation across all 12 islands & temples
    const getGroundHeight = (x: number, z: number): number => {
      let maxH = 0.0;
      for (let i = 0; i < solidZones.length; i++) {
        const zone = solidZones[i];
        const dx = x - zone.x;
        const dz = z - zone.z;
        if (dx * dx + dz * dz <= zone.radius * zone.radius) {
          if (zone.topY > maxH) maxH = zone.topY;
        }
      }
      return maxH;
    };

    // Super Jump Launch Pads / Geysers between all 12 Islands
    interface LaunchPad {
      x: number;
      z: number;
      y: number;
      targetVy: number;
      label: string;
    }
    const launchPads: LaunchPad[] = [
      { x: 0, z: -54, y: starterTopY, targetVy: 32, label: '🌪️ SKY LAUNCHER' },
      { x: 0, z: 54, y: starterTopY, targetVy: 28, label: '🌪️ DESERT LAUNCHER' },
      { x: -52, z: 0, y: starterTopY, targetVy: 28, label: '🌪️ JUNGLE LAUNCHER' },
      { x: 52, z: 0, y: starterTopY, targetVy: 28, label: '🌪️ MARINE LAUNCHER' },
      { x: -38, z: 38, y: starterTopY, targetVy: 30, label: '❄️ FROST LAUNCHER' },
      { x: 38, z: 38, y: starterTopY, targetVy: 30, label: '🌋 MAGMA LAUNCHER' },
      { x: -52, z: 20, y: starterTopY, targetVy: 30, label: '👻 GHOST LAUNCHER' },
      { x: 52, z: 20, y: starterTopY, targetVy: 30, label: '⚔️ ARENA LAUNCHER' },
      { x: 0, z: 58, y: starterTopY, targetVy: 34, label: '🐉 ONIGASHIMA LAUNCHER' },
      { x: -54, z: -40, y: starterTopY, targetVy: 32, label: '🎂 WHOLE CAKE LAUNCHER' },
      { x: 54, z: -40, y: starterTopY, targetVy: 32, label: '👁️ LAUGH TALE LAUNCHER' },
      { x: skyCenterX, z: skyCenterZ + 48, y: skyTopY, targetVy: 22, label: '🌪️ SKY DESCENT' },
      { x: frozenCenterX, z: frozenCenterZ - 36, y: frozenTopY, targetVy: 26, label: '🌪️ FROST RETURN' },
      { x: magmaCenterX, z: magmaCenterZ - 36, y: magmaTopY, targetVy: 26, label: '🌪️ MAGMA RETURN' },
      { x: ghostCenterX + 32, z: ghostCenterZ, y: ghostTopY, targetVy: 26, label: '🌪️ GHOST RETURN' },
      { x: arenaCenterX - 32, z: arenaCenterZ, y: arenaTopY, targetVy: 26, label: '🌪️ ARENA RETURN' },
      { x: onigashimaCenterX, z: onigashimaCenterZ - 42, y: onigashimaTopY, targetVy: 28, label: '🌪️ ONIGASHIMA RETURN' },
      { x: wholeCakeCenterX + 38, z: wholeCakeCenterZ + 20, y: wholeCakeTopY, targetVy: 28, label: '🌪️ WHOLE CAKE RETURN' },
      { x: laughTaleCenterX - 38, z: laughTaleCenterZ + 20, y: laughTaleTopY, targetVy: 28, label: '🌪️ LAUGH TALE RETURN' },
    ];
    launchPads.forEach((lp) => {
      const padGeo = new THREE.CylinderGeometry(2.8, 3.2, 0.5, 16);
      const padMat = new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.9 });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(lp.x, lp.y + 0.25, lp.z);
      scene.add(pad);

      const ringVFX = new THREE.Mesh(
        new THREE.RingGeometry(1.5, 2.6, 16),
        new THREE.MeshBasicMaterial({ color: '#7dd3fc', side: THREE.DoubleSide })
      );
      ringVFX.rotation.x = -Math.PI / 2;
      ringVFX.position.set(lp.x, lp.y + 0.6, lp.z);
      scene.add(ringVFX);
    });

    // =========================================================================
    // 4. INTERACTIVE NPCS
    // =========================================================================
    // Helper: Ultra-Shiny Round LEGO Minifigure Vendor for Shops
    const createLegoNpcVendor = (torsoColor: string, hatType: 'dealer' | 'smith' | 'acc' | 'quest' | 'harbor') => {
      const vendorGroup = new THREE.Group();
      vendorGroup.position.set(0, 0, -1.8);

      // Pants / Legs
      const pantsMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.7 });
      const legs = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 1.1), pantsMat);
      legs.position.y = 1.1;
      vendorGroup.add(legs);

      // Torso
      const torsoMat = new THREE.MeshPhysicalMaterial({ color: torsoColor, roughness: 0.04, clearcoat: 0.95 });
      const torso = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.6, 1.3), torsoMat);
      torso.position.y = 3.5;
      vendorGroup.add(torso);

      // Shoulder Studs
      const lStud = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), torsoMat);
      lStud.position.set(-0.8, 4.8, 0);
      vendorGroup.add(lStud);
      const rStud = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), torsoMat);
      rStud.position.set(0.8, 4.8, 0);
      vendorGroup.add(rStud);

      // Arms
      const armMat = new THREE.MeshPhysicalMaterial({ color: '#facc15', roughness: 0.02, metalness: 0.02, clearcoat: 1.0 });
      const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.0, 0.8), torsoMat);
      leftArm.position.set(-1.6, 3.4, 0.3);
      leftArm.rotation.x = -0.3;
      vendorGroup.add(leftArm);
      const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 2.0, 0.8), torsoMat);
      rightArm.position.set(1.6, 3.4, 0.3);
      rightArm.rotation.x = -0.3;
      vendorGroup.add(rightArm);

      // Neck
      const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.35, 24), armMat);
      neck.position.y = 4.85;
      vendorGroup.add(neck);

      // Round Ultra-Shiny Head!
      const { headGroup: npcHeadGroup } = createShinyLegoHeadMesh('#facc15', hatType === 'quest' || hatType === 'acc');
      vendorGroup.add(npcHeadGroup);

      // Friendly Face features
      const eyeMat = new THREE.MeshBasicMaterial({ color: '#09090b' });
      const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.05), eyeMat);
      leftEye.rotation.y = -0.45;
      leftEye.position.set(-0.36, 5.9, 0.76);
      vendorGroup.add(leftEye);

      const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.28, 0.05), eyeMat);
      rightEye.rotation.y = 0.45;
      rightEye.position.set(0.36, 5.9, 0.76);
      vendorGroup.add(rightEye);

      const smile = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.05), eyeMat);
      smile.position.set(0, 5.42, 0.83);
      vendorGroup.add(smile);

      // Hat / Accessories by type
      if (hatType === 'dealer') {
        const dHat = new THREE.Mesh(
          new THREE.CylinderGeometry(0.92, 0.86, 0.5, 32),
          new THREE.MeshPhysicalMaterial({ color: '#7e22ce', roughness: 0.02, clearcoat: 1.0 })
        );
        dHat.position.set(0, 6.55, 0);
        vendorGroup.add(dHat);
      } else if (hatType === 'smith') {
        const sBandana = new THREE.Mesh(
          new THREE.CylinderGeometry(0.88, 0.88, 0.45, 32),
          new THREE.MeshPhysicalMaterial({ color: '#b45309', roughness: 0.02, clearcoat: 1.0 })
        );
        sBandana.position.set(0, 6.45, 0);
        vendorGroup.add(sBandana);
      } else if (hatType === 'acc') {
        const glasses = new THREE.Mesh(
          new THREE.BoxGeometry(1.2, 0.22, 0.1),
          new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.1 })
        );
        glasses.position.set(0, 5.9, 0.84);
        vendorGroup.add(glasses);
      } else if (hatType === 'harbor') {
        const hHat = new THREE.Mesh(
          new THREE.CylinderGeometry(0.95, 0.88, 0.55, 32),
          new THREE.MeshPhysicalMaterial({ color: '#0369a1', roughness: 0.02, clearcoat: 1.0 })
        );
        hHat.position.set(0, 6.55, 0);
        vendorGroup.add(hHat);
      }

      return vendorGroup;
    };

    // Dealer NPC
    const dealerGroup = new THREE.Group();
    const stallTable = new THREE.Mesh(new THREE.BoxGeometry(7, 3, 4), new THREE.MeshStandardMaterial({ color: '#78350f' }));
    stallTable.position.set(0, 1.5, 0);
    dealerGroup.add(stallTable);
    const dealerCanopy = new THREE.Mesh(new THREE.ConeGeometry(5.5, 2.5, 4), new THREE.MeshStandardMaterial({ color: '#9333ea' }));
    dealerCanopy.rotation.y = Math.PI / 4;
    dealerCanopy.position.set(0, 5.5, 0);
    dealerGroup.add(dealerCanopy);
    const sampleFruit = new THREE.Mesh(new THREE.SphereGeometry(0.85, 16, 16), new THREE.MeshStandardMaterial({ color: '#ec4899', emissive: '#ec4899', emissiveIntensity: 0.9 }));
    sampleFruit.position.set(0, 3.8, 0);
    dealerGroup.add(sampleFruit);
    dealerGroup.add(createLegoNpcVendor('#9333ea', 'dealer'));
    const dealerLabel = createBillboardText('🍇 BLOX FRUIT DEALER (E)', '#d8b4fe');
    dealerLabel.position.set(0, 7.8, 0);
    dealerGroup.add(dealerLabel);
    dealerGroup.position.set(-14, starterTopY, 14);
    scene.add(dealerGroup);

    // Blacksmith NPC
    const smithGroup = new THREE.Group();
    const anvil = new THREE.Mesh(new THREE.BoxGeometry(4, 2.5, 3), new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.85 }));
    anvil.position.set(0, 1.25, 0);
    smithGroup.add(anvil);
    smithGroup.add(createLegoNpcVendor('#b45309', 'smith'));
    const smithLabel = createBillboardText('⚔️ BLACKSMITH / WEAPONS (E)', '#fde047');
    smithLabel.position.set(0, 7.0, 0);
    smithGroup.add(smithLabel);
    smithGroup.position.set(14, starterTopY, 14);
    scene.add(smithGroup);

    // Accessories NPC
    const accGroup = new THREE.Group();
    const accTable = new THREE.Mesh(new THREE.BoxGeometry(6, 2.8, 3.5), new THREE.MeshStandardMaterial({ color: '#065f46' }));
    accTable.position.set(0, 1.4, 0);
    accGroup.add(accTable);
    accGroup.add(createLegoNpcVendor('#047857', 'acc'));
    const accLabel = createBillboardText('🛡️ KAGAMITAN / ACCESSORIES (E)', '#34d399');
    accLabel.position.set(0, 6.8, 0);
    accGroup.add(accLabel);
    accGroup.position.set(-14, starterTopY, -14);
    scene.add(accGroup);

    // Quest NPC
    const questNpcGroup = new THREE.Group();
    const qStand = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 3), new THREE.MeshStandardMaterial({ color: '#b45309' }));
    qStand.position.set(0, 2, 0);
    questNpcGroup.add(qStand);
    questNpcGroup.add(createLegoNpcVendor('#1e3a8a', 'quest'));
    const questLabel = createBillboardText('📜 QUEST GIVER / GABAY (E)', '#fef08a');
    questLabel.position.set(0, 7.5, 0);
    questNpcGroup.add(questLabel);
    questNpcGroup.position.set(0, starterTopY, 22);
    scene.add(questNpcGroup);

    // Harbor Master
    const harborGroup = new THREE.Group();
    const anchorMesh = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.35, 8, 16), new THREE.MeshStandardMaterial({ color: '#0369a1', metalness: 0.8 }));
    anchorMesh.position.set(0, 2.5, 0);
    harborGroup.add(anchorMesh);
    harborGroup.add(createLegoNpcVendor('#0369a1', 'harbor'));
    const harborLabel = createBillboardText('⛵ HARBOR MASTER / MAGLAYAG (E)', '#38bdf8');
    harborLabel.position.set(0, 6.5, 0);
    harborGroup.add(harborLabel);
    harborGroup.position.set(0, starterTopY, 52);
    scene.add(harborGroup);

    // =========================================================================
    // 5. STAR CHESTS & FLOATING STAR COINS
    // =========================================================================
    const chests: Chest3D[] = [];
    const chestLocations = [
      // Starter Island
      { id: 'chest-starter-beach', x: -32, z: -32, stars: 35, y: starterTopY },
      { id: 'chest-starter-windmill', x: 30, z: -28, stars: 40, y: starterTopY },
      { id: 'chest-starter-pier', x: 0, z: 66, stars: 45, y: starterTopY },
      // Jungle Island
      { id: 'chest-jungle-temple', x: jungleCenterX + 24, z: jungleCenterZ - 20, stars: 55, y: jungleTopY + 8 },
      { id: 'chest-jungle-ruins', x: jungleCenterX - 28, z: jungleCenterZ + 15, stars: 50, y: jungleTopY },
      { id: 'chest-jungle-arena', x: jungleCenterX, z: jungleCenterZ - 30, stars: 60, y: jungleTopY },
      // Marineford Fortress
      { id: 'chest-marine-keep', x: marineCenterX, z: marineCenterZ - 10, stars: 75, y: marineTopY + 16 },
      { id: 'chest-marine-wall', x: marineCenterX - 18, z: marineCenterZ + 18, stars: 65, y: marineTopY + 8 },
      { id: 'chest-marine-dock', x: marineCenterX + 22, z: marineCenterZ - 25, stars: 60, y: marineTopY },
      // Alabasta Sand Dunes
      { id: 'chest-desert-pyramid', x: desertCenterX, z: desertCenterZ, stars: 85, y: desertTopY + 14 },
      { id: 'chest-desert-oasis', x: desertCenterX + 26, z: desertCenterZ - 18, stars: 75, y: desertTopY },
      { id: 'chest-desert-tomb', x: desertCenterX - 24, z: desertCenterZ + 18, stars: 80, y: desertTopY },
      // Skylands Cloud Sanctum
      { id: 'chest-sky-bell', x: skyCenterX, z: skyCenterZ, stars: 100, y: skyTopY + 3 },
      { id: 'chest-sky-cloud1', x: skyCenterX + 28, z: skyCenterZ + 15, stars: 90, y: skyTopY },
      { id: 'chest-sky-cloud2', x: skyCenterX - 28, z: skyCenterZ - 15, stars: 90, y: skyTopY },
      // Frozen Ice Castle Island
      { id: 'chest-frost-palace', x: frozenCenterX, z: frozenCenterZ, stars: 105, y: frozenTopY + 14 },
      { id: 'chest-frost-spire', x: frozenCenterX + 22, z: frozenCenterZ + 18, stars: 95, y: frozenTopY },
      { id: 'chest-frost-dock', x: frozenCenterX - 22, z: frozenCenterZ - 18, stars: 90, y: frozenTopY },
      // Magma Volcano Island
      { id: 'chest-magma-crater', x: magmaCenterX, z: magmaCenterZ, stars: 115, y: magmaTopY + 1 },
      { id: 'chest-magma-basalt', x: magmaCenterX + 24, z: magmaCenterZ - 20, stars: 100, y: magmaTopY + 6 },
      { id: 'chest-magma-rim', x: magmaCenterX - 24, z: magmaCenterZ + 20, stars: 100, y: magmaTopY },
      // Haunted Ghost Bark Island
      { id: 'chest-ghost-deck', x: ghostCenterX, z: ghostCenterZ, stars: 120, y: ghostTopY + 3 },
      { id: 'chest-ghost-crypt', x: ghostCenterX - 20, z: ghostCenterZ + 16, stars: 105, y: ghostTopY },
      { id: 'chest-ghost-stern', x: ghostCenterX + 20, z: ghostCenterZ - 16, stars: 105, y: ghostTopY },
      // Gladiator Colosseum Island
      { id: 'chest-arena-throne', x: arenaCenterX, z: arenaCenterZ - 18, stars: 130, y: arenaTopY + 4 },
      { id: 'chest-arena-ring1', x: arenaCenterX + 22, z: arenaCenterZ + 15, stars: 110, y: arenaTopY },
      { id: 'chest-arena-ring2', x: arenaCenterX - 22, z: arenaCenterZ + 15, stars: 110, y: arenaTopY },
    ];

    chestLocations.forEach((cl) => {
      const cGroup = new THREE.Group();
      
      // Wooden Chest Base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(3.4, 1.8, 2.4),
        new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.7 })
      );
      base.position.y = 0.9;
      base.castShadow = true;
      cGroup.add(base);

      // Gold Metallic Brackets with LEGO Studs
      const trimMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.85, roughness: 0.2 });
      const trim = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.35, 2.5),
        trimMat
      );
      trim.position.y = 1.6;
      cGroup.add(trim);

      // 4 LEGO Studs along the front and back chest trim
      for (let sx = -1.2; sx <= 1.2; sx += 0.8) {
        const cStudFront = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.16, 10), trimMat);
        cStudFront.position.set(sx, 1.82, 1.05);
        cGroup.add(cStudFront);
        const cStudBack = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.16, 10), trimMat);
        cStudBack.position.set(sx, 1.82, -1.05);
        cGroup.add(cStudBack);
      }

      // Hinged Chest Lid (Rotatable on Open)
      const lidGeo = new THREE.CylinderGeometry(1.22, 1.22, 3.4, 12, 1, false, 0, Math.PI);
      const lidMat = new THREE.MeshStandardMaterial({ color: '#92400e', roughness: 0.6 });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.rotation.z = Math.PI / 2;
      lid.position.set(0, 1.8, -1.2);
      cGroup.add(lid);

      // Golden Star Lock Emblem
      const lockMesh = new THREE.Mesh(
        new THREE.BoxGeometry(0.6, 0.6, 0.2),
        new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#ca8a04', emissiveIntensity: 0.8, metalness: 0.9 })
      );
      lockMesh.position.set(0, 1.3, 1.25);
      cGroup.add(lockMesh);

      // Sky-High Golden Beacon Light Beam (Visible from afar!)
      const beamGeo = new THREE.CylinderGeometry(0.5, 1.2, 55, 16);
      const beamMat = new THREE.MeshBasicMaterial({
        color: '#facc15',
        transparent: true,
        opacity: 0.35,
        side: THREE.DoubleSide,
      });
      const beaconBeam = new THREE.Mesh(beamGeo, beamMat);
      beaconBeam.position.set(0, 28, 0);
      cGroup.add(beaconBeam);

      const starSprite = createBillboardText(`⭐ STAR CHEST (+${cl.stars})`, '#fef08a');
      starSprite.position.set(0, 4.6, 0);
      cGroup.add(starSprite);

      cGroup.position.set(cl.x, cl.y, cl.z);
      scene.add(cGroup);

      chests.push({
        mesh: cGroup,
        lid,
        opened: false,
        rewardStars: cl.stars,
        id: cl.id,
        respawnTimer: 0,
        beaconBeam,
        quizCooldown: 0,
      });
    });

    const starCoins: StarCoin3D[] = [];
    const coinPositions = [
      // Starter Town Plaza & Streets
      { x: 0, y: starterTopY + 2.0, z: 18 },
      { x: 0, y: starterTopY + 2.0, z: 32 },
      { x: 0, y: starterTopY + 2.0, z: 46 },
      { x: -14, y: starterTopY + 2.0, z: 0 },
      { x: 14, y: starterTopY + 2.0, z: 0 },
      { x: -18, y: starterTopY + 2.0, z: -16 },
      { x: 18, y: starterTopY + 2.0, z: -16 },
      { x: -28, y: starterTopY + 2.0, z: 12 },
      { x: 28, y: starterTopY + 2.0, z: 12 },
      { x: 0, y: starterTopY + 7.5, z: 0 }, // Atop monument
      { x: 0, y: starterTopY + 2.0, z: 62 }, // Harbor pier
      { x: 0, y: starterTopY + 2.0, z: 76 },
      // Jungle Island Paths & Ruins
      { x: jungleCenterX, y: jungleTopY + 2.0, z: jungleCenterZ + 18 },
      { x: jungleCenterX - 18, y: jungleTopY + 2.0, z: jungleCenterZ },
      { x: jungleCenterX + 18, y: jungleTopY + 2.0, z: jungleCenterZ },
      { x: jungleCenterX - 28, y: jungleTopY + 2.0, z: jungleCenterZ - 20 },
      { x: jungleCenterX + 28, y: jungleTopY + 2.0, z: jungleCenterZ + 20 },
      { x: jungleCenterX + 24, y: jungleTopY + 9.5, z: jungleCenterZ - 20 }, // Pyramid top
      { x: jungleCenterX - 14, y: jungleTopY + 2.0, z: jungleCenterZ + 28 },
      // Marineford Fortress Battlements
      { x: marineCenterX, y: marineTopY + 2.0, z: marineCenterZ + 12 },
      { x: marineCenterX - 16, y: marineTopY + 2.0, z: marineCenterZ },
      { x: marineCenterX + 16, y: marineTopY + 2.0, z: marineCenterZ },
      { x: marineCenterX, y: marineTopY + 5.5, z: marineCenterZ + 18 }, // Fortress wall
      { x: marineCenterX, y: marineTopY + 17.5, z: marineCenterZ - 10 }, // Keep roof
      { x: marineCenterX - 22, y: marineTopY + 2.0, z: marineCenterZ - 24 },
      // Alabasta Sand Dunes & Oasis
      { x: desertCenterX, y: desertTopY + 2.0, z: desertCenterZ + 25 },
      { x: desertCenterX, y: desertTopY + 2.0, z: desertCenterZ - 25 },
      { x: desertCenterX - 20, y: desertTopY + 2.0, z: desertCenterZ },
      { x: desertCenterX + 20, y: desertTopY + 2.0, z: desertCenterZ },
      { x: desertCenterX, y: desertTopY + 14.5, z: desertCenterZ }, // Pyramid summit
      { x: desertCenterX + 28, y: desertTopY + 2.0, z: desertCenterZ - 16 }, // Oasis
      { x: desertCenterX - 24, y: desertTopY + 2.0, z: desertCenterZ + 24 },
      // Skylands Cloud Sanctum
      { x: skyCenterX, y: skyTopY + 2.0, z: skyCenterZ + 20 },
      { x: skyCenterX, y: skyTopY + 2.0, z: skyCenterZ - 20 },
      { x: skyCenterX - 20, y: skyTopY + 2.0, z: skyCenterZ },
      { x: skyCenterX + 20, y: skyTopY + 2.0, z: skyCenterZ },
      { x: skyCenterX, y: skyTopY + 11.5, z: skyCenterZ }, // Golden bell
      { x: skyCenterX - 26, y: skyTopY + 2.0, z: skyCenterZ - 20 },
      { x: skyCenterX + 26, y: skyTopY + 2.0, z: skyCenterZ + 20 },
      // Frozen Ice Castle Island
      { x: frozenCenterX, y: frozenTopY + 15.5, z: frozenCenterZ }, // Palace roof
      { x: frozenCenterX - 18, y: frozenTopY + 2.0, z: frozenCenterZ + 12 },
      { x: frozenCenterX + 18, y: frozenTopY + 2.0, z: frozenCenterZ - 12 },
      // Magma Volcano Island
      { x: magmaCenterX, y: magmaTopY + 2.0, z: magmaCenterZ + 18 },
      { x: magmaCenterX - 18, y: magmaTopY + 2.0, z: magmaCenterZ - 12 },
      { x: magmaCenterX + 18, y: magmaTopY + 7.5, z: magmaCenterZ },
      // Haunted Ghost Bark Island
      { x: ghostCenterX, y: ghostTopY + 5.5, z: ghostCenterZ },
      { x: ghostCenterX - 16, y: ghostTopY + 2.0, z: ghostCenterZ - 10 },
      { x: ghostCenterX + 16, y: ghostTopY + 2.0, z: ghostCenterZ + 10 },
      // Gladiator Colosseum Island
      { x: arenaCenterX, y: arenaTopY + 2.0, z: arenaCenterZ },
      { x: arenaCenterX, y: arenaTopY + 5.5, z: arenaCenterZ - 18 }, // Throne
      { x: arenaCenterX + 18, y: arenaTopY + 2.0, z: arenaCenterZ + 12 },
      { x: arenaCenterX - 18, y: arenaTopY + 2.0, z: arenaCenterZ - 12 },
      // Onigashima Skull Peak (Nightmare)
      { x: onigashimaCenterX, y: onigashimaTopY + 2.0, z: onigashimaCenterZ + 20 },
      { x: onigashimaCenterX - 18, y: onigashimaTopY + 2.0, z: onigashimaCenterZ - 15 },
      { x: onigashimaCenterX + 18, y: onigashimaTopY + 2.0, z: onigashimaCenterZ - 15 },
      { x: onigashimaCenterX, y: onigashimaTopY + 16.0, z: onigashimaCenterZ }, // Skull top
      // Whole Cake Sweet Kingdom (Nightmare)
      { x: wholeCakeCenterX, y: wholeCakeTopY + 2.0, z: wholeCakeCenterZ + 20 },
      { x: wholeCakeCenterX - 18, y: wholeCakeTopY + 2.0, z: wholeCakeCenterZ - 15 },
      { x: wholeCakeCenterX + 18, y: wholeCakeTopY + 2.0, z: wholeCakeCenterZ - 15 },
      { x: wholeCakeCenterX, y: wholeCakeTopY + 18.0, z: wholeCakeCenterZ }, // Cake tier 3
      // Laugh Tale Void Temple (Nightmare)
      { x: laughTaleCenterX, y: laughTaleTopY + 2.0, z: laughTaleCenterZ + 20 },
      { x: laughTaleCenterX - 18, y: laughTaleTopY + 2.0, z: laughTaleCenterZ - 15 },
      { x: laughTaleCenterX + 18, y: laughTaleTopY + 2.0, z: laughTaleCenterZ - 15 },
      { x: laughTaleCenterX, y: laughTaleTopY + 8.0, z: laughTaleCenterZ },
    ];

    coinPositions.forEach((cl) => {
      const coinGroup = new THREE.Group();
      // 3D Faceted Star Coin Mesh
      const coinGeo = new THREE.CylinderGeometry(1.3, 1.3, 0.4, 8);
      const coinMat = new THREE.MeshStandardMaterial({
        color: '#facc15',
        emissive: '#ca8a04',
        emissiveIntensity: 0.8,
        metalness: 0.9,
        roughness: 0.2,
      });
      const coinMesh = new THREE.Mesh(coinGeo, coinMat);
      coinMesh.rotation.x = Math.PI / 2;
      coinGroup.add(coinMesh);

      // Raised Circular LEGO Studs on Front and Back of Coin
      const coinStudGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
      const studFront = new THREE.Mesh(coinStudGeo, coinMat);
      studFront.rotation.x = Math.PI / 2;
      studFront.position.z = 0.22;
      coinGroup.add(studFront);
      const studBack = new THREE.Mesh(coinStudGeo, coinMat);
      studBack.rotation.x = Math.PI / 2;
      studBack.position.z = -0.22;
      coinGroup.add(studBack);

      // Star Icon center relief atop stud
      const starIcon = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 0),
        new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#fef08a', emissiveIntensity: 1.0 })
      );
      starIcon.position.z = 0.25;
      coinGroup.add(starIcon);

      coinGroup.position.set(cl.x, cl.y, cl.z);
      scene.add(coinGroup);
      starCoins.push({ mesh: coinGroup, collected: false, respawnTimer: 0, originalY: cl.y, value: 1 });
    });

    // =========================================================================
    // 6. 3D ROBLOX BLOCKY PLAYER MODEL (Boy or Girl Selection)
    // =========================================================================
    const playerGroup = new THREE.Group();
    const genderModelGroup = new THREE.Group();
    playerGroup.add(genderModelGroup);

    let currentRenderedGender: 'boy' | 'girl' = 'boy';

    const buildPlayerGenderVisuals = (gender: 'boy' | 'girl') => {
      currentRenderedGender = gender;
      while (genderModelGroup.children.length > 0) {
        genderModelGroup.remove(genderModelGroup.children[0]);
      }

      if (gender === 'girl') {
        // --- GIRL PIRATE AVATAR ---
        // Stylish Ruby/Rose Cropped Jacket with Lace
        const vestMat = new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.5 });
        const girlTorso = new THREE.Mesh(new THREE.BoxGeometry(2.35, 2.7, 1.35), vestMat);
        girlTorso.position.y = 3.6;
        girlTorso.castShadow = true;
        genderModelGroup.add(girlTorso);

        // White Lace Collar / Cuffs Trim
        const laceMat = new THREE.MeshStandardMaterial({ color: '#fdf2f8', roughness: 0.6 });
        const collar = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.4, 1.42), laceMat);
        collar.position.set(0, 4.8, 0);
        genderModelGroup.add(collar);

        // Gold Buttons
        const buttonMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.2 });
        for (let b = 0; b < 3; b++) {
          const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 8), buttonMat);
          btn.rotation.x = Math.PI / 2;
          btn.position.set(0, 3.2 + b * 0.55, 0.72);
          genderModelGroup.add(btn);
        }

        // Gold Belt Buckle
        const gBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.4, 0.2), buttonMat);
        gBuckle.position.set(0, 2.5, 0.72);
        genderModelGroup.add(gBuckle);

        // LEGO Minifigure Neck (Ultra-shiny Yellow Plastic)
        const girlNeck = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.42, 0.35, 24),
          new THREE.MeshPhysicalMaterial({ color: '#facc15', roughness: 0.02, metalness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.02 })
        );
        girlNeck.position.y = 4.85;
        genderModelGroup.add(girlNeck);

        // LEGO Shoulder Studs on Vest
        const lStudG = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), vestMat);
        lStudG.position.set(-0.8, 5.0, 0);
        genderModelGroup.add(lStudG);
        const rStudG = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), vestMat);
        rStudG.position.set(0.8, 5.0, 0);
        genderModelGroup.add(rStudG);

        // Authentic Shiny Round LEGO Minifigure Head (Smooth Cylinder + Beveled Rims + Hollow Stud)
        const { headGroup: girlHeadGroup } = createShinyLegoHeadMesh('#facc15', true);
        genderModelGroup.add(girlHeadGroup);

        // Expressive Eyes with Eyelashes - Angled to Hug Round Cylinder Head
        const eyeMat = new THREE.MeshBasicMaterial({ color: '#09090b' });
        const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.35, 0.05), eyeMat);
        leftEye.rotation.y = -0.45;
        leftEye.position.set(-0.36, 5.9, 0.76);
        genderModelGroup.add(leftEye);

        const leftLash = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.06), eyeMat);
        leftLash.rotation.y = -0.45;
        leftLash.rotation.z = -0.2;
        leftLash.position.set(-0.38, 6.12, 0.76);
        genderModelGroup.add(leftLash);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.35, 0.05), eyeMat);
        rightEye.rotation.y = 0.45;
        rightEye.position.set(0.36, 5.9, 0.76);
        genderModelGroup.add(rightEye);

        const rightLash = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.08, 0.06), eyeMat);
        rightLash.rotation.y = 0.45;
        rightLash.rotation.z = 0.2;
        rightLash.position.set(0.38, 6.12, 0.76);
        genderModelGroup.add(rightLash);

        // Sweet Smile (Centered on Front Arc)
        const smile = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.12, 0.05), eyeMat);
        smile.position.set(0, 5.42, 0.83);
        genderModelGroup.add(smile);

        // Rosy Pink Cheeks (Angled on Round Cheeks)
        const blushMat = new THREE.MeshBasicMaterial({ color: '#f472b6', transparent: true, opacity: 0.85 });
        const leftBlush = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), blushMat);
        leftBlush.rotation.y = -0.62;
        leftBlush.position.set(-0.48, 5.6, 0.68);
        genderModelGroup.add(leftBlush);

        const rightBlush = new THREE.Mesh(new THREE.CircleGeometry(0.18, 16), blushMat);
        rightBlush.rotation.y = 0.62;
        rightBlush.position.set(0.48, 5.6, 0.68);
        genderModelGroup.add(rightBlush);

        // Twin-Tail Hairstyle (Rounded Cylinder Cap + Side Ponytails)
        const hairMat = new THREE.MeshPhysicalMaterial({ color: '#78350f', roughness: 0.1, clearcoat: 1.0, clearcoatRoughness: 0.04 });
        const hairTop = new THREE.Mesh(new THREE.CylinderGeometry(0.88, 0.88, 0.45, 32), hairMat);
        hairTop.position.set(0, 6.55, 0);
        genderModelGroup.add(hairTop);

        const bangs = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.5, 0.3), hairMat);
        bangs.position.set(0, 6.3, 0.8);
        genderModelGroup.add(bangs);

        // Left Ponytail
        const leftPony = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.15, 2.4, 16), hairMat);
        leftPony.rotation.z = 0.35;
        leftPony.position.set(-1.25, 5.6, -0.3);
        genderModelGroup.add(leftPony);

        // Right Ponytail
        const rightPony = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.15, 2.4, 16), hairMat);
        rightPony.rotation.z = -0.35;
        rightPony.position.set(1.25, 5.6, -0.3);
        genderModelGroup.add(rightPony);

        // Hair Ribbon Bows
        const bowMat = new THREE.MeshPhysicalMaterial({ color: '#ec4899', roughness: 0.08, clearcoat: 1.0 });
        const leftBow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), bowMat);
        leftBow.position.set(-1.0, 6.6, -0.2);
        genderModelGroup.add(leftBow);

        const rightBow = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.3, 0.3), bowMat);
        rightBow.position.set(1.0, 6.6, -0.2);
        genderModelGroup.add(rightBow);
      } else {
        // --- BOY PIRATE AVATAR ---
        const torsoMat = new THREE.MeshPhysicalMaterial({ color: '#dc2626', roughness: 0.08, metalness: 0.04, clearcoat: 1.0, clearcoatRoughness: 0.04 });
        const boyTorso = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.8, 1.4), torsoMat);
        boyTorso.position.y = 3.6;
        boyTorso.castShadow = true;
        genderModelGroup.add(boyTorso);

        // LEGO Shoulder Studs on Red Torso
        const lStudB = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), torsoMat);
        lStudB.position.set(-0.8, 5.0, 0);
        genderModelGroup.add(lStudB);
        const rStudB = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16), torsoMat);
        rStudB.position.set(0.8, 5.0, 0);
        genderModelGroup.add(rStudB);

        // Front Belt Buckle & Sash
        const sashMat = new THREE.MeshPhysicalMaterial({ color: '#eab308', roughness: 0.1, clearcoat: 0.8 });
        const sash = new THREE.Mesh(new THREE.BoxGeometry(2.45, 0.5, 1.45), sashMat);
        sash.position.set(0, 2.5, 0);
        genderModelGroup.add(sash);

        const buckleMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.1 });
        const buckle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.4, 0.2), buckleMat);
        buckle.position.set(0, 2.5, 0.74);
        genderModelGroup.add(buckle);

        // LEGO Minifigure Neck (Ultra-shiny Yellow Plastic)
        const boyNeck = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.42, 0.35, 24),
          new THREE.MeshPhysicalMaterial({ color: '#facc15', roughness: 0.02, metalness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.02 })
        );
        boyNeck.position.y = 4.85;
        genderModelGroup.add(boyNeck);

        // Authentic Shiny Round LEGO Minifigure Head (Bandana will sit on top with Stud)
        const { headGroup: boyHeadGroup } = createShinyLegoHeadMesh('#facc15', false);
        genderModelGroup.add(boyHeadGroup);

        // Face features - Angled to Hug the Round Cylinder Head
        const eyeMat = new THREE.MeshBasicMaterial({ color: '#09090b' });
        const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.05), eyeMat);
        leftEye.rotation.y = -0.45;
        leftEye.position.set(-0.36, 5.9, 0.76);
        genderModelGroup.add(leftEye);

        const leftBrow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.06), eyeMat);
        leftBrow.rotation.y = -0.45;
        leftBrow.rotation.z = 0.15;
        leftBrow.position.set(-0.36, 6.18, 0.76);
        genderModelGroup.add(leftBrow);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.35, 0.05), eyeMat);
        rightEye.rotation.y = 0.45;
        rightEye.position.set(0.36, 5.9, 0.76);
        genderModelGroup.add(rightEye);

        const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.06), eyeMat);
        rightBrow.rotation.y = 0.45;
        rightBrow.rotation.z = -0.15;
        rightBrow.position.set(0.36, 6.18, 0.76);
        genderModelGroup.add(rightBrow);

        const smile = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.15, 0.05), eyeMat);
        smile.position.set(0, 5.45, 0.83);
        genderModelGroup.add(smile);

        // Shiny Round Bandana Cap (Cylindrical to fit Round LEGO Head)
        const bandanaMat = new THREE.MeshPhysicalMaterial({ color: '#dc2626', roughness: 0.02, metalness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.02 });
        const bandana = new THREE.Mesh(
          new THREE.CylinderGeometry(0.88, 0.88, 0.55, 32),
          bandanaMat
        );
        bandana.position.y = 6.45;
        genderModelGroup.add(bandana);

        // Iconic LEGO Minifig Head Top Stud atop Bandana with Center Hollow Recess
        const headTopStud = new THREE.Mesh(
          new THREE.CylinderGeometry(0.38, 0.38, 0.32, 24),
          bandanaMat
        );
        headTopStud.position.y = 6.88;
        genderModelGroup.add(headTopStud);

        const studHoleMat = new THREE.MeshBasicMaterial({ color: '#09090b' });
        const studHole = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 0.04, 16),
          studHoleMat
        );
        studHole.position.y = 7.05;
        genderModelGroup.add(studHole);

        // Spiky front fringe
        const hairMat = new THREE.MeshPhysicalMaterial({ color: '#18181b', roughness: 0.1, clearcoat: 0.8 });
        const fringe = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.3, 0.25), hairMat);
        fringe.position.set(0, 6.2, 0.83);
        genderModelGroup.add(fringe);
      }
    };

    buildPlayerGenderVisuals(propsRef.current.playerGender || 'boy');

    // Arms with Ultra-Shiny Authentic LEGO Minifigure C-Claw Hands
    const armMat = new THREE.MeshPhysicalMaterial({ color: '#facc15', roughness: 0.05, metalness: 0.04, clearcoat: 1.0, clearcoatRoughness: 0.03 });
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-1.8, 4.8, 0);
    const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.0), armMat);
    leftArmMesh.position.y = -1.1;
    leftArmMesh.castShadow = true;
    leftArmGroup.add(leftArmMesh);
    
    // LEGO Minifigure Left Wrist + C-Claw Hand
    const leftWrist = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 12), armMat);
    leftWrist.position.y = -2.25;
    leftArmGroup.add(leftWrist);
    const leftHandClaw = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 8, 16, Math.PI * 1.4), armMat);
    leftHandClaw.rotation.y = Math.PI / 2;
    leftHandClaw.rotation.z = Math.PI * 0.25;
    leftHandClaw.position.set(0, -2.45, 0.1);
    leftArmGroup.add(leftHandClaw);
    playerGroup.add(leftArmGroup);

    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(1.8, 4.8, 0);
    const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.0), armMat);
    rightArmMesh.position.y = -1.1;
    rightArmMesh.castShadow = true;
    rightArmGroup.add(rightArmMesh);
    
    // LEGO Minifigure Right Wrist + C-Claw Hand
    const rightWrist = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 12), armMat);
    rightWrist.position.y = -2.25;
    rightArmGroup.add(rightWrist);
    const rightHandClaw = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 8, 16, Math.PI * 1.4), armMat);
    rightHandClaw.rotation.y = Math.PI / 2;
    rightHandClaw.rotation.z = Math.PI * 0.25;
    rightHandClaw.position.set(0, -2.45, 0.1);
    rightArmGroup.add(rightHandClaw);

    // Equipped 3D Sword on Right Arm
    const swordModel = new THREE.Group();
    rightArmGroup.add(swordModel);

    const buildSwordVisual = (swordId: string, isHaki: boolean) => {
      // Clear previous sword parts
      while (swordModel.children.length > 0) {
        swordModel.remove(swordModel.children[0]);
      }

      const bladeColor = isHaki ? '#09090b' : swordId === 'sword-dark-blade' ? '#09090b' : '#f8fafc';
      const bladeEmissive = isHaki ? '#581c87' : swordId === 'sword-dark-blade' ? '#052e16' : '#000000';
      const bladeRoughness = isHaki ? 0.05 : 0.1;

      const bladeMat = new THREE.MeshStandardMaterial({
        color: bladeColor,
        emissive: bladeEmissive,
        emissiveIntensity: isHaki ? 0.6 : 0.2,
        metalness: 0.95,
        roughness: bladeRoughness,
      });

      if (swordId === 'sword-dark-blade') {
        // Mihawk's Iconic Colossal Yoru (Cross-shaped Greatsword)
        const yoruBlade = new THREE.Mesh(new THREE.BoxGeometry(0.35, 7.5, 1.1), bladeMat);
        yoruBlade.position.y = 3.6;
        yoruBlade.castShadow = true;
        swordModel.add(yoruBlade);

        // Ornate Golden Crossguard
        const crossguard = new THREE.Mesh(
          new THREE.BoxGeometry(3.6, 0.5, 0.8),
          new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.85, roughness: 0.2 })
        );
        crossguard.position.y = 0.3;
        swordModel.add(crossguard);

        // Emerald Center Jewel
        const jewel = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 12, 12),
          new THREE.MeshStandardMaterial({ color: '#10b981', emissive: '#059669', emissiveIntensity: 1.2 })
        );
        jewel.position.set(0, 0.3, 0.45);
        swordModel.add(jewel);

        // Hilt with LEGO Pommel Stud
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 1.6),
          new THREE.MeshStandardMaterial({ color: '#78350f' })
        );
        handle.position.y = -0.7;
        swordModel.add(handle);

        const yoruPommel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.35, 0.25, 12),
          new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.85, roughness: 0.2 })
        );
        yoruPommel.position.y = -1.55;
        swordModel.add(yoruPommel);
      } else if (swordId === 'sword-pirate-cutlass') {
        // Pirate Captain Cutlass
        const cutlassBlade = new THREE.Mesh(new THREE.BoxGeometry(0.25, 4.8, 0.9), bladeMat);
        cutlassBlade.position.y = 2.4;
        cutlassBlade.castShadow = true;
        swordModel.add(cutlassBlade);

        // Brass Basket Guard
        const basket = new THREE.Mesh(
          new THREE.TorusGeometry(0.7, 0.15, 8, 16, Math.PI),
          new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.8 })
        );
        basket.rotation.z = Math.PI / 2;
        basket.position.set(0.3, 0.1, 0);
        swordModel.add(basket);

        // Hilt + LEGO Pommel Stud
        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.18, 0.18, 1.4),
          new THREE.MeshStandardMaterial({ color: '#1e293b' })
        );
        handle.position.y = -0.7;
        swordModel.add(handle);

        const cutlassPommel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.3, 0.3, 0.2, 12),
          new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.8 })
        );
        cutlassPommel.position.y = -1.45;
        swordModel.add(cutlassPommel);
      } else {
        // Standard Katana / Saber / True Triple Katana
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.22, 5.2, 0.75), bladeMat);
        blade.position.y = 2.5;
        blade.castShadow = true;
        swordModel.add(blade);

        const tsuba = new THREE.Mesh(
          new THREE.CylinderGeometry(0.65, 0.65, 0.15, 8),
          new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.8 })
        );
        tsuba.position.y = 0.1;
        swordModel.add(tsuba);

        const handle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.2, 0.2, 1.4),
          new THREE.MeshStandardMaterial({ color: '#0f172a' })
        );
        handle.position.y = -0.6;
        swordModel.add(handle);

        // LEGO Pommel Stud
        const katanaPommel = new THREE.Mesh(
          new THREE.CylinderGeometry(0.28, 0.28, 0.2, 12),
          new THREE.MeshStandardMaterial({ color: '#d97706', metalness: 0.8 })
        );
        katanaPommel.position.y = -1.35;
        swordModel.add(katanaPommel);
      }

      swordModel.position.set(0, -2.4, 0.4);
      swordModel.rotation.x = Math.PI / 4;
    };

    buildSwordVisual(propsRef.current.equippedSword.id, propsRef.current.hakiActive);
    playerGroup.add(rightArmGroup);

    // Legs
    const legMat = new THREE.MeshStandardMaterial({ color: '#1e3a8a', roughness: 0.8 });
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.7, 2.2, 0);
    const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4, 1.0), legMat);
    leftLegMesh.position.y = -1.2;
    leftLegMesh.castShadow = true;
    leftLegGroup.add(leftLegMesh);
    playerGroup.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.7, 2.2, 0);
    const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4, 1.0), legMat);
    rightLegMesh.position.y = -1.2;
    rightLegMesh.castShadow = true;
    rightLegGroup.add(rightLegMesh);
    playerGroup.add(rightLegGroup);

    // Cape Accessory
    const capeMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 3.8, 0.2),
      new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.9 })
    );
    capeMesh.rotation.x = 0.15;
    capeMesh.position.set(0, 3.4, -0.8);
    playerGroup.add(capeMesh);

    // Fruit Aura Light
    const auraLight = new THREE.PointLight(equippedFruit.glowColor, 2.5, 10);
    auraLight.position.set(0, 4, 0);
    playerGroup.add(auraLight);

    // 3D LEGO Blox Fruit Companion (Blocky fruit with 4 top studs & stem)
    const legoFruitGroup = new THREE.Group();
    legoFruitGroup.position.set(-1.6, 5.2, -0.6);
    const fruitCoreMat = new THREE.MeshStandardMaterial({
      color: equippedFruit.glowColor || '#f97316',
      emissive: equippedFruit.glowColor || '#ea580c',
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.05,
    });
    const fruitCore = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), fruitCoreMat);
    fruitCore.castShadow = true;
    legoFruitGroup.add(fruitCore);

    // 4 LEGO Studs atop the Fruit Brick
    for (let sx = -0.2; sx <= 0.2; sx += 0.4) {
      for (let sz = -0.2; sz <= 0.2; sz += 0.4) {
        const fStud = new THREE.Mesh(
          new THREE.CylinderGeometry(0.1, 0.1, 0.14, 10),
          fruitCoreMat
        );
        fStud.position.set(sx, 0.46, sz);
        legoFruitGroup.add(fStud);
      }
    }

    // Green Fruit Stem with decorative leaf
    const stemMat = new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.4 });
    const fStem = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8), stemMat);
    fStem.position.set(0, 0.58, 0);
    legoFruitGroup.add(fStem);
    const fLeaf = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 4), stemMat);
    fLeaf.rotation.z = -Math.PI / 3;
    fLeaf.position.set(0.12, 0.65, 0);
    legoFruitGroup.add(fLeaf);
    playerGroup.add(legoFruitGroup);

    playerGroup.position.set(0, starterTopY, 10);
    scene.add(playerGroup);

    // =========================================================================
    // 7. 3D ENEMIES (Bandits, Baboons, Marines, Desert, Sky & Bosses)
    // =========================================================================
    const enemies: Enemy3D[] = [];

    const spawnEnemy = (
      type: 'bandit' | 'baboon' | 'marine' | 'desert' | 'sky' | 'boss',
      name: string,
      x: number,
      z: number,
      hp: number,
      atk: number,
      speed: number,
      color: string,
      scale: number = 1.0,
      skillName: string = 'Heavy Strike',
      maxSkillCooldown: number = 10.0,
      posY: number = starterTopY
    ) => {
      const eGroup = new THREE.Group();
      eGroup.scale.set(scale, scale, scale);

      // 1. Torso
      const eTorsoMat = new THREE.MeshStandardMaterial({ color, roughness: 0.28, metalness: 0.05 });
      const eTorso = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 2.8, 1.4),
        eTorsoMat
      );
      eTorso.position.y = 3.6;
      eTorso.castShadow = true;
      eGroup.add(eTorso);

      // LEGO Shoulder Studs on Enemy Torso
      const eShoulderL = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12), eTorsoMat);
      eShoulderL.position.set(-0.8, 5.0, 0);
      eGroup.add(eShoulderL);
      const eShoulderR = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.18, 12), eTorsoMat);
      eShoulderR.position.set(0.8, 5.0, 0);
      eGroup.add(eShoulderR);

      // Belt
      const eBelt = new THREE.Mesh(
        new THREE.BoxGeometry(2.45, 0.4, 1.45),
        new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.8 })
      );
      eBelt.position.set(0, 2.4, 0);
      eGroup.add(eBelt);

      // 2. Ultra-Shiny Round LEGO Minifigure Head for Enemy (Seamless Lathe Geometry)
      const headColor =
        type === 'baboon'
          ? '#451a03'
          : type === 'desert'
          ? '#d97706'
          : type === 'marine' || type === 'bandit'
          ? '#fde047'
          : type === 'sky'
          ? '#fef08a'
          : '#ca8a04';

      const needsTopHat =
        type === 'bandit' ||
        type === 'marine' ||
        type === 'desert' ||
        (type === 'boss' &&
          (name.includes('GORILLA') ||
            name.includes('GARP') ||
            name.includes('CROCODILE') ||
            name.includes('ENEL') ||
            name.includes('AOKIJI') ||
            name.includes('AKAINU') ||
            name.includes('DOFLAMINGO') ||
            name.includes('BIG MOM') ||
            name.includes('IMU')));

      const { headGroup: eHeadGroup, shinyMat: eHeadMat } = createShinyLegoHeadMesh(
        headColor,
        !needsTopHat
      );
      eGroup.add(eHeadGroup);

      // LEGO Minifigure Neck on Enemy (Ultra-shiny matching plastic)
      const eNeck = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.35, 24), eHeadMat);
      eNeck.position.y = 4.85;
      eGroup.add(eNeck);

      // 3. FACES BY ENEMY TYPE
      const eyeMatDark = new THREE.MeshBasicMaterial({ color: '#09090b' });
      const eyeMatGlowRed = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#dc2626', emissiveIntensity: 1.2 });
      const eyeMatGlowCyan = new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 1.2 });

      if (type === 'bandit') {
        // --- PIRATE BANDIT FACE (Contoured on Round Shiny Head) ---
        const eyePatch = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.32, 0.06), eyeMatDark);
        eyePatch.rotation.y = -0.45;
        eyePatch.position.set(-0.36, 5.9, 0.76);
        eGroup.add(eyePatch);

        const patchStrap = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.04, 8, 32), eyeMatDark);
        patchStrap.rotation.x = Math.PI / 2;
        patchStrap.rotation.y = -0.12;
        patchStrap.position.set(0, 5.95, 0);
        eGroup.add(patchStrap);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.3, 0.05), eyeMatDark);
        rightEye.rotation.y = 0.45;
        rightEye.position.set(0.36, 5.9, 0.76);
        eGroup.add(rightEye);

        const rightBrow = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.08, 0.06), eyeMatDark);
        rightBrow.rotation.y = 0.45;
        rightBrow.rotation.z = -0.25;
        rightBrow.position.set(0.36, 6.15, 0.76);
        eGroup.add(rightBrow);

        const scowl = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.1, 0.05), eyeMatDark);
        scowl.rotation.z = 0.15;
        scowl.position.set(0, 5.4, 0.83);
        eGroup.add(scowl);

        // Shiny Round Bandana Cap with Top Stud
        const bandanaMat = new THREE.MeshPhysicalMaterial({ color: '#dc2626', roughness: 0.02, metalness: 0.02, clearcoat: 1.0, clearcoatRoughness: 0.02 });
        const bandana = new THREE.Mesh(
          new THREE.CylinderGeometry(0.88, 0.88, 0.5, 32),
          bandanaMat
        );
        bandana.position.set(0, 6.45, 0);
        eGroup.add(bandana);

        const bandanaStud = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.3, 24), bandanaMat);
        bandanaStud.position.set(0, 6.85, 0);
        eGroup.add(bandanaStud);

      } else if (type === 'baboon') {
        // --- JUNGLE BABOON FACE (Contoured on Round Shiny Head) ---
        const muzzle = new THREE.Mesh(
          new THREE.CylinderGeometry(0.55, 0.65, 0.6, 24),
          new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.8 })
        );
        muzzle.position.set(0, 5.5, 0.82);
        eGroup.add(muzzle);

        const nostrilMat = new THREE.MeshBasicMaterial({ color: '#1c1917' });
        const leftNostril = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.05), nostrilMat);
        leftNostril.position.set(-0.16, 5.52, 1.2);
        eGroup.add(leftNostril);

        const rightNostril = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.05), nostrilMat);
        rightNostril.position.set(0.16, 5.52, 1.2);
        eGroup.add(rightNostril);

        const fangMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
        const leftFang = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), fangMat);
        leftFang.position.set(-0.3, 5.75, 1.15);
        eGroup.add(leftFang);

        const rightFang = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.45, 6), fangMat);
        rightFang.position.set(0.3, 5.75, 1.15);
        eGroup.add(rightFang);

        const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.05), eyeMatGlowRed);
        leftEye.rotation.y = -0.45;
        leftEye.position.set(-0.36, 6.05, 0.76);
        eGroup.add(leftEye);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.05), eyeMatGlowRed);
        rightEye.rotation.y = 0.45;
        rightEye.position.set(0.36, 6.05, 0.76);
        eGroup.add(rightEye);

        const earMat = new THREE.MeshStandardMaterial({ color: '#78350f' });
        const leftEar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.3), earMat);
        leftEar.position.set(-0.95, 5.9, 0);
        eGroup.add(leftEar);
        const rightEar = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.3), earMat);
        rightEar.position.set(0.95, 5.9, 0);
        eGroup.add(rightEar);

      } else if (type === 'marine') {
        // --- MARINE SOLDIER FACE (Contoured on Round Shiny Head) ---
        const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.05), eyeMatDark);
        leftEye.rotation.y = -0.45;
        leftEye.position.set(-0.36, 5.85, 0.76);
        eGroup.add(leftEye);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.3, 0.05), eyeMatDark);
        rightEye.rotation.y = 0.45;
        rightEye.position.set(0.36, 5.85, 0.76);
        eGroup.add(rightEye);

        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.1, 0.05), eyeMatDark);
        mouth.position.set(0, 5.4, 0.83);
        eGroup.add(mouth);

        const capGroup = new THREE.Group();
        // Round naval peaked cap
        const capMat = new THREE.MeshPhysicalMaterial({ color: '#f8fafc', roughness: 0.02, metalness: 0.02, clearcoat: 1.0 });
        const capCrown = new THREE.Mesh(
          new THREE.CylinderGeometry(0.95, 0.86, 0.55, 32),
          capMat
        );
        capCrown.position.set(0, 6.55, 0);
        capGroup.add(capCrown);

        const capStud = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.28, 24), capMat);
        capStud.position.set(0, 6.95, 0);
        capGroup.add(capStud);

        // Curved naval visor
        const visor = new THREE.Mesh(
          new THREE.CylinderGeometry(0.98, 0.98, 0.1, 24, 1, false, -Math.PI / 3, (2 * Math.PI) / 3),
          new THREE.MeshPhysicalMaterial({ color: '#1e3a8a', roughness: 0.04, clearcoat: 0.9 })
        );
        visor.position.set(0, 6.25, 0.05);
        capGroup.add(visor);

        const badge = new THREE.Mesh(
          new THREE.OctahedronGeometry(0.18, 0),
          new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.1 })
        );
        badge.position.set(0, 6.6, 0.94);
        capGroup.add(badge);
        eGroup.add(capGroup);

        const epauletMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.8, roughness: 0.2 });
        const leftEp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 1.1), epauletMat);
        leftEp.position.set(-1.8, 4.9, 0);
        eGroup.add(leftEp);

        const rightEp = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.25, 1.1), epauletMat);
        rightEp.position.set(1.8, 4.9, 0);
        eGroup.add(rightEp);

      } else if (type === 'desert') {
        // --- DESERT RAIDER / ASSASSIN FACE (Contoured on Round Shiny Head) ---
        const turbanMat = new THREE.MeshStandardMaterial({ color: '#b45309', roughness: 0.7 });
        const turban = new THREE.Mesh(new THREE.CylinderGeometry(0.94, 0.88, 0.65, 32), turbanMat);
        turban.position.set(0, 6.5, 0);
        eGroup.add(turban);

        const turbanRoll = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.15, 12, 32), turbanMat);
        turbanRoll.rotation.x = Math.PI / 2;
        turbanRoll.position.set(0, 6.35, 0);
        eGroup.add(turbanRoll);

        const goggleMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.85, roughness: 0.2 });
        const goggleStrap = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.05, 8, 32), goggleMat);
        goggleStrap.rotation.x = Math.PI / 2;
        goggleStrap.position.set(0, 6.18, 0);
        eGroup.add(goggleStrap);

        const lensMat = new THREE.MeshStandardMaterial({ color: '#f59e0b', emissive: '#b45309', emissiveIntensity: 0.6, roughness: 0.1 });
        const leftLens = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), lensMat);
        leftLens.rotation.x = Math.PI / 2;
        leftLens.position.set(-0.35, 6.18, 0.82);
        eGroup.add(leftLens);

        const rightLens = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.1, 16), lensMat);
        rightLens.rotation.x = Math.PI / 2;
        rightLens.position.set(0.35, 6.18, 0.82);
        eGroup.add(rightLens);

        const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.05), eyeMatDark);
        leftEye.rotation.y = -0.45;
        leftEye.position.set(-0.36, 5.85, 0.76);
        eGroup.add(leftEye);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.15, 0.05), eyeMatDark);
        rightEye.rotation.y = 0.45;
        rightEye.position.set(0.36, 5.85, 0.76);
        eGroup.add(rightEye);

        // Curved Face Mask wrapping around cylinder
        const mask = new THREE.Mesh(
          new THREE.CylinderGeometry(0.86, 0.86, 0.55, 16, 1, false, -Math.PI / 3, (2 * Math.PI) / 3),
          new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.85 })
        );
        mask.position.set(0, 5.35, 0.05);
        eGroup.add(mask);

      } else if (type === 'sky') {
        // --- SKY SOLDIER FACE (Contoured on Round Shiny Head) ---
        const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.05), eyeMatGlowCyan);
        leftEye.rotation.y = -0.45;
        leftEye.position.set(-0.36, 5.9, 0.76);
        eGroup.add(leftEye);

        const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.32, 0.05), eyeMatGlowCyan);
        rightEye.rotation.y = 0.45;
        rightEye.position.set(0.36, 5.9, 0.76);
        eGroup.add(rightEye);

        const crownMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.1 });
        const circlet = new THREE.Mesh(new THREE.TorusGeometry(0.86, 0.08, 8, 32), crownMat);
        circlet.rotation.x = Math.PI / 2;
        circlet.position.set(0, 6.35, 0);
        eGroup.add(circlet);

        const leftWinglet = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.9, 4), crownMat);
        leftWinglet.rotation.z = -0.5;
        leftWinglet.position.set(-0.95, 6.7, 0);
        eGroup.add(leftWinglet);

        const rightWinglet = new THREE.Mesh(new THREE.ConeGeometry(0.25, 0.9, 4), crownMat);
        rightWinglet.rotation.z = 0.5;
        rightWinglet.position.set(0.95, 6.7, 0);
        eGroup.add(rightWinglet);

      } else if (type === 'boss') {
        // --- BOSS SPECIFIC FACES ---
        if (name.includes('GORILLA')) {
          // --- GORILLA KING TITAN (Contoured on Round Shiny Head) ---
          const muzzle = new THREE.Mesh(
            new THREE.CylinderGeometry(0.65, 0.75, 0.7, 24),
            new THREE.MeshStandardMaterial({ color: '#27272a', roughness: 0.8 })
          );
          muzzle.position.set(0, 5.5, 0.82);
          eGroup.add(muzzle);

          const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), eyeMatGlowRed);
          leftEye.rotation.y = -0.45;
          leftEye.position.set(-0.4, 6.1, 0.76);
          eGroup.add(leftEye);

          const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), eyeMatGlowRed);
          rightEye.rotation.y = 0.45;
          rightEye.position.set(0.4, 6.1, 0.76);
          eGroup.add(rightEye);

          const fangMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 });
          const lf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 6), fangMat);
          lf.position.set(-0.35, 5.9, 1.25);
          eGroup.add(lf);
          const rf = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 6), fangMat);
          rf.position.set(0.35, 5.9, 1.25);
          eGroup.add(rf);

          const crownGroup = new THREE.Group();
          const crownBase = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.9, 0.45, 24), new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.95, roughness: 0.1 }));
          crownBase.position.set(0, 6.8, 0);
          crownGroup.add(crownBase);
          for (let p = 0; p < 5; p++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.7, 4), new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.95, roughness: 0.1 }));
            const ang = (p * Math.PI * 2) / 5;
            spike.position.set(Math.cos(ang) * 0.85, 7.25, Math.sin(ang) * 0.85);
            crownGroup.add(spike);
          }
          const ruby = new THREE.Mesh(new THREE.OctahedronGeometry(0.25, 0), new THREE.MeshStandardMaterial({ color: '#dc2626', emissive: '#b91c1c', emissiveIntensity: 1.0 }));
          ruby.position.set(0, 7.0, 0.95);
          crownGroup.add(ruby);
          eGroup.add(crownGroup);

        } else if (name.includes('GARP')) {
          // --- VICE ADMIRAL GARP (Contoured on Round Shiny Head) ---
          const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.05), eyeMatGlowCyan);
          leftEye.rotation.y = -0.45;
          leftEye.position.set(-0.36, 5.95, 0.76);
          eGroup.add(leftEye);

          const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.3, 0.05), eyeMatGlowCyan);
          rightEye.rotation.y = 0.45;
          rightEye.position.set(0.36, 5.95, 0.76);
          eGroup.add(rightEye);

          const beard = new THREE.Mesh(
            new THREE.CylinderGeometry(0.86, 0.86, 0.55, 16, 1, false, -Math.PI / 3, (2 * Math.PI) / 3),
            new THREE.MeshStandardMaterial({ color: '#94a3b8', roughness: 0.8 })
          );
          beard.position.set(0, 5.25, 0.05);
          eGroup.add(beard);

          const hat = new THREE.Mesh(
            new THREE.CylinderGeometry(0.96, 0.88, 0.65, 32),
            new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, metalness: 0.02, clearcoat: 1.0 })
          );
          hat.position.set(0, 6.6, 0);
          eGroup.add(hat);

        } else if (name.includes('CROCODILE')) {
          // --- CROCODILE SAND LORD (Contoured on Round Shiny Head) ---
          const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.05), eyeMatDark);
          leftEye.rotation.y = -0.45;
          leftEye.position.set(-0.36, 5.95, 0.76);
          eGroup.add(leftEye);

          const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.05), eyeMatDark);
          rightEye.rotation.y = 0.45;
          rightEye.position.set(0.36, 5.95, 0.76);
          eGroup.add(rightEye);

          const scar = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 0.06), new THREE.MeshBasicMaterial({ color: '#7f1d1d' }));
          scar.position.set(0, 5.75, 0.83);
          eGroup.add(scar);

          const cigar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.6, 8), new THREE.MeshStandardMaterial({ color: '#78350f' }));
          cigar.rotation.x = Math.PI / 2;
          cigar.rotation.y = 0.3;
          cigar.position.set(0.45, 5.35, 0.85);
          eGroup.add(cigar);

          const hair = new THREE.Mesh(
            new THREE.CylinderGeometry(0.92, 0.86, 0.5, 32),
            new THREE.MeshPhysicalMaterial({ color: '#09090b', roughness: 0.04, clearcoat: 0.9 })
          );
          hair.position.set(0, 6.55, 0);
          eGroup.add(hair);

        } else if (name.includes('ENEL')) {
          // --- THUNDER GOD ENEL (Contoured on Round Shiny Head) ---
          const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.05), eyeMatGlowCyan);
          leftEye.rotation.y = -0.45;
          leftEye.position.set(-0.36, 5.9, 0.76);
          eGroup.add(leftEye);

          const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.3, 0.05), eyeMatGlowCyan);
          rightEye.rotation.y = 0.45;
          rightEye.position.set(0.36, 5.9, 0.76);
          eGroup.add(rightEye);

          const durag = new THREE.Mesh(
            new THREE.CylinderGeometry(0.9, 0.86, 0.55, 32),
            new THREE.MeshPhysicalMaterial({ color: '#f8fafc', roughness: 0.02, clearcoat: 1.0 })
          );
          durag.position.set(0, 6.5, 0);
          eGroup.add(durag);

          const earMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.95, roughness: 0.1 });
          const leftEarLobe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8), earMat);
          leftEarLobe.position.set(-0.95, 5.0, 0);
          eGroup.add(leftEarLobe);

          const rightEarLobe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.4, 8), earMat);
          rightEarLobe.position.set(0.95, 5.0, 0);
          eGroup.add(rightEarLobe);

        } else if (name.includes('AOKIJI')) {
          // --- ADMIRAL AOKIJI (Contoured on Round Shiny Head) ---
          const sleepMask = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.32, 0.1), new THREE.MeshStandardMaterial({ color: '#10b981' }));
          sleepMask.position.set(0, 6.2, 0.83);
          eGroup.add(sleepMask);

          const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.05), eyeMatGlowCyan);
          leftEye.rotation.y = -0.45;
          leftEye.position.set(-0.36, 5.85, 0.76);
          eGroup.add(leftEye);

          const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.2, 0.05), eyeMatGlowCyan);
          rightEye.rotation.y = 0.45;
          rightEye.position.set(0.36, 5.85, 0.76);
          eGroup.add(rightEye);

          const afro = new THREE.Mesh(
            new THREE.CylinderGeometry(0.98, 0.88, 0.65, 32),
            new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.9 })
          );
          afro.position.set(0, 6.6, 0);
          eGroup.add(afro);

        } else if (name.includes('AKAINU')) {
          // --- FLEET ADMIRAL AKAINU (Contoured on Round Shiny Head) ---
          const marineCap = new THREE.Mesh(
            new THREE.CylinderGeometry(0.98, 0.88, 0.55, 32),
            new THREE.MeshPhysicalMaterial({ color: '#ffffff', roughness: 0.02, clearcoat: 1.0 })
          );
          marineCap.position.set(0, 6.6, 0);
          eGroup.add(marineCap);

          const rose = new THREE.Mesh(new THREE.SphereGeometry(0.22, 8, 8), new THREE.MeshStandardMaterial({ color: '#dc2626', emissive: '#b91c1c', emissiveIntensity: 0.8 }));
          rose.position.set(0.65, 5.2, 0.8);
          eGroup.add(rose);

          const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), eyeMatDark);
          leftEye.rotation.y = -0.45;
          leftEye.position.set(-0.36, 5.9, 0.76);
          eGroup.add(leftEye);

          const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.15, 0.05), eyeMatDark);
          rightEye.rotation.y = 0.45;
          rightEye.position.set(0.36, 5.9, 0.76);
          eGroup.add(rightEye);

          const scowl = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.12, 0.05), eyeMatDark);
          scowl.position.set(0, 5.4, 0.83);
          eGroup.add(scowl);

        } else if (name.includes('GECKO')) {
          // --- SHADOW REAPER GECKO (Contoured on Round Shiny Head) ---
          const leftEye = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#ca8a04', emissiveIntensity: 1.2 }));
          leftEye.rotation.y = -0.45;
          leftEye.position.set(-0.36, 6.0, 0.76);
          eGroup.add(leftEye);

          const rightEye = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.05), new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#ca8a04', emissiveIntensity: 1.2 }));
          rightEye.rotation.y = 0.45;
          rightEye.position.set(0.36, 6.0, 0.76);
          eGroup.add(rightEye);

          const fangs = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.22, 0.1), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 }));
          fangs.position.set(0, 5.35, 0.83);
          eGroup.add(fangs);

          // Horns
          const hornMat = new THREE.MeshStandardMaterial({ color: '#7c3aed', roughness: 0.3 });
          const lh = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 5), hornMat);
          lh.rotation.z = -0.3;
          lh.position.set(-0.6, 6.9, 0.4);
          eGroup.add(lh);

          const rh = new THREE.Mesh(new THREE.ConeGeometry(0.22, 1.1, 5), hornMat);
          rh.rotation.z = 0.3;
          rh.position.set(0.6, 6.9, 0.4);
          eGroup.add(rh);

        } else if (name.includes('DOFLAMINGO')) {
          // --- HEAVENLY DEMON DOFLAMINGO (Contoured on Round Shiny Head) ---
          const redGlassesMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#dc2626', emissiveIntensity: 1.4 });
          const lg = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 3), redGlassesMat);
          lg.rotation.z = Math.PI / 2;
          lg.rotation.y = -0.45;
          lg.position.set(-0.36, 5.95, 0.82);
          eGroup.add(lg);

          const rg = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 3), redGlassesMat);
          rg.rotation.z = -Math.PI / 2;
          rg.rotation.y = 0.45;
          rg.position.set(0.36, 5.95, 0.82);
          eGroup.add(rg);

          const grin = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.18, 0.08), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 }));
          grin.position.set(0, 5.35, 0.84);
          eGroup.add(grin);

          const blondeHair = new THREE.Mesh(
            new THREE.CylinderGeometry(0.92, 0.86, 0.55, 32),
            new THREE.MeshPhysicalMaterial({ color: '#fde047', roughness: 0.04, clearcoat: 1.0 })
          );
          blondeHair.position.set(0, 6.55, 0);
          eGroup.add(blondeHair);

        } else if (name.includes('KAIDO')) {
          // --- EMPEROR KAIDO (Contoured on Round Shiny Head) ---
          const kHornMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2 });
          const lh = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 6), kHornMat);
          lh.rotation.z = -0.7;
          lh.rotation.x = -0.3;
          lh.position.set(-1.0, 7.2, 0.2);
          eGroup.add(lh);

          const rh = new THREE.Mesh(new THREE.ConeGeometry(0.35, 2.4, 6), kHornMat);
          rh.rotation.z = 0.7;
          rh.rotation.x = -0.3;
          rh.position.set(1.0, 7.2, 0.2);
          eGroup.add(rh);

          const mustache = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.18, 0.1), eyeMatDark);
          mustache.position.set(0, 5.3, 0.85);
          eGroup.add(mustache);

        } else if (name.includes('BIG MOM')) {
          // --- EMPRESS BIG MOM (Contoured on Round Shiny Head) ---
          const hatMat = new THREE.MeshStandardMaterial({ color: '#f43f5e', roughness: 0.5 });
          const hat = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.2, 1.2, 32), hatMat);
          hat.position.set(0, 6.9, 0);
          eGroup.add(hat);

          const skullBadge = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), new THREE.MeshStandardMaterial({ color: '#ffffff' }));
          skullBadge.position.set(0, 6.9, 0.95);
          eGroup.add(skullBadge);

          const lipstick = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.3, 0.1), new THREE.MeshStandardMaterial({ color: '#e11d48', roughness: 0.2 }));
          lipstick.position.set(0, 5.25, 0.84);
          eGroup.add(lipstick);

        } else if (name.includes('IMU')) {
          // --- IMU VOID SUPREME SOVEREIGN (Contoured on Round Shiny Head) ---
          const veilMat = new THREE.MeshStandardMaterial({ color: '#020617', roughness: 0.9 });
          const crownSpire = new THREE.Mesh(new THREE.ConeGeometry(1.2, 4.5, 16), veilMat);
          crownSpire.position.set(0, 8.5, 0);
          eGroup.add(crownSpire);

          const redEyeMat = new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#dc2626', emissiveIntensity: 2.8 });
          const le = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 8, 24), redEyeMat);
          le.rotation.y = -0.45;
          le.position.set(-0.36, 5.85, 0.78);
          eGroup.add(le);

          const re = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.07, 8, 24), redEyeMat);
          re.rotation.y = 0.45;
          re.position.set(0.36, 5.85, 0.78);
          eGroup.add(re);
        }
      }

      // 4. ARMS & LEGS (Animated for Walking / Attack)
      const armMat = new THREE.MeshStandardMaterial({ color: headColor, roughness: 0.6 });
      const legMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.8 });

      const leftArmGroup = new THREE.Group();
      leftArmGroup.position.set(-1.8, 4.8, 0);
      const leftArmMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.0), armMat);
      leftArmMesh.position.y = -1.1;
      leftArmMesh.castShadow = true;
      leftArmGroup.add(leftArmMesh);
      // LEGO Minifigure Left Wrist + C-Claw Hand
      const leftWrist = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 12), armMat);
      leftWrist.position.y = -2.25;
      leftArmGroup.add(leftWrist);
      const leftHandClaw = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 8, 16, Math.PI * 1.4), armMat);
      leftHandClaw.rotation.y = Math.PI / 2;
      leftHandClaw.rotation.z = Math.PI * 0.25;
      leftHandClaw.position.set(0, -2.45, 0.1);
      leftArmGroup.add(leftHandClaw);
      eGroup.add(leftArmGroup);

      const rightArmGroup = new THREE.Group();
      rightArmGroup.position.set(1.8, 4.8, 0);
      const rightArmMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.2, 1.0), armMat);
      rightArmMesh.position.y = -1.1;
      rightArmMesh.castShadow = true;
      rightArmGroup.add(rightArmMesh);
      // LEGO Minifigure Right Wrist + C-Claw Hand
      const rightWrist = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.2, 12), armMat);
      rightWrist.position.y = -2.25;
      rightArmGroup.add(rightWrist);
      const rightHandClaw = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.1, 8, 16, Math.PI * 1.4), armMat);
      rightHandClaw.rotation.y = Math.PI / 2;
      rightHandClaw.rotation.z = Math.PI * 0.25;
      rightHandClaw.position.set(0, -2.45, 0.1);
      rightArmGroup.add(rightHandClaw);
      eGroup.add(rightArmGroup);

      const leftLegGroup = new THREE.Group();
      leftLegGroup.position.set(-0.7, 2.2, 0);
      const leftLegMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4, 1.0), legMat);
      leftLegMesh.position.y = -1.2;
      leftLegMesh.castShadow = true;
      leftLegGroup.add(leftLegMesh);
      eGroup.add(leftLegGroup);

      const rightLegGroup = new THREE.Group();
      rightLegGroup.position.set(0.7, 2.2, 0);
      const rightLegMesh = new THREE.Mesh(new THREE.BoxGeometry(1.0, 2.4, 1.0), legMat);
      rightLegMesh.position.y = -1.2;
      rightLegMesh.castShadow = true;
      rightLegGroup.add(rightLegMesh);
      eGroup.add(rightLegGroup);

      // 5. EQUIPMENT & WEAPONS BY ENEMY TYPE
      if (type === 'bandit') {
        const bladeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', metalness: 0.9, roughness: 0.2 });
        const cutlass = new THREE.Mesh(new THREE.BoxGeometry(0.18, 3.8, 0.7), bladeMat);
        cutlass.position.set(0, -2.4, 0.8);
        cutlass.rotation.x = Math.PI / 4;
        rightArmGroup.add(cutlass);

        const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.15, 8), new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.8 }));
        guard.position.set(0, -2.4, 0.1);
        rightArmGroup.add(guard);

        const strap = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.35, 1.55), new THREE.MeshStandardMaterial({ color: '#78350f' }));
        strap.rotation.z = -0.45;
        strap.position.set(0, 3.6, 0);
        eGroup.add(strap);

      } else if (type === 'baboon') {
        const clubMat = new THREE.MeshStandardMaterial({ color: '#78350f', roughness: 0.9 });
        const club = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.25, 4.2, 8), clubMat);
        club.position.set(0, -2.6, 0.8);
        club.rotation.x = Math.PI / 4;
        rightArmGroup.add(club);

        const spikeMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.9 });
        for (let s = 0; s < 4; s++) {
          const spk = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.5, 4), spikeMat);
          spk.position.set(s % 2 === 0 ? 0.45 : -0.45, -2.0 - s * 0.4, 0.8);
          spk.rotation.z = s % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
          rightArmGroup.add(spk);
        }

        const boneMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4 });
        const necklace = new THREE.Mesh(new THREE.TorusGeometry(1.1, 0.12, 6, 12), boneMat);
        necklace.rotation.x = Math.PI / 2;
        necklace.position.set(0, 4.8, 0);
        eGroup.add(necklace);

      } else if (type === 'marine') {
        const rifleStock = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.2, 0.5), new THREE.MeshStandardMaterial({ color: '#78350f' }));
        rifleStock.position.set(0, -2.0, 0.6);
        rifleStock.rotation.x = Math.PI / 4;
        rightArmGroup.add(rifleStock);

        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 3.8, 8), new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.9 }));
        barrel.position.set(0, -1.2, 1.8);
        barrel.rotation.x = Math.PI / 4;
        rightArmGroup.add(barrel);

        const bayonet = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.4, 0.25), new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.95 }));
        bayonet.position.set(0, 0.3, 3.0);
        bayonet.rotation.x = Math.PI / 4;
        rightArmGroup.add(bayonet);

      } else if (type === 'desert') {
        const bladeMat = new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#ca8a04', emissiveIntensity: 0.5, metalness: 0.95, roughness: 0.2 });
        const scimitar = new THREE.Mesh(new THREE.BoxGeometry(0.18, 4.0, 0.8), bladeMat);
        scimitar.position.set(0, -2.4, 0.8);
        scimitar.rotation.x = Math.PI / 3.8;
        rightArmGroup.add(scimitar);

        const daggerMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.9 });
        const dag1 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.5, 0.3), daggerMat);
        dag1.position.set(-1.3, 2.5, 0);
        dag1.rotation.z = 0.3;
        eGroup.add(dag1);

        const dag2 = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.5, 0.3), daggerMat);
        dag2.position.set(-1.3, 2.5, -0.3);
        dag2.rotation.z = 0.3;
        eGroup.add(dag2);

      } else if (type === 'sky') {
        const spearShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 5.5, 8), new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.85 }));
        spearShaft.position.set(0, -1.8, 0.8);
        spearShaft.rotation.x = Math.PI / 4;
        rightArmGroup.add(spearShaft);

        const tridentHead = new THREE.Mesh(new THREE.ConeGeometry(0.35, 1.5, 4), new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.8 }));
        tridentHead.position.set(0, 0.5, 2.8);
        tridentHead.rotation.x = Math.PI / 4;
        rightArmGroup.add(tridentHead);

        const wingMat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.5 });
        const leftWing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 1.8), wingMat);
        leftWing.rotation.set(0.2, 0.4, -0.4);
        leftWing.position.set(-1.4, 4.2, -1.0);
        eGroup.add(leftWing);

        const rightWing = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3.5, 1.8), wingMat);
        rightWing.rotation.set(0.2, -0.4, 0.4);
        rightWing.position.set(1.4, 4.2, -1.0);
        eGroup.add(rightWing);

      } else if (type === 'boss') {
        if (name.includes('GORILLA')) {
          const mace = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.3, 5.5, 8), new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.9 }));
          mace.position.set(0, -2.8, 1.0);
          mace.rotation.x = Math.PI / 4;
          rightArmGroup.add(mace);

        } else if (name.includes('GARP')) {
          const hakiMat = new THREE.MeshStandardMaterial({ color: '#09090b', emissive: '#581c87', emissiveIntensity: 0.9, metalness: 0.95 });
          const leftGauntlet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), hakiMat);
          leftGauntlet.position.y = -2.0;
          leftArmGroup.add(leftGauntlet);

          const rightGauntlet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 1.2), hakiMat);
          rightGauntlet.position.y = -2.0;
          rightArmGroup.add(rightGauntlet);

          const coat = new THREE.Mesh(new THREE.BoxGeometry(3.6, 4.5, 0.4), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }));
          coat.position.set(0, 3.2, -1.0);
          coat.rotation.x = 0.12;
          eGroup.add(coat);

        } else if (name.includes('CROCODILE')) {
          const hookMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.95, roughness: 0.1, emissive: '#ca8a04', emissiveIntensity: 0.6 });
          const hook = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.22, 8, 16, Math.PI * 1.3), hookMat);
          hook.position.set(0, -2.2, 0.3);
          hook.rotation.z = Math.PI / 2;
          leftArmGroup.add(hook);

          const trench = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.6, 0.4), new THREE.MeshStandardMaterial({ color: '#1c1917', roughness: 0.8 }));
          trench.position.set(0, 3.2, -1.0);
          eGroup.add(trench);

        } else if (name.includes('ENEL')) {
          const staffMat = new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, emissive: '#ca8a04', emissiveIntensity: 0.5 });
          const staff = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 6.2, 8), staffMat);
          staff.position.set(0, -2.0, 0.8);
          staff.rotation.x = Math.PI / 4;
          rightArmGroup.add(staff);

          const drumRing = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.15, 8, 24), staffMat);
          drumRing.position.set(0, 4.8, -1.2);
          eGroup.add(drumRing);

          for (let d = 0; d < 4; d++) {
            const drum = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.45, 12), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.4 }));
            const ang = (d * Math.PI) / 2 + Math.PI / 4;
            drum.rotation.x = Math.PI / 2;
            drum.position.set(Math.cos(ang) * 2.4, 4.8 + Math.sin(ang) * 2.4, -1.2);
            eGroup.add(drum);
          }

        } else if (name.includes('AOKIJI')) {
          // --- ADMIRAL AOKIJI EQUIPMENT ---
          const iceBladeMat = new THREE.MeshStandardMaterial({
            color: '#a5f3fc',
            emissive: '#0284c7',
            emissiveIntensity: 0.8,
            transparent: true,
            opacity: 0.9,
            roughness: 0.1,
            metalness: 0.8,
          });
          const iceSaber = new THREE.Mesh(new THREE.BoxGeometry(0.2, 5.0, 0.8), iceBladeMat);
          iceSaber.position.set(0, -2.4, 0.8);
          iceSaber.rotation.x = Math.PI / 4;
          rightArmGroup.add(iceSaber);

          const marineCoat = new THREE.Mesh(
            new THREE.BoxGeometry(3.6, 4.5, 0.4),
            new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 })
          );
          marineCoat.position.set(0, 3.2, -1.0);
          marineCoat.rotation.x = 0.12;
          eGroup.add(marineCoat);

        } else if (name.includes('AKAINU')) {
          // --- FLEET ADMIRAL AKAINU EQUIPMENT ---
          const magmaGauntletMat = new THREE.MeshStandardMaterial({
            color: '#ea580c',
            emissive: '#dc2626',
            emissiveIntensity: 1.6,
            roughness: 0.4,
          });
          const magmaFist = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.6), magmaGauntletMat);
          magmaFist.position.y = -2.2;
          rightArmGroup.add(magmaFist);

          const magmaSpikes = new THREE.Mesh(
            new THREE.ConeGeometry(0.35, 1.2, 5),
            new THREE.MeshStandardMaterial({ color: '#f97316', emissive: '#ea580c', emissiveIntensity: 1.2 })
          );
          magmaSpikes.rotation.z = Math.PI / 2;
          magmaSpikes.position.set(0.9, -2.2, 0);
          rightArmGroup.add(magmaSpikes);

          const coat = new THREE.Mesh(
            new THREE.BoxGeometry(3.6, 4.5, 0.4),
            new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 })
          );
          coat.position.set(0, 3.2, -1.0);
          coat.rotation.x = 0.12;
          eGroup.add(coat);

        } else if (name.includes('GECKO')) {
          // --- SHADOW REAPER GECKO EQUIPMENT ---
          const scytheShaft = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 6.5, 8),
            new THREE.MeshStandardMaterial({ color: '#09090b', roughness: 0.9 })
          );
          scytheShaft.position.set(0, -1.6, 0.8);
          scytheShaft.rotation.x = Math.PI / 4;
          rightArmGroup.add(scytheShaft);

          const scytheBlade = new THREE.Mesh(
            new THREE.RingGeometry(0.8, 2.8, 16, 1, 0, Math.PI * 0.6),
            new THREE.MeshStandardMaterial({ color: '#c084fc', emissive: '#9333ea', emissiveIntensity: 1.2, side: THREE.DoubleSide })
          );
          scytheBlade.position.set(0, 1.2, 3.2);
          scytheBlade.rotation.y = Math.PI / 2;
          rightArmGroup.add(scytheBlade);

          const vampireCape = new THREE.Mesh(
            new THREE.BoxGeometry(3.8, 5.0, 0.4),
            new THREE.MeshStandardMaterial({ color: '#3b0764', roughness: 0.8 })
          );
          vampireCape.position.set(0, 3.2, -1.0);
          vampireCape.rotation.x = 0.15;
          eGroup.add(vampireCape);

        } else if (name.includes('DOFLAMINGO')) {
          // --- HEAVENLY DEMON DOFLAMINGO EQUIPMENT ---
          const pinkFeatherMat = new THREE.MeshStandardMaterial({ color: '#f472b6', roughness: 0.8 });
          const featherCoat = new THREE.Mesh(new THREE.BoxGeometry(4.2, 4.8, 1.4), pinkFeatherMat);
          featherCoat.position.set(0, 3.4, -0.6);
          eGroup.add(featherCoat);

          for (let f = 0; f < 6; f++) {
            const featherTuft = new THREE.Mesh(new THREE.SphereGeometry(0.65, 8, 8), pinkFeatherMat);
            featherTuft.position.set((f % 2 === 0 ? 2.1 : -2.1), 4.8 - Math.floor(f / 2) * 1.4, -0.6);
            eGroup.add(featherTuft);
          }

          // String Blade Hand
          const stringMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
          for (let s = 0; s < 5; s++) {
            const strBlade = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 3.5, 4), stringMat);
            strBlade.position.set(-0.35 + s * 0.18, -2.4, 1.0);
            strBlade.rotation.x = Math.PI / 3.5;
            rightArmGroup.add(strBlade);
          }

        } else if (name.includes('KAIDO')) {
          // --- EMPEROR KAIDO SPIKED KANABO CLUB ---
          const kanaboMat = new THREE.MeshStandardMaterial({ color: '#09090b', metalness: 0.95, roughness: 0.1 });
          const club = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.35, 6.5, 8), kanaboMat);
          club.position.set(0, -2.2, 1.2);
          club.rotation.x = Math.PI / 4;
          rightArmGroup.add(club);

          const spikeMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0', metalness: 0.9 });
          for (let sp = 0; sp < 6; sp++) {
            const spike = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.6, 4), spikeMat);
            spike.position.set((sp % 2 === 0 ? 0.6 : -0.6), -1.0 - sp * 0.5, 1.2);
            spike.rotation.z = sp % 2 === 0 ? Math.PI / 2 : -Math.PI / 2;
            rightArmGroup.add(spike);
          }

        } else if (name.includes('BIG MOM')) {
          // --- EMPRESS BIG MOM NAPOLEON FLAME SABER ---
          const napoleonMat = new THREE.MeshStandardMaterial({ color: '#facc15', emissive: '#ea580c', emissiveIntensity: 1.5, metalness: 0.9 });
          const blade = new THREE.Mesh(new THREE.BoxGeometry(0.3, 5.5, 1.2), napoleonMat);
          blade.position.set(0, -2.6, 1.0);
          blade.rotation.x = Math.PI / 4;
          rightArmGroup.add(blade);

          const sunOrb = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 10, 10),
            new THREE.MeshStandardMaterial({ color: '#f97316', emissive: '#ea580c', emissiveIntensity: 2.2 })
          );
          sunOrb.position.set(-2.8, 6.0, 0);
          eGroup.add(sunOrb);

          const cloudOrb = new THREE.Mesh(
            new THREE.SphereGeometry(1.2, 10, 10),
            new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 1.8 })
          );
          cloudOrb.position.set(2.8, 6.0, 0);
          eGroup.add(cloudOrb);

        } else if (name.includes('IMU')) {
          // --- IMU VOID SUPREME CAPE & ASTRAL HALO ---
          const voidCape = new THREE.Mesh(
            new THREE.BoxGeometry(4.5, 6.5, 0.4),
            new THREE.MeshStandardMaterial({ color: '#020617', roughness: 0.95 })
          );
          voidCape.position.set(0, 3.2, -1.2);
          voidCape.rotation.x = 0.12;
          eGroup.add(voidCape);

          const halo = new THREE.Mesh(
            new THREE.TorusGeometry(2.5, 0.15, 8, 24),
            new THREE.MeshStandardMaterial({ color: '#ef4444', emissive: '#dc2626', emissiveIntensity: 2.2 })
          );
          halo.rotation.x = Math.PI / 2;
          halo.position.set(0, 9.2, 0);
          eGroup.add(halo);
        }
      }

      // Billboard HP Bar
      const hpSprite = createBillboardHpBar(hp, hp, name);
      hpSprite.position.set(0, 7.8, 0);
      eGroup.add(hpSprite);

      eGroup.position.set(x, posY, z);
      scene.add(eGroup);

      enemies.push({
        mesh: eGroup,
        type,
        hp,
        maxHp: hp,
        isBoss: type === 'boss',
        name,
        speed,
        atk,
        patrolCenter: new THREE.Vector3(x, posY, z),
        patrolRadius: type === 'boss' ? 22 : 15,
        hpBarMesh: hpSprite,
        state: 'idle',
        attackCooldown: 0,
        skillCooldown: 4.0 + Math.random() * 4.0,
        maxSkillCooldown,
        skillName,
        skillCastTimer: 0,
        isCasting: false,
        telegraphMesh: null,
        respawnTimer: 0,
        originalScale: scale,
        takeHitAnim: 0,
        leftArm: leftArmGroup,
        rightArm: rightArmGroup,
        leftLeg: leftLegGroup,
        rightLeg: rightLegGroup,
        walkCycleAnim: 0,
      });
    };

    // =========================================================================
    // 7. ISLAND-BY-ISLAND ENEMY & BOSS SPAWNS (CATEGORIZED: EASY TO NIGHTMARE)
    // Minions and bosses levels increase per island!
    // =========================================================================
    // 🟢 CATEGORY 1: EASY (MADALI)
    // --- Island 1: Starter Pirate Town (Lvl 1 - 10) ---
    spawnEnemy('bandit', '[Lvl 3] Rookie Bandit 1', -26, -30, 180, 12, 4.2, '#475569', 1.0, 'Bandit Blade Rush', 9.0);
    spawnEnemy('bandit', '[Lvl 4] Rookie Bandit 2', 26, -30, 180, 12, 4.2, '#475569', 1.0, 'Bandit Blade Rush', 9.0);
    spawnEnemy('bandit', '[Lvl 5] Pirate Marauder', -30, 15, 220, 15, 4.4, '#334155', 1.1, 'Pirate Cutlass Slash', 8.5);
    spawnEnemy('bandit', '[Lvl 5] Pirate Swordsman', 30, 15, 240, 16, 4.5, '#334155', 1.1, 'Pirate Cutlass Slash', 8.5);
    spawnEnemy('boss', '👑 [Lvl 10 BOSS] BANDIT KING BUGGY (EASY)', 0, -32, 1200, 32, 4.8, '#dc2626', 2.0, 'CHOP-CHOP CANNON BARRAGE', 10.0);

    // --- Island 2: Jungle of Primates (Lvl 15 - 35) ---
    spawnEnemy('baboon', '[Lvl 15] Wild Baboon Fighter 1', jungleCenterX - 18, jungleCenterZ - 10, 360, 24, 5.0, '#78350f', 1.1, 'Primal Ground Pound', 8.0);
    spawnEnemy('baboon', '[Lvl 16] Wild Baboon Fighter 2', jungleCenterX + 18, jungleCenterZ - 10, 360, 24, 5.0, '#78350f', 1.1, 'Primal Ground Pound', 8.0);
    spawnEnemy('baboon', '[Lvl 20] Jungle Alpha Ape', jungleCenterX, jungleCenterZ + 20, 480, 30, 5.2, '#451a03', 1.3, 'Ape Seismic Slam', 7.5);
    spawnEnemy('boss', '👑 [Lvl 35 BOSS] GORILLA KING TITAN (EASY)', jungleCenterX, jungleCenterZ, 2200, 52, 5.6, '#18181b', 2.3, 'TITAN ROAR & EARTHQUAKE', 11.0);

    // 🟡 CATEGORY 2: MEDIUM (KATAMTAMAN)
    // --- Island 3: Marineford Fortress (Lvl 45 - 75) ---
    spawnEnemy('marine', '[Lvl 45] Elite Marine Guard 1', marineCenterX - 14, marineCenterZ + 8, 600, 40, 5.0, '#1d4ed8', 1.1, 'Triple Marine Volley', 8.0);
    spawnEnemy('marine', '[Lvl 48] Elite Marine Guard 2', marineCenterX + 14, marineCenterZ + 8, 600, 40, 5.0, '#1d4ed8', 1.1, 'Triple Marine Volley', 8.0);
    spawnEnemy('marine', '[Lvl 55] Marine Captain Smoker', marineCenterX - 10, marineCenterZ - 14, 900, 52, 5.2, '#0f172a', 1.4, 'White Smoke Blow', 9.0);
    spawnEnemy('boss', '👑 [Lvl 75 BOSS] VICE ADMIRAL GARP (MEDIUM)', marineCenterX, marineCenterZ - 14, 3800, 80, 5.6, '#1e3a8a', 2.3, 'FIST OF LOVE & ICE GLACIER', 11.5);

    // --- Island 4: Alabasta Sand Dunes (Lvl 75 - 110) ---
    spawnEnemy('desert', '[Lvl 75] Desert Sand Bandit 1', desertCenterX - 18, desertCenterZ - 12, 850, 55, 5.0, '#b45309', 1.1, 'Desert Sandstorm', 8.5);
    spawnEnemy('desert', '[Lvl 78] Desert Sand Bandit 2', desertCenterX + 18, desertCenterZ - 12, 850, 55, 5.0, '#b45309', 1.1, 'Desert Sandstorm', 8.5);
    spawnEnemy('desert', '[Lvl 85] Desert Assassin Raider', desertCenterX, desertCenterZ + 22, 1100, 65, 5.3, '#78350f', 1.2, 'Quicksand Ambush', 8.0);
    spawnEnemy('boss', '👑 [Lvl 110 BOSS] CROCODILE SAND LORD (MEDIUM)', desertCenterX, desertCenterZ, 5200, 110, 5.6, '#451a03', 2.3, 'DESERT SPADA SAND BLADES', 11.0);

    // 🟠 CATEGORY 3: HARD (MAHIRAP)
    // --- Island 5: Skylands Cloud Sanctum (Lvl 125 - 170) ---
    spawnEnemy('sky', '[Lvl 125] Sky Cloud Soldier 1', skyCenterX - 16, skyCenterZ + 14, 1350, 80, 5.2, '#0284c7', 1.1, 'Cloud Lightning Spear', 8.0, skyTopY);
    spawnEnemy('sky', '[Lvl 130] Sky Cloud Soldier 2', skyCenterX + 16, skyCenterZ + 14, 1350, 80, 5.2, '#0284c7', 1.1, 'Cloud Lightning Spear', 8.0, skyTopY);
    spawnEnemy('sky', '[Lvl 140] Angelic Sky Spearman', skyCenterX, skyCenterZ - 18, 1700, 95, 5.5, '#4338ca', 1.3, 'Thunder Javelin', 8.0, skyTopY);
    spawnEnemy('boss', '⚡ [Lvl 170 BOSS] THUNDER GOD ENEL (HARD)', skyCenterX, skyCenterZ, 7500, 150, 6.0, '#eab308', 2.4, 'EL THOR DIVINE THUNDER', 10.5, skyTopY);

    // --- Island 6: Frozen Ice Castle (Lvl 155 - 210) ---
    spawnEnemy('marine', '[Lvl 155] Frost Ice Knight 1', frozenCenterX - 16, frozenCenterZ + 12, 1800, 105, 5.0, '#0284c7', 1.1, 'Glacial Blade Slash', 8.0, frozenTopY);
    spawnEnemy('marine', '[Lvl 160] Frost Ice Knight 2', frozenCenterX + 16, frozenCenterZ + 12, 1800, 105, 5.0, '#0284c7', 1.1, 'Glacial Blade Slash', 8.0, frozenTopY);
    spawnEnemy('boss', '👑 [Lvl 210 BOSS] ADMIRAL AOKIJI (HARD)', frozenCenterX, frozenCenterZ, 9500, 185, 5.8, '#0369a1', 2.3, 'ICE AGE GLACIAL ERUPTION', 11.0, frozenTopY);

    // 🔴 CATEGORY 4: EXPERT (DALUBHASA)
    // --- Island 7: Magma Caldera Volcano (Lvl 220 - 290) ---
    spawnEnemy('marine', '[Lvl 220] Magma Hound Knight 1', magmaCenterX - 16, magmaCenterZ + 12, 2600, 140, 5.0, '#ea580c', 1.1, 'Magma Fist Volley', 8.0, magmaTopY);
    spawnEnemy('marine', '[Lvl 230] Magma Hound Knight 2', magmaCenterX + 16, magmaCenterZ + 12, 2600, 140, 5.0, '#ea580c', 1.1, 'Magma Fist Volley', 8.0, magmaTopY);
    spawnEnemy('boss', '👑 [Lvl 290 BOSS] FLEET ADMIRAL AKAINU (EXPERT)', magmaCenterX, magmaCenterZ, 13500, 235, 5.8, '#c2410c', 2.4, 'GREAT ERUPTION HELLFIRE HOUND', 11.0, magmaTopY);

    // --- Island 8: Haunted Ghost Bark (Lvl 270 - 360) ---
    spawnEnemy('bandit', '[Lvl 270] Shadow Zombie Pirate 1', ghostCenterX - 14, ghostCenterZ - 10, 3400, 170, 4.8, '#475569', 1.1, 'Spectral Cutlass Slash', 8.0, ghostTopY);
    spawnEnemy('bandit', '[Lvl 280] Shadow Zombie Pirate 2', ghostCenterX + 14, ghostCenterZ - 10, 3400, 170, 4.8, '#475569', 1.1, 'Spectral Cutlass Slash', 8.0, ghostTopY);
    spawnEnemy('boss', '👑 [Lvl 360 BOSS] SHADOW REAPER GECKO (EXPERT)', ghostCenterX, ghostCenterZ, 16500, 275, 5.8, '#1e1b4b', 2.4, 'SHADOW BRICK SCYTHE SLICE', 11.0, ghostTopY);

    // --- Island 9: Gladiator Arena (Lvl 330 - 430) ---
    spawnEnemy('desert', '[Lvl 330] Royal Gladiator Champion 1', arenaCenterX - 16, arenaCenterZ + 10, 4400, 210, 5.2, '#ca8a04', 1.2, 'Gladiator Shield Slam', 7.5, arenaTopY);
    spawnEnemy('desert', '[Lvl 340] Royal Gladiator Champion 2', arenaCenterX + 16, arenaCenterZ + 10, 4400, 210, 5.2, '#ca8a04', 1.2, 'Gladiator Shield Slam', 7.5, arenaTopY);
    spawnEnemy('boss', '👑 [Lvl 430 BOSS] HEAVENLY DEMON DOFLAMINGO (EXPERT)', arenaCenterX, arenaCenterZ, 20000, 320, 6.0, '#db2777', 2.3, 'OVERHEAT STRING GUILLOTINE', 10.5, arenaTopY);

    // 🟣 CATEGORY 5: NIGHTMARE (BANGUNGOT / PINAKAMAHIRAP)
    // --- Island 10: Onigashima Skull Peak (Lvl 520 - 750) ---
    spawnEnemy('bandit', '[Lvl 520] Oni Beast Berserker 1', onigashimaCenterX - 16, onigashimaCenterZ + 12, 7200, 320, 5.2, '#581c87', 1.3, 'Demonic Horn Charge', 7.5, onigashimaTopY);
    spawnEnemy('bandit', '[Lvl 550] Oni Beast Berserker 2', onigashimaCenterX + 16, onigashimaCenterZ + 12, 7600, 340, 5.2, '#581c87', 1.3, 'Demonic Horn Charge', 7.5, onigashimaTopY);
    spawnEnemy('boss', '🐉 [Lvl 750 BOSS] EMPEROR KAIDO DRAGON TYRANT (NIGHTMARE)', onigashimaCenterX, onigashimaCenterZ, 34000, 490, 6.2, '#1e1b4b', 2.6, 'THUNDER BAGUA & BLAST BREATH', 10.0, onigashimaTopY);

    // --- Island 11: Whole Cake Sweet Kingdom (Lvl 650 - 900) ---
    spawnEnemy('marine', '[Lvl 650] Sweet Chess Homie 1', wholeCakeCenterX - 16, wholeCakeCenterZ + 12, 10500, 400, 5.4, '#f43f5e', 1.3, 'Candy Cane Smash', 7.5, wholeCakeTopY);
    spawnEnemy('marine', '[Lvl 680] Sweet Chess Homie 2', wholeCakeCenterX + 16, wholeCakeCenterZ + 12, 11000, 420, 5.4, '#f43f5e', 1.3, 'Candy Cane Smash', 7.5, wholeCakeTopY);
    spawnEnemy('boss', '🎂 [Lvl 900 BOSS] EMPRESS BIG MOM SOUL QUEEN (NIGHTMARE)', wholeCakeCenterX, wholeCakeCenterZ, 45000, 600, 6.0, '#be185d', 2.6, 'IKOKU SOVEREIGNTY & HEAVENLY FIRE', 10.0, wholeCakeTopY);

    // --- Island 12: Ang Lihim na Pulo ng Raftel / Laugh Tale (Lvl 820 - 1200) ---
    spawnEnemy('sky', '[Lvl 820] Void Astral Guardian 1', laughTaleCenterX - 16, laughTaleCenterZ + 12, 15000, 520, 5.6, '#0284c7', 1.4, 'Celestial Void Cleave', 7.0, laughTaleTopY);
    spawnEnemy('sky', '[Lvl 860] Void Astral Guardian 2', laughTaleCenterX + 16, laughTaleCenterZ + 12, 16500, 550, 5.6, '#0284c7', 1.4, 'Celestial Void Cleave', 7.0, laughTaleTopY);
    spawnEnemy('boss', '👁️ [Lvl 1200 BOSS] IMU VOID SUPREME SOVEREIGN (NIGHTMARE GOD)', laughTaleCenterX, laughTaleCenterZ, 70000, 780, 6.4, '#0f172a', 2.8, 'MOTHER FLAME VOID ANNIHILATION', 9.5, laughTaleTopY);

    // Boss rewards calculator
    const getBossStarReward = (bossName: string): number => {
      if (bossName.includes('IMU')) return 600;
      if (bossName.includes('BIG MOM')) return 450;
      if (bossName.includes('KAIDO')) return 350;
      if (bossName.includes('DOFLAMINGO')) return 220;
      if (bossName.includes('GECKO')) return 190;
      if (bossName.includes('AKAINU')) return 160;
      if (bossName.includes('AOKIJI')) return 140;
      if (bossName.includes('ENEL')) return 120;
      if (bossName.includes('CROCODILE')) return 95;
      if (bossName.includes('GARP')) return 75;
      if (bossName.includes('GORILLA')) return 55;
      return 40; // Buggy
    };

    const getBossExpReward = (bossName: string): number => {
      if (bossName.includes('IMU')) return 20000;
      if (bossName.includes('BIG MOM')) return 14000;
      if (bossName.includes('KAIDO')) return 10000;
      if (bossName.includes('DOFLAMINGO')) return 4000;
      if (bossName.includes('GECKO')) return 3200;
      if (bossName.includes('AKAINU')) return 2600;
      if (bossName.includes('AOKIJI')) return 2000;
      if (bossName.includes('ENEL')) return 1600;
      if (bossName.includes('CROCODILE')) return 1200;
      if (bossName.includes('GARP')) return 900;
      if (bossName.includes('GORILLA')) return 650;
      return 400; // Buggy
    };

    // Helper: Boss Defeat Spawns Glowing 3D Boss Chest
    const dropBossChest = (x: number, y: number, z: number, bossName: string) => {
      const bossId = `boss-drop-${Date.now()}`;
      const cGroup = new THREE.Group();
      cGroup.scale.set(1.4, 1.4, 1.4);

      // Epic Chest Base
      const baseMat = new THREE.MeshStandardMaterial({
        color: '#dc2626',
        metalness: 0.7,
        roughness: 0.3,
        emissive: '#991b1b',
        emissiveIntensity: 0.4,
      });
      const base = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.8, 2.4), baseMat);
      base.position.y = 0.9;
      cGroup.add(base);

      // Gold Trim
      const goldTrim = new THREE.Mesh(
        new THREE.BoxGeometry(3.5, 0.4, 2.5),
        new THREE.MeshStandardMaterial({ color: '#facc15', metalness: 0.9, roughness: 0.2 })
      );
      goldTrim.position.y = 1.0;
      cGroup.add(goldTrim);

      // Chest Lid
      const lidGeo = new THREE.CylinderGeometry(1.2, 1.2, 3.4, 16, 1, false, 0, Math.PI);
      const lidMat = new THREE.MeshStandardMaterial({
        color: '#b91c1c',
        metalness: 0.6,
        roughness: 0.3,
        emissive: '#7f1d1d',
        emissiveIntensity: 0.3,
      });
      const lid = new THREE.Mesh(lidGeo, lidMat);
      lid.rotation.z = Math.PI / 2;
      lid.position.set(0, 1.8, -1.2);
      cGroup.add(lid);

      // Towering Golden Beacon Beam shooting up to sky
      const beamGeo = new THREE.CylinderGeometry(0.8, 2.0, 85, 16);
      const beamMat = new THREE.MeshBasicMaterial({
        color: '#facc15',
        transparent: true,
        opacity: 0.45,
        side: THREE.DoubleSide,
      });
      const beaconBeam = new THREE.Mesh(beamGeo, beamMat);
      beaconBeam.position.set(0, 42, 0);
      cGroup.add(beaconBeam);

      const bossStars = getBossStarReward(bossName);
      const bossClean = bossName.replace(/👑|⚡|🐉|🎂|👁️|\[.*?\]|\(.*?\)/g, '').trim().slice(0, 18);
      const starSprite = createBillboardText(`🎁 ${bossClean} CHEST (+${bossStars} ⭐)`, '#fef08a');
      starSprite.position.set(0, 4.6, 0);
      cGroup.add(starSprite);

      cGroup.position.set(x, y, z);
      scene.add(cGroup);

      chests.push({
        mesh: cGroup,
        lid,
        opened: false,
        rewardStars: bossStars,
        id: bossId,
        respawnTimer: 0,
        beaconBeam,
        quizCooldown: 0,
      });

      spawnFloatingDamage(new THREE.Vector3(x, y + 2, z), '🎁 BOSS CHEST DROPPED!', '#facc15', true);
      spawnSparkBurst(new THREE.Vector3(x, y + 2, z), 24, '#facc15', 18, 'star');
      playBattleVictorySound();
    };

    // =========================================================================
    // 8. COMBAT ACTIVE EFFECTS, PARTICLES & FLOATING DAMAGE TEXTS (Optimized for 0-Lag)
    // =========================================================================
    const activeEffects: ActiveEffect3D[] = [];
    const particles: SparkParticle[] = [];

    // Pre-allocated shared geometry and material cache to eliminate heap GC & lag
    const sharedSparkGeo = new THREE.BoxGeometry(0.35, 0.35, 0.35);
    const sharedOctaGeo = new THREE.OctahedronGeometry(0.38, 0);
    const sharedTetraGeo = new THREE.TetrahedronGeometry(0.42, 0);

    // Common shared skill geometry pool to eliminate runtime memory allocation
    const skillGeoCache = {
      sphereSm: new THREE.SphereGeometry(1.2, 10, 10),
      sphereMd: new THREE.SphereGeometry(2.8, 12, 12),
      sphereLg: new THREE.SphereGeometry(5.5, 14, 14),
      coneSm: new THREE.ConeGeometry(0.6, 2.5, 8),
      coneMd: new THREE.ConeGeometry(1.5, 5.0, 8),
      coneLg: new THREE.ConeGeometry(3.0, 9.0, 8),
      cylinderSm: new THREE.CylinderGeometry(0.35, 0.35, 6.0, 8),
      cylinderMd: new THREE.CylinderGeometry(0.9, 0.9, 12.0, 8),
      cylinderBeam: new THREE.CylinderGeometry(0.65, 0.65, 42.0, 8),
      torusSm: new THREE.TorusGeometry(2.8, 0.28, 6, 18),
      torusMd: new THREE.TorusGeometry(5.5, 0.38, 6, 22),
      torusLg: new THREE.TorusGeometry(9.0, 0.48, 6, 26),
      ringSm: new THREE.RingGeometry(1.8, 3.8, 18),
      ringMd: new THREE.RingGeometry(3.5, 7.5, 22),
      ringLg: new THREE.RingGeometry(6.0, 12.0, 24),
      octa: new THREE.OctahedronGeometry(1.2, 0),
      boxSm: new THREE.BoxGeometry(1.2, 1.2, 1.2),
      boxMd: new THREE.BoxGeometry(3.0, 1.8, 4.5),
      boxLg: new THREE.BoxGeometry(6.5, 2.5, 8.0),
      icosa: new THREE.IcosahedronGeometry(4.0, 1),
      dodeca: new THREE.DodecahedronGeometry(2.2, 0),
    };

    // Mark shared geometries so disposeHierarchy does not destroy static cache
    Object.values(skillGeoCache).forEach((g) => {
      g.userData = { keepShared: true };
    });
    sharedSparkGeo.userData = { keepShared: true };
    sharedOctaGeo.userData = { keepShared: true };
    sharedTetraGeo.userData = { keepShared: true };

    // Deep hierarchy and GPU buffer disposal helper to eliminate WebGL memory leaks
    const disposeHierarchy = (obj: THREE.Object3D) => {
      obj.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          if (mesh.geometry && !mesh.geometry.userData?.keepShared) {
            mesh.geometry.dispose();
          }
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => {
              if (!m.userData?.keepShared) m.dispose();
            });
          } else if (mesh.material && !mesh.material.userData?.keepShared) {
            mesh.material.dispose();
          }
        }
      });
    };

    // Pre-allocated persistent skill point light pool (added ONCE, never triggers shader recompile)
    const MAX_SKILL_LIGHTS = 4;
    const skillLightPool: THREE.PointLight[] = [];
    for (let i = 0; i < MAX_SKILL_LIGHTS; i++) {
      const pLight = new THREE.PointLight('#ffffff', 0, 32);
      pLight.visible = false;
      scene.add(pLight);
      skillLightPool.push(pLight);
    }
    let nextLightIndex = 0;

    const borrowSkillLight = (color: string, intensity: number = 4.0, distance: number = 32): THREE.PointLight => {
      const light = skillLightPool[nextLightIndex];
      nextLightIndex = (nextLightIndex + 1) % MAX_SKILL_LIGHTS;
      light.color.set(color);
      light.intensity = intensity;
      light.distance = distance;
      light.visible = true;
      return light;
    };

    const returnSkillLight = (light?: THREE.PointLight | null) => {
      if (!light) return;
      light.intensity = 0;
      light.visible = false;
    };

    const sparkMatCache = new Map<string, THREE.MeshBasicMaterial>();
    const getSparkMaterial = (color: string) => {
      let mat = sparkMatCache.get(color);
      if (!mat) {
        mat = new THREE.MeshBasicMaterial({ color });
        sparkMatCache.set(color, mat);
      }
      return mat;
    };

    // Pre-allocated damage sprite pool to eliminate GC & runtime texture re-uploads
    const TEXT_POOL_SIZE = 8;
    const damageSpritePool: {
      sprite: THREE.Sprite;
      canvas: HTMLCanvasElement;
      ctx: CanvasRenderingContext2D;
      texture: THREE.CanvasTexture;
      inUse: boolean;
      lifetime: number;
      maxLifetime: number;
      velocity: THREE.Vector3;
    }[] = [];

    for (let i = 0; i < TEXT_POOL_SIZE; i++) {
      const cvs = document.createElement('canvas');
      cvs.width = 256;
      cvs.height = 80;
      const c = cvs.getContext('2d')!;
      const tex = new THREE.CanvasTexture(cvs);
      const sMat = new THREE.SpriteMaterial({ map: tex, transparent: true });
      const sp = new THREE.Sprite(sMat);
      sp.scale.set(5.5, 1.8, 1);
      sp.visible = false;
      scene.add(sp);
      damageSpritePool.push({
        sprite: sp,
        canvas: cvs,
        ctx: c,
        texture: tex,
        inUse: false,
        lifetime: 0,
        maxLifetime: 0.85,
        velocity: new THREE.Vector3(),
      });
    }

    // Spawn 3D Floating Damage Number (Pool-based, Zero GC lag)
    const spawnFloatingDamage = (
      pos: THREE.Vector3,
      text: string,
      color: string = '#facc15',
      isCrit: boolean = false
    ) => {
      let entry = damageSpritePool.find((e) => !e.inUse);
      if (!entry) {
        entry = damageSpritePool.reduce((min, e) => (e.lifetime < min.lifetime ? e : min), damageSpritePool[0]);
      }
      entry.inUse = true;
      entry.lifetime = 0.85;
      entry.maxLifetime = 0.85;
      entry.velocity.set((Math.random() - 0.5) * 2.0, 4.5, (Math.random() - 0.5) * 2.0);

      const ctx = entry.ctx;
      ctx.clearRect(0, 0, 256, 80);
      ctx.font = `bold ${isCrit ? '40px' : '32px'} sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineWidth = 5;
      ctx.strokeStyle = '#000000';
      ctx.strokeText(text, 128, 40);
      ctx.fillStyle = color;
      ctx.fillText(text, 128, 40);

      entry.texture.needsUpdate = true;
      entry.sprite.position.copy(pos).add(new THREE.Vector3((Math.random() - 0.5) * 1.5, 5.5, (Math.random() - 0.5) * 1.5));
      entry.sprite.material.opacity = 1.0;
      entry.sprite.visible = true;
    };

    // Spawn Flashy Spark Burst Particles with Shared Geometry & Core Glow (With strict budget cap)
    const spawnSparkBurst = (
      center: THREE.Vector3,
      count: number,
      color: string,
      speed: number = 14,
      style: 'spark' | 'star' | 'ice' | 'smoke' = 'spark'
    ) => {
      // Keep active particle count under 45 to eliminate CPU/GPU stutter
      while (particles.length > 45) {
        const oldest = particles.shift();
        if (oldest) scene.remove(oldest.mesh);
      }

      const pMat = getSparkMaterial(color);
      const whiteMat = getSparkMaterial('#ffffff');
      const geo = style === 'star' ? sharedOctaGeo : style === 'ice' ? sharedTetraGeo : sharedSparkGeo;
      const spawnLimit = Math.min(count, 16); // High-impact particle count without micro-stutter
      for (let i = 0; i < spawnLimit; i++) {
        const useWhite = Math.random() < 0.28;
        const pMesh = new THREE.Mesh(geo, useWhite ? whiteMat : pMat);
        pMesh.position.copy(center).add(new THREE.Vector3((Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8));
        scene.add(pMesh);

        const dir = new THREE.Vector3(
          (Math.random() - 0.5) * 2,
          Math.random() * 1.8 + 0.2,
          (Math.random() - 0.5) * 2
        ).normalize();

        particles.push({
          mesh: pMesh,
          velocity: dir.multiplyScalar(Math.random() * speed + speed * 0.5),
          lifetime: 0.38 + Math.random() * 0.22,
          maxLifetime: 0.55,
        });
      }
    };

    // Anime Cross-Slash Flash on Hit
    const spawnAnimeSlashImpact = (pos: THREE.Vector3, color: string, isCrit: boolean = false) => {
      const slashGroup = new THREE.Group();
      const bladeLen = isCrit ? 6.2 : 4.2;
      const bladeW = isCrit ? 0.38 : 0.22;

      const geo = new THREE.PlaneGeometry(bladeLen, bladeW);
      const mat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: 0.98 });
      const m1 = new THREE.Mesh(geo, mat);
      m1.rotation.z = Math.PI / 4;
      slashGroup.add(m1);

      const m2 = new THREE.Mesh(geo, mat.clone());
      m2.rotation.z = -Math.PI / 4;
      slashGroup.add(m2);

      const auraGeo = new THREE.PlaneGeometry(bladeLen * 1.25, bladeW * 2.4);
      const auraMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const a1 = new THREE.Mesh(auraGeo, auraMat);
      a1.rotation.z = Math.PI / 4;
      slashGroup.add(a1);

      const a2 = new THREE.Mesh(auraGeo, auraMat.clone());
      a2.rotation.z = -Math.PI / 4;
      slashGroup.add(a2);

      slashGroup.position.copy(pos);
      slashGroup.lookAt(camera.position);
      scene.add(slashGroup);

      activeEffects.push({
        mesh: slashGroup,
        type: 'decal',
        velocity: new THREE.Vector3(0, 0, 0),
        lifetime: 0.16,
        maxLifetime: 0.16,
        damage: 0,
        aoeRadius: 0,
        color,
        effectType: 'slash_impact',
        hasHit: new Set(),
        onUpdate: (dt, eff) => {
          const ratio = Math.max(0, eff.lifetime / eff.maxLifetime);
          slashGroup.scale.multiplyScalar(1.0 + dt * 2.6);
          mat.opacity = ratio;
          auraMat.opacity = ratio * 0.85;
        },
        onExpire: () => {
          scene.remove(slashGroup);
          slashGroup.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
                else obj.material.dispose();
              }
            }
          });
        },
      });
    };

    // Camera Screen Shake System for Kinetic Anime Impact
    let cameraShakeTime = 0;
    let cameraShakeMagnitude = 0;
    const triggerCameraShake = (magnitude: number = 0.8, duration: number = 0.32) => {
      cameraShakeMagnitude = magnitude;
      cameraShakeTime = duration;
    };

    // Web Audio API Elemental Sound Synthesizer with Distinct Profiles
    const playElementalSkillSound = (effectType: string, skillKey: string) => {
      try {
        const ctx = getSkillAudioCtx();
        if (!ctx) return;
        const now = ctx.currentTime;
        if (skillKey === 'V') {
          // Deep cinematic bass drop + rumbling supernova choir
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          osc1.type = 'sawtooth';
          osc1.frequency.setValueAtTime(150, now);
          osc1.frequency.exponentialRampToValueAtTime(22, now + 0.7);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(80, now);
          osc2.frequency.exponentialRampToValueAtTime(18, now + 0.8);

          gain.gain.setValueAtTime(0.45, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);
          osc1.start(now);
          osc2.start(now);
          osc1.stop(now + 0.9);
          osc2.stop(now + 0.9);
        } else if (effectType === 'light') {
          // High-energy laser beam screech & prism chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.exponentialRampToValueAtTime(220, now + 0.3);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.34);
        } else if (effectType === 'ice') {
          // Crystalline ice freeze / glass shatter chime
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1050, now);
          osc.frequency.exponentialRampToValueAtTime(360, now + 0.32);
          gain.gain.setValueAtTime(0.32, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.38);
        } else if (effectType === 'dark' || effectType === 'portal') {
          // Cosmic space warp frequency glide
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(480, now);
          osc.frequency.exponentialRampToValueAtTime(70, now + 0.4);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
        } else if (effectType === 'explosion') {
          // Heavy concussive detonation boom
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(110, now);
          osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.52);
        } else {
          // Fiery whoosh / blast
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(280, now);
          osc.frequency.exponentialRampToValueAtTime(48, now + 0.35);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.45);
        }
      } catch {}
    };

    // Dynamic Real-time Light for Projectiles & Detonations (Pre-allocated pool, zero shader recompiles)
    const spawnDynamicSkillLight = (color: string, intensity: number = 4.0, distance: number = 32): THREE.PointLight => {
      return borrowSkillLight(color, intensity, distance);
    };

    // Muzzle Flare & Casting Magic Sigil at Player Hands
    const spawnCastingMuzzleBurst = (pos: THREE.Vector3, color: string, radius: number = 2.4) => {
      const mGroup = new THREE.Group();

      // Outer glowing rune ring
      const ringGeo = new THREE.RingGeometry(radius * 0.65, radius, 28);
      const ringMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      mGroup.add(ringMesh);

      // Inner white-hot core diamond/star
      const coreGeo = new THREE.RingGeometry(0.3, radius * 0.45, 4);
      const coreMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: 0.98 });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      mGroup.add(coreMesh);

      // Second angled rune square
      const sqGeo = new THREE.RingGeometry(radius * 0.35, radius * 0.5, 4);
      const sqMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.85 });
      const sqMesh = new THREE.Mesh(sqGeo, sqMat);
      sqMesh.rotation.z = Math.PI / 4;
      mGroup.add(sqMesh);

      mGroup.position.copy(pos);
      mGroup.lookAt(camera.position);
      scene.add(mGroup);

      spawnSparkBurst(pos, 16, color, 14, 'star');

      const castLight = spawnDynamicSkillLight(color, 5.5, 22);
      castLight.position.copy(pos);

      activeEffects.push({
        mesh: mGroup,
        type: 'decal',
        velocity: new THREE.Vector3(0, 0, 0),
        lifetime: 0.24,
        maxLifetime: 0.24,
        damage: 0,
        aoeRadius: 0,
        color,
        effectType: 'muzzle',
        hasHit: new Set(),
        light: castLight,
        onUpdate: (dt, eff) => {
          const progress = eff.lifetime / eff.maxLifetime;
          mGroup.scale.multiplyScalar(1.0 + dt * 4.2);
          mGroup.rotation.z += dt * 5.0;
          ringMat.opacity = progress * 0.95;
          coreMat.opacity = progress * 0.98;
          sqMat.opacity = progress * 0.85;
        },
        onExpire: () => {
          scene.remove(mGroup);
          mGroup.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
                else obj.material.dispose();
              }
            }
          });
        },
      });
    };

    // Expanding Ground Decal / Rupture Crater Ring with Radial Fractures
    const spawnGroundRuptureDecal = (center: THREE.Vector3, color: string, radius: number = 8.0, duration: number = 0.75) => {
      const grp = new THREE.Group();
      const gY = getGroundHeight(center.x, center.z) + 0.12;

      // Outer glowing shockwave ring
      const outerGeo = new THREE.RingGeometry(radius * 0.6, radius, 32);
      const outerMat = new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const outerMesh = new THREE.Mesh(outerGeo, outerMat);
      outerMesh.rotation.x = -Math.PI / 2;
      grp.add(outerMesh);

      // Inner white-hot impact core ring
      const innerGeo = new THREE.RingGeometry(0.5, radius * 0.45, 24);
      const innerMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: 0.95 });
      const innerMesh = new THREE.Mesh(innerGeo, innerMat);
      innerMesh.rotation.x = -Math.PI / 2;
      grp.add(innerMesh);

      // 4 Radial ground fracture lines
      for (let f = 0; f < 4; f++) {
        const fAng = (f / 4) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
        const lineGeo = new THREE.PlaneGeometry(radius * 0.95, 0.45);
        const lineMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
        const lineMesh = new THREE.Mesh(lineGeo, lineMat);
        lineMesh.rotation.x = -Math.PI / 2;
        lineMesh.rotation.z = fAng;
        grp.add(lineMesh);
      }

      grp.position.set(center.x, gY, center.z);
      scene.add(grp);

      activeEffects.push({
        mesh: grp,
        type: 'decal',
        velocity: new THREE.Vector3(0, 0, 0),
        lifetime: duration,
        maxLifetime: duration,
        damage: 0,
        aoeRadius: 0,
        color,
        effectType: 'ground_decal',
        hasHit: new Set(),
        onUpdate: (dt, eff) => {
          const p = eff.lifetime / eff.maxLifetime;
          grp.scale.multiplyScalar(1.0 + dt * 0.9);
          outerMat.opacity = p * 0.85;
          innerMat.opacity = p * 0.95;
        },
        onExpire: (eff) => {
          scene.remove(eff.mesh);
          eff.mesh.traverse((obj) => {
            if (obj instanceof THREE.Mesh) {
              if (obj.geometry) obj.geometry.dispose();
              if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
                else obj.material.dispose();
              }
            }
          });
        },
      });
    };

    // Calculate Aim Vector (Snap towards nearest enemy in front if nearby)
    const getAimDirection = (): THREE.Vector3 => {
      const playerPos = playerGroup.position;
      const rawForward = new THREE.Vector3(
        Math.sin(playerGroup.rotation.y),
        0,
        Math.cos(playerGroup.rotation.y)
      ).normalize();

      let bestTarget: Enemy3D | null = null;
      let minAngle = Math.PI * 0.4; // 72 degree cone

      enemies.forEach((enemy) => {
        if (enemy.hp <= 0) return;
        const toEnemy = enemy.mesh.position.clone().sub(playerPos);
        const dist = toEnemy.length();
        if (dist > 35) return;

        toEnemy.y = 0;
        toEnemy.normalize();
        const angle = rawForward.angleTo(toEnemy);
        if (angle < minAngle) {
          minAngle = angle;
          bestTarget = enemy;
        }
      });

      if (bestTarget) {
        const toTarget = bestTarget.mesh.position.clone().sub(playerPos);
        toTarget.y = 0;
        toTarget.normalize();
        // Turn character towards target for attack
        playerGroup.rotation.y = Math.atan2(toTarget.x, toTarget.z);
        return toTarget;
      }

      return rawForward;
    };

    // Apply Hit to an Enemy
    const applyDamageToEnemy = (
      enemy: Enemy3D,
      damageAmount: number,
      knockbackDir: THREE.Vector3,
      color: string,
      isCrit: boolean = false,
      isHaki: boolean = false
    ) => {
      if (enemy.hp <= 0) return;

      const dmg = Math.max(1, Math.round(damageAmount));
      enemy.hp = Math.max(0, enemy.hp - dmg);
      enemy.takeHitAnim = 0.25;
      updateEnemyHpBar(enemy);

      // Knockback
      enemy.mesh.position.add(knockbackDir.clone().multiplyScalar(isCrit ? 3.5 : 2.0));

      // Visual Spark Burst & Anime Slash Impact
      const hitPos = enemy.mesh.position.clone().add(new THREE.Vector3(0, 3.5, 0));
      spawnSparkBurst(hitPos, isCrit ? 24 : 14, color, isCrit ? 18 : 12, isCrit ? 'star' : 'spark');
      spawnAnimeSlashImpact(hitPos, color, isCrit);

      // Floating Damage Text
      const label = isCrit ? `CRIT! -${dmg}` : isHaki ? `HAKI! -${dmg}` : `-${dmg}`;
      spawnFloatingDamage(enemy.mesh.position, label, isCrit ? '#ef4444' : isHaki ? '#c084fc' : color, isCrit);

      if (isCrit) {
        playCriticalHitSound();
      }

      if (enemy.hp === 0) {
        enemy.state = 'dead';
        enemy.respawnTimer = enemy.isBoss ? 25.0 : 12.0;
        enemy.mesh.visible = false;

        if (enemy.isBoss) {
          // BOSS SLAIN: Drop Epic Glowing Boss Chest!
          dropBossChest(
            enemy.mesh.position.x,
            enemy.mesh.position.y + 0.5,
            enemy.mesh.position.z,
            enemy.name
          );
          propsRef.current.onEnemyDefeated(
            enemy.type,
            true,
            getBossStarReward(enemy.name),
            getBossExpReward(enemy.name)
          );
        } else {
          // COMMON FOES GIVE NO REWARDS OR CHESTS! (Only Bosses drop chest)
          spawnFloatingDamage(enemy.mesh.position, '💀 FOE DEFEATED (Walang drop)', '#94a3b8', false);
          propsRef.current.onEnemyDefeated(
            enemy.type,
            false,
            0,
            0
          );
        }
      }
    };

    // Point-blank melee sweep check
    const checkMeleeHitInCone = (fwd: THREE.Vector3, radius: number, baseDmg: number, color: string) => {
      const playerPos = playerGroup.position;
      let hitAny = false;

      enemies.forEach((enemy) => {
        if (enemy.hp <= 0) return;
        const dist = playerPos.distanceTo(enemy.mesh.position);
        if (dist <= radius) {
          const toEnemy = enemy.mesh.position.clone().sub(playerPos).normalize();
          if (fwd.dot(toEnemy) > 0.2) {
            hitAny = true;
            const isCrit = Math.random() < 0.25;
            const isHaki = propsRef.current.hakiActive;
            const multiplier = (isCrit ? 1.6 : 1.0) * (isHaki ? 1.35 : 1.0);
            applyDamageToEnemy(enemy, baseDmg * multiplier, toEnemy, color, isCrit, isHaki);
          }
        }
      });

      return hitAny;
    };

    // Sword Slash Wave VFX Creator
    const spawnSwordSlashWave = () => {
      let slashColor = '#38bdf8';
      const isHaki = propsRef.current.hakiActive;
      const swordId = propsRef.current.equippedSword.id;

      if (isHaki) {
        slashColor = '#c084fc';
      } else if (swordId === 'sword-dark-blade') {
        slashColor = '#22c55e'; // Iconic Mihawk Green Wave
      } else if (swordId === 'sword-saber') {
        slashColor = '#f43f5e';
      } else if (swordId === 'sword-triple-katana') {
        slashColor = '#06b6d4';
      } else if (swordId === 'sword-pirate-cutlass') {
        slashColor = '#facc15';
      }

      const fwd = getAimDirection();
      const waveGroup = new THREE.Group();

      // 1. Outer curved glowing blade crescent arc
      const arcGeo = new THREE.RingGeometry(2.0, 5.8, 36, 1, -Math.PI * 0.42, Math.PI * 0.84);
      const arcMat = new THREE.MeshBasicMaterial({
        color: slashColor,
        transparent: true,
        opacity: 0.92,
        side: THREE.DoubleSide,
      });
      const arcMesh = new THREE.Mesh(arcGeo, arcMat);
      arcMesh.rotation.x = Math.PI / 2;
      arcMesh.rotation.z = Math.PI / 6;
      waveGroup.add(arcMesh);

      // 2. Core razor-sharp white-hot cutting edge
      const coreGeo = new THREE.RingGeometry(3.6, 4.4, 36, 1, -Math.PI * 0.4, Math.PI * 0.8);
      const coreMat = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.98,
        side: THREE.DoubleSide,
      });
      const coreMesh = new THREE.Mesh(coreGeo, coreMat);
      coreMesh.rotation.x = Math.PI / 2;
      coreMesh.rotation.z = Math.PI / 6;
      waveGroup.add(coreMesh);

      // 3. Trailing aerodynamic wind scythe ribbon
      const ribbonGeo = new THREE.RingGeometry(1.2, 4.0, 24, 1, -Math.PI * 0.35, Math.PI * 0.7);
      const ribbonMat = new THREE.MeshBasicMaterial({
        color: slashColor,
        transparent: true,
        opacity: 0.55,
        side: THREE.DoubleSide,
      });
      const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
      ribbonMesh.rotation.x = Math.PI / 2;
      ribbonMesh.rotation.z = Math.PI / 6;
      ribbonMesh.position.z = -1.2;
      waveGroup.add(ribbonMesh);

      // 4. Special Armament Haki or Dark Blade Tendrils
      if (isHaki) {
        for (let l = 0; l < 3; l++) {
          const lGeo = new THREE.BoxGeometry(0.2, 0.2, 2.5);
          const lMat = new THREE.MeshBasicMaterial({ color: '#f3e8ff' });
          const lMesh = new THREE.Mesh(lGeo, lMat);
          lMesh.position.set((l - 1) * 2.2, (l % 2) * 0.8, -0.6);
          lMesh.rotation.set((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5));
          waveGroup.add(lMesh);
        }
      } else if (swordId === 'sword-dark-blade') {
        const darkTorus = new THREE.Mesh(
          new THREE.TorusGeometry(3.8, 0.28, 6, 24, Math.PI * 0.8),
          new THREE.MeshBasicMaterial({ color: '#14532d', wireframe: true })
        );
        darkTorus.rotation.x = Math.PI / 2;
        waveGroup.add(darkTorus);
      }

      waveGroup.position.copy(playerGroup.position).add(fwd.clone().multiplyScalar(2.6)).add(new THREE.Vector3(0, 3.6, 0));
      waveGroup.rotation.y = Math.atan2(fwd.x, fwd.z);
      scene.add(waveGroup);

      const dynamicSlashLight = spawnDynamicSkillLight(slashColor, 5.0, 26);
      dynamicSlashLight.position.copy(waveGroup.position);
      triggerCameraShake(0.4, 0.2);

      const swordDmg =
        (propsRef.current.equippedSword.baseDamage || 35) +
        25 +
        (propsRef.current.playerLevel || 1) * 3 +
        (propsRef.current.playerStats?.sword || 0) * 12;

      activeEffects.push({
        mesh: waveGroup,
        type: 'sword_slash',
        velocity: fwd.clone().multiplyScalar(48),
        lifetime: 0.58,
        maxLifetime: 0.58,
        damage: swordDmg,
        aoeRadius: 7.0,
        color: slashColor,
        effectType: 'slash',
        hasHit: new Set(),
        light: dynamicSlashLight,
        onUpdate: (dt, eff) => {
          eff.mesh.scale.multiplyScalar(1.0 + dt * 0.5);
          if (Math.random() < 0.6) {
            spawnSparkBurst(eff.mesh.position, 3, slashColor, 10, 'star');
          }
        },
      });

      // Immediate point blank hit check
      checkMeleeHitInCone(fwd, 10.0, swordDmg, slashColor);
    };

    // Master Attack Trigger Function
    let isAttacking = false;
    let attackTime = 0;
    const attackDuration = 0.38;
    let slashWaveSpawned = false;

    const triggerAttack3D = (type: 'sword' | 'melee' | 'skill', skill?: FruitSkill) => {
      isAttacking = true;
      attackTime = attackDuration;
      slashWaveSpawned = false;

      const fwd = getAimDirection();

      if (type === 'sword' || type === 'melee') {
        playSwordSlashSound();
      } else if (type === 'skill' && skill) {
        const fruit = propsRef.current.equippedFruit;
        const color = fruit.glowColor || '#f97316';
        const pLevel = propsRef.current.playerLevel || 1;
        const fruitStat = propsRef.current.playerStats?.bloxFruit || 0;
        const baseFruitDmg = 55 + pLevel * 6 + fruitStat * 16;
        const isHaki = propsRef.current.hakiActive;
        const fruitId = fruit.id;
        const effectType = skill.effectType || 'fire';

        // Play custom elemental audio feedback
        playElementalSkillSound(effectType, skill.key);

        // Muzzle flare and casting aura at player hands
        const castPos = playerGroup.position.clone().add(fwd.clone().multiplyScalar(2.2)).add(new THREE.Vector3(0, 3.6, 0));
        spawnCastingMuzzleBurst(castPos, color, skill.key === 'V' ? 4.2 : 2.6);

        if (skill.key === 'V') {
          triggerCameraShake(1.6, 0.55);
        } else if (skill.key === 'C') {
          triggerCameraShake(0.9, 0.35);
        } else {
          triggerCameraShake(0.4, 0.2);
        }

        // ---------------------------------------------------------------------
        // SKILL [Z]: UNIQUE ELEMENTAL SHOOT / BURST / PIERCE / HOMING
        // ---------------------------------------------------------------------
        if (skill.key === 'Z') {
          const totalDmg = baseFruitDmg * (skill.damageMultiplier || 1.8);

          if (fruitId === 'fruit-flame') {
            // === FLAME: RAPID-FIRE TRIPLE BURST (HIGAN) ===
            // Fires 3 fiery bullets in rapid succession
            for (let b = 0; b < 3; b++) {
              setTimeout(() => {
                const bGroup = new THREE.Group();
                const bCore = new THREE.Mesh(
                  skillGeoCache.sphereSm,
                  new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#f97316', emissiveIntensity: 3.5 })
                );
                bGroup.add(bCore);

                const bTail = new THREE.Mesh(
                  skillGeoCache.coneSm,
                  new THREE.MeshBasicMaterial({ color: '#ea580c', transparent: true, opacity: 0.85 })
                );
                bTail.position.z = -1.2;
                bTail.rotation.x = Math.PI / 2;
                bGroup.add(bTail);

                const bCast = castPos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 1.0, (Math.random() - 0.5) * 0.8, 0));
                bGroup.position.copy(bCast);
                bGroup.lookAt(bCast.clone().add(fwd));
                scene.add(bGroup);

                const bLight = spawnDynamicSkillLight('#f97316', 3.5, 20);
                activeEffects.push({
                  mesh: bGroup,
                  type: 'skill_z',
                  velocity: fwd.clone().multiplyScalar(68),
                  lifetime: 0.65,
                  maxLifetime: 0.65,
                  damage: totalDmg * 0.42,
                  aoeRadius: 4.5,
                  color: '#f97316',
                  effectType: 'fire',
                  hasHit: new Set(),
                  light: bLight,
                  onUpdate: (dt, eff) => {
                    eff.mesh.rotation.z += dt * 12;
                    if (Math.random() < 0.4) spawnSparkBurst(eff.mesh.position, 2, '#f97316', 8);
                  },
                  onExpire: (eff) => {
                    const hitPos = eff.mesh.position.clone();
                    spawnSparkBurst(hitPos, 12, '#f97316', 14);
                    spawnGroundRuptureDecal(hitPos, '#f97316', 4.0, 0.45);
                    playExplosionSound();
                  },
                });
              }, b * 90);
            }
          } else if (fruitId === 'fruit-ice') {
            // === ICE: 3 TRIDENTS FAN SPREAD (PARTISAN) ===
            // Launches 3 sharp crystalline ice lances fanning out across angles
            [-0.24, 0, 0.24].forEach((ang) => {
              const spreadFwd = fwd.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
              const lanceGroup = new THREE.Group();
              const lanceMat = new THREE.MeshStandardMaterial({
                color: '#e0f2fe',
                emissive: '#38bdf8',
                emissiveIntensity: 2.8,
                roughness: 0.1,
                metalness: 0.35,
              });

              const lanceTip = new THREE.Mesh(skillGeoCache.coneMd, lanceMat);
              lanceTip.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
              lanceGroup.add(lanceTip);

              const crossGuard = new THREE.Mesh(skillGeoCache.icosa, lanceMat);
              crossGuard.position.z = -1.8;
              lanceGroup.add(crossGuard);

              lanceGroup.position.copy(castPos);
              lanceGroup.lookAt(castPos.clone().add(spreadFwd));
              scene.add(lanceGroup);

              const iLight = spawnDynamicSkillLight('#38bdf8', 3.8, 22);
              activeEffects.push({
                mesh: lanceGroup,
                type: 'skill_z',
                velocity: spreadFwd.multiplyScalar(62),
                lifetime: 0.75,
                maxLifetime: 0.75,
                damage: totalDmg * 0.48,
                aoeRadius: 4.8,
                color: '#38bdf8',
                effectType: 'ice',
                hasHit: new Set(),
                light: iLight,
                onUpdate: (dt, eff) => {
                  eff.mesh.rotation.z += dt * 10;
                  if (Math.random() < 0.4) spawnSparkBurst(eff.mesh.position, 2, '#38bdf8', 8, 'ice');
                },
                onExpire: (eff) => {
                  const hitPos = eff.mesh.position.clone();
                  spawnSparkBurst(hitPos, 14, '#38bdf8', 14, 'ice');
                  spawnGroundRuptureDecal(hitPos, '#38bdf8', 4.5, 0.45);
                  playExplosionSound();
                },
              });
            });
          } else if (fruitId === 'fruit-kitsune') {
            // === KITSUNE: 3 HOMING FOX-FIRE HOUNDS ===
            // Releases 3 spirit wisps that steer towards living enemies
            [-0.35, 0, 0.35].forEach((ang, idx) => {
              const spreadFwd = fwd.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), ang);
              const wispGroup = new THREE.Group();
              const orbMesh = new THREE.Mesh(
                skillGeoCache.sphereSm,
                new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#6366f1', emissiveIntensity: 3.5 })
              );
              wispGroup.add(orbMesh);

              const tailMesh = new THREE.Mesh(
                skillGeoCache.coneSm,
                new THREE.MeshBasicMaterial({ color: '#818cf8', transparent: true, opacity: 0.85 })
              );
              tailMesh.position.z = -1.2;
              tailMesh.rotation.x = Math.PI / 2;
              wispGroup.add(tailMesh);

              wispGroup.position.copy(castPos).add(new THREE.Vector3((idx - 1) * 1.2, 0, 0));
              wispGroup.lookAt(castPos.clone().add(spreadFwd));
              scene.add(wispGroup);

              const kLight = spawnDynamicSkillLight('#818cf8', 3.8, 22);
              const wispVel = spreadFwd.multiplyScalar(48);

              activeEffects.push({
                mesh: wispGroup,
                type: 'skill_z',
                velocity: wispVel,
                lifetime: 1.1,
                maxLifetime: 1.1,
                damage: totalDmg * 0.45,
                aoeRadius: 5.2,
                color: '#818cf8',
                effectType: 'dark',
                hasHit: new Set(),
                light: kLight,
                onUpdate: (dt, eff) => {
                  // Homing behavior: find closest living enemy
                  let nearestEn: Enemy3D | null = null;
                  let minD = 35;
                  enemies.forEach((en) => {
                    if (en.hp > 0) {
                      const d = eff.mesh.position.distanceTo(en.mesh.position);
                      if (d < minD) {
                        minD = d;
                        nearestEn = en;
                      }
                    }
                  });
                  if (nearestEn) {
                    const toTarget = (nearestEn as Enemy3D).mesh.position.clone().add(new THREE.Vector3(0, 2.5, 0)).sub(eff.mesh.position).normalize();
                    eff.velocity.lerp(toTarget.multiplyScalar(55), 0.12);
                    eff.mesh.lookAt(eff.mesh.position.clone().add(eff.velocity));
                  }
                  if (Math.random() < 0.5) spawnSparkBurst(eff.mesh.position, 2, '#818cf8', 8, 'star');
                },
                onExpire: (eff) => {
                  const hitPos = eff.mesh.position.clone();
                  spawnSparkBurst(hitPos, 16, '#818cf8', 16, 'star');
                  spawnGroundRuptureDecal(hitPos, '#6366f1', 5.0, 0.5);
                  playExplosionSound();
                },
              });
            });
          } else {
            // === DRAGON, LIGHT, MAGMA, BUDDHA, PORTAL, SMOKE, BOMB ===
            const zGroup = new THREE.Group();
            const dynamicLight = spawnDynamicSkillLight(color, 5.0, 32);
            let projectileSpeed = 54;
            let aoeRadius = 6.0;
            let isPiercing = false;

            if (fruitId === 'fruit-dragon') {
              // === DRAGON BOLO BREATH CONTINUOUS PIERCING BEAM ===
              projectileSpeed = 74;
              aoeRadius = 8.0;
              isPiercing = true;

              const coreMesh = new THREE.Mesh(
                skillGeoCache.cylinderBeam,
                new THREE.MeshBasicMaterial({ color: '#fef08a' })
              );
              coreMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
              zGroup.add(coreMesh);

              const mantleMesh = new THREE.Mesh(
                new THREE.CylinderGeometry(1.6, 2.4, 40, 12),
                new THREE.MeshStandardMaterial({ color: '#ea580c', emissive: '#a855f7', emissiveIntensity: 2.8, transparent: true, opacity: 0.8 })
              );
              mantleMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
              zGroup.add(mantleMesh);

              const mawMesh = new THREE.Mesh(skillGeoCache.coneMd, new THREE.MeshBasicMaterial({ color: '#facc15' }));
              mawMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
              mawMesh.position.z = 21;
              zGroup.add(mawMesh);
            } else if (fruitId === 'fruit-light') {
              // === LIGHT BEAM ARROW (INSTANT PIERCING LASER) ===
              projectileSpeed = 96;
              aoeRadius = 5.5;
              isPiercing = true;

              [-1.6, 1.6].forEach((bSide) => {
                const bowWing = new THREE.Mesh(skillGeoCache.coneSm, new THREE.MeshBasicMaterial({ color: '#fef08a' }));
                bowWing.position.set(bSide * 0.9, 0, -1.5);
                bowWing.rotation.z = bSide > 0 ? 0.7 : -0.7;
                zGroup.add(bowWing);
              });

              const beamMesh = new THREE.Mesh(skillGeoCache.cylinderBeam, new THREE.MeshBasicMaterial({ color: '#ffffff' }));
              beamMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1));
              zGroup.add(beamMesh);

              const ringMesh = new THREE.Mesh(skillGeoCache.ringSm, new THREE.MeshBasicMaterial({ color: '#facc15', side: THREE.DoubleSide }));
              ringMesh.position.z = 10;
              zGroup.add(ringMesh);
            } else if (fruitId === 'fruit-magma') {
              // === MAGMA CLAWS WITH LAVA POOL DECALS ===
              projectileSpeed = 52;
              aoeRadius = 7.0;

              const clawMesh = new THREE.Mesh(
                skillGeoCache.boxMd,
                new THREE.MeshStandardMaterial({ color: '#1c1917', emissive: '#dc2626', emissiveIntensity: 3.2 })
              );
              zGroup.add(clawMesh);

              for (let c = 0; c < 4; c++) {
                const tooth = new THREE.Mesh(skillGeoCache.coneSm, new THREE.MeshBasicMaterial({ color: '#f97316' }));
                tooth.position.set((c - 1.5) * 0.8, 1.2, 2.4);
                tooth.rotation.x = Math.PI / 2;
                zGroup.add(tooth);
              }
            } else if (fruitId === 'fruit-buddha') {
              // === BUDDHA GOLDEN PALM BLAST ===
              projectileSpeed = 56;
              aoeRadius = 8.5;

              const sunMesh = new THREE.Mesh(
                skillGeoCache.sphereMd,
                new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#eab308', emissiveIntensity: 3.8 })
              );
              zGroup.add(sunMesh);

              const halo = new THREE.Mesh(skillGeoCache.torusMd, new THREE.MeshBasicMaterial({ color: '#fef08a' }));
              halo.rotation.x = Math.PI / 2;
              zGroup.add(halo);
            } else if (fruitId === 'fruit-portal') {
              // === PORTAL DIMENSIONAL SLASH ===
              projectileSpeed = 64;
              aoeRadius = 6.5;

              const riftMesh = new THREE.Mesh(
                skillGeoCache.ringMd,
                new THREE.MeshBasicMaterial({ color: '#06b6d4', side: THREE.DoubleSide })
              );
              zGroup.add(riftMesh);

              const innerRift = new THREE.Mesh(
                skillGeoCache.ringSm,
                new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide })
              );
              zGroup.add(innerRift);
            } else if (fruitId === 'fruit-smoke') {
              // === SMOKE SLAM FIST ===
              projectileSpeed = 54;
              aoeRadius = 6.5;

              const fist = new THREE.Mesh(
                skillGeoCache.boxMd,
                new THREE.MeshStandardMaterial({ color: '#f1f5f9', emissive: '#94a3b8', emissiveIntensity: 2.2 })
              );
              zGroup.add(fist);

              const vRing = new THREE.Mesh(skillGeoCache.torusSm, new THREE.MeshBasicMaterial({ color: '#cbd5e1', wireframe: true }));
              vRing.position.z = -2.0;
              zGroup.add(vRing);
            } else {
              // === BOMB TARGETED BOUNCING MISSILE ===
              projectileSpeed = 52;
              aoeRadius = 7.0;

              const bodyMesh = new THREE.Mesh(
                skillGeoCache.sphereMd,
                new THREE.MeshStandardMaterial({ color: '#1c1917', emissive: '#ea580c', emissiveIntensity: 2.8 })
              );
              zGroup.add(bodyMesh);

              const fuse = new THREE.Mesh(skillGeoCache.sphereSm, new THREE.MeshBasicMaterial({ color: '#fef08a' }));
              fuse.position.y = 2.0;
              zGroup.add(fuse);
            }

            zGroup.position.copy(castPos);
            zGroup.lookAt(castPos.clone().add(fwd));
            scene.add(zGroup);

            activeEffects.push({
              mesh: zGroup,
              type: 'skill_z',
              velocity: fwd.clone().multiplyScalar(projectileSpeed),
              lifetime: 0.9,
              maxLifetime: 0.9,
              damage: totalDmg,
              aoeRadius,
              color,
              effectType,
              hasHit: new Set(),
              light: dynamicLight,
              onUpdate: (dt, eff) => {
                eff.mesh.rotation.z += dt * 8;
                if (Math.random() < 0.5) spawnSparkBurst(eff.mesh.position, 2, color, 8, effectType === 'ice' ? 'ice' : effectType === 'light' ? 'star' : 'spark');
              },
              onExpire: (eff) => {
                const expPos = eff.mesh.position.clone();
                spawnSparkBurst(expPos, 22, color, 18, effectType === 'ice' ? 'ice' : effectType === 'light' ? 'star' : 'spark');
                spawnGroundRuptureDecal(expPos, color, aoeRadius * 1.3, 0.65);
                playExplosionSound();
                triggerCameraShake(0.7, 0.25);

                // Ground lava pools for Magma
                if (fruitId === 'fruit-magma') {
                  spawnGroundRuptureDecal(expPos, '#dc2626', 6.5, 2.0);
                }

                enemies.forEach((enemy) => {
                  if (enemy.hp <= 0) return;
                  const d = expPos.distanceTo(enemy.mesh.position);
                  if (d < aoeRadius * 1.3) {
                    const toEnemy = enemy.mesh.position.clone().sub(expPos).normalize();
                    const isCrit = Math.random() < 0.3;
                    applyDamageToEnemy(enemy, eff.damage * (isCrit ? 1.5 : 1.0) * (isHaki ? 1.35 : 1.0), toEnemy, color, isCrit, isHaki);
                  }
                });
              },
            });
          }
        }

        // ---------------------------------------------------------------------
        // SKILL [X]: HAZARD / PILLAR / TORNADO / TELEPORT KICK / DASH
        // ---------------------------------------------------------------------
        else if (skill.key === 'X') {
          const totalDmg = baseFruitDmg * (skill.damageMultiplier || 3.2);

          if (fruitId === 'fruit-light') {
            // === LIGHT: LIGHT SPEED KICK (TRUE FLASH STEP TELEPORT KICK) ===
            // Find closest enemy in forward direction, or flash step forward
            let targetEnemy: Enemy3D | null = null;
            let closestDist = 32;
            enemies.forEach((en) => {
              if (en.hp > 0) {
                const d = playerGroup.position.distanceTo(en.mesh.position);
                const dirToEn = en.mesh.position.clone().sub(playerGroup.position).normalize();
                if (d < closestDist && dirToEn.dot(fwd) > 0.3) {
                  closestDist = d;
                  targetEnemy = en;
                }
              }
            });

            const originPos = playerGroup.position.clone();
            const destPos = targetEnemy
              ? (targetEnemy as Enemy3D).mesh.position.clone().sub(fwd.clone().multiplyScalar(3.0))
              : playerGroup.position.clone().add(fwd.clone().multiplyScalar(18.0));
            destPos.y = getGroundHeight(destPos.x, destPos.z);

            // Origin speed flash
            spawnGroundRuptureDecal(originPos, '#fde047', 4.5, 0.35);
            spawnSparkBurst(originPos.clone().add(new THREE.Vector3(0, 3, 0)), 14, '#fde047', 20, 'star');

            // Flash step teleport!
            playerGroup.position.copy(destPos);
            playerVy = 6.0;
            isGrounded = false;

            // Destination explosive golden kick shockwave
            spawnGroundRuptureDecal(destPos, '#ffffff', 8.0, 0.6);
            spawnSparkBurst(destPos.clone().add(new THREE.Vector3(0, 3, 0)), 22, '#fde047', 22, 'star');
            triggerCameraShake(0.85, 0.3);
            playSwordSlashSound();

            const kLight = spawnDynamicSkillLight('#fde047', 5.5, 30);
            setTimeout(() => returnSkillLight(kLight), 300);

            // Explosive kick launch to all nearby enemies
            enemies.forEach((en) => {
              if (en.hp <= 0) return;
              const d = destPos.distanceTo(en.mesh.position);
              if (d < 12.0) {
                const toEn = en.mesh.position.clone().sub(destPos).normalize();
                en.mesh.position.y += 4.5; // High vertical launch!
                applyDamageToEnemy(en, totalDmg * (isHaki ? 1.4 : 1.0), toEn, '#fde047', true, isHaki);
              }
            });
          } else if (fruitId === 'fruit-portal') {
            // === PORTAL: PARALLEL ESCAPE (QUANTUM WARP BEHIND TARGET) ===
            let targetEnemy: Enemy3D | null = null;
            let closestDist = 32;
            enemies.forEach((en) => {
              if (en.hp > 0) {
                const d = playerGroup.position.distanceTo(en.mesh.position);
                if (d < closestDist) {
                  closestDist = d;
                  targetEnemy = en;
                }
              }
            });

            const originPos = playerGroup.position.clone();
            const destPos = targetEnemy
              ? (targetEnemy as Enemy3D).mesh.position.clone().add(fwd.clone().multiplyScalar(4.0)) // Warp right behind!
              : playerGroup.position.clone().add(fwd.clone().multiplyScalar(20.0));
            destPos.y = getGroundHeight(destPos.x, destPos.z);

            // Dual portal VFX: entrance & exit
            spawnGroundRuptureDecal(originPos, '#06b6d4', 5.0, 0.45);
            spawnSparkBurst(originPos.clone().add(new THREE.Vector3(0, 3, 0)), 16, '#8b5cf6', 16, 'star');

            playerGroup.position.copy(destPos);
            spawnGroundRuptureDecal(destPos, '#8b5cf6', 7.5, 0.55);
            spawnSparkBurst(destPos.clone().add(new THREE.Vector3(0, 3, 0)), 20, '#06b6d4', 20, 'star');
            triggerCameraShake(0.7, 0.25);

            enemies.forEach((en) => {
              if (en.hp <= 0) return;
              const d = destPos.distanceTo(en.mesh.position);
              if (d < 11.0) {
                const toEn = en.mesh.position.clone().sub(destPos).normalize();
                applyDamageToEnemy(en, totalDmg * (isHaki ? 1.4 : 1.0), toEn, '#06b6d4', true, isHaki);
              }
            });
          } else if (fruitId === 'fruit-kitsune') {
            // === KITSUNE: SPECTRAL FOX DASH (PHANTOM RUSH) ===
            const dashStart = playerGroup.position.clone();
            const dashEnd = dashStart.clone().add(fwd.clone().multiplyScalar(22.0));
            dashEnd.y = getGroundHeight(dashEnd.x, dashEnd.z);

            playerGroup.position.copy(dashEnd);
            playerVy = 4.0;
            isGrounded = false;

            spawnGroundRuptureDecal(dashStart, '#6366f1', 5.0, 0.4);
            spawnGroundRuptureDecal(dashEnd, '#38bdf8', 7.0, 0.5);
            spawnSparkBurst(dashEnd.clone().add(new THREE.Vector3(0, 3, 0)), 22, '#38bdf8', 22, 'star');
            triggerCameraShake(0.8, 0.25);

            enemies.forEach((en) => {
              if (en.hp <= 0) return;
              const d = en.mesh.position.distanceTo(dashEnd);
              if (d < 14.0) {
                const toEn = en.mesh.position.clone().sub(dashEnd).normalize();
                applyDamageToEnemy(en, totalDmg * (isHaki ? 1.4 : 1.0), toEn, '#818cf8', true, isHaki);
              }
            });
          } else if (fruitId === 'fruit-ice') {
            // === ICE: ICE SURGE (CASCADING GLACIAL SPIKES LINE) ===
            for (let sp = 1; sp <= 6; sp++) {
              setTimeout(() => {
                const spPos = playerGroup.position.clone().add(fwd.clone().multiplyScalar(sp * 3.8));
                spPos.y = getGroundHeight(spPos.x, spPos.z);

                const spikeMesh = new THREE.Mesh(
                  skillGeoCache.coneLg,
                  new THREE.MeshStandardMaterial({ color: '#e0f2fe', emissive: '#38bdf8', emissiveIntensity: 2.8, roughness: 0.1, metalness: 0.35 })
                );
                spikeMesh.position.copy(spPos).add(new THREE.Vector3(0, 4.0, 0));
                spikeMesh.rotation.z = (Math.random() - 0.5) * 0.3;
                scene.add(spikeMesh);

                spawnGroundRuptureDecal(spPos, '#38bdf8', 4.5, 0.5);
                spawnSparkBurst(spPos.clone().add(new THREE.Vector3(0, 2, 0)), 10, '#38bdf8', 12, 'ice');

                enemies.forEach((en) => {
                  if (en.hp <= 0) return;
                  if (en.mesh.position.distanceTo(spPos) < 6.0) {
                    const toEn = en.mesh.position.clone().sub(spPos).normalize();
                    applyDamageToEnemy(en, totalDmg * 0.45, toEn, '#38bdf8', false, isHaki);
                  }
                });

                setTimeout(() => scene.remove(spikeMesh), 650);
              }, sp * 75);
            }
          } else {
            // === DRAGON, FLAME, MAGMA, BUDDHA, SMOKE, BOMB ===
            const targetPoint = playerGroup.position.clone().add(fwd.clone().multiplyScalar(14));
            const groundY = getGroundHeight(targetPoint.x, targetPoint.z);
            const xGroup = new THREE.Group();
            const dynamicLight = spawnDynamicSkillLight(color, 5.5, 35);
            dynamicLight.position.set(targetPoint.x, groundY + 8, targetPoint.z);

            let duration = 1.3;
            let aoeRadius = 8.5;

            if (fruitId === 'fruit-dragon') {
              // === DRAGON CLAW TORNADO (TATSUMAKI) ===
              aoeRadius = 10.0;
              duration = 1.6;

              const cone1 = new THREE.Mesh(
                skillGeoCache.cylinderBeam,
                new THREE.MeshStandardMaterial({ color: '#a855f7', emissive: '#7e22ce', emissiveIntensity: 2.5, transparent: true, opacity: 0.75, side: THREE.DoubleSide })
              );
              cone1.position.y = 12;
              xGroup.add(cone1);

              const scytheMesh = new THREE.Mesh(skillGeoCache.ringMd, new THREE.MeshBasicMaterial({ color: '#facc15', side: THREE.DoubleSide }));
              scytheMesh.rotation.x = Math.PI / 2;
              scytheMesh.position.y = 8;
              xGroup.add(scytheMesh);
            } else if (fruitId === 'fruit-flame') {
              // === FLAME: FIRE COLUMN (DAI ENKAI GEYSER) ===
              aoeRadius = 9.0;
              duration = 1.5;

              const fireCol = new THREE.Mesh(
                new THREE.CylinderGeometry(4.5, 5.5, 26, 14, 1, true),
                new THREE.MeshStandardMaterial({ color: '#ea580c', emissive: '#f97316', emissiveIntensity: 3.2, transparent: true, opacity: 0.85, side: THREE.DoubleSide })
              );
              fireCol.position.y = 13;
              xGroup.add(fireCol);

              const rMesh = new THREE.Mesh(skillGeoCache.torusMd, new THREE.MeshBasicMaterial({ color: '#f97316', wireframe: true }));
              rMesh.position.y = 12;
              rMesh.rotation.x = Math.PI / 2;
              xGroup.add(rMesh);
            } else if (fruitId === 'fruit-magma') {
              // === MAGMA HOUND (MEIGO) ===
              aoeRadius = 9.5;
              duration = 1.4;

              const headMesh = new THREE.Mesh(
                skillGeoCache.boxMd,
                new THREE.MeshStandardMaterial({ color: '#1c1917', emissive: '#dc2626', emissiveIntensity: 3.2 })
              );
              headMesh.position.y = 2.5;
              xGroup.add(headMesh);

              [-1.2, 1.2].forEach((xEye) => {
                const eyeMesh = new THREE.Mesh(skillGeoCache.sphereSm, new THREE.MeshBasicMaterial({ color: '#facc15' }));
                eyeMesh.position.set(xEye, 3.2, 2.4);
                xGroup.add(eyeMesh);
              });
            } else if (fruitId === 'fruit-buddha') {
              // === BUDDHA DIVINE PALM SHOCKWAVE ===
              aoeRadius = 10.0;
              duration = 1.4;

              const palmPlate = new THREE.Mesh(
                skillGeoCache.boxLg,
                new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#eab308', emissiveIntensity: 3.5, transparent: true, opacity: 0.88 })
              );
              palmPlate.position.y = 5.2;
              xGroup.add(palmPlate);

              const halo = new THREE.Mesh(skillGeoCache.torusLg, new THREE.MeshBasicMaterial({ color: '#fde047' }));
              halo.position.y = 7.0;
              xGroup.add(halo);
            } else if (fruitId === 'fruit-smoke') {
              // === SMOKE BILLOWING WHIRLWIND ===
              aoeRadius = 9.0;
              duration = 1.4;

              const vortex = new THREE.Mesh(
                new THREE.CylinderGeometry(6.5, 1.2, 22, 12, 1, true),
                new THREE.MeshStandardMaterial({ color: '#cbd5e1', emissive: '#94a3b8', emissiveIntensity: 2.0, transparent: true, opacity: 0.8, side: THREE.DoubleSide })
              );
              vortex.position.y = 11;
              xGroup.add(vortex);
            } else {
              // === BOMB EXPLOSION CLUSTER MINES ===
              aoeRadius = 9.5;
              duration = 1.3;

              for (let b = 0; b < 4; b++) {
                const bAngle = (b / 4) * Math.PI * 2;
                const bomb = new THREE.Mesh(
                  skillGeoCache.sphereSm,
                  new THREE.MeshStandardMaterial({ color: '#1c1917', emissive: '#ea580c', emissiveIntensity: 2.8 })
                );
                bomb.position.set(Math.cos(bAngle) * 3.8, 1.2, Math.sin(bAngle) * 3.8);
                xGroup.add(bomb);
              }
            }

            spawnGroundRuptureDecal(targetPoint, color, aoeRadius * 1.3, duration);
            xGroup.position.set(targetPoint.x, groundY, targetPoint.z);
            scene.add(xGroup);

            activeEffects.push({
              mesh: xGroup,
              type: 'skill_x',
              velocity: new THREE.Vector3(0, 0, 0),
              lifetime: duration,
              maxLifetime: duration,
              damage: totalDmg * 0.35,
              aoeRadius,
              color,
              effectType,
              hasHit: new Set(),
              isPeriodic: true,
              periodicInterval: 0.28,
              periodicTimer: 0,
              light: dynamicLight,
              onUpdate: (dt, eff) => {
                eff.mesh.rotation.y += dt * 7.5;
                if (fruitId === 'fruit-dragon') {
                  enemies.forEach((en) => {
                    if (en.hp > 0 && en.mesh.position.distanceTo(eff.mesh.position) < aoeRadius * 1.5) {
                      en.mesh.position.lerp(eff.mesh.position, 0.04);
                    }
                  });
                  triggerCameraShake(0.4, 0.2);
                }
                if (Math.random() < 0.5) {
                  spawnSparkBurst(eff.mesh.position.clone().add(new THREE.Vector3(0, Math.random() * 12 + 1, 0)), 2, color, 8);
                }
              },
            });
          }
        }

        // ---------------------------------------------------------------------
        // SKILL [C]: HEAVY SLAM / SKY LIGHTNING / VORTEX / SKY BARRAGE / DASH
        // ---------------------------------------------------------------------
        else if (skill.key === 'C') {
          const totalDmg = baseFruitDmg * (skill.damageMultiplier || 3.8);

          if (fruitId === 'fruit-flame') {
            // === FLAME: FIRE FLIGHT DASH & HIKEN (GIANT FIRE FIST) ===
            const startP = playerGroup.position.clone();
            const endP = startP.clone().add(fwd.clone().multiplyScalar(18.0));
            endP.y = getGroundHeight(endP.x, endP.z);

            playerGroup.position.copy(endP);
            playerVy = 6.0;
            isGrounded = false;

            spawnGroundRuptureDecal(startP, '#ea580c', 5.0, 0.45);
            spawnGroundRuptureDecal(endP, '#f97316', 8.5, 0.75);
            spawnSparkBurst(endP.clone().add(new THREE.Vector3(0, 3, 0)), 28, '#f97316', 22);
            triggerCameraShake(1.2, 0.4);
            playExplosionSound();

            const cFist = new THREE.Mesh(
              skillGeoCache.sphereLg,
              new THREE.MeshStandardMaterial({ color: '#ea580c', emissive: '#f97316', emissiveIntensity: 3.8 })
            );
            cFist.position.copy(endP).add(new THREE.Vector3(0, 4.0, 0));
            scene.add(cFist);
            setTimeout(() => scene.remove(cFist), 450);

            enemies.forEach((en) => {
              if (en.hp <= 0) return;
              const d = endP.distanceTo(en.mesh.position);
              if (d < 16.0) {
                const toEn = en.mesh.position.clone().sub(endP).normalize();
                applyDamageToEnemy(en, totalDmg * (isHaki ? 1.4 : 1.0), toEn, '#f97316', true, isHaki);
              }
            });
          } else if (fruitId === 'fruit-portal') {
            // === PORTAL: WORLD WARP VORTEX (REAL GRAVITATIONAL BLACK HOLE) ===
            const vortexCenter = playerGroup.position.clone().add(fwd.clone().multiplyScalar(12.0));
            vortexCenter.y = getGroundHeight(vortexCenter.x, vortexCenter.z) + 3.5;
            const vortexGroup = new THREE.Group();

            const singularity = new THREE.Mesh(
              skillGeoCache.sphereMd,
              new THREE.MeshBasicMaterial({ color: '#000000' })
            );
            vortexGroup.add(singularity);

            [0, Math.PI / 3, (Math.PI * 2) / 3].forEach((rotX) => {
              const aRing = new THREE.Mesh(
                skillGeoCache.torusMd,
                new THREE.MeshBasicMaterial({ color: '#06b6d4', wireframe: true })
              );
              aRing.rotation.x = rotX;
              vortexGroup.add(aRing);
            });

            vortexGroup.position.copy(vortexCenter);
            scene.add(vortexGroup);

            const vLight = spawnDynamicSkillLight('#06b6d4', 6.0, 35);
            vLight.position.copy(vortexCenter);

            activeEffects.push({
              mesh: vortexGroup,
              type: 'skill_c',
              velocity: new THREE.Vector3(0, 0, 0),
              lifetime: 2.2,
              maxLifetime: 2.2,
              damage: totalDmg * 0.22,
              aoeRadius: 20.0,
              color: '#06b6d4',
              effectType: 'dark',
              hasHit: new Set(),
              isPeriodic: true,
              periodicInterval: 0.28,
              periodicTimer: 0,
              light: vLight,
              onUpdate: (dt, eff) => {
                eff.mesh.rotation.y += dt * 8.5;
                eff.mesh.rotation.z += dt * 6.0;

                // REAL GRAVITATIONAL SUCTION: pulls all living enemies toward singularity center!
                enemies.forEach((en) => {
                  if (en.hp > 0) {
                    const d = en.mesh.position.distanceTo(eff.mesh.position);
                    if (d < 24.0) {
                      en.mesh.position.lerp(eff.mesh.position, 0.08); // Real black hole pull!
                    }
                  }
                });
                triggerCameraShake(0.35, 0.15);
                if (Math.random() < 0.6) {
                  spawnSparkBurst(eff.mesh.position, 2, '#06b6d4', 10, 'star');
                }
              },
              onExpire: (eff) => {
                spawnGroundRuptureDecal(eff.mesh.position, '#8b5cf6', 10.0, 0.7);
                spawnSparkBurst(eff.mesh.position, 28, '#06b6d4', 22, 'star');
                playExplosionSound();
                triggerCameraShake(1.2, 0.4);
              },
            });
          } else if (fruitId === 'fruit-light') {
            // === LIGHT: SKY BEAM BARRAGE (CELESTIAL LASER RAIN) ===
            const barrageCenter = playerGroup.position.clone().add(fwd.clone().multiplyScalar(14.0));
            barrageCenter.y = getGroundHeight(barrageCenter.x, barrageCenter.z);

            // Celestial golden rune sigil in the clouds
            const sigil = new THREE.Mesh(skillGeoCache.ringMd, new THREE.MeshBasicMaterial({ color: '#fde047', side: THREE.DoubleSide }));
            sigil.rotation.x = Math.PI / 2;
            sigil.position.set(barrageCenter.x, barrageCenter.y + 32, barrageCenter.z);
            scene.add(sigil);
            setTimeout(() => scene.remove(sigil), 1800);

            // 8 Celestial laser strikes falling in rapid sequence with random offsets
            for (let b = 0; b < 8; b++) {
              setTimeout(() => {
                const bAngle = (b / 8) * Math.PI * 2;
                const bR = Math.random() * 8.0;
                const bStrikeX = barrageCenter.x + Math.cos(bAngle) * bR;
                const bStrikeZ = barrageCenter.z + Math.sin(bAngle) * bR;
                const bGroundY = getGroundHeight(bStrikeX, bStrikeZ);

                const beamMesh = new THREE.Mesh(
                  skillGeoCache.cylinderBeam,
                  new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.95 })
                );
                beamMesh.position.set(bStrikeX, bGroundY + 21, bStrikeZ);
                scene.add(beamMesh);

                const strikePos = new THREE.Vector3(bStrikeX, bGroundY, bStrikeZ);
                spawnGroundRuptureDecal(strikePos, '#fde047', 4.5, 0.4);
                spawnSparkBurst(strikePos.clone().add(new THREE.Vector3(0, 2, 0)), 8, '#fde047', 14, 'star');
                triggerCameraShake(0.4, 0.15);

                enemies.forEach((en) => {
                  if (en.hp <= 0) return;
                  if (en.mesh.position.distanceTo(strikePos) < 6.5) {
                    const toEn = en.mesh.position.clone().sub(strikePos).normalize();
                    applyDamageToEnemy(en, totalDmg * 0.32, toEn, '#fde047', false, isHaki);
                  }
                });

                setTimeout(() => scene.remove(beamMesh), 200);
              }, b * 110);
            }
          } else {
            // === DRAGON, ICE, MAGMA, BUDDHA, SMOKE, BOMB ===
            playerVy = 16.0;
            isGrounded = false;

            const slamPoint = playerGroup.position.clone().add(fwd.clone().multiplyScalar(9));
            const groundY = getGroundHeight(slamPoint.x, slamPoint.z);
            const cGroup = new THREE.Group();
            const dynamicLight = spawnDynamicSkillLight(color, 6.0, 40);
            dynamicLight.position.set(slamPoint.x, groundY + 4, slamPoint.z);

            let aoeRadius = 18.0;

            if (fruitId === 'fruit-dragon') {
              // === THUNDER ROAR QUAKE: SKY LIGHTNING CRASH ===
              aoeRadius = 22.0;
              for (let b = 0; b < 4; b++) {
                const boltMesh = new THREE.Mesh(
                  skillGeoCache.cylinderBeam,
                  new THREE.MeshBasicMaterial({ color: '#fef08a' })
                );
                const bAngle = (b / 4) * Math.PI * 2;
                boltMesh.position.set(Math.cos(bAngle) * 5.0, 21, Math.sin(bAngle) * 5.0);
                cGroup.add(boltMesh);
              }
              triggerCameraShake(1.4, 0.45);
            } else if (fruitId === 'fruit-ice') {
              // === GLACIAL FREEZE (ABSOLUTE ZERO ICE CAGE) ===
              aoeRadius = 18.0;

              const domeMesh = new THREE.Mesh(
                skillGeoCache.icosa,
                new THREE.MeshStandardMaterial({ color: '#e0f2fe', emissive: '#38bdf8', emissiveIntensity: 2.8, roughness: 0.1, metalness: 0.5, wireframe: true })
              );
              domeMesh.position.y = 3.0;
              cGroup.add(domeMesh);

              const fRing = new THREE.Mesh(skillGeoCache.torusLg, new THREE.MeshBasicMaterial({ color: '#bae6fd' }));
              fRing.position.y = 0.5;
              fRing.rotation.x = Math.PI / 2;
              cGroup.add(fRing);
            } else if (fruitId === 'fruit-magma') {
              // === VOLCANIC ERUPTION SPIRES ===
              aoeRadius = 19.0;
              [-4.0, 0, 4.0].forEach((spX) => {
                const spCone = new THREE.Mesh(
                  skillGeoCache.coneLg,
                  new THREE.MeshStandardMaterial({ color: '#1c1917', emissive: '#dc2626', emissiveIntensity: 2.8 })
                );
                spCone.position.set(spX, 5.0, 0);
                cGroup.add(spCone);
              });
            } else if (fruitId === 'fruit-buddha') {
              // === HEAVENLY SMASH CELESTIAL BELL ===
              aoeRadius = 19.0;
              const bell = new THREE.Mesh(
                skillGeoCache.cylinderMd,
                new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#eab308', emissiveIntensity: 3.5, metalness: 0.8 })
              );
              bell.position.y = 8.0;
              cGroup.add(bell);

              const lotusRim = new THREE.Mesh(skillGeoCache.torusLg, new THREE.MeshBasicMaterial({ color: '#fef08a' }));
              lotusRim.position.y = 2.0;
              lotusRim.rotation.x = Math.PI / 2;
              cGroup.add(lotusRim);
            } else if (fruitId === 'fruit-kitsune') {
              // === NINE-TAILS SHRINE BARRAGE (TORII GATE) ===
              aoeRadius = 19.0;
              [-4.0, 4.0].forEach((pX) => {
                const pillar = new THREE.Mesh(
                  skillGeoCache.cylinderMd,
                  new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#6366f1', emissiveIntensity: 3.2 })
                );
                pillar.position.set(pX, 6.0, 0);
                cGroup.add(pillar);
              });
              const crossbeam = new THREE.Mesh(skillGeoCache.boxLg, new THREE.MeshBasicMaterial({ color: '#fde047' }));
              crossbeam.position.set(0, 12.0, 0);
              cGroup.add(crossbeam);
            } else if (fruitId === 'fruit-smoke') {
              // === WHITE OUT VOLUMETRIC DOME ===
              aoeRadius = 18.0;
              const smokeDome = new THREE.Mesh(
                skillGeoCache.sphereLg,
                new THREE.MeshStandardMaterial({ color: '#f8fafc', emissive: '#94a3b8', emissiveIntensity: 2.2, transparent: true, opacity: 0.82 })
              );
              smokeDome.position.y = 6.0;
              cGroup.add(smokeDome);
            } else {
              // === BOMB SELF-DESTRUCT NUCLEAR SPHERE ===
              aoeRadius = 20.0;
              const nukeCore = new THREE.Mesh(
                skillGeoCache.sphereLg,
                new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#dc2626', emissiveIntensity: 3.8 })
              );
              nukeCore.position.y = 4.5;
              cGroup.add(nukeCore);
            }

            spawnGroundRuptureDecal(slamPoint, color, aoeRadius * 1.2, 0.85);
            spawnSparkBurst(slamPoint.clone().add(new THREE.Vector3(0, 2, 0)), 28, color, 20);

            cGroup.position.set(slamPoint.x, groundY, slamPoint.z);
            scene.add(cGroup);

            activeEffects.push({
              mesh: cGroup,
              type: 'skill_c',
              velocity: new THREE.Vector3(0, 0, 0),
              lifetime: 0.8,
              maxLifetime: 0.8,
              damage: totalDmg,
              aoeRadius,
              color,
              effectType,
              hasHit: new Set(),
              isAoe: true,
              light: dynamicLight,
              onUpdate: (dt, eff) => {
                eff.mesh.scale.multiplyScalar(1.0 + dt * 1.35);
              },
            });
          }
        }

        // ---------------------------------------------------------------------
        // SKILL [V]: ULTIMATE CELESTIAL DESTRUCTION
        // ---------------------------------------------------------------------
        else if (skill.key === 'V') {
          const totalDmg = baseFruitDmg * (skill.damageMultiplier || 5.2);

          if (fruitId === 'fruit-light') {
            // === LIGHT: YASAKANI NO MAGATAMA (MACHINE-GUN JEWEL BARRAGE) ===
            playerVy = 10.0;
            isGrounded = false;
            triggerCameraShake(1.6, 0.7);

            // 10 Sacred Light Jewels fired rapidly in a cone forward
            for (let j = 0; j < 10; j++) {
              setTimeout(() => {
                const spreadFwd = fwd.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.45, (Math.random() - 0.5) * 0.35, (Math.random() - 0.5) * 0.45)).normalize();
                const jGroup = new THREE.Group();

                const jCore = new THREE.Mesh(skillGeoCache.octa, new THREE.MeshStandardMaterial({ color: '#fef08a', emissive: '#eab308', emissiveIntensity: 4.0 }));
                jGroup.add(jCore);

                const jOrigin = playerGroup.position.clone().add(new THREE.Vector3(0, 4.0, 0));
                jGroup.position.copy(jOrigin);
                jGroup.lookAt(jOrigin.clone().add(spreadFwd));
                scene.add(jGroup);

                const jLight = spawnDynamicSkillLight('#facc15', 3.5, 20);
                activeEffects.push({
                  mesh: jGroup,
                  type: 'skill_v',
                  velocity: spreadFwd.multiplyScalar(78),
                  lifetime: 0.7,
                  maxLifetime: 0.7,
                  damage: totalDmg * 0.18,
                  aoeRadius: 6.5,
                  color: '#facc15',
                  effectType: 'light',
                  hasHit: new Set(),
                  light: jLight,
                  onUpdate: (dt, eff) => {
                    eff.mesh.rotation.z += dt * 16;
                    if (Math.random() < 0.4) spawnSparkBurst(eff.mesh.position, 2, '#facc15', 10, 'star');
                  },
                  onExpire: (eff) => {
                    const hitPos = eff.mesh.position.clone();
                    spawnSparkBurst(hitPos, 14, '#facc15', 16, 'star');
                    spawnGroundRuptureDecal(hitPos, '#facc15', 4.5, 0.45);
                    playExplosionSound();
                  },
                });
              }, j * 65);
            }
          } else if (fruitId === 'fruit-magma') {
            // === MAGMA: METEOR RAIN: DAI FUNKA (4 FALLING METEORS FROM SKY) ===
            const rainCenter = playerGroup.position.clone().add(fwd.clone().multiplyScalar(16.0));
            triggerCameraShake(1.8, 0.8);

            for (let m = 0; m < 4; m++) {
              setTimeout(() => {
                const mAngle = (m / 4) * Math.PI * 2 + Math.random() * 0.5;
                const mDist = Math.random() * 9.0;
                const mTargetX = rainCenter.x + Math.cos(mAngle) * mDist;
                const mTargetZ = rainCenter.z + Math.sin(mAngle) * mDist;
                const mTargetY = getGroundHeight(mTargetX, mTargetZ);

                const mGroup = new THREE.Group();
                const meteorMesh = new THREE.Mesh(
                  skillGeoCache.dodeca,
                  new THREE.MeshStandardMaterial({ color: '#ea580c', emissive: '#dc2626', emissiveIntensity: 3.8 })
                );
                mGroup.add(meteorMesh);

                const fireTail = new THREE.Mesh(
                  skillGeoCache.coneLg,
                  new THREE.MeshBasicMaterial({ color: '#f97316', transparent: true, opacity: 0.85 })
                );
                fireTail.position.y = 4.5;
                mGroup.add(fireTail);

                const spawnY = mTargetY + 45;
                mGroup.position.set(mTargetX, spawnY, mTargetZ);
                scene.add(mGroup);

                const mLight = spawnDynamicSkillLight('#ea580c', 5.0, 30);
                activeEffects.push({
                  mesh: mGroup,
                  type: 'skill_v',
                  velocity: new THREE.Vector3(0, -65, 0), // Falling straight down!
                  lifetime: 0.8,
                  maxLifetime: 0.8,
                  damage: totalDmg * 0.35,
                  aoeRadius: 10.0,
                  color: '#ea580c',
                  effectType: 'fire',
                  hasHit: new Set(),
                  light: mLight,
                  onUpdate: (dt, eff) => {
                    eff.mesh.rotation.y += dt * 6;
                    eff.mesh.rotation.x += dt * 6;
                    if (Math.random() < 0.5) spawnSparkBurst(eff.mesh.position, 3, '#f97316', 10);
                  },
                  onExpire: (eff) => {
                    const impactPos = eff.mesh.position.clone();
                    impactPos.y = mTargetY;
                    spawnSparkBurst(impactPos, 24, '#ea580c', 22);
                    spawnGroundRuptureDecal(impactPos, '#dc2626', 8.5, 1.2); // Lingering lava crater
                    playExplosionSound();
                    triggerCameraShake(1.0, 0.35);

                    enemies.forEach((en) => {
                      if (en.hp <= 0) return;
                      if (en.mesh.position.distanceTo(impactPos) < 10.0) {
                        const toEn = en.mesh.position.clone().sub(impactPos).normalize();
                        applyDamageToEnemy(en, totalDmg * 0.35, toEn, '#ea580c', true, isHaki);
                      }
                    });
                  },
                });
              }, m * 200);
            }
          } else if (fruitId === 'fruit-smoke') {
            // === SMOKE: SMOKE FLIGHT BOMBER (JET RUSH & CARPET BOMBS) ===
            const jetStart = playerGroup.position.clone();
            const jetEnd = jetStart.clone().add(fwd.clone().multiplyScalar(24.0));
            jetEnd.y = getGroundHeight(jetEnd.x, jetEnd.z);

            playerGroup.position.copy(jetEnd);
            playerVy = 6.0;
            isGrounded = false;

            spawnGroundRuptureDecal(jetStart, '#cbd5e1', 5.0, 0.4);
            spawnGroundRuptureDecal(jetEnd, '#cbd5e1', 7.0, 0.6);
            spawnSparkBurst(jetEnd.clone().add(new THREE.Vector3(0, 3, 0)), 24, '#94a3b8', 18);
            triggerCameraShake(1.0, 0.35);
            playExplosionSound();

            [0.25, 0.5, 0.75].forEach((ratio, idx) => {
              setTimeout(() => {
                const bPos = jetStart.clone().lerp(jetEnd, ratio);
                bPos.y = getGroundHeight(bPos.x, bPos.z);
                spawnGroundRuptureDecal(bPos, '#94a3b8', 7.5, 0.6);
                spawnSparkBurst(bPos.clone().add(new THREE.Vector3(0, 2, 0)), 18, '#94a3b8', 16);
                playExplosionSound();

                enemies.forEach((en) => {
                  if (en.hp <= 0) return;
                  if (en.mesh.position.distanceTo(bPos) < 9.0) {
                    const toEn = en.mesh.position.clone().sub(bPos).normalize();
                    applyDamageToEnemy(en, totalDmg * 0.4, toEn, '#94a3b8', false, isHaki);
                  }
                });
              }, idx * 120);
            });
          } else {
            // === DRAGON, FLAME, ICE, BUDDHA, PORTAL, KITSUNE, BOMB ===
            const vGroup = new THREE.Group();
            const dynamicLight = spawnDynamicSkillLight(color, 6.5, 45);
            let aoeRadius = 28.0;

            if (fruitId === 'fruit-dragon') {
              // === FLAME DRAGON TORCH: TITANIC EASTERN DRAGON AVATAR ===
              aoeRadius = 32.0;
              const dragonHead = new THREE.Group();
              const skull = new THREE.Mesh(
                skillGeoCache.boxLg,
                new THREE.MeshStandardMaterial({ color: '#581c87', emissive: '#a855f7', emissiveIntensity: 3.2 })
              );
              dragonHead.add(skull);

              const snout = new THREE.Mesh(
                skillGeoCache.boxMd,
                new THREE.MeshStandardMaterial({ color: '#ea580c', emissive: '#ea580c', emissiveIntensity: 2.8 })
              );
              snout.position.set(0, -0.6, 5.0);
              dragonHead.add(snout);

              [-1.8, 1.8].forEach((eyeX) => {
                const eye = new THREE.Mesh(skillGeoCache.sphereSm, new THREE.MeshBasicMaterial({ color: '#facc15' }));
                eye.position.set(eyeX, 1.6, 3.5);
                dragonHead.add(eye);
              });

              vGroup.add(dragonHead);

              const solRing = new THREE.Mesh(skillGeoCache.torusLg, new THREE.MeshBasicMaterial({ color: '#ea580c', wireframe: true }));
              vGroup.add(solRing);
            } else if (fruitId === 'fruit-flame') {
              // === ENKAI: FIRE EMPEROR (ENTEI - MINIATURE SUN) ===
              aoeRadius = 30.0;
              const sunCore = new THREE.Mesh(
                skillGeoCache.sphereLg,
                new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#f97316', emissiveIntensity: 4.2 })
              );
              vGroup.add(sunCore);

              const solRing = new THREE.Mesh(skillGeoCache.torusLg, new THREE.MeshBasicMaterial({ color: '#facc15', wireframe: true }));
              vGroup.add(solRing);
            } else if (fruitId === 'fruit-ice') {
              // === ICE AGE BLIZZARD (RADIAL GLACIAL ERUPTION) ===
              aoeRadius = 30.0;
              const iceCore = new THREE.Mesh(
                skillGeoCache.icosa,
                new THREE.MeshStandardMaterial({ color: '#e0f2fe', emissive: '#38bdf8', emissiveIntensity: 3.5, roughness: 0.1, metalness: 0.4 })
              );
              vGroup.add(iceCore);

              for (let g = 0; g < 8; g++) {
                const ang = (g / 8) * Math.PI * 2;
                const gSpike = new THREE.Mesh(skillGeoCache.coneLg, new THREE.MeshStandardMaterial({ color: '#bae6fd', emissive: '#38bdf8', emissiveIntensity: 2.5 }));
                gSpike.position.set(Math.cos(ang) * 7.5, 0, Math.sin(ang) * 7.5);
                vGroup.add(gSpike);
              }
            } else if (fruitId === 'fruit-buddha') {
              // === ENLIGHTENMENT ROAR (RETRIBUTION OF THE GODS) ===
              aoeRadius = 32.0;
              const colossus = new THREE.Mesh(
                skillGeoCache.sphereLg,
                new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#eab308', emissiveIntensity: 4.0, metalness: 0.8 })
              );
              vGroup.add(colossus);

              const hRing = new THREE.Mesh(skillGeoCache.torusLg, new THREE.MeshBasicMaterial({ color: '#fde047' }));
              vGroup.add(hRing);
            } else if (fruitId === 'fruit-kitsune') {
              // === KITSUNE DIVINE ASCENSION (SPIRIT MOON & 9 TAILS) ===
              aoeRadius = 32.0;
              const moonDisc = new THREE.Mesh(skillGeoCache.ringLg, new THREE.MeshBasicMaterial({ color: '#e0e7ff', side: THREE.DoubleSide }));
              moonDisc.position.set(0, 3.5, -4.0);
              vGroup.add(moonDisc);

              for (let t = 0; t < 5; t++) {
                const tAng = ((t - 2) / 2.5) * Math.PI * 0.45;
                const tail = new THREE.Mesh(
                  skillGeoCache.coneLg,
                  new THREE.MeshStandardMaterial({ color: '#6366f1', emissive: '#38bdf8', emissiveIntensity: 3.5, transparent: true, opacity: 0.88 })
                );
                tail.position.set(Math.sin(tAng) * 5.5, Math.cos(tAng) * 5.5, -2.5);
                tail.rotation.z = -tAng;
                vGroup.add(tail);
              }
            } else if (fruitId === 'fruit-portal') {
              // === DIMENSIONAL RIFT DOMAIN (HEXAGONAL POCKET DIMENSION) ===
              aoeRadius = 30.0;
              const domainDome = new THREE.Mesh(
                skillGeoCache.icosa,
                new THREE.MeshStandardMaterial({ color: '#06b6d4', emissive: '#8b5cf6', emissiveIntensity: 3.5, wireframe: true })
              );
              vGroup.add(domainDome);
            } else {
              // === ATOMIC MINES TACTICAL NUCLEAR CARPET ===
              aoeRadius = 30.0;
              const coreNuke = new THREE.Mesh(
                skillGeoCache.sphereLg,
                new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: '#dc2626', emissiveIntensity: 4.2 })
              );
              vGroup.add(coreNuke);
            }

            vGroup.position.copy(playerGroup.position).add(fwd.clone().multiplyScalar(6)).add(new THREE.Vector3(0, 6, 0));
            vGroup.lookAt(vGroup.position.clone().add(fwd));
            scene.add(vGroup);

            activeEffects.push({
              mesh: vGroup,
              type: 'skill_v',
              velocity: fwd.clone().multiplyScalar(30),
              lifetime: 1.05,
              maxLifetime: 1.05,
              damage: totalDmg,
              aoeRadius,
              color,
              effectType,
              hasHit: new Set(),
              isAoe: true,
              light: dynamicLight,
              onUpdate: (dt, eff) => {
                eff.mesh.rotation.z += dt * 4.5;
                eff.mesh.rotation.y += dt * 3.5;
                if (Math.random() < 0.5) spawnSparkBurst(eff.mesh.position, 3, color, 12, effectType === 'ice' ? 'ice' : effectType === 'light' ? 'star' : 'spark');
              },
              onExpire: (eff) => {
                const novaCenter = eff.mesh.position.clone();
                spawnSparkBurst(novaCenter, 28, color, 24, effectType === 'ice' ? 'ice' : effectType === 'light' ? 'star' : 'spark');
                spawnGroundRuptureDecal(novaCenter, color, aoeRadius * 1.3, 1.0);
                playExplosionSound();
                triggerCameraShake(1.8, 0.6);

                const novaMesh = new THREE.Mesh(
                  skillGeoCache.sphereLg,
                  new THREE.MeshStandardMaterial({ color: '#ffffff', emissive: color, emissiveIntensity: 4.8, wireframe: true, transparent: true, opacity: 0.95 })
                );
                novaMesh.scale.setScalar(aoeRadius / 5.5);
                novaMesh.position.copy(novaCenter);
                scene.add(novaMesh);

                const flashLight = spawnDynamicSkillLight(color, 8.0, 50);
                flashLight.position.copy(novaCenter);

                enemies.forEach((enemy) => {
                  if (enemy.hp <= 0) return;
                  const d = novaCenter.distanceTo(enemy.mesh.position);
                  if (d < aoeRadius * 1.2) {
                    const toEnemy = enemy.mesh.position.clone().sub(novaCenter).normalize();
                    const isCrit = Math.random() < 0.45;
                    applyDamageToEnemy(enemy, eff.damage * (isCrit ? 1.8 : 1.0) * (isHaki ? 1.4 : 1.0), toEnemy, color, isCrit, isHaki);
                  }
                });

                setTimeout(() => {
                  scene.remove(novaMesh);
                  returnSkillLight(flashLight);
                }, 400);
              },
            });
          }
        }
      }
    };

    // =========================================================================
    // 9. CONTROLS & EVENT LISTENERS
    // =========================================================================
    const keys: Record<string, boolean> = {};

    const handleKeyDown = (e: KeyboardEvent) => {
      if (propsRef.current.isPaused) return;
      keys[e.key.toLowerCase()] = true;

      // Key Q: Flash Step
      if (e.key.toLowerCase() === 'q') {
        executeDash();
      }

      // Key B: Toggle Haki
      if (e.key.toLowerCase() === 'b') {
        playHakiSound();
      }

      // Key E: Interact with nearby NPCs
      if (e.key.toLowerCase() === 'e') {
        const pPos = playerGroup.position;
        if (pPos.distanceTo(dealerGroup.position) < 12) {
          propsRef.current.onOpenShop('dealer');
        } else if (pPos.distanceTo(smithGroup.position) < 12) {
          propsRef.current.onOpenShop('blacksmith');
        } else if (pPos.distanceTo(accGroup.position) < 12) {
          propsRef.current.onOpenShop('accessories');
        } else if (pPos.distanceTo(questNpcGroup.position) < 12) {
          propsRef.current.onOpenShop('quests');
        } else if (pPos.distanceTo(harborGroup.position) < 12) {
          propsRef.current.onOpenShop('map');
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Mouse Drag Camera Orbit & Click to Attack
    let isMouseDown = false;
    let clickStartX = 0;
    let clickStartY = 0;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let cameraYaw = 0;
    let cameraPitch = 0.35;
    let cameraDist = 20;

    const handleMouseDown = (e: MouseEvent) => {
      if (propsRef.current.isPaused) return;
      if (e.button === 0 || e.button === 2) {
        isMouseDown = true;
        clickStartX = e.clientX;
        clickStartY = e.clientY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isMouseDown) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      cameraYaw -= deltaX * 0.006;
      cameraPitch = Math.max(0.08, Math.min(1.25, cameraPitch + deltaY * 0.005));
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (isMouseDown && e.button === 0) {
        const moveDist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
        if (moveDist < 6) {
          // Clean Left Click -> Trigger Sword Attack!
          if (propsRef.current.onRequestAttack) {
            propsRef.current.onRequestAttack('sword');
          } else {
            triggerAttack3D('sword');
          }
        }
      }
      isMouseDown = false;
    };

    const handleWheel = (e: WheelEvent) => {
      cameraDist = Math.max(6, Math.min(42, cameraDist + e.deltaY * 0.02));
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: true });

    // Touch Support for Mobile (Multi-Touch Aware for Simultaneous Movement + Camera)
    let cameraTouchId: number | null = null;
    let touchStartX = 0;
    let touchStartY = 0;
    let touchDownTime = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (propsRef.current.isPaused) return;
      if (e.target !== renderer.domElement) return;
      if (cameraTouchId === null && e.changedTouches.length > 0) {
        const t = e.changedTouches[0];
        cameraTouchId = t.identifier;
        touchStartX = t.clientX;
        touchStartY = t.clientY;
        touchDownTime = Date.now();
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (cameraTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === cameraTouchId) {
          const deltaX = t.clientX - touchStartX;
          const deltaY = t.clientY - touchStartY;
          touchStartX = t.clientX;
          touchStartY = t.clientY;

          cameraYaw -= deltaX * 0.008;
          cameraPitch = Math.max(0.08, Math.min(1.25, cameraPitch + deltaY * 0.006));
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (cameraTouchId === null) return;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === cameraTouchId) {
          const dist = Math.hypot(t.clientX - touchStartX, t.clientY - touchStartY);
          const duration = Date.now() - touchDownTime;
          if (dist < 8 && duration < 320) {
            if (propsRef.current.onRequestAttack) {
              propsRef.current.onRequestAttack('sword');
            } else {
              triggerAttack3D('sword');
            }
          }
          cameraTouchId = null;
          break;
        }
      }
    };

    const handleTouchCancel = () => {
      cameraTouchId = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: true });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true });

    // Physics state
    let playerVy = 0;
    const gravity = 28;
    const jumpStrength = 14.5;
    let isGrounded = true;
    let canSkyJump = false;
    let prevJumpInput = false;

    // Flash Step / Dash Execution
    const executeDash = () => {
      playDashSound();
      const fwd = getAimDirection();
      const startPos = playerGroup.position.clone();

      // Ghost trail at origin
      spawnGroundRuptureDecal(startPos, '#38bdf8', 4.0, 0.4);
      spawnSparkBurst(startPos.clone().add(new THREE.Vector3(0, 3.5, 0)), 16, '#38bdf8', 18, 'star');

      // Dash teleport forward
      playerGroup.position.add(fwd.clone().multiplyScalar(13));
      const endPos = playerGroup.position.clone();

      // Flash sonic shockwave on landing
      spawnGroundRuptureDecal(endPos, '#ffffff', 4.5, 0.45);
      spawnSparkBurst(endPos.clone().add(new THREE.Vector3(0, 3.5, 0)), 18, '#ffffff', 16, 'star');
      triggerCameraShake(0.3, 0.15);
    };

    // Keep track of sword visual changes
    let currentEquippedSwordId = propsRef.current.equippedSword.id;
    let currentHakiActive = propsRef.current.hakiActive;

    // =========================================================================
    // 10. MAIN ANIMATION LOOP
    // =========================================================================
    let animationFrameId: number;
    const clock = new THREE.Clock();
    let walkCycle = 0;
    let currentSmoothMode = isSmooth;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.1);
      const curProps = propsRef.current;

      // Dynamic Smooth Mode adjustment
      if (curProps.smoothMode !== undefined && curProps.smoothMode !== currentSmoothMode) {
        currentSmoothMode = curProps.smoothMode;
        renderer.shadowMap.enabled = !currentSmoothMode;
        renderer.setPixelRatio(currentSmoothMode ? 1.0 : Math.min(window.devicePixelRatio, 1.25));
        sunLight.castShadow = !currentSmoothMode;
      }

      // Keep sun light centered on player
      sunLight.position.set(playerGroup.position.x + 80, 140, playerGroup.position.z + 60);
      sunLight.target.position.copy(playerGroup.position);
      sunLight.target.updateMatrixWorld();

      // 1. Process External Attack Trigger from HUD or Keyboard
      if (curProps.attackTrigger && curProps.attackTrigger.id !== lastAttackId.current) {
        lastAttackId.current = curProps.attackTrigger.id;
        triggerAttack3D(curProps.attackTrigger.type, curProps.attackTrigger.skill);
      }

      // 2. Process Dash Trigger
      if (curProps.dashTrigger && curProps.dashTrigger !== lastDashId.current) {
        lastDashId.current = curProps.dashTrigger;
        executeDash();
      }

      // 3. Process Haki Toggle Trigger
      if (curProps.hakiToggleTrigger && curProps.hakiToggleTrigger !== lastHakiId.current) {
        lastHakiId.current = curProps.hakiToggleTrigger;
        playHakiSound();
        const pPos = playerGroup.position.clone();
        spawnGroundRuptureDecal(pPos, curProps.hakiActive ? '#c084fc' : '#38bdf8', 5.5, 0.5);
        spawnSparkBurst(pPos.clone().add(new THREE.Vector3(0, 3.5, 0)), 24, curProps.hakiActive ? '#c084fc' : '#38bdf8', 16, 'star');
        triggerCameraShake(0.5, 0.25);
      }

      // 4. Process Island Teleport / Fast Travel
      if (curProps.teleportTarget && curProps.teleportTarget.name !== lastTeleportName.current) {
        lastTeleportName.current = curProps.teleportTarget.name;
        const groundY = getGroundHeight(curProps.teleportTarget.x, curProps.teleportTarget.z);
        playerGroup.position.set(curProps.teleportTarget.x, groundY + 1.5, curProps.teleportTarget.z);
        playerVy = 0;
      }

      // Background Game Pause (Freeze world simulation when questions or modals are shown)
      if (curProps.isPaused) {
        renderer.render(scene, camera);
        return;
      }

      // 5. Update Sword Mesh if sword or Haki changed
      if (
        curProps.equippedSword.id !== currentEquippedSwordId ||
        curProps.hakiActive !== currentHakiActive
      ) {
        currentEquippedSwordId = curProps.equippedSword.id;
        currentHakiActive = curProps.hakiActive;
        buildSwordVisual(currentEquippedSwordId, currentHakiActive);

        // Haki Armament visual reflection
        armMat.color.set(currentHakiActive ? '#18181b' : '#fde047');
        armMat.metalness = currentHakiActive ? 0.8 : 0.0;
        armMat.roughness = currentHakiActive ? 0.2 : 0.4;
      }

      // Update Player Gender Model if changed dynamically
      if (curProps.playerGender && curProps.playerGender !== currentRenderedGender) {
        buildPlayerGenderVisuals(curProps.playerGender);
      }

      // Buddha Giant Scaling
      const isBuddha = curProps.equippedFruit.id === 'fruit-buddha';
      const targetScale = isBuddha ? 2.3 : 1.0;
      playerGroup.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

      // Aura light color & 3D LEGO Blox Fruit Companion Animation
      const fColor = curProps.equippedFruit.glowColor || '#f97316';
      auraLight.color.set(fColor);
      fruitCoreMat.color.set(fColor);
      fruitCoreMat.emissive.set(fColor);
      legoFruitGroup.rotation.y += dt * 1.5;
      legoFruitGroup.position.y = 5.2 + Math.sin(clock.elapsedTime * 2.8) * 0.18;

      // Movement Input (Keyboard + Mobile Virtual Controls)
      let inputZ = 0;
      let inputX = 0;
      if (keys['w'] || keys['arrowup']) inputZ -= 1;
      if (keys['s'] || keys['arrowdown']) inputZ += 1;
      if (keys['a'] || keys['arrowleft']) inputX -= 1;
      if (keys['d'] || keys['arrowright']) inputX += 1;

      if (curProps.movementInput.forward !== 0) inputZ = -curProps.movementInput.forward;
      if (curProps.movementInput.strafe !== 0) inputX = curProps.movementInput.strafe;

      const isSprinting = Boolean(keys['shift'] || curProps.movementInput.sprint);
      const moveSpeed = isSprinting ? 20.0 : 11.0;

      // Jump & Sky Leap (Edge-triggered for clean mobile touch & keyboard)
      const currentJumpInput = Boolean(keys[' '] || curProps.movementInput.jump);
      const jumpPressed = currentJumpInput && !prevJumpInput;
      prevJumpInput = currentJumpInput;

      if (jumpPressed) {
        keys[' '] = false;
        if (isGrounded) {
          playerVy = jumpStrength;
          isGrounded = false;
          canSkyJump = true;
          playDashSound();
        } else if (canSkyJump) {
          playerVy = jumpStrength * 1.15;
          canSkyJump = false;
          playDashSound();
          spawnSparkBurst(playerGroup.position.clone().add(new THREE.Vector3(0, 1, 0)), 8, '#38bdf8', 8);
        }
      }

      // Move player relative to camera yaw
      const moveVector = new THREE.Vector3(inputX, 0, inputZ);
      const isMoving = moveVector.lengthSq() > 0.01;

      if (isMoving) {
        moveVector.normalize();
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

        playerGroup.position.x += moveVector.x * moveSpeed * dt;
        playerGroup.position.z += moveVector.z * moveSpeed * dt;

        // Smooth rotation towards movement
        const targetRot = Math.atan2(moveVector.x, moveVector.z);
        let rotDiff = targetRot - playerGroup.rotation.y;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        playerGroup.rotation.y += rotDiff * 0.22;

        // Walk / Run Limb Animation
        walkCycle += dt * (isSprinting ? 15 : 10);
        const swingAngle = Math.sin(walkCycle) * (isSprinting ? 0.8 : 0.55);
        leftArmGroup.rotation.x = swingAngle;
        if (!isAttacking) {
          rightArmGroup.rotation.x = -swingAngle;
        }
        leftLegGroup.rotation.x = -swingAngle;
        rightLegGroup.rotation.x = swingAngle;
      } else {
        leftArmGroup.rotation.x = THREE.MathUtils.lerp(leftArmGroup.rotation.x, 0, 0.15);
        if (!isAttacking) {
          rightArmGroup.rotation.x = THREE.MathUtils.lerp(rightArmGroup.rotation.x, 0, 0.15);
        }
        leftLegGroup.rotation.x = THREE.MathUtils.lerp(leftLegGroup.rotation.x, 0, 0.15);
        rightLegGroup.rotation.x = THREE.MathUtils.lerp(rightLegGroup.rotation.x, 0, 0.15);
      }

      // =======================================================================
      // Dynamic Sword Slash Animation (Wind-up -> Downward Slash -> Recovery)
      // =======================================================================
      if (isAttacking) {
        attackTime -= dt;
        const p = Math.max(0, Math.min(1, 1 - attackTime / attackDuration));

        if (p < 0.22) {
          // Phase 1: Wind-up: pull right arm back & up
          const w = p / 0.22;
          rightArmGroup.rotation.x = THREE.MathUtils.lerp(0, -Math.PI * 0.75, w);
          rightArmGroup.rotation.y = THREE.MathUtils.lerp(0, 0.6, w);
          rightArmGroup.rotation.z = THREE.MathUtils.lerp(0, 0.4, w);
          genderModelGroup.rotation.y = THREE.MathUtils.lerp(0, -0.25, w);
        } else if (p < 0.75) {
          // Phase 2: Downward & across violent slash sweep!
          const s = (p - 0.22) / 0.53;
          const sEase = Math.sin(s * Math.PI * 0.5);
          rightArmGroup.rotation.x = THREE.MathUtils.lerp(-Math.PI * 0.75, Math.PI * 0.55, sEase);
          rightArmGroup.rotation.y = THREE.MathUtils.lerp(0.6, -0.75, s);
          rightArmGroup.rotation.z = THREE.MathUtils.lerp(0.4, -0.3, s);
          genderModelGroup.rotation.y = THREE.MathUtils.lerp(-0.25, 0.35, s);

          // Spawn the visible crescent arc wave!
          if (!slashWaveSpawned) {
            slashWaveSpawned = true;
            spawnSwordSlashWave();
          }
        } else {
          // Phase 3: Recovery back to neutral
          const r = (p - 0.75) / 0.25;
          rightArmGroup.rotation.x = THREE.MathUtils.lerp(Math.PI * 0.55, 0, r);
          rightArmGroup.rotation.y = THREE.MathUtils.lerp(-0.75, 0, r);
          rightArmGroup.rotation.z = THREE.MathUtils.lerp(-0.3, 0, r);
          genderModelGroup.rotation.y = THREE.MathUtils.lerp(0.35, 0, r);
        }

        if (attackTime <= 0) {
          isAttacking = false;
          rightArmGroup.rotation.set(0, 0, 0);
          genderModelGroup.rotation.y = 0;
        }
      }

      // Gravity & Ground Collision
      playerVy -= gravity * dt;
      playerGroup.position.y += playerVy * dt;

      const groundY = getGroundHeight(playerGroup.position.x, playerGroup.position.z);
      if (playerGroup.position.y <= groundY) {
        playerGroup.position.y = groundY;
        playerVy = 0;
        isGrounded = true;
      }

      // Ocean Water Hazard: Devil Fruit users take damage in seawater
      if (groundY <= 0.1 && playerGroup.position.y <= 0.3) {
        if (Math.random() < dt * 1.5) {
          curProps.onDamageTaken(20);
          spawnFloatingDamage(playerGroup.position, '🌊 Nalulunod sa Dagat! -20', '#0284c7', true);
        }
      }
      if (playerGroup.position.y < -15) {
        playerGroup.position.set(0, starterTopY + 2.0, 20);
        playerVy = 0;
        isGrounded = true;
        curProps.onDamageTaken(9999);
      }

      // Smooth Orbit Camera with Dynamic Screen Shake
      let shakeX = 0;
      let shakeY = 0;
      let shakeZ = 0;
      if (cameraShakeTime > 0) {
        cameraShakeTime -= dt;
        const progress = Math.max(0, cameraShakeTime / 0.35);
        const curMag = cameraShakeMagnitude * progress;
        shakeX = (Math.random() - 0.5) * curMag;
        shakeY = (Math.random() - 0.5) * curMag;
        shakeZ = (Math.random() - 0.5) * curMag;
      }

      const camTargetX = playerGroup.position.x + Math.sin(cameraYaw) * Math.cos(cameraPitch) * cameraDist + shakeX;
      const camTargetY = playerGroup.position.y + Math.sin(cameraPitch) * cameraDist + 4.5 + shakeY;
      const camTargetZ = playerGroup.position.z + Math.cos(cameraYaw) * Math.cos(cameraPitch) * cameraDist + shakeZ;

      camera.position.lerp(new THREE.Vector3(camTargetX, camTargetY, camTargetZ), 0.18);
      camera.lookAt(playerGroup.position.x, playerGroup.position.y + 4.5, playerGroup.position.z);

      // Rotate Star Coins & Proximity Pickup
      starCoins.forEach((c) => {
        if (!c.collected) {
          c.mesh.rotation.y += dt * 3.5;
          c.mesh.position.y = c.originalY + Math.sin(clock.getElapsedTime() * 3.5) * 0.45;

          if (playerGroup.position.distanceTo(c.mesh.position) < 4.4) {
            c.collected = true;
            c.mesh.visible = false;
            c.respawnTimer = 18.0;
            playStarSound();
            curProps.onCoinCollected(c.value);
            spawnSparkBurst(c.mesh.position, 12, '#facc15', 10);
            spawnFloatingDamage(c.mesh.position, `+${c.value} ⭐ COIN`, '#facc15', false);
          }
        } else {
          c.respawnTimer -= dt;
          if (c.respawnTimer <= 0) {
            c.collected = false;
            c.mesh.visible = true;
          }
        }
      });

      // Chest Proximity Open with Educational Quiz & Respawns
      chests.forEach((c) => {
        if (!c.opened) {
          // Bobbing beacon beam
          c.beaconBeam.rotation.y += dt * 1.5;

          if (c.quizCooldown > 0) {
            c.quizCooldown -= dt;
          }

          const dist = playerGroup.position.distanceTo(c.mesh.position);
          if (dist < 4.8) {
            if (curProps.onOpenChestQuiz && c.quizCooldown <= 0) {
              c.quizCooldown = 4.0;
              curProps.onOpenChestQuiz(c.id, c.rewardStars);
            } else if (!curProps.onOpenChestQuiz && dist < 4.2) {
              c.opened = true;
              c.respawnTimer = 40.0;
              c.lid.rotation.x = -Math.PI * 0.45;
              c.beaconBeam.visible = false;

              playStarSound();
              curProps.onChestCollected(c.rewardStars);
              spawnSparkBurst(c.mesh.position.clone().add(new THREE.Vector3(0, 2.5, 0)), 32, '#facc15', 20);
              spawnFloatingDamage(c.mesh.position, `+${c.rewardStars} ⭐ CHEST!`, '#fef08a', true);
            }
          }
        } else {
          c.respawnTimer -= dt;
          if (c.respawnTimer <= 0) {
            if (c.id.startsWith('boss-drop-')) {
              // Boss dropped chest opened: clean up permanently
              scene.remove(c.mesh);
              const idx = chests.indexOf(c);
              if (idx !== -1) chests.splice(idx, 1);
            } else {
              c.opened = false;
              c.lid.rotation.x = 0;
              c.beaconBeam.visible = true;
              c.quizCooldown = 0;
            }
          }
        }
      });

      // Handle External Chest Unlock from Quiz Success
      if (
        curProps.openedChestTrigger &&
        curProps.openedChestTrigger.time > lastOpenedChestTime.current
      ) {
        lastOpenedChestTime.current = curProps.openedChestTrigger.time;
        const targetChest = chests.find((ch) => ch.id === curProps.openedChestTrigger?.id);
        if (targetChest && !targetChest.opened) {
          targetChest.opened = true;
          targetChest.respawnTimer = 45.0;
          targetChest.lid.rotation.x = -Math.PI * 0.45;
          targetChest.beaconBeam.visible = false;
          playStarSound();
          spawnSparkBurst(targetChest.mesh.position.clone().add(new THREE.Vector3(0, 2.5, 0)), 36, '#facc15', 22);
          spawnFloatingDamage(targetChest.mesh.position, `+${targetChest.rewardStars} ⭐ TAMA!`, '#fef08a', true);
        }
      }

      // Super Jump Launch Pads / Geysers
      launchPads.forEach((lp) => {
        const d = playerGroup.position.distanceTo(new THREE.Vector3(lp.x, lp.y, lp.z));
        if (d < 4.2 && isGrounded) {
          playerVy = lp.targetVy;
          isGrounded = false;
          canSkyJump = true;
          playDashSound();
          spawnSparkBurst(playerGroup.position.clone().add(new THREE.Vector3(0, 1, 0)), 16, '#38bdf8', 16);
          spawnFloatingDamage(playerGroup.position, lp.label, '#38bdf8', true);
        }
      });

      // Update Combat Active Effects (Sword Waves, Skills Z, X, C, V, Decals)
      for (let i = activeEffects.length - 1; i >= 0; i--) {
        const eff = activeEffects[i];
        eff.mesh.position.addScaledVector(eff.velocity, dt);
        eff.lifetime -= dt;

        if (eff.light) {
          eff.light.position.copy(eff.mesh.position);
          const ratio = Math.max(0, eff.lifetime / eff.maxLifetime);
          eff.light.intensity = 4.5 * ratio;
        }

        if (eff.onUpdate) {
          eff.onUpdate(dt, eff);
        }

        // Periodic AoE Ticks (e.g. Skill X Pillar / Tornado)
        if (eff.isPeriodic) {
          eff.periodicTimer = (eff.periodicTimer || 0) + dt;
          if (eff.periodicTimer >= (eff.periodicInterval || 0.28)) {
            eff.periodicTimer = 0;
            eff.hasHit.clear(); // Allow next tick
          }
        }

        // Enemy Collision & Damage Check
        if (eff.damage > 0 && eff.aoeRadius > 0) {
          enemies.forEach((enemy) => {
            if (enemy.hp <= 0) return;
            if (eff.hasHit.has(enemy)) return;

            const dist = eff.mesh.position.distanceTo(enemy.mesh.position);
            if (dist <= eff.aoeRadius) {
              eff.hasHit.add(enemy);

              const isCrit = Math.random() < 0.3;
              const isHaki = curProps.hakiActive;
              const multiplier = (isCrit ? 1.6 : 1.0) * (isHaki ? 1.35 : 1.0);
              const toEnemy = enemy.mesh.position.clone().sub(eff.mesh.position).normalize();

              // Lift enemy for Skill X pillar
              if (eff.type === 'skill_x') {
                enemy.mesh.position.y += 2.0;
              }

              applyDamageToEnemy(enemy, eff.damage * multiplier, toEnemy, eff.color, isCrit, isHaki);

              // For non-AoE single-hit projectiles, expire on contact
              if (eff.type === 'skill_z') {
                eff.lifetime = 0; // Trigger detonation in onExpire
              }
            }
          });
        }

        // Expire or finished
        if (eff.lifetime <= 0) {
          if (eff.onExpire) {
            eff.onExpire(eff);
          }
          if (eff.light) {
            returnSkillLight(eff.light);
          }
          scene.remove(eff.mesh);
          disposeHierarchy(eff.mesh);
          activeEffects.splice(i, 1);
        }
      }

      // Update Spark Particles with Smooth Shrink Fading
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.lifetime -= dt;
        p.velocity.y -= gravity * 0.5 * dt;
        p.mesh.position.addScaledVector(p.velocity, dt);

        const ratio = Math.max(0.01, p.lifetime / p.maxLifetime);
        p.mesh.scale.setScalar(ratio);

        if (p.lifetime <= 0) {
          scene.remove(p.mesh);
          particles.splice(i, 1);
        }
      }

      // Update Floating 3D Damage Numbers (Pool-based, zero allocation)
      damageSpritePool.forEach((ft) => {
        if (!ft.inUse) return;
        ft.lifetime -= dt;
        ft.sprite.position.addScaledVector(ft.velocity, dt);
        const progress = Math.max(0, ft.lifetime / ft.maxLifetime);
        ft.sprite.material.opacity = progress;

        if (ft.lifetime <= 0) {
          ft.inUse = false;
          ft.sprite.visible = false;
        }
      });

      // Update Enemies AI, Skills & Respawns
      enemies.forEach((enemy) => {
        if (enemy.hp <= 0) {
          if (enemy.telegraphMesh) {
            scene.remove(enemy.telegraphMesh);
            disposeHierarchy(enemy.telegraphMesh);
            enemy.telegraphMesh = null;
          }
          enemy.isCasting = false;
          if (enemy.leftArm) enemy.leftArm.rotation.x = 0;
          if (enemy.rightArm) enemy.rightArm.rotation.x = 0;
          if (enemy.leftLeg) enemy.leftLeg.rotation.x = 0;
          if (enemy.rightLeg) enemy.rightLeg.rotation.x = 0;

          enemy.respawnTimer -= dt;
          if (enemy.respawnTimer <= 0) {
            enemy.hp = enemy.maxHp;
            enemy.mesh.position.copy(enemy.patrolCenter);
            enemy.mesh.visible = true;
            enemy.skillCooldown = 3.0 + Math.random() * 3.0;
            updateEnemyHpBar(enemy);
          }
          return;
        }

        if (enemy.takeHitAnim > 0) {
          enemy.takeHitAnim -= dt;
        }
        if (enemy.attackCooldown > 0) enemy.attackCooldown -= dt;
        if (enemy.skillCooldown > 0) enemy.skillCooldown -= dt;

        const distToPlayer = enemy.mesh.position.distanceTo(playerGroup.position);
        if (distToPlayer > 85) {
          // Off-screen on another island: skip limb matrix updates and expensive physics
          return;
        }

        // 1. Enemy Skill Casting Sequence
        if (enemy.isCasting) {
          enemy.skillCastTimer -= dt;

          if (enemy.leftArm) enemy.leftArm.rotation.x = -Math.PI / 3;
          if (enemy.rightArm) enemy.rightArm.rotation.x = -Math.PI / 3;

          if (enemy.telegraphMesh) {
            enemy.telegraphMesh.scale.multiplyScalar(1.0 + dt * 0.4);
          }

          if (enemy.skillCastTimer <= 0) {
            enemy.isCasting = false;
            enemy.skillCooldown = enemy.maxSkillCooldown;
            if (enemy.leftArm) enemy.leftArm.rotation.x = 0;
            if (enemy.rightArm) enemy.rightArm.rotation.x = 0;

            let telegraphCenter = enemy.mesh.position;
            if (enemy.telegraphMesh) {
              telegraphCenter = enemy.telegraphMesh.position.clone();
              scene.remove(enemy.telegraphMesh);
              disposeHierarchy(enemy.telegraphMesh);
              enemy.telegraphMesh = null;
            }

            const hitDist = playerGroup.position.distanceTo(telegraphCenter);
            const skillRadius = enemy.isBoss ? 16.0 : 10.0;

            if (hitDist <= skillRadius) {
              // Player Hit by Enemy Skill!
              const skillDmg = Math.round(enemy.atk * (enemy.isBoss ? 2.2 : 1.75));
              playExplosionSound();
              curProps.onDamageTaken(skillDmg);
              spawnSparkBurst(playerGroup.position.clone().add(new THREE.Vector3(0, 3, 0)), 24, '#ef4444', 16);
              spawnFloatingDamage(playerGroup.position, `⚠️ ${enemy.skillName} -${skillDmg}`, '#ef4444', true);
            } else {
              // Player Successfully Dodged!
              spawnFloatingDamage(playerGroup.position, 'DODGED! 💨', '#38bdf8', true);
            }
          }
          return; // Frozen in place while casting
        }

        // 2. Normal AI State & Movement
        if (distToPlayer < 28) {
          enemy.state = 'chase';
          const dir = playerGroup.position.clone().sub(enemy.mesh.position).normalize();
          enemy.mesh.position.x += dir.x * enemy.speed * dt;
          enemy.mesh.position.z += dir.z * enemy.speed * dt;
          enemy.mesh.rotation.y = Math.atan2(dir.x, dir.z);

          // Animate walking / chasing limbs
          enemy.walkCycleAnim = (enemy.walkCycleAnim || 0) + dt * enemy.speed * 2.2;
          const swing = Math.sin(enemy.walkCycleAnim) * 0.55;
          if (enemy.leftArm) enemy.leftArm.rotation.x = swing;
          if (enemy.rightArm) enemy.rightArm.rotation.x = -swing;
          if (enemy.leftLeg) enemy.leftLeg.rotation.x = -swing;
          if (enemy.rightLeg) enemy.rightLeg.rotation.x = swing;

          // Initiate Skill when cooldown is ready
          if (enemy.skillCooldown <= 0 && distToPlayer < 24) {
            enemy.isCasting = true;
            enemy.skillCastTimer = enemy.isBoss ? 1.05 : 0.8;

            // Spawn Red Warning Telegraph Ring at Target Area
            const teleRadius = enemy.isBoss ? 15.0 : 9.0;
            const teleGeo = new THREE.RingGeometry(1.0, teleRadius, 24);
            const teleMat = new THREE.MeshBasicMaterial({
              color: enemy.isBoss ? '#dc2626' : '#f97316',
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.65,
            });
            const teleMesh = new THREE.Mesh(teleGeo, teleMat);
            teleMesh.rotation.x = -Math.PI / 2;
            teleMesh.position.copy(playerGroup.position);
            teleMesh.position.y += 0.25;
            scene.add(teleMesh);
            enemy.telegraphMesh = teleMesh;

            spawnFloatingDamage(enemy.mesh.position, `⚠️ ${enemy.skillName}!`, '#facc15', true);
            return;
          }

          // Basic Melee Strike
          if (distToPlayer < 4.2 && enemy.attackCooldown <= 0) {
            enemy.attackCooldown = 1.6;
            curProps.onDamageTaken(enemy.atk);
            playSwordSlashSound();
            spawnSparkBurst(playerGroup.position.clone().add(new THREE.Vector3(0, 3, 0)), 8, '#f87171');
          }
        } else {
          enemy.state = 'idle';
          if (enemy.leftArm) enemy.leftArm.rotation.x = 0;
          if (enemy.rightArm) enemy.rightArm.rotation.x = 0;
          if (enemy.leftLeg) enemy.leftLeg.rotation.x = 0;
          if (enemy.rightLeg) enemy.rightLeg.rotation.x = 0;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);
      window.removeEventListener('resize', handleResize);

      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      damageSpritePool.forEach((d) => {
        d.texture.dispose();
        (d.sprite.material as THREE.Material).dispose();
      });
      sparkMatCache.forEach((m) => m.dispose());
      skillLightPool.forEach((l) => l.dispose());
      renderer.dispose();
    };
  }, []);

  // Billboard Text & HP Bar Utilities
  function createBillboardText(text: string, color: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.roundRect(4, 4, 248, 56, 12);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.font = 'bold 20px monospace';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 32);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(6.5, 1.6, 1);
    return sprite;
  }

  function createBillboardHpBar(current: number, max: number, name: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 70;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      drawHpBarCanvas(ctx, current, max, name);
    }
    const texture = new THREE.CanvasTexture(canvas);
    const mat = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(mat);
    sprite.scale.set(6.5, 1.8, 1);
    return sprite;
  }

  function drawHpBarCanvas(
    ctx: CanvasRenderingContext2D,
    current: number,
    max: number,
    name: string
  ) {
    ctx.clearRect(0, 0, 256, 70);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.roundRect(4, 4, 248, 62, 10);
    ctx.fill();
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    ctx.font = 'bold 15px sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(name, 128, 22);

    ctx.fillStyle = '#334155';
    ctx.fillRect(16, 32, 224, 16);

    const fillW = Math.max(0, Math.min(224, (current / max) * 224));
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(16, 32, fillW, 16);

    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${current}/${max}`, 128, 60);
  }

  function updateEnemyHpBar(enemy: Enemy3D) {
    const sprite = enemy.hpBarMesh;
    const texture = sprite.material.map as THREE.CanvasTexture;
    if (texture && texture.image) {
      const canvas = texture.image as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        drawHpBarCanvas(ctx, enemy.hp, enemy.maxHp, enemy.name);
        texture.needsUpdate = true;
      }
    }
  }

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative cursor-grab active:cursor-grabbing select-none"
    />
  );
};

export const BloxFruitsWorld3D = React.memo(BloxFruitsWorld3DComponent);
