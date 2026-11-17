import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  ProductConfiguration,
  RoomArrangement,
  RoomPreset,
} from '../types/furniture';
import { createProceduralTextureSet } from './textures';
import {
  buildArcoFloorLamp,
  buildAtelierLoungeChair,
  buildAurelSofa,
  buildFormDiningTable,
  buildLumaBed,
  buildMonoCoffeeTable,
  buildNomaDiningChair,
  buildStoneSideTable,
  FurnitureAssembly,
} from './models';

export interface ShowroomCanvasProps {
  scrollProgress: number; // 0..1 continuous showroom scroll journey
  interactiveOrbit: boolean; // True when user enables 360° Inspect or Spaces Explorer
  activePreset: RoomPreset | null;
  arrangement: RoomArrangement;
  sofaConfig: ProductConfiguration;
  selectedProductId: string | null;
  onSelectProduct: (productId: string | null) => void;
  resetSignal: number;
  zoomDeltaSignal: { seq: number; dir: number };
}

function detectSoftwareWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return true;
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  } catch {
    return true;
  }
}

interface CameraKeyframe {
  t: number;
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

const SCROLL_KEYFRAMES: CameraKeyframe[] = [
  // 0.00 — Hero Living Room Vista (frames furniture center-right around bottom-left editorial card)
  {
    t: 0.0,
    pos: new THREE.Vector3(-2.15, 1.62, 4.95),
    look: new THREE.Vector3(-0.48, 0.56, -0.22),
  },
  // 0.24 — Signature AUREL Sofa Close-Up
  {
    t: 0.24,
    pos: new THREE.Vector3(-0.75, 1.18, 2.75),
    look: new THREE.Vector3(-0.1, 0.56, -0.3),
  },
  // 0.48 — Full Living Room Architectural Pull-Back
  {
    t: 0.48,
    pos: new THREE.Vector3(1.5, 2.15, 5.45),
    look: new THREE.Vector3(0.4, 0.7, 0.1),
  },
  // 0.74 — Lateral Glide Through Archway into Dining Pavilion
  {
    t: 0.74,
    pos: new THREE.Vector3(9.4, 1.9, 4.7),
    look: new THREE.Vector3(9.5, 0.78, -0.6),
  },
  // 1.00 — Calm Bedroom Sanctuary
  {
    t: 1.0,
    pos: new THREE.Vector3(18.6, 1.78, 4.6),
    look: new THREE.Vector3(18.8, 0.68, -0.35),
  },
];

const PRESET_VIEWS: Record<RoomPreset, { pos: THREE.Vector3; look: THREE.Vector3 }> = {
  living: {
    pos: new THREE.Vector3(-1.85, 1.72, 4.85),
    look: new THREE.Vector3(0.25, 0.65, 0.05),
  },
  dining: {
    pos: new THREE.Vector3(9.35, 1.85, 4.65),
    look: new THREE.Vector3(9.5, 0.75, -0.6),
  },
  bedroom: {
    pos: new THREE.Vector3(18.55, 1.72, 4.45),
    look: new THREE.Vector3(18.8, 0.65, -0.3),
  },
  overview: {
    pos: new THREE.Vector3(9.2, 4.8, 12.2),
    look: new THREE.Vector3(9.2, 0.6, -0.4),
  },
};

// Pre-allocated scratch math helpers (zero allocations inside RAF)
const _targetPos = new THREE.Vector3();
const _targetLook = new THREE.Vector3();
const _currentLook = new THREE.Vector3(-0.48, 0.56, -0.22);
const _mouseNDC = new THREE.Vector2();
const _bgWarm = new THREE.Color('#EFECE5');
const _bgSand = new THREE.Color('#EAE4D9');
const _bgCalm = new THREE.Color('#E8E3DA');

function sampleScrollCamera(t: number, outPos: THREE.Vector3, outLook: THREE.Vector3) {
  const clamped = Math.max(0, Math.min(1, t));
  for (let i = 0; i < SCROLL_KEYFRAMES.length - 1; i++) {
    const a = SCROLL_KEYFRAMES[i];
    const b = SCROLL_KEYFRAMES[i + 1];
    if (clamped >= a.t && clamped <= b.t) {
      const local = (clamped - a.t) / (b.t - a.t);
      const smooth = local * local * (3 - 2 * local);
      outPos.lerpVectors(a.pos, b.pos, smooth);
      outLook.lerpVectors(a.look, b.look, smooth);
      return;
    }
  }
  const last = SCROLL_KEYFRAMES[SCROLL_KEYFRAMES.length - 1];
  outPos.copy(last.pos);
  outLook.copy(last.look);
}

export const ShowroomCanvas: React.FC<ShowroomCanvasProps> = ({
  scrollProgress,
  interactiveOrbit,
  activePreset,
  arrangement,
  sofaConfig,
  selectedProductId,
  onSelectProduct,
  resetSignal,
  zoomDeltaSignal,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);

  // Mutable refs so React UI updates never tear down the WebGL context
  const stateRef = useRef({
    scrollProgress,
    interactiveOrbit,
    activePreset,
    arrangement,
    sofaConfig,
    selectedProductId,
    mouseX: 0,
    mouseY: 0,
    manualPresetOverride: false,
  });

  stateRef.current.scrollProgress = scrollProgress;
  stateRef.current.interactiveOrbit = interactiveOrbit;
  stateRef.current.activePreset = activePreset;
  stateRef.current.arrangement = arrangement;
  stateRef.current.sofaConfig = sofaConfig;
  stateRef.current.selectedProductId = selectedProductId;

  const callbacksRef = useRef({ onSelectProduct });
  callbacksRef.current.onSelectProduct = onSelectProduct;

  const engineRef = useRef<{
    requestRender: () => void;
    applySofaConfig: (cfg: ProductConfiguration) => void;
    applyArrangement: (arr: RoomArrangement) => void;
    applySelectionHighlight: (id: string | null) => void;
    jumpToPreset: (preset: RoomPreset) => void;
    resetToScrollCamera: () => void;
    zoomBy: (dir: number) => void;
  } | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = _bgWarm.clone();
    scene.fog = new THREE.Fog('#EFECE5', 11, 28);
    scene.environmentIntensity = 0.42;

    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 60);
    camera.position.copy(SCROLL_KEYFRAMES[0].pos);
    camera.lookAt(SCROLL_KEYFRAMES[0].look);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();
    const textures = createProceduralTextureSet(maxAnisotropy);

    // Warm/cool architectural 3-point lighting rig (calibrated for rich sculptural shading)
    const hemiLight = new THREE.HemisphereLight('#EBF0F7', '#9F8D76', 0.42);
    scene.add(hemiLight);

    const sunKey = new THREE.DirectionalLight('#FFF0D8', 1.15);
    sunKey.position.set(6, 9, 8);
    sunKey.castShadow = !isSoftwareGl;
    sunKey.shadow.mapSize.set(1024, 1024);
    sunKey.shadow.camera.near = 1;
    sunKey.shadow.camera.far = 35;
    sunKey.shadow.camera.left = -14;
    sunKey.shadow.camera.right = 22;
    sunKey.shadow.camera.top = 10;
    sunKey.shadow.camera.bottom = -10;
    sunKey.shadow.bias = -0.0005;
    sunKey.shadow.normalBias = 0.02;
    scene.add(sunKey);

    const rimLight = new THREE.DirectionalLight('#D0DCEB', 0.38);
    rimLight.position.set(-8, 6, -6);
    scene.add(rimLight);

    // Subtle interior warm accent point lights (capped at 3)
    const livingLampLight = new THREE.PointLight('#FFE2B8', 0.55, 8, 2);
    livingLampLight.position.set(-0.3, 1.7, 0.1);
    scene.add(livingLampLight);

    const diningLight = new THREE.PointLight('#FFE5C0', 0.6, 9, 2);
    diningLight.position.set(9.5, 2.2, -0.6);
    scene.add(diningLight);

    const bedroomLight = new THREE.PointLight('#FFDDB0', 0.55, 8, 2);
    bedroomLight.position.set(18.8, 1.8, -0.6);
    scene.add(bedroomLight);

    // === ARCHITECTURAL PAVILION ===
    const floorMat = new THREE.MeshStandardMaterial({
      color: '#C2AC8F',
      map: textures.oakColor,
      bumpMap: textures.oakBump,
      bumpScale: 0.012,
      roughness: 0.65,
      metalness: 0.02,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(34, 16), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(9.2, 0, 0);
    floor.receiveShadow = true;
    scene.add(floor);

    const plasterMat = new THREE.MeshStandardMaterial({
      color: '#D6CCBC',
      bumpMap: textures.plasterBump,
      bumpScale: 0.01,
      roughness: 0.9,
      metalness: 0.01,
    });

    // Back continuous gallery wall with warm limewash finish
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(34, 4.4, 0.25), plasterMat);
    backWall.position.set(9.2, 2.2, -3.2);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Architectural dividing portals with open archways (living -> dining -> bedroom)
    const buildPortalPartition = (xPos: number) => {
      const grp = new THREE.Group();
      const leftPillar = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.4, 2.2), plasterMat);
      leftPillar.position.set(xPos, 2.2, -2.0);
      leftPillar.receiveShadow = true;
      grp.add(leftPillar);

      const headerBeam = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.9, 5.4), plasterMat);
      headerBeam.position.set(xPos, 3.95, 0.2);
      grp.add(headerBeam);

      const frontPier = new THREE.Mesh(new THREE.BoxGeometry(0.28, 4.4, 1.0), plasterMat);
      frontPier.position.set(xPos, 2.2, 2.6);
      grp.add(frontPier);
      scene.add(grp);
    };
    buildPortalPartition(4.8);
    buildPortalPartition(14.2);

    // Tall minimalist steel-framed window mullions on left side of Living Room
    const mullionMat = new THREE.MeshStandardMaterial({
      color: '#2A2926',
      roughness: 0.4,
      metalness: 0.7,
    });
    [-1.8, -0.4, 1.0].forEach((mz) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 4.2, 0.06), mullionMat);
      post.position.set(-4.2, 2.1, mz);
      scene.add(post);
    });

    // Minimalist framed relief artwork on living back wall
    const frameMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.35, 1.7, 0.045),
      new THREE.MeshStandardMaterial({ color: '#8B7055', roughness: 0.55 })
    );
    frameMesh.position.set(0.2, 1.95, -3.05);
    scene.add(frameMesh);
    const canvasArt = new THREE.Mesh(
      new THREE.BoxGeometry(1.22, 1.56, 0.02),
      new THREE.MeshStandardMaterial({ color: '#F3EFE6', roughness: 0.92 })
    );
    canvasArt.position.set(0.2, 1.95, -3.025);
    scene.add(canvasArt);

    // Woven wool area rugs (offset y = 0.024 >= 0.02 to prevent Z-fighting)
    const rugMat = new THREE.MeshStandardMaterial({
      color: '#DCD4C6',
      map: textures.rugColor,
      bumpMap: textures.rugBump,
      bumpScale: 0.015,
      roughness: 0.95,
    });
    const livingRug = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.018, 3.2), rugMat);
    livingRug.position.set(0.15, 0.024, 0.35);
    livingRug.receiveShadow = true;
    scene.add(livingRug);

    const bedroomRug = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.018, 3.1), rugMat);
    bedroomRug.position.set(18.8, 0.024, 0.15);
    bedroomRug.receiveShadow = true;
    scene.add(bedroomRug);

    // === FURNITURE ASSEMBLIES ===
    const assemblies: FurnitureAssembly[] = [];
    const interactables: THREE.Object3D[] = [];

    // Wing 1: Living Room
    const aurelSofa = buildAurelSofa(textures, 'aurel-lounge-sofa');
    aurelSofa.group.position.set(-0.15, 0, -0.55);
    aurelSofa.applyConfig(stateRef.current.sofaConfig, textures);
    scene.add(aurelSofa.group);
    assemblies.push(aurelSofa);
    interactables.push(aurelSofa.group);

    const monoTable = buildMonoCoffeeTable(textures, 'mono-coffee-table');
    monoTable.group.position.set(0.05, 0, 0.78);
    scene.add(monoTable.group);
    assemblies.push(monoTable);
    interactables.push(monoTable.group);

    const arcoLamp = buildArcoFloorLamp(textures, 'arco-floor-lamp');
    arcoLamp.group.position.set(-2.05, 0, -0.75);
    arcoLamp.group.rotation.y = -0.35;
    scene.add(arcoLamp.group);
    assemblies.push(arcoLamp);
    interactables.push(arcoLamp.group);

    const atelierChair = buildAtelierLoungeChair(textures, 'atelier-lounge-chair');
    atelierChair.group.position.set(2.1, 0, 0.52);
    atelierChair.group.rotation.y = -0.75;
    scene.add(atelierChair.group);
    assemblies.push(atelierChair);
    interactables.push(atelierChair.group);

    // Wing 2: Dining Room
    const formTable = buildFormDiningTable(textures, 'form-dining-table');
    formTable.group.position.set(9.5, 0, -0.6);
    scene.add(formTable.group);
    assemblies.push(formTable);
    interactables.push(formTable.group);

    const chairPositions: Array<[number, number, number]> = [
      [8.85, -1.25, 0],
      [10.15, -1.25, 0],
      [8.85, 0.08, Math.PI],
      [10.15, 0.08, Math.PI],
    ];
    for (const [cx, cz, ry] of chairPositions) {
      const chair = buildNomaDiningChair(textures, 'noma-dining-chair');
      chair.group.position.set(cx, 0, cz);
      chair.group.rotation.y = ry;
      scene.add(chair.group);
      assemblies.push(chair);
      interactables.push(chair.group);
    }

    // Dining linear brass pendant luminaire
    const pendantBar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 1.65, 16),
      new THREE.MeshStandardMaterial({ color: '#B69A64', metalness: 0.9, roughness: 0.22 })
    );
    pendantBar.rotation.z = Math.PI / 2;
    pendantBar.position.set(9.5, 2.35, -0.6);
    scene.add(pendantBar);

    // Wing 3: Bedroom Sanctuary
    const lumaBed = buildLumaBed(textures, 'luma-bed');
    lumaBed.group.position.set(18.8, 0, -0.75);
    scene.add(lumaBed.group);
    assemblies.push(lumaBed);
    interactables.push(lumaBed.group);

    const leftNightstand = buildStoneSideTable(textures, 'stone-side-table');
    leftNightstand.group.position.set(17.15, 0, -1.45);
    scene.add(leftNightstand.group);
    assemblies.push(leftNightstand);
    interactables.push(leftNightstand.group);

    const rightNightstand = buildStoneSideTable(textures, 'stone-side-table');
    rightNightstand.group.position.set(20.45, 0, -1.45);
    scene.add(rightNightstand.group);
    assemblies.push(rightNightstand);
    interactables.push(rightNightstand.group);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // OrbitControls for Inspect / Spaces mode
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.6;
    controls.maxDistance = 16;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.enabled = stateRef.current.interactiveOrbit;
    controls.target.copy(_currentLook);

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let lastTickTime = performance.now();

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (!gl || typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function stepFrame() {
      const now = performance.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTickTime) / 1000));
      lastTickTime = now;
      const damp = isSoftwareGl ? 1 : 1 - Math.exp(-6.5 * dt);

      // Smoothly transition atmosphere background tint across wings
      const p = stateRef.current.scrollProgress;
      if (p < 0.55) {
        (scene.background as THREE.Color).lerpColors(_bgWarm, _bgSand, p / 0.55);
      } else {
        (scene.background as THREE.Color).lerpColors(_bgSand, _bgCalm, (p - 0.55) / 0.45);
      }
      if (scene.fog) {
        scene.fog.color.copy(scene.background as THREE.Color);
      }

      let stillMoving = false;
      if (!stateRef.current.interactiveOrbit) {
        sampleScrollCamera(p, _targetPos, _targetLook);
        // Subtle mouse parallax in non-orbit showroom view
        _targetPos.x += stateRef.current.mouseX * 0.24;
        _targetPos.y += stateRef.current.mouseY * 0.12;

        camera.position.lerp(_targetPos, damp);
        _currentLook.lerp(_targetLook, damp);
        camera.lookAt(_currentLook);
        controls.target.copy(_currentLook);

        if (
          !isSoftwareGl &&
          (camera.position.distanceToSquared(_targetPos) > 0.0002 ||
            _currentLook.distanceToSquared(_targetLook) > 0.0002)
        ) {
          stillMoving = true;
        }
      } else if (stateRef.current.manualPresetOverride) {
        camera.position.lerp(_targetPos, damp);
        controls.target.lerp(_targetLook, damp);
        controls.update();
        if (
          !isSoftwareGl &&
          (camera.position.distanceToSquared(_targetPos) > 0.0004 ||
            controls.target.distanceToSquared(_targetLook) > 0.0004)
        ) {
          stillMoving = true;
        } else {
          stateRef.current.manualPresetOverride = false;
        }
      } else {
        controls.update();
      }

      renderer.render(scene, camera);
      return stillMoving;
    }

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        const keepGoing = stepFrame();
        const done = () => {
          renderBusy = false;
          if (renderDirty || keepGoing) {
            requestRender();
          }
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    controls.addEventListener('start', () => {
      stateRef.current.manualPresetOverride = false;
    });
    controls.addEventListener('change', () => {
      if (stateRef.current.interactiveOrbit) {
        requestRender();
      }
    });

    // Raycasting for room furniture selection
    const raycaster = new THREE.Raycaster();
    let pointerDownPos = { x: 0, y: 0 };
    let lastHoverTime = 0;

    const onPointerDown = (e: PointerEvent) => {
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);
      if (dist > 6) return; // Dragged camera, not a click

      const rect = renderer.domElement.getBoundingClientRect();
      _mouseNDC.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      _mouseNDC.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(_mouseNDC, camera);
      const hits = raycaster.intersectObjects(interactables, true);
      if (hits.length > 0) {
        const pid = hits[0].object.userData.productId as string | undefined;
        if (pid) {
          callbacksRef.current.onSelectProduct(pid);
        }
      } else if (stateRef.current.selectedProductId) {
        callbacksRef.current.onSelectProduct(null);
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      stateRef.current.mouseX = nx;
      stateRef.current.mouseY = ny;

      if (!stateRef.current.interactiveOrbit && !isSoftwareGl) {
        requestRender();
      }

      const now = performance.now();
      if (now - lastHoverTime < 60) return;
      lastHoverTime = now;
      if (stateRef.current.interactiveOrbit) {
        _mouseNDC.set(nx, ny);
        raycaster.setFromCamera(_mouseNDC, camera);
        const hits = raycaster.intersectObjects(interactables, true);
        renderer.domElement.style.cursor = hits.length > 0 ? 'pointer' : 'grab';
      } else {
        renderer.domElement.style.cursor = 'default';
      }
    };

    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    renderer.domElement.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    engineRef.current = {
      requestRender,
      applySofaConfig: (cfg) => {
        aurelSofa.applyConfig(cfg, textures);
        requestRender();
      },
      applyArrangement: (arr) => {
        if (arr === 'salon') {
          aurelSofa.group.position.set(-0.15, 0, -0.55);
          aurelSofa.group.rotation.y = 0;
          monoTable.group.position.set(0.05, 0, 0.78);
          monoTable.group.rotation.y = 0;
          atelierChair.group.position.set(2.1, 0, 0.52);
          atelierChair.group.rotation.y = -0.75;
        } else {
          // Asymmetric Atelier conversational angle
          aurelSofa.group.position.set(-0.45, 0, -0.35);
          aurelSofa.group.rotation.y = 0.22;
          monoTable.group.position.set(0.45, 0, 0.72);
          monoTable.group.rotation.y = 0.65;
          atelierChair.group.position.set(-2.05, 0, 1.05);
          atelierChair.group.rotation.y = 0.85;
        }
        requestRender();
      },
      applySelectionHighlight: (id) => {
        for (const a of assemblies) {
          a.setHighlighted(Boolean(id && a.productId === id));
        }
        requestRender();
      },
      jumpToPreset: (preset) => {
        const view = PRESET_VIEWS[preset];
        _targetPos.copy(view.pos);
        _targetLook.copy(view.look);
        stateRef.current.manualPresetOverride = true;
        if (isSoftwareGl) {
          camera.position.copy(view.pos);
          controls.target.copy(view.look);
          controls.update();
        }
        requestRender();
      },
      resetToScrollCamera: () => {
        stateRef.current.manualPresetOverride = false;
        sampleScrollCamera(stateRef.current.scrollProgress, _targetPos, _targetLook);
        camera.position.copy(_targetPos);
        _currentLook.copy(_targetLook);
        controls.target.copy(_targetLook);
        controls.update();
        requestRender();
      },
      zoomBy: (dir) => {
        const offset = camera.position.clone().sub(controls.target);
        const factor = dir > 0 ? 0.82 : 1.22;
        offset.multiplyScalar(factor);
        const len = offset.length();
        if (len >= controls.minDistance && len <= controls.maxDistance) {
          camera.position.copy(controls.target).add(offset);
          controls.update();
          requestRender();
        }
      },
    };

    // Immediate synchronous initial render + queued refinement render
    stepFrame();
    requestRender();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      renderer.domElement.removeEventListener('pointerdown', onPointerDown);
      renderer.domElement.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      textures.dispose();
      envTarget.dispose();
      scene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry.dispose();
          if (Array.isArray(m.material)) {
            m.material.forEach((mat) => mat.dispose());
          } else if (m.material) {
            m.material.dispose();
          }
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
      engineRef.current = null;
    };
  }, []);

  // Sync interactiveOrbit to OrbitControls dynamically
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;
    engineRef.current?.requestRender();
  }, [interactiveOrbit]);

  // Sync scroll progress
  useEffect(() => {
    engineRef.current?.requestRender();
  }, [scrollProgress]);

  // Sync sofa material/color/wood/size
  useEffect(() => {
    engineRef.current?.applySofaConfig(sofaConfig);
  }, [sofaConfig]);

  // Sync room arrangement
  useEffect(() => {
    engineRef.current?.applyArrangement(arrangement);
  }, [arrangement]);

  // Sync selection highlight
  useEffect(() => {
    engineRef.current?.applySelectionHighlight(selectedProductId);
  }, [selectedProductId]);

  // Sync preset jump
  useEffect(() => {
    if (activePreset) {
      engineRef.current?.jumpToPreset(activePreset);
    }
  }, [activePreset]);

  // Sync reset signal
  useEffect(() => {
    if (resetSignal > 0) {
      engineRef.current?.resetToScrollCamera();
    }
  }, [resetSignal]);

  // Sync zoom buttons
  useEffect(() => {
    if (zoomDeltaSignal.seq > 0) {
      engineRef.current?.zoomBy(zoomDeltaSignal.dir);
    }
  }, [zoomDeltaSignal]);

  return (
    <div
      ref={mountRef}
      data-testid="showroom-canvas"
      data-sofa-material={sofaConfig.upholstery ?? 'boucle'}
      data-sofa-color={sofaConfig.color ?? 'ivory'}
      data-orbit={interactiveOrbit ? 'active' : 'scroll'}
      className="w-full h-full"
    />
  );
};
