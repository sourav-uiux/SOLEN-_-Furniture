import * as THREE from 'three';
import { UpholsteryMaterialId } from '../types/furniture';

export interface ProceduralTextureSet {
  oakColor: THREE.CanvasTexture;
  oakBump: THREE.CanvasTexture;
  travertineColor: THREE.CanvasTexture;
  travertineBump: THREE.CanvasTexture;
  plasterBump: THREE.CanvasTexture;
  rugColor: THREE.CanvasTexture;
  rugBump: THREE.CanvasTexture;
  contactShadow: THREE.CanvasTexture;
  fabricBumpByMaterial: Record<UpholsteryMaterialId, THREE.CanvasTexture>;
  dispose: () => void;
}

function makeSeededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function configureTexture(
  tex: THREE.CanvasTexture,
  repeatX: number,
  repeatY: number,
  isColor: boolean,
  maxAnisotropy: number
): THREE.CanvasTexture {
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(repeatX, repeatY);
  tex.colorSpace = isColor ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = Math.min(8, maxAnisotropy);
  tex.needsUpdate = true;
  return tex;
}

function createOakTextures(maxAnisotropy: number) {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const rand = makeSeededRandom(101);
  cCtx.fillStyle = '#CBB393';
  cCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  // Subtle wide European oak planks
  const plankCount = 4;
  const plankW = size / plankCount;
  for (let p = 0; p < plankCount; p++) {
    const shade = (rand() - 0.5) * 14;
    cCtx.fillStyle = `rgb(${203 + shade}, ${179 + shade}, ${147 + shade})`;
    cCtx.fillRect(p * plankW, 0, plankW, size);

    // Fine wood grain fibers
    for (let i = 0; i < 60; i++) {
      const x = p * plankW + rand() * plankW;
      const alpha = 0.04 + rand() * 0.08;
      cCtx.strokeStyle = rand() > 0.5 ? `rgba(110, 82, 52, ${alpha})` : `rgba(240, 224, 198, ${alpha})`;
      cCtx.lineWidth = 0.7 + rand() * 1.4;
      cCtx.beginPath();
      cCtx.moveTo(x, 0);
      cCtx.bezierCurveTo(
        x + (rand() - 0.5) * 6,
        size * 0.33,
        x + (rand() - 0.5) * 6,
        size * 0.66,
        x + (rand() - 0.5) * 3,
        size
      );
      cCtx.stroke();

      bCtx.strokeStyle = `rgba(90, 90, 90, ${alpha * 1.5})`;
      bCtx.lineWidth = 1;
      bCtx.beginPath();
      bCtx.moveTo(x, 0);
      bCtx.lineTo(x, size);
      bCtx.stroke();
    }

    // Plank seam
    cCtx.fillStyle = 'rgba(92, 72, 50, 0.28)';
    cCtx.fillRect(p * plankW, 0, 1.5, size);
    bCtx.fillStyle = '#303030';
    bCtx.fillRect(p * plankW, 0, 2, size);
  }

  return {
    oakColor: configureTexture(new THREE.CanvasTexture(colorCanvas), 6, 6, true, maxAnisotropy),
    oakBump: configureTexture(new THREE.CanvasTexture(bumpCanvas), 6, 6, false, maxAnisotropy),
  };
}

function createTravertineTextures(maxAnisotropy: number) {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const rand = makeSeededRandom(202);
  cCtx.fillStyle = '#DDD2C0';
  cCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#909090';
  bCtx.fillRect(0, 0, size, size);

  // Sedimentary mineral bands
  for (let y = 0; y < size; y += 3) {
    const delta = Math.sin(y * 0.08) * 8 + (rand() - 0.5) * 10;
    cCtx.fillStyle = `rgb(${221 + delta}, ${210 + delta}, ${192 + delta})`;
    cCtx.fillRect(0, y, size, 3);
  }

  // Open-pore travertine cavities
  for (let i = 0; i < 240; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const w = 3 + rand() * 14;
    const h = 1 + rand() * 2.5;
    cCtx.fillStyle = `rgba(155, 138, 114, ${0.14 + rand() * 0.18})`;
    cCtx.fillRect(x, y, w, h);

    bCtx.fillStyle = `rgba(55, 55, 55, ${0.35 + rand() * 0.4})`;
    bCtx.fillRect(x, y, w, h);
  }

  return {
    travertineColor: configureTexture(new THREE.CanvasTexture(colorCanvas), 2, 2, true, maxAnisotropy),
    travertineBump: configureTexture(new THREE.CanvasTexture(bumpCanvas), 2, 2, false, maxAnisotropy),
  };
}

function createPlasterBump(maxAnisotropy: number) {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = makeSeededRandom(303);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  for (let i = 0; i < 900; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 4 + rand() * 18;
    const g = Math.floor(110 + rand() * 35);
    ctx.fillStyle = `rgba(${g}, ${g}, ${g}, 0.14)`;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  return configureTexture(new THREE.CanvasTexture(canvas), 3, 2, false, maxAnisotropy);
}

function createRugTextures(maxAnisotropy: number) {
  const size = 256;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const cCtx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  const rand = makeSeededRandom(404);
  cCtx.fillStyle = '#DDD6C9';
  cCtx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#808080';
  bCtx.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 4) {
    for (let x = 0; x < size; x += 4) {
      const v = rand();
      const shade = v > 0.7 ? -18 : v < 0.25 ? 10 : 0;
      cCtx.fillStyle = `rgb(${221 + shade}, ${214 + shade}, ${201 + shade})`;
      cCtx.fillRect(x, y, 3, 3);

      const b = Math.floor(105 + rand() * 50);
      bCtx.fillStyle = `rgb(${b}, ${b}, ${b})`;
      bCtx.fillRect(x, y, 3, 3);
    }
  }

  return {
    rugColor: configureTexture(new THREE.CanvasTexture(colorCanvas), 4, 4, true, maxAnisotropy),
    rugBump: configureTexture(new THREE.CanvasTexture(bumpCanvas), 5, 5, false, maxAnisotropy),
  };
}

function createFabricBump(type: UpholsteryMaterialId, maxAnisotropy: number): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const rand = makeSeededRandom(type.length * 97 + 13);

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, size, size);

  if (type === 'boucle') {
    for (let i = 0; i < 650; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 1.5 + rand() * 2.8;
      const l = Math.floor(95 + rand() * 75);
      ctx.fillStyle = `rgba(${l}, ${l}, ${l}, 0.55)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (type === 'natural-linen' || type === 'cotton-blend') {
    const step = type === 'natural-linen' ? 4 : 3;
    for (let y = 0; y < size; y += step) {
      ctx.fillStyle = y % (step * 2) === 0 ? 'rgba(175,175,175,0.4)' : 'rgba(90,90,90,0.4)';
      ctx.fillRect(0, y, size, 1.5);
    }
    for (let x = 0; x < size; x += step) {
      ctx.fillStyle = x % (step * 2) === 0 ? 'rgba(165,165,165,0.35)' : 'rgba(95,95,95,0.35)';
      ctx.fillRect(x, 0, 1.5, size);
    }
  } else if (type === 'velvet') {
    for (let i = 0; i < 400; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const l = Math.floor(118 + rand() * 25);
      ctx.fillStyle = `rgba(${l}, ${l}, ${l}, 0.25)`;
      ctx.fillRect(x, y, 8, 3);
    }
  } else {
    // premium-leather pebble grain
    for (let i = 0; i < 500; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 1 + rand() * 2;
      const l = Math.floor(115 + rand() * 35);
      ctx.fillStyle = `rgba(${l}, ${l}, ${l}, 0.35)`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  return configureTexture(new THREE.CanvasTexture(canvas), 6, 6, false, maxAnisotropy);
}

function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.08,
    size / 2,
    size / 2,
    size * 0.5
  );
  grad.addColorStop(0, 'rgba(36, 36, 33, 0.52)');
  grad.addColorStop(0.55, 'rgba(36, 36, 33, 0.22)');
  grad.addColorStop(1, 'rgba(36, 36, 33, 0.0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

export function createProceduralTextureSet(maxAnisotropy: number): ProceduralTextureSet {
  const { oakColor, oakBump } = createOakTextures(maxAnisotropy);
  const { travertineColor, travertineBump } = createTravertineTextures(maxAnisotropy);
  const plasterBump = createPlasterBump(maxAnisotropy);
  const { rugColor, rugBump } = createRugTextures(maxAnisotropy);
  const contactShadow = createContactShadowTexture();

  const fabricBumpByMaterial: Record<UpholsteryMaterialId, THREE.CanvasTexture> = {
    boucle: createFabricBump('boucle', maxAnisotropy),
    'natural-linen': createFabricBump('natural-linen', maxAnisotropy),
    'cotton-blend': createFabricBump('cotton-blend', maxAnisotropy),
    velvet: createFabricBump('velvet', maxAnisotropy),
    'premium-leather': createFabricBump('premium-leather', maxAnisotropy),
  };

  return {
    oakColor,
    oakBump,
    travertineColor,
    travertineBump,
    plasterBump,
    rugColor,
    rugBump,
    contactShadow,
    fabricBumpByMaterial,
    dispose: () => {
      oakColor.dispose();
      oakBump.dispose();
      travertineColor.dispose();
      travertineBump.dispose();
      plasterBump.dispose();
      rugColor.dispose();
      rugBump.dispose();
      contactShadow.dispose();
      Object.values(fabricBumpByMaterial).forEach((t) => t.dispose());
    },
  };
}
