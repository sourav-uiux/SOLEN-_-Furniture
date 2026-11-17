import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Model3DKey, ProductConfiguration } from '../types/furniture';
import { buildFurnitureByKey, FurnitureAssembly } from './models';
import { createProceduralTextureSet } from './textures';

export interface ProductViewer3DProps {
  productId: string;
  modelKey: Model3DKey;
  config: ProductConfiguration;
  cameraPreset: 'studio' | 'front' | 'side' | 'detail';
  resetSeq: number;
  zoomSeq: { seq: number; dir: number };
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

const STUDIO_CAMERAS: Record<
  ProductViewer3DProps['cameraPreset'],
  { pos: [number, number, number]; look: [number, number, number] }
> = {
  studio: { pos: [2.4, 1.45, 2.95], look: [0, 0.45, 0] },
  front: { pos: [0, 1.05, 3.35], look: [0, 0.45, 0] },
  side: { pos: [3.2, 1.05, 0.25], look: [0, 0.45, 0] },
  detail: { pos: [1.15, 0.92, 1.45], look: [0.1, 0.4, 0] },
};

export const ProductViewer3D: React.FC<ProductViewer3DProps> = ({
  productId,
  modelKey,
  config,
  cameraPreset,
  resetSeq,
  zoomSeq,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<{
    applyConfig: (cfg: ProductConfiguration) => void;
    setPreset: (p: ProductViewer3DProps['cameraPreset']) => void;
    zoomBy: (dir: number) => void;
  } | null>(null);

  const initialConfigRef = useRef(config);
  initialConfigRef.current = config;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = detectSoftwareWebGL();
    const width = container.clientWidth || 720;
    const height = container.clientHeight || 540;

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
    scene.background = new THREE.Color('#E8E3D9');
    scene.fog = new THREE.Fog('#E8E3D9', 7, 18);
    scene.environmentIntensity = 0.45;

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 40);
    camera.position.set(...STUDIO_CAMERAS.studio.pos);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTarget = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = envTarget.texture;
    pmrem.dispose();

    const textures = createProceduralTextureSet(renderer.capabilities.getMaxAnisotropy());

    // Studio Lighting (calibrated for rich sculptural shading without clipping light fabrics)
    const hemi = new THREE.HemisphereLight('#EDF1F7', '#A5927B', 0.42);
    scene.add(hemi);

    const key = new THREE.DirectionalLight('#FFF0D9', 1.18);
    key.position.set(4, 6, 4.5);
    key.castShadow = !isSoftwareGl;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -3.5;
    key.shadow.camera.right = 3.5;
    key.shadow.camera.top = 3.5;
    key.shadow.camera.bottom = -3.5;
    key.shadow.bias = -0.0005;
    scene.add(key);

    const rim = new THREE.DirectionalLight('#CFDCEB', 0.38);
    rim.position.set(-4, 3.5, -3.5);
    scene.add(rim);

    // Architectural Cyclorama Plinth Floor
    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(9, 48),
      new THREE.MeshStandardMaterial({
        color: '#D5CDC0',
        roughness: 0.88,
        metalness: 0.02,
      })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const assembly: FurnitureAssembly = buildFurnitureByKey(modelKey, textures, productId);
    assembly.applyConfig(initialConfigRef.current, textures);
    scene.add(assembly.group);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.minDistance = 1.25;
    controls.maxDistance = 7.5;
    controls.maxPolarAngle = Math.PI / 2 - 0.04;
    controls.target.set(...STUDIO_CAMERAS.studio.look);
    controls.update();

    let frameId = 0;
    let renderBusy = false;
    let renderDirty = false;
    let animatingPreset = false;
    const targetPos = new THREE.Vector3(...STUDIO_CAMERAS.studio.pos);
    const targetLook = new THREE.Vector3(...STUDIO_CAMERAS.studio.look);
    let lastTime = performance.now();

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

    function requestRender() {
      if (renderBusy) {
        renderDirty = true;
        return;
      }
      renderBusy = true;
      frameId = requestAnimationFrame(() => {
        renderDirty = false;
        const now = performance.now();
        const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000));
        lastTime = now;

        if (animatingPreset) {
          const damp = isSoftwareGl ? 1 : 1 - Math.exp(-7 * dt);
          camera.position.lerp(targetPos, damp);
          controls.target.lerp(targetLook, damp);
          if (
            isSoftwareGl ||
            (camera.position.distanceToSquared(targetPos) < 0.0005 &&
              controls.target.distanceToSquared(targetLook) < 0.0005)
          ) {
            animatingPreset = false;
          }
        }
        controls.update();
        renderer.render(scene, camera);

        const done = () => {
          renderBusy = false;
          if (renderDirty || animatingPreset) requestRender();
        };
        if (isSoftwareGl) afterDraw(done);
        else done();
      });
    }

    controls.addEventListener('start', () => {
      animatingPreset = false;
    });
    controls.addEventListener('change', requestRender);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth || 720;
      const h = container.clientHeight || 540;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      requestRender();
    };
    window.addEventListener('resize', onResize);

    viewerRef.current = {
      applyConfig: (cfg) => {
        assembly.applyConfig(cfg, textures);
        requestRender();
      },
      setPreset: (p) => {
        const spec = STUDIO_CAMERAS[p];
        targetPos.set(...spec.pos);
        targetLook.set(...spec.look);
        animatingPreset = true;
        requestRender();
      },
      zoomBy: (dir) => {
        const offset = camera.position.clone().sub(controls.target);
        offset.multiplyScalar(dir > 0 ? 0.82 : 1.22);
        const len = offset.length();
        if (len >= controls.minDistance && len <= controls.maxDistance) {
          camera.position.copy(controls.target).add(offset);
          controls.update();
          requestRender();
        }
      },
    };

    renderer.render(scene, camera);
    requestRender();

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
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
      viewerRef.current = null;
    };
  }, [modelKey, productId]);

  useEffect(() => {
    viewerRef.current?.applyConfig(config);
  }, [config]);

  useEffect(() => {
    viewerRef.current?.setPreset(cameraPreset);
  }, [cameraPreset, resetSeq]);

  useEffect(() => {
    if (zoomSeq.seq > 0) {
      viewerRef.current?.zoomBy(zoomSeq.dir);
    }
  }, [zoomSeq]);

  return (
    <div
      ref={mountRef}
      data-testid="pdp-3d-viewer"
      data-config-color={config.color ?? 'default'}
      data-config-material={config.upholstery ?? 'default'}
      className="w-full h-full min-h-[420px] lg:min-h-[560px]"
    />
  );
};
