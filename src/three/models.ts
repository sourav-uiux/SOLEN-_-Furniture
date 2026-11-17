import * as THREE from 'three';
import {
  FABRIC_COLORS,
  METAL_FINISHES,
  UPHOLSTERY_MATERIALS,
  WOOD_FINISHES,
} from '../data/catalog';
import {
  Model3DKey,
  ProductConfiguration,
  UpholsteryMaterialId,
} from '../types/furniture';
import { ProceduralTextureSet } from './textures';

export interface FurnitureAssembly {
  group: THREE.Group;
  productId: string;
  upholsteryMat?: THREE.MeshPhysicalMaterial;
  accentMat?: THREE.MeshPhysicalMaterial;
  woodMat?: THREE.MeshStandardMaterial;
  metalMat?: THREE.MeshStandardMaterial;
  stoneMat?: THREE.MeshStandardMaterial;
  chaisePart?: THREE.Group;
  grandExtensionPart?: THREE.Group;
  ottomanPart?: THREE.Group;
  applyConfig: (config: ProductConfiguration, textures: ProceduralTextureSet) => void;
  setHighlighted: (active: boolean) => void;
}

function makeContactShadow(
  textures: ProceduralTextureSet,
  width: number,
  depth: number,
  opacity = 0.36
): THREE.Mesh {
  const geo = new THREE.PlaneGeometry(width, depth);
  geo.rotateX(-Math.PI / 2);
  const mat = new THREE.MeshBasicMaterial({
    map: textures.contactShadow,
    transparent: true,
    opacity,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0.014;
  mesh.receiveShadow = false;
  mesh.castShadow = false;
  return mesh;
}

function createUpholsteryMaterial(
  textures: ProceduralTextureSet,
  matId: UpholsteryMaterialId = 'boucle',
  colorHex = '#EAE6DE'
): THREE.MeshPhysicalMaterial {
  const spec = UPHOLSTERY_MATERIALS.find((m) => m.id === matId) ?? UPHOLSTERY_MATERIALS[0];
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(colorHex),
    roughness: spec.roughness,
    metalness: 0.02,
    sheen: spec.sheen * 0.65,
    sheenRoughness: matId === 'velvet' ? 0.42 : 0.82,
    sheenColor: new THREE.Color('#E5DFD3'),
    bumpMap: textures.fabricBumpByMaterial[matId],
    bumpScale: spec.bumpScale,
  });
}

function createWoodMaterial(
  textures: ProceduralTextureSet,
  woodHex = '#B99873'
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(woodHex),
    map: textures.oakColor,
    bumpMap: textures.oakBump,
    bumpScale: 0.012,
    roughness: 0.56,
    metalness: 0.04,
  });
}

function createMetalMaterial(metalHex = '#B69A64'): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(metalHex),
    roughness: 0.22,
    metalness: 0.92,
  });
}

function createTravertineMaterial(
  textures: ProceduralTextureSet,
  colorHex = '#DDD2C0'
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(colorHex),
    map: textures.travertineColor,
    bumpMap: textures.travertineBump,
    bumpScale: 0.018,
    roughness: 0.68,
    metalness: 0.02,
  });
}

function tagProductGroup(group: THREE.Group, productId: string) {
  group.userData.productId = productId;
  group.traverse((obj) => {
    obj.userData.productId = productId;
    if ((obj as THREE.Mesh).isMesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
}

function makeRoundedBox(
  width: number,
  height: number,
  depth: number,
  radius: number
): THREE.ExtrudeGeometry {
  const hw = width / 2 - radius;
  const hd = depth / 2 - radius;
  const shape = new THREE.Shape();
  shape.moveTo(-hw, -hd - radius);
  shape.lineTo(hw, -hd - radius);
  shape.quadraticCurveTo(hw + radius, -hd - radius, hw + radius, -hd);
  shape.lineTo(hw + radius, hd);
  shape.quadraticCurveTo(hw + radius, hd + radius, hw, hd + radius);
  shape.lineTo(-hw, hd + radius);
  shape.quadraticCurveTo(-hw - radius, hd + radius, -hw - radius, hd);
  shape.lineTo(-hw - radius, -hd);
  shape.quadraticCurveTo(-hw - radius, -hd - radius, -hw, -hd - radius);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.02, height - radius * 2),
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: radius,
    bevelThickness: radius,
  });
  geo.rotateX(-Math.PI / 2);
  geo.center();
  return geo;
}

export function buildAurelSofa(
  textures: ProceduralTextureSet,
  productId = 'aurel-lounge-sofa'
): FurnitureAssembly {
  const group = new THREE.Group();
  const upholsteryMat = createUpholsteryMaterial(textures, 'boucle', '#EAE6DE');
  const accentMat = upholsteryMat.clone();
  accentMat.color.set('#D7CFC2');
  const woodMat = createWoodMaterial(textures, '#B99873');
  const metalMat = createMetalMaterial('#B69A64');

  // 1. Recessed solid oak plinth base (beveled ExtrudeGeometry)
  const plinthGeo = makeRoundedBox(2.44, 0.11, 0.96, 0.04);
  const plinth = new THREE.Mesh(plinthGeo, woodMat);
  plinth.position.set(0, 0.125, 0);
  group.add(plinth);

  // 2. Brass shadow-gap recessed feet (6 feet)
  const footGeo = new THREE.CylinderGeometry(0.024, 0.018, 0.07, 14);
  const footPositions: Array<[number, number]> = [
    [-1.05, -0.36],
    [0, -0.36],
    [1.05, -0.36],
    [-1.05, 0.36],
    [0, 0.36],
    [1.05, 0.36],
  ];
  for (const [fx, fz] of footPositions) {
    const foot = new THREE.Mesh(footGeo, metalMat);
    foot.position.set(fx, 0.035, fz);
    group.add(foot);
  }

  // 3. Primary sculptural seat deck & 3 cushion segments
  const deckGeo = makeRoundedBox(2.5, 0.16, 0.98, 0.055);
  const deck = new THREE.Mesh(deckGeo, upholsteryMat);
  deck.position.set(0, 0.26, 0);
  group.add(deck);

  const cushionGeo = makeRoundedBox(0.76, 0.13, 0.78, 0.045);
  [-0.78, 0, 0.78].forEach((cx) => {
    const cushion = new THREE.Mesh(cushionGeo, upholsteryMat);
    cushion.position.set(cx, 0.39, 0.06);
    group.add(cushion);
  });

  // 4. Sweeping curved backrest shell (Tube/Lathe-like smooth sweep via curved segments)
  const backCenterGeo = makeRoundedBox(2.15, 0.44, 0.22, 0.075);
  const backCenter = new THREE.Mesh(backCenterGeo, upholsteryMat);
  backCenter.position.set(0, 0.56, -0.38);
  backCenter.rotation.x = -0.1;
  group.add(backCenter);

  // 5. Rounded wraparound armrests
  const armGeo = makeRoundedBox(0.24, 0.42, 0.94, 0.085);
  const leftArm = new THREE.Mesh(armGeo, upholsteryMat);
  leftArm.position.set(-1.16, 0.52, -0.02);
  leftArm.rotation.z = 0.08;
  group.add(leftArm);

  const rightArm = new THREE.Mesh(armGeo, upholsteryMat);
  rightArm.position.set(1.16, 0.52, -0.02);
  rightArm.rotation.z = -0.08;
  group.add(rightArm);

  // 6. Plush bolster accent pillows
  const pillowGeo = new THREE.SphereGeometry(0.145, 20, 16);
  pillowGeo.scale(1.15, 1.0, 0.75);
  const pillow1 = new THREE.Mesh(pillowGeo, accentMat);
  pillow1.position.set(-0.78, 0.56, -0.18);
  pillow1.rotation.set(-0.22, 0.25, 0.08);
  group.add(pillow1);

  const pillow2 = new THREE.Mesh(pillowGeo, accentMat);
  pillow2.position.set(0.66, 0.55, -0.18);
  pillow2.rotation.set(-0.2, -0.28, -0.05);
  group.add(pillow2);

  // 7. Optional Chaise extension module (for Asymmetric Chaise / Modular Grand)
  const chaisePart = new THREE.Group();
  const chaisePlinth = new THREE.Mesh(makeRoundedBox(0.86, 0.11, 0.62, 0.04), woodMat);
  chaisePlinth.position.set(-0.82, 0.125, 0.76);
  chaisePart.add(chaisePlinth);
  const chaiseDeck = new THREE.Mesh(makeRoundedBox(0.88, 0.24, 0.64, 0.055), upholsteryMat);
  chaiseDeck.position.set(-0.82, 0.31, 0.76);
  chaisePart.add(chaiseDeck);
  chaisePart.visible = false;
  group.add(chaisePart);

  // 8. Optional Grand side module
  const grandExtensionPart = new THREE.Group();
  const extPlinth = new THREE.Mesh(makeRoundedBox(0.76, 0.11, 0.96, 0.04), woodMat);
  extPlinth.position.set(1.56, 0.125, 0);
  grandExtensionPart.add(extPlinth);
  const extDeck = new THREE.Mesh(makeRoundedBox(0.78, 0.24, 0.96, 0.055), upholsteryMat);
  extDeck.position.set(1.56, 0.31, 0);
  grandExtensionPart.add(extDeck);
  const extBack = new THREE.Mesh(makeRoundedBox(0.76, 0.44, 0.22, 0.075), upholsteryMat);
  extBack.position.set(1.56, 0.56, -0.38);
  extBack.rotation.x = -0.1;
  grandExtensionPart.add(extBack);
  grandExtensionPart.visible = false;
  group.add(grandExtensionPart);

  const shadow = makeContactShadow(textures, 3.2, 1.8, 0.38);
  group.add(shadow);

  tagProductGroup(group, productId);
  shadow.castShadow = false;

  return {
    group,
    productId,
    upholsteryMat,
    accentMat,
    woodMat,
    metalMat,
    chaisePart,
    grandExtensionPart,
    applyConfig: (config, tex) => {
      const matId = config.upholstery ?? 'boucle';
      const matSpec = UPHOLSTERY_MATERIALS.find((m) => m.id === matId) ?? UPHOLSTERY_MATERIALS[0];
      const colSpec = FABRIC_COLORS.find((c) => c.id === (config.color ?? 'ivory')) ?? FABRIC_COLORS[0];
      const woodSpec = WOOD_FINISHES.find((w) => w.id === (config.woodFinish ?? 'natural-oak')) ?? WOOD_FINISHES[0];

      upholsteryMat.color.set(colSpec.hex);
      upholsteryMat.roughness = matSpec.roughness;
      upholsteryMat.sheen = matSpec.sheen * 0.65;
      upholsteryMat.bumpMap = tex.fabricBumpByMaterial[matId];
      upholsteryMat.bumpScale = matSpec.bumpScale;
      upholsteryMat.needsUpdate = true;

      accentMat.color.set(colSpec.hex).offsetHSL(0, -0.02, colSpec.id === 'charcoal' ? 0.09 : -0.09);
      accentMat.roughness = matSpec.roughness;
      accentMat.bumpMap = tex.fabricBumpByMaterial[matId];
      accentMat.needsUpdate = true;

      woodMat.color.set(woodSpec.hex);

      chaisePart.visible = config.sizeOption === 'l-chaise' || config.sizeOption === 'modular-grand';
      grandExtensionPart.visible = config.sizeOption === 'modular-grand';
    },
    setHighlighted: (active) => {
      upholsteryMat.emissive.set(active ? '#3B352D' : '#000000');
      upholsteryMat.emissiveIntensity = active ? 0.25 : 0;
    },
  };
}

export function buildMonoCoffeeTable(
  textures: ProceduralTextureSet,
  productId = 'mono-coffee-table'
): FurnitureAssembly {
  const group = new THREE.Group();
  const stoneMat = createTravertineMaterial(textures, '#DFD4C2');
  const woodMat = createWoodMaterial(textures, '#B99873');
  const ceramicMat = new THREE.MeshStandardMaterial({
    color: '#F2EFE8',
    roughness: 0.72,
    metalness: 0.02,
  });

  // 1. Organic pebble-shaped top via smooth Shape + beveled ExtrudeGeometry
  const topShape = new THREE.Shape();
  topShape.moveTo(-0.62, -0.18);
  topShape.bezierCurveTo(-0.74, 0.24, -0.22, 0.44, 0.26, 0.36);
  topShape.bezierCurveTo(0.76, 0.28, 0.78, -0.18, 0.42, -0.34);
  topShape.bezierCurveTo(0.05, -0.46, -0.5, -0.44, -0.62, -0.18);

  const topGeo = new THREE.ExtrudeGeometry(topShape, {
    depth: 0.042,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.022,
    bevelThickness: 0.022,
  });
  topGeo.rotateX(-Math.PI / 2);
  const topMesh = new THREE.Mesh(topGeo, stoneMat);
  topMesh.position.set(0, 0.30, 0);
  group.add(topMesh);

  // 2. Fluted travertine cylindrical drum plinth
  const plinthGeo = new THREE.CylinderGeometry(0.24, 0.25, 0.29, 28);
  const plinth = new THREE.Mesh(plinthGeo, stoneMat);
  plinth.position.set(-0.14, 0.145, 0.02);
  group.add(plinth);

  // 3. Fluted architectural ribs around drum
  const ribGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.28, 8);
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    const rib = new THREE.Mesh(ribGeo, stoneMat);
    rib.position.set(-0.14 + Math.cos(a) * 0.242, 0.145, 0.02 + Math.sin(a) * 0.242);
    group.add(rib);
  }

  // 4. Secondary offset oak slab leg
  const oakLeg = new THREE.Mesh(makeRoundedBox(0.11, 0.29, 0.24, 0.015), woodMat);
  oakLeg.position.set(0.36, 0.145, -0.05);
  oakLeg.rotation.y = 0.28;
  group.add(oakLeg);

  // 5. Minimalist LatheGeometry ceramic vessel on top
  const vesselPts = [
    new THREE.Vector2(0.0, 0),
    new THREE.Vector2(0.07, 0),
    new THREE.Vector2(0.12, 0.05),
    new THREE.Vector2(0.13, 0.10),
    new THREE.Vector2(0.115, 0.11),
    new THREE.Vector2(0.06, 0.02),
    new THREE.Vector2(0, 0.02),
  ];
  const vessel = new THREE.Mesh(new THREE.LatheGeometry(vesselPts, 24), ceramicMat);
  vessel.position.set(0.22, 0.36, 0.04);
  group.add(vessel);

  // 6. Art monograph stack accent
  const book = new THREE.Mesh(
    makeRoundedBox(0.24, 0.028, 0.18, 0.004),
    new THREE.MeshStandardMaterial({ color: '#3E3C37', roughness: 0.78 })
  );
  book.position.set(-0.24, 0.376, -0.04);
  book.rotation.y = -0.18;
  group.add(book);

  const shadow = makeContactShadow(textures, 1.7, 1.2, 0.34);
  group.add(shadow);
  tagProductGroup(group, productId);
  shadow.castShadow = false;

  return {
    group,
    productId,
    stoneMat,
    woodMat,
    applyConfig: (config) => {
      const col = FABRIC_COLORS.find((c) => c.id === (config.color ?? 'sand'));
      if (col) {
        stoneMat.color.set(col.id === 'ivory' ? '#EAE5DC' : col.id === 'warm-grey' ? '#BEB8AE' : '#DDD2C0');
      }
      const wood = WOOD_FINISHES.find((w) => w.id === (config.woodFinish ?? 'natural-oak'));
      if (wood) woodMat.color.set(wood.hex);
      const scale = config.sizeOption === 'grand' ? 1.16 : 1.0;
      group.scale.set(scale, 1, scale);
    },
    setHighlighted: (active) => {
      stoneMat.emissive.set(active ? '#463E32' : '#000000');
      stoneMat.emissiveIntensity = active ? 0.25 : 0;
    },
  };
}

export function buildArcoFloorLamp(
  textures: ProceduralTextureSet,
  productId = 'arco-floor-lamp'
): FurnitureAssembly {
  const group = new THREE.Group();
  const stoneMat = createTravertineMaterial(textures, '#E3DDD2');
  const metalMat = createMetalMaterial('#B69A64');
  const bulbMat = new THREE.MeshStandardMaterial({
    color: '#FFF4DC',
    emissive: '#FFDCA8',
    emissiveIntensity: 1.6,
    roughness: 0.2,
  });

  // 1. Honed marble base plinth
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.17, 0.44, 28), stoneMat);
  base.position.set(0, 0.22, 0);
  group.add(base);

  // 2. Vertical collar & sweeping curved arc arm (TubeGeometry)
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.44, 0),
    new THREE.Vector3(0, 1.32, 0),
    new THREE.Vector3(0.22, 1.98, 0),
    new THREE.Vector3(0.85, 2.16, 0),
    new THREE.Vector3(1.38, 1.96, 0),
    new THREE.Vector3(1.52, 1.78, 0),
  ]);
  const arm = new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.016, 12, false), metalMat);
  group.add(arm);

  // 3. Spun metal dome shade (LatheGeometry)
  const shadePts = [
    new THREE.Vector2(0.018, 0.16),
    new THREE.Vector2(0.14, 0.13),
    new THREE.Vector2(0.21, 0.05),
    new THREE.Vector2(0.22, 0),
    new THREE.Vector2(0.212, 0),
    new THREE.Vector2(0.13, 0.12),
    new THREE.Vector2(0.018, 0.15),
  ];
  const shade = new THREE.Mesh(new THREE.LatheGeometry(shadePts, 28), metalMat);
  shade.position.set(1.52, 1.61, 0);
  group.add(shade);

  // 4. Warm diffuser bulb inside dome
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 12), bulbMat);
  bulb.position.set(1.52, 1.66, 0);
  group.add(bulb);

  const shadow = makeContactShadow(textures, 0.7, 0.7, 0.34);
  group.add(shadow);
  tagProductGroup(group, productId);
  shadow.castShadow = false;

  return {
    group,
    productId,
    stoneMat,
    metalMat,
    applyConfig: (config) => {
      const metal = METAL_FINISHES.find((m) => m.id === (config.metalFinish ?? 'brushed-brass'));
      if (metal) {
        metalMat.color.set(metal.hex);
        metalMat.roughness = metal.id === 'matte-nickel' ? 0.32 : 0.2;
      }
    },
    setHighlighted: (active) => {
      metalMat.emissive.set(active ? '#4A3C22' : '#000000');
      metalMat.emissiveIntensity = active ? 0.35 : 0;
    },
  };
}

export function buildAtelierLoungeChair(
  textures: ProceduralTextureSet,
  productId = 'atelier-lounge-chair'
): FurnitureAssembly {
  const group = new THREE.Group();
  const woodMat = createWoodMaterial(textures, '#B99873');
  const upholsteryMat = createUpholsteryMaterial(textures, 'premium-leather', '#A46952');
  const metalMat = createMetalMaterial('#B69A64');

  // 1. Sculpted timber side A-frames
  const legGeo = makeRoundedBox(0.055, 0.56, 0.065, 0.012);
  [-0.33, 0.33].forEach((x) => {
    const frontLeg = new THREE.Mesh(legGeo, woodMat);
    frontLeg.position.set(x, 0.27, 0.24);
    frontLeg.rotation.x = 0.16;
    group.add(frontLeg);

    const rearLeg = new THREE.Mesh(legGeo, woodMat);
    rearLeg.position.set(x, 0.25, -0.24);
    rearLeg.rotation.x = -0.28;
    group.add(rearLeg);

    const armrest = new THREE.Mesh(makeRoundedBox(0.065, 0.045, 0.62, 0.014), woodMat);
    armrest.position.set(x, 0.54, 0.02);
    armrest.rotation.x = -0.14;
    group.add(armrest);

    // Brass hardware pins
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.072, 12), metalMat);
    pin.rotation.z = Math.PI / 2;
    pin.position.set(x, 0.51, 0.25);
    group.add(pin);
  });

  // 2. Seat & reclined backrest cushions
  const seat = new THREE.Mesh(makeRoundedBox(0.62, 0.11, 0.62, 0.035), upholsteryMat);
  seat.position.set(0, 0.36, 0.04);
  seat.rotation.x = -0.14;
  group.add(seat);

  const back = new THREE.Mesh(makeRoundedBox(0.60, 0.44, 0.11, 0.035), upholsteryMat);
  back.position.set(0, 0.59, -0.25);
  back.rotation.x = -0.3;
  group.add(back);

  // 3. Optional Ottoman
  const ottomanPart = new THREE.Group();
  const ottoBase = new THREE.Mesh(makeRoundedBox(0.56, 0.06, 0.44, 0.015), woodMat);
  ottoBase.position.set(0, 0.25, 0.85);
  ottomanPart.add(ottoBase);
  const ottoCushion = new THREE.Mesh(makeRoundedBox(0.56, 0.1, 0.44, 0.035), upholsteryMat);
  ottoCushion.position.set(0, 0.33, 0.85);
  ottomanPart.add(ottoCushion);
  [-0.22, 0.22].forEach((ox) => {
    [-0.16, 0.16].forEach((oz) => {
      const oLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.016, 0.24, 12), woodMat);
      oLeg.position.set(ox, 0.12, 0.85 + oz);
      ottomanPart.add(oLeg);
    });
  });
  ottomanPart.visible = false;
  group.add(ottomanPart);

  const shadow = makeContactShadow(textures, 1.05, 1.05, 0.34);
  group.add(shadow);
  tagProductGroup(group, productId);
  shadow.castShadow = false;

  return {
    group,
    productId,
    woodMat,
    upholsteryMat,
    metalMat,
    ottomanPart,
    applyConfig: (config, tex) => {
      const matId = config.upholstery ?? 'premium-leather';
      const matSpec = UPHOLSTERY_MATERIALS.find((m) => m.id === matId) ?? UPHOLSTERY_MATERIALS[4];
      const col = FABRIC_COLORS.find((c) => c.id === (config.color ?? 'terracotta')) ?? FABRIC_COLORS[4];
      const wood = WOOD_FINISHES.find((w) => w.id === (config.woodFinish ?? 'natural-oak')) ?? WOOD_FINISHES[0];
      const metal = METAL_FINISHES.find((m) => m.id === (config.metalFinish ?? 'brushed-brass')) ?? METAL_FINISHES[0];

      upholsteryMat.color.set(col.hex);
      upholsteryMat.roughness = matSpec.roughness;
      upholsteryMat.sheen = matSpec.sheen;
      upholsteryMat.bumpMap = tex.fabricBumpByMaterial[matId];
      upholsteryMat.needsUpdate = true;

      woodMat.color.set(wood.hex);
      metalMat.color.set(metal.hex);
      ottomanPart.visible = config.sizeOption === 'with-ottoman';
    },
    setHighlighted: (active) => {
      upholsteryMat.emissive.set(active ? '#3B2F27' : '#000000');
      upholsteryMat.emissiveIntensity = active ? 0.28 : 0;
    },
  };
}

export function buildFormDiningTable(
  textures: ProceduralTextureSet,
  productId = 'form-dining-table'
): FurnitureAssembly {
  const group = new THREE.Group();
  const woodMat = createWoodMaterial(textures, '#634733');
  const metalMat = createMetalMaterial('#4B433B');

  // 1. Chamfered architectural timber tabletop
  const top = new THREE.Mesh(makeRoundedBox(2.4, 0.06, 1.0, 0.015), woodMat);
  top.position.set(0, 0.73, 0);
  group.add(top);

  // 2. Sculpted inward-raked trestle legs
  const legGeo = makeRoundedBox(0.11, 0.72, 0.72, 0.018);
  const leftTrestle = new THREE.Mesh(legGeo, woodMat);
  leftTrestle.position.set(-0.78, 0.36, 0);
  leftTrestle.rotation.z = -0.1;
  group.add(leftTrestle);

  const rightTrestle = new THREE.Mesh(legGeo, woodMat);
  rightTrestle.position.set(0.78, 0.36, 0);
  rightTrestle.rotation.z = 0.1;
  group.add(rightTrestle);

  // 3. Structural cross-stretcher with metal tenon brackets
  const stretcher = new THREE.Mesh(makeRoundedBox(1.62, 0.055, 0.08, 0.01), woodMat);
  stretcher.position.set(0, 0.22, 0);
  group.add(stretcher);

  [-0.78, 0.78].forEach((bx) => {
    const bracket = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.075, 0.10), metalMat);
    bracket.position.set(bx, 0.22, 0);
    group.add(bracket);
  });

  // 4. Minimalist table centerpiece bowl
  const bowlPts = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.08, 0),
    new THREE.Vector2(0.16, 0.055),
    new THREE.Vector2(0.17, 0.08),
    new THREE.Vector2(0.155, 0.08),
    new THREE.Vector2(0.07, 0.015),
    new THREE.Vector2(0, 0.015),
  ];
  const bowl = new THREE.Mesh(
    new THREE.LatheGeometry(bowlPts, 24),
    new THREE.MeshStandardMaterial({ color: '#EAE6DE', roughness: 0.72 })
  );
  bowl.position.set(0, 0.76, 0);
  group.add(bowl);

  const shadow = makeContactShadow(textures, 2.7, 1.3, 0.35);
  group.add(shadow);
  tagProductGroup(group, productId);
  shadow.castShadow = false;

  return {
    group,
    productId,
    woodMat,
    metalMat,
    applyConfig: (config) => {
      const wood = WOOD_FINISHES.find((w) => w.id === (config.woodFinish ?? 'smoked-walnut'));
      if (wood) woodMat.color.set(wood.hex);
      const metal = METAL_FINISHES.find((m) => m.id === (config.metalFinish ?? 'bronzed-steel'));
      if (metal) metalMat.color.set(metal.hex);
      const lenScale =
        config.sizeOption === '10-seat' ? 1.22 : config.sizeOption === '8-seat' ? 1.1 : 1.0;
      group.scale.set(lenScale, 1, 1);
    },
    setHighlighted: (active) => {
      woodMat.emissive.set(active ? '#3B2F22' : '#000000');
      woodMat.emissiveIntensity = active ? 0.28 : 0;
    },
  };
}

export function buildNomaDiningChair(
  textures: ProceduralTextureSet,
  productId = 'noma-dining-chair'
): FurnitureAssembly {
  const group = new THREE.Group();
  const woodMat = createWoodMaterial(textures, '#B99873');
  const upholsteryMat = createUpholsteryMaterial(textures, 'natural-linen', '#EAE6DE');

  // 1. Four tapered oak legs
  const legGeo = new THREE.CylinderGeometry(0.019, 0.014, 0.45, 12);
  const legPositions: Array<[number, number]> = [
    [-0.21, 0.19],
    [0.21, 0.19],
    [-0.21, -0.19],
    [0.21, -0.19],
  ];
  for (const [lx, lz] of legPositions) {
    const leg = new THREE.Mesh(legGeo, woodMat);
    leg.position.set(lx, 0.225, lz);
    group.add(leg);
  }

  // 2. Upholstered floating seat cushion
  const seat = new THREE.Mesh(makeRoundedBox(0.46, 0.065, 0.44, 0.022), upholsteryMat);
  seat.position.set(0, 0.46, 0.01);
  group.add(seat);

  // 3. Rear vertical uprights & steam-bent curved backrest
  const postGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.34, 12);
  [-0.19, 0.19].forEach((px) => {
    const post = new THREE.Mesh(postGeo, woodMat);
    post.position.set(px, 0.61, -0.2);
    post.rotation.x = -0.1;
    group.add(post);
  });

  const backCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.24, 0.72, -0.08),
    new THREE.Vector3(-0.18, 0.74, -0.21),
    new THREE.Vector3(0, 0.75, -0.24),
    new THREE.Vector3(0.18, 0.74, -0.21),
    new THREE.Vector3(0.24, 0.72, -0.08),
  ]);
  const backrest = new THREE.Mesh(new THREE.TubeGeometry(backCurve, 20, 0.042, 12, false), upholsteryMat);
  group.add(backrest);

  const shadow = makeContactShadow(textures, 0.65, 0.65, 0.28);
  group.add(shadow);
  tagProductGroup(group, productId);
  shadow.castShadow = false;

  return {
    group,
    productId,
    woodMat,
    upholsteryMat,
    applyConfig: (config, tex) => {
      const matId = config.upholstery ?? 'natural-linen';
      const matSpec = UPHOLSTERY_MATERIALS.find((m) => m.id === matId) ?? UPHOLSTERY_MATERIALS[1];
      const col = FABRIC_COLORS.find((c) => c.id === (config.color ?? 'ivory')) ?? FABRIC_COLORS[0];
      const wood = WOOD_FINISHES.find((w) => w.id === (config.woodFinish ?? 'natural-oak')) ?? WOOD_FINISHES[0];

      upholsteryMat.color.set(col.hex);
      upholsteryMat.roughness = matSpec.roughness;
      upholsteryMat.bumpMap = tex.fabricBumpByMaterial[matId];
      upholsteryMat.needsUpdate = true;
      woodMat.color.set(wood.hex);
    },
    setHighlighted: (active) => {
      upholsteryMat.emissive.set(active ? '#3B352D' : '#000000');
      upholsteryMat.emissiveIntensity = active ? 0.25 : 0;
    },
  };
}

export function buildLumaBed(
  textures: ProceduralTextureSet,
  productId = 'luma-bed'
): FurnitureAssembly {
  const group = new THREE.Group();
  const woodMat = createWoodMaterial(textures, '#B99873');
  const upholsteryMat = createUpholsteryMaterial(textures, 'natural-linen', '#CFC2B0');
  const duvetMat = createUpholsteryMaterial(textures, 'natural-linen', '#ECE7DD');

  // 1. Recessed floating platform shadow plinth
  const subBase = new THREE.Mesh(makeRoundedBox(1.88, 0.14, 1.98, 0.02), woodMat);
  subBase.position.set(0, 0.07, 0.05);
  group.add(subBase);

  // 2. Wide solid oak perimeter platform frame
  const platform = new THREE.Mesh(makeRoundedBox(2.14, 0.14, 2.22, 0.025), woodMat);
  platform.position.set(0, 0.21, 0.06);
  group.add(platform);

  // 3. Expansive cushioned headboard
  const headboard = new THREE.Mesh(makeRoundedBox(2.38, 0.96, 0.16, 0.045), upholsteryMat);
  headboard.position.set(0, 0.56, -1.04);
  group.add(headboard);

  // 4. Layered mattress & linen duvet fold
  const mattress = new THREE.Mesh(makeRoundedBox(1.86, 0.24, 2.02, 0.045), duvetMat);
  mattress.position.set(0, 0.39, 0.04);
  group.add(mattress);

  const duvet = new THREE.Mesh(makeRoundedBox(1.92, 0.18, 1.48, 0.055), duvetMat);
  duvet.position.set(0, 0.45, 0.32);
  group.add(duvet);

  // 5. Four layered linen pillows
  const pillowGeo = makeRoundedBox(0.74, 0.12, 0.44, 0.045);
  [-0.44, 0.44].forEach((px) => {
    const backPillow = new THREE.Mesh(pillowGeo, upholsteryMat);
    backPillow.position.set(px, 0.58, -0.78);
    backPillow.rotation.x = 0.25;
    group.add(backPillow);

    const frontPillow = new THREE.Mesh(pillowGeo, duvetMat);
    frontPillow.position.set(px, 0.55, -0.58);
    frontPillow.rotation.x = 0.14;
    group.add(frontPillow);
  });

  const shadow = makeContactShadow(textures, 2.7, 2.6, 0.36);
  group.add(shadow);
  tagProductGroup(group, productId);
  shadow.castShadow = false;

  return {
    group,
    productId,
    woodMat,
    upholsteryMat,
    applyConfig: (config, tex) => {
      const matId = config.upholstery ?? 'natural-linen';
      const matSpec = UPHOLSTERY_MATERIALS.find((m) => m.id === matId) ?? UPHOLSTERY_MATERIALS[1];
      const col = FABRIC_COLORS.find((c) => c.id === (config.color ?? 'sand')) ?? FABRIC_COLORS[1];
      const wood = WOOD_FINISHES.find((w) => w.id === (config.woodFinish ?? 'natural-oak')) ?? WOOD_FINISHES[0];

      upholsteryMat.color.set(col.hex);
      upholsteryMat.roughness = matSpec.roughness;
      upholsteryMat.bumpMap = tex.fabricBumpByMaterial[matId];
      upholsteryMat.needsUpdate = true;
      woodMat.color.set(wood.hex);

      const wScale = config.sizeOption === 'queen' ? 0.9 : 1.0;
      group.scale.set(wScale, 1, 1);
    },
    setHighlighted: (active) => {
      upholsteryMat.emissive.set(active ? '#3B352D' : '#000000');
      upholsteryMat.emissiveIntensity = active ? 0.25 : 0;
    },
  };
}

export function buildStoneSideTable(
  textures: ProceduralTextureSet,
  productId = 'stone-side-table'
): FurnitureAssembly {
  const group = new THREE.Group();
  const stoneMat = createTravertineMaterial(textures, '#DDD2C0');
  const brassMat = createMetalMaterial('#B69A64');
  const globeMat = new THREE.MeshStandardMaterial({
    color: '#FFF6E8',
    emissive: '#FFE0B2',
    emissiveIntensity: 0.75,
    roughness: 0.35,
  });

  // 1. Turned travertine drum
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.46, 28), stoneMat);
  body.position.set(0, 0.23, 0);
  group.add(body);

  // 2. Chamfered top cap lip
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.225, 0.225, 0.03, 28), stoneMat);
  cap.position.set(0, 0.465, 0);
  group.add(cap);

  // 3. Alabaster bedside globe lamp accent
  const lampStem = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.042, 0.09, 16), brassMat);
  lampStem.position.set(0, 0.525, 0);
  group.add(lampStem);

  const globe = new THREE.Mesh(new THREE.SphereGeometry(0.095, 20, 16), globeMat);
  globe.position.set(0, 0.64, 0);
  group.add(globe);

  const shadow = makeContactShadow(textures, 0.7, 0.7, 0.34);
  group.add(shadow);
  tagProductGroup(group, productId);
  shadow.castShadow = false;

  return {
    group,
    productId,
    stoneMat,
    applyConfig: (config) => {
      const col = FABRIC_COLORS.find((c) => c.id === (config.color ?? 'sand'));
      if (col) {
        stoneMat.color.set(col.id === 'ivory' ? '#EAE5DC' : col.id === 'warm-grey' ? '#BEB8AE' : '#DDD2C0');
      }
      const hScale = config.sizeOption === 'tall' ? 1.18 : 1.0;
      group.scale.set(1, hScale, 1);
    },
    setHighlighted: (active) => {
      stoneMat.emissive.set(active ? '#463E32' : '#000000');
      stoneMat.emissiveIntensity = active ? 0.25 : 0;
    },
  };
}

export function buildFurnitureByKey(
  key: Model3DKey,
  textures: ProceduralTextureSet,
  productId: string
): FurnitureAssembly {
  switch (key) {
    case 'aurel-sofa':
      return buildAurelSofa(textures, productId);
    case 'mono-coffee-table':
      return buildMonoCoffeeTable(textures, productId);
    case 'arco-floor-lamp':
      return buildArcoFloorLamp(textures, productId);
    case 'atelier-lounge-chair':
      return buildAtelierLoungeChair(textures, productId);
    case 'form-dining-table':
      return buildFormDiningTable(textures, productId);
    case 'noma-dining-chair':
      return buildNomaDiningChair(textures, productId);
    case 'luma-bed':
      return buildLumaBed(textures, productId);
    case 'stone-side-table':
      return buildStoneSideTable(textures, productId);
  }
}
