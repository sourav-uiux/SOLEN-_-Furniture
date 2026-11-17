import {
  CollectionMeta,
  ColorOption,
  JournalArticle,
  MaterialOption,
  MaterialStory,
  MetalOption,
  Product,
  WoodOption,
} from '../types/furniture';

export const IMAGES = {
  heroLiving: '/src/assets/images/hero_living_showroom_1794912300321.jpg',
  aurelSofa: '/src/assets/images/product_aurel_sofa_1794912299911.jpg',
  monoTable: '/src/assets/images/product_mono_table_1794912300675.jpg',
  formDining: '/src/assets/images/product_form_dining_1794912301483.jpg',
  lumaBed: '/src/assets/images/product_luma_bed_1794912302066.jpg',
  arcoLamp: '/src/assets/images/product_arco_lamp_1794912302697.jpg',
  workspaceStudio: '/src/assets/images/collection_workspace_studio_1794912302662.jpg',
  materialPalette: '/src/assets/images/material_craft_palette_1794912302822.jpg',
} as const;

export const UPHOLSTERY_MATERIALS: MaterialOption[] = [
  {
    id: 'boucle',
    label: 'Bouclé',
    description: 'Belgian spun alpaca-wool loop with deep tactile warmth.',
    priceDelta: 0,
    roughness: 0.92,
    sheen: 0.35,
    bumpScale: 0.032,
  },
  {
    id: 'natural-linen',
    label: 'Natural Linen',
    description: 'Heavyweight stone-washed flax weave with crisp drape.',
    priceDelta: -220,
    roughness: 0.88,
    sheen: 0.15,
    bumpScale: 0.022,
  },
  {
    id: 'cotton-blend',
    label: 'Cotton Blend',
    description: 'Brushed organic cotton twill engineered for daily resilience.',
    priceDelta: -300,
    roughness: 0.84,
    sheen: 0.12,
    bumpScale: 0.016,
  },
  {
    id: 'velvet',
    label: 'Velvet',
    description: 'Dense mohair pile with subtle directional light absorption.',
    priceDelta: 480,
    roughness: 0.62,
    sheen: 0.85,
    bumpScale: 0.012,
  },
  {
    id: 'premium-leather',
    label: 'Premium Leather',
    description: 'Full-grain vegetable-tanned Nordic aniline saddle hide.',
    priceDelta: 1150,
    roughness: 0.44,
    sheen: 0.25,
    bumpScale: 0.014,
  },
];

export const FABRIC_COLORS: ColorOption[] = [
  { id: 'ivory', label: 'Ivory', hex: '#EAE6DE' },
  { id: 'sand', label: 'Sand', hex: '#CFC2B0' },
  { id: 'warm-grey', label: 'Warm Grey', hex: '#9E978E' },
  { id: 'olive', label: 'Olive', hex: '#737767' },
  { id: 'terracotta', label: 'Terracotta', hex: '#A46952' },
  { id: 'charcoal', label: 'Charcoal', hex: '#2B2B28' },
];

export const WOOD_FINISHES: WoodOption[] = [
  { id: 'natural-oak', label: 'Natural Oak', hex: '#B99873', priceDelta: 0 },
  { id: 'smoked-walnut', label: 'Smoked Walnut', hex: '#634733', priceDelta: 340 },
  { id: 'ebonized-ash', label: 'Ebonized Ash', hex: '#2D2A27', priceDelta: 260 },
];

export const METAL_FINISHES: MetalOption[] = [
  { id: 'brushed-brass', label: 'Brushed Brass', hex: '#B69A64', priceDelta: 0 },
  { id: 'bronzed-steel', label: 'Bronzed Steel', hex: '#4B433B', priceDelta: 120 },
  { id: 'matte-nickel', label: 'Matte Nickel', hex: '#A9ABA8', priceDelta: 90 },
];

export const PRODUCTS: Product[] = [
  {
    id: 'aurel-lounge-sofa',
    slug: 'aurel-lounge-sofa',
    name: 'AUREL Lounge Sofa',
    subtitle: 'Curved architectural three-seater with recessed solid oak plinth',
    category: 'Living Room',
    style: 'Sculptural',
    basePrice: 4850,
    dimensions: 'W 258 cm · D 104 cm · H 74 cm · Seat H 41 cm',
    availability: 'In Stock',
    leadTime: 'Dispatches in 2–3 weeks via White-Glove Carrier',
    description:
      'Defined by a continuous enveloping silhouette, the AUREL Lounge Sofa anchors the living space with calm proportion. Multi-density natural latex cushions rest above a sculpted solid timber plinth.',
    craftsmanship:
      'Kiln-dried European oak internal framing joined with traditional mortise-and-tenon joinery, wrapped in breathable wool wadding and hand-tailored Belgian upholstery.',
    careInstructions:
      'Vacuum upholstery weekly with a soft brush attachment. Blot spills immediately with a damp linen cloth; condition aniline leather twice yearly with neutral balm.',
    deliveryInfo:
      'Includes white-glove inside placement, assembly, and packaging removal. 30-day home trial and 10-year structural frame warranty.',
    primaryImage: IMAGES.aurelSofa,
    secondaryImage: IMAGES.heroLiving,
    model3D: 'aurel-sofa',
    supportsUpholstery: true,
    supportsWoodFinish: true,
    supportsMetalFinish: false,
    supportedMaterials: ['boucle', 'natural-linen', 'cotton-blend', 'velvet', 'premium-leather'],
    supportedColors: ['ivory', 'sand', 'warm-grey', 'olive', 'terracotta', 'charcoal'],
    supportedWoods: ['natural-oak', 'smoked-walnut', 'ebonized-ash'],
    supportedMetals: [],
    sizeOptions: [
      { id: '3-seater', label: '3-Seater Curved', dimensions: '258 × 104 × 74 cm', priceDelta: 0 },
      { id: 'l-chaise', label: 'Asymmetric Chaise', dimensions: '295 × 148 × 74 cm', priceDelta: 1180 },
      { id: 'modular-grand', label: 'Modular Grand Salon', dimensions: '340 × 152 × 74 cm', priceDelta: 2150 },
    ],
    defaultConfig: {
      upholstery: 'boucle',
      color: 'ivory',
      woodFinish: 'natural-oak',
      sizeOption: '3-seater',
    },
  },
  {
    id: 'mono-coffee-table',
    slug: 'mono-sculptural-coffee-table',
    name: 'MONO Sculptural Coffee Table',
    subtitle: 'Carved Roman travertine organic top on fluted stone plinth',
    category: 'Living Room',
    style: 'Organic',
    basePrice: 2290,
    dimensions: 'W 145 cm · D 88 cm · H 34 cm',
    availability: 'In Stock',
    leadTime: 'Dispatches in 7–10 business days',
    description:
      'Milled from solid blocks of open-pore Roman travertine, the MONO Coffee Table balances an organic soft-chamfered tabletop over an architectural fluted cylindrical column.',
    craftsmanship:
      'Quarried in Tivoli and honed by hand to preserve natural sedimentary veining, sealed with an invisible matte breathable stone protectant.',
    careInstructions:
      'Wipe daily with a soft dry or pH-neutral damp cloth. Avoid acidic cleaners to protect the natural limestone finish.',
    deliveryInfo:
      'Delivered in reinforced timber crating with in-room placement and leveling included.',
    primaryImage: IMAGES.monoTable,
    secondaryImage: IMAGES.heroLiving,
    model3D: 'mono-coffee-table',
    supportsUpholstery: false,
    supportsWoodFinish: true,
    supportsMetalFinish: false,
    supportedMaterials: [],
    supportedColors: ['ivory', 'sand', 'warm-grey'],
    supportedWoods: ['natural-oak', 'smoked-walnut'],
    supportedMetals: [],
    sizeOptions: [
      { id: 'standard', label: 'Standard Organic', dimensions: '145 × 88 × 34 cm', priceDelta: 0 },
      { id: 'grand', label: 'Grand Pavilion', dimensions: '175 × 102 × 34 cm', priceDelta: 520 },
    ],
    defaultConfig: {
      color: 'sand',
      woodFinish: 'natural-oak',
      sizeOption: 'standard',
    },
  },
  {
    id: 'form-dining-table',
    slug: 'form-dining-table',
    name: 'FORM Dining Table',
    subtitle: 'Architectural solid timber plank top on sculpted trestle legs',
    category: 'Dining Room',
    style: 'Architectural',
    basePrice: 3950,
    dimensions: 'L 240 cm · W 100 cm · H 75 cm',
    availability: 'Made to Order',
    leadTime: 'Crafted to order in 4–5 weeks',
    description:
      'Designed as a gathering plane for slow meals and quiet work, the FORM Dining Table pairs a chamfered solid timber surface with bold inward-raked trestle legs.',
    craftsmanship:
      'Constructed from FSC-certified European oak and American black walnut planks matched for continuous grain, finished in matte plant-based oil.',
    careInstructions:
      'Dust with a dry cotton cloth. Refresh the oiled timber surface annually with our botanical maintenance wax.',
    deliveryInfo:
      'White-glove assembly in your dining room with trestle leveling and packaging removal.',
    primaryImage: IMAGES.formDining,
    secondaryImage: IMAGES.workspaceStudio,
    model3D: 'form-dining-table',
    supportsUpholstery: false,
    supportsWoodFinish: true,
    supportsMetalFinish: true,
    supportedMaterials: [],
    supportedColors: [],
    supportedWoods: ['smoked-walnut', 'natural-oak', 'ebonized-ash'],
    supportedMetals: ['brushed-brass', 'bronzed-steel'],
    sizeOptions: [
      { id: '6-seat', label: '6-Seater (220 cm)', dimensions: '220 × 98 × 75 cm', priceDelta: 0 },
      { id: '8-seat', label: '8-Seater (260 cm)', dimensions: '260 × 104 × 75 cm', priceDelta: 650 },
      { id: '10-seat', label: '10-Seater (300 cm)', dimensions: '300 × 108 × 75 cm', priceDelta: 1200 },
    ],
    defaultConfig: {
      woodFinish: 'smoked-walnut',
      metalFinish: 'bronzed-steel',
      sizeOption: '6-seat',
    },
  },
  {
    id: 'noma-dining-chair',
    slug: 'noma-dining-chair',
    name: 'NOMA Dining Chair',
    subtitle: 'Steam-bent solid oak frame with suspended upholstered cradle',
    category: 'Dining Room',
    style: 'Minimalist',
    basePrice: 780,
    dimensions: 'W 54 cm · D 52 cm · H 77 cm · Seat H 46 cm',
    availability: 'In Stock',
    leadTime: 'Dispatches in 5–7 business days',
    description:
      'Light in visual profile yet generously supportive over long dinners, the NOMA Chair wraps a curved steam-bent backrest seamlessly around an upholstered seat cushion.',
    craftsmanship:
      'Turned solid timber legs and finger-jointed rear uprights crafted by third-generation cabinetmakers.',
    careInstructions:
      'Wipe timber gently with a slightly damp cloth and blot fabric upholstery immediately if needed.',
    deliveryInfo:
      'Ships fully assembled in recyclable protective cartons.',
    primaryImage: IMAGES.formDining,
    secondaryImage: IMAGES.materialPalette,
    model3D: 'noma-dining-chair',
    supportsUpholstery: true,
    supportsWoodFinish: true,
    supportsMetalFinish: false,
    supportedMaterials: ['natural-linen', 'boucle', 'premium-leather'],
    supportedColors: ['ivory', 'sand', 'olive', 'charcoal'],
    supportedWoods: ['natural-oak', 'smoked-walnut', 'ebonized-ash'],
    supportedMetals: [],
    sizeOptions: [
      { id: 'single', label: 'Single Chair', dimensions: '54 × 52 × 77 cm', priceDelta: 0 },
      { id: 'pair', label: 'Set of 2 Chairs', dimensions: '2 × 54 × 52 × 77 cm', priceDelta: 740 },
    ],
    defaultConfig: {
      upholstery: 'natural-linen',
      color: 'ivory',
      woodFinish: 'natural-oak',
      sizeOption: 'single',
    },
  },
  {
    id: 'arco-floor-lamp',
    slug: 'arco-floor-lamp',
    name: 'ARCO Floor Lamp',
    subtitle: 'Sweeping brushed brass arc suspended from a honed stone plinth',
    category: 'Lighting & Accessories',
    style: 'Architectural',
    basePrice: 1480,
    dimensions: 'W 42 cm · Reach 185 cm · H 215 cm',
    availability: 'In Stock',
    leadTime: 'Dispatches in 3–5 business days',
    description:
      'Drawing a quiet architectural arc across the room, the ARCO Floor Lamp pairs a monolithic travertine counterweight with a spun metal shade that casts warm pooled light.',
    craftsmanship:
      'Precision-bent seamless metal tubing finished by hand, anchored into a cored Roman travertine base with braided linen cord.',
    careInstructions:
      'Dust metal surfaces with a dry microfiber cloth; avoid abrasive brass polishes to preserve the protective matte lacquer.',
    deliveryInfo:
      'Ships in two custom foam-free protective boxes with integrated warm 2700K dimmable LED bulb.',
    primaryImage: IMAGES.arcoLamp,
    secondaryImage: IMAGES.heroLiving,
    model3D: 'arco-floor-lamp',
    supportsUpholstery: false,
    supportsWoodFinish: false,
    supportsMetalFinish: true,
    supportedMaterials: [],
    supportedColors: [],
    supportedWoods: [],
    supportedMetals: ['brushed-brass', 'bronzed-steel', 'matte-nickel'],
    sizeOptions: [
      { id: 'standard', label: 'Standard Atelier Arc (215 cm)', dimensions: '185 × 42 × 215 cm', priceDelta: 0 },
    ],
    defaultConfig: {
      metalFinish: 'brushed-brass',
      sizeOption: 'standard',
    },
  },
  {
    id: 'luma-bed',
    slug: 'luma-bed',
    name: 'LUMA Bed',
    subtitle: 'Low-profile timber platform with wide upholstered linen headboard',
    category: 'Bedroom',
    style: 'Minimalist',
    basePrice: 3680,
    dimensions: 'W 228 cm · L 218 cm · H 102 cm (King)',
    availability: 'Made to Order',
    leadTime: 'Crafted to order in 3–4 weeks',
    description:
      'Designed as a serene architectural sanctuary, the LUMA Bed suspends a recessed oak platform above the floor, anchored by an expansive cushioned headboard.',
    craftsmanship:
      'Solid hardwood perimeter rails with silent slatted beech suspension and removable zippered Belgian linen headboard covers.',
    careInstructions:
      'Removable linen headboard upholstery can be dry-cleaned; dust oak frame weekly.',
    deliveryInfo:
      'Includes white-glove bedroom installation and full assembly.',
    primaryImage: IMAGES.lumaBed,
    secondaryImage: IMAGES.materialPalette,
    model3D: 'luma-bed',
    supportsUpholstery: true,
    supportsWoodFinish: true,
    supportsMetalFinish: false,
    supportedMaterials: ['natural-linen', 'boucle', 'cotton-blend'],
    supportedColors: ['sand', 'ivory', 'warm-grey', 'olive'],
    supportedWoods: ['natural-oak', 'smoked-walnut', 'ebonized-ash'],
    supportedMetals: [],
    sizeOptions: [
      { id: 'queen', label: 'Queen (160 × 200 cm)', dimensions: '208 × 214 × 102 cm', priceDelta: 0 },
      { id: 'king', label: 'King (180 × 200 cm)', dimensions: '228 × 218 × 102 cm', priceDelta: 420 },
    ],
    defaultConfig: {
      upholstery: 'natural-linen',
      color: 'sand',
      woodFinish: 'natural-oak',
      sizeOption: 'king',
    },
  },
  {
    id: 'stone-side-table',
    slug: 'stone-side-table',
    name: 'STONE Side Table',
    subtitle: 'Turned monolithic travertine cylinder for bedside or lounge',
    category: 'Bedroom',
    style: 'Organic',
    basePrice: 920,
    dimensions: 'Ø 44 cm · H 48 cm',
    availability: 'In Stock',
    leadTime: 'Dispatches in 3–5 business days',
    description:
      'A quiet study in geological permanence. Turned from solid limestone and Roman travertine, the STONE Side Table brings grounded weight beside a bed or lounge chair.',
    craftsmanship:
      'Lathe-turned from natural stone blocks with subtle vertical channelling and recessed felt floor protection.',
    careInstructions:
      'Clean with warm water and soft cloth; reapply stone sealer annually if desired.',
    deliveryInfo:
      'Delivered in reinforced packaging with threshold or white-glove placement.',
    primaryImage: IMAGES.lumaBed,
    secondaryImage: IMAGES.monoTable,
    model3D: 'stone-side-table',
    supportsUpholstery: false,
    supportsWoodFinish: false,
    supportsMetalFinish: false,
    supportedMaterials: [],
    supportedColors: ['sand', 'ivory', 'warm-grey'],
    supportedWoods: [],
    supportedMetals: [],
    sizeOptions: [
      { id: 'standard', label: 'Cylinder (Ø 44 cm)', dimensions: 'Ø 44 × H 48 cm', priceDelta: 0 },
      { id: 'tall', label: 'Plinth Tall (Ø 38 cm)', dimensions: 'Ø 38 × H 58 cm', priceDelta: 140 },
    ],
    defaultConfig: {
      color: 'sand',
      sizeOption: 'standard',
    },
  },
  {
    id: 'atelier-lounge-chair',
    slug: 'atelier-lounge-chair',
    name: 'ATELIER Lounge Chair',
    subtitle: 'Sculpted solid timber frame with pitched saddle sling cushions',
    category: 'Workspace',
    style: 'Sculptural',
    basePrice: 2150,
    dimensions: 'W 74 cm · D 82 cm · H 76 cm · Seat H 39 cm',
    availability: 'Limited Atelier Run',
    leadTime: 'Dispatches in 10–14 business days',
    description:
      'Engineered around a relaxed 106-degree reading recline, the ATELIER Lounge Chair pairs carved timber armrests with supple leather or bouclé sling cushions.',
    craftsmanship:
      'Hand-shaped solid oak or walnut joinery fastened with concealed brushed brass hardware.',
    careInstructions:
      'Nourish saddle leather with beeswax conditioner every 6 months; brush wool textiles gently.',
    deliveryInfo:
      'Arrives fully assembled with white-glove placement available.',
    primaryImage: IMAGES.arcoLamp,
    secondaryImage: IMAGES.workspaceStudio,
    model3D: 'atelier-lounge-chair',
    supportsUpholstery: true,
    supportsWoodFinish: true,
    supportsMetalFinish: true,
    supportedMaterials: ['premium-leather', 'boucle', 'natural-linen'],
    supportedColors: ['terracotta', 'ivory', 'olive', 'charcoal'],
    supportedWoods: ['natural-oak', 'smoked-walnut'],
    supportedMetals: ['brushed-brass', 'bronzed-steel'],
    sizeOptions: [
      { id: 'chair-only', label: 'Lounge Chair', dimensions: '74 × 82 × 76 cm', priceDelta: 0 },
      { id: 'with-ottoman', label: 'Chair + Matching Ottoman', dimensions: '74 × 132 × 76 cm', priceDelta: 690 },
    ],
    defaultConfig: {
      upholstery: 'premium-leather',
      color: 'terracotta',
      woodFinish: 'natural-oak',
      metalFinish: 'brushed-brass',
      sizeOption: 'chair-only',
    },
  },
];

export const COLLECTIONS: CollectionMeta[] = [
  {
    id: 'Living Room',
    slug: 'living-room',
    title: 'Living Room',
    description: 'Curved seating, monolithic travertine tables, and low architectural proportions.',
    productCount: 2,
    image: IMAGES.heroLiving,
    accentNote: 'Primary Gathering Spaces',
  },
  {
    id: 'Dining Room',
    slug: 'dining-room',
    title: 'Dining Room',
    description: 'Solid European oak tables and steam-bent seating crafted for daily rituals.',
    productCount: 2,
    image: IMAGES.formDining,
    accentNote: 'Tactile Timber Joinery',
  },
  {
    id: 'Bedroom',
    slug: 'bedroom',
    title: 'Bedroom',
    description: 'Quiet upholstered platforms and honed limestone bedside volumes.',
    productCount: 2,
    image: IMAGES.lumaBed,
    accentNote: 'Restorative Architecture',
  },
  {
    id: 'Workspace',
    slug: 'workspace',
    title: 'Workspace',
    description: 'Focused reading chairs and quiet walnut surfaces bathed in natural light.',
    productCount: 1,
    image: IMAGES.workspaceStudio,
    accentNote: 'Private Studies',
  },
  {
    id: 'Outdoor',
    slug: 'outdoor',
    title: 'Outdoor',
    description: 'Weather-seasoned stone plinths and architectural courtyard seating.',
    productCount: 1,
    image: IMAGES.monoTable,
    accentNote: 'Courtyard & Terrace',
  },
  {
    id: 'Lighting & Accessories',
    slug: 'lighting-accessories',
    title: 'Lighting & Accessories',
    description: 'Brushed brass luminaires and warm tactile sculptural accents.',
    productCount: 1,
    image: IMAGES.arcoLamp,
    accentNote: 'Atmospheric Light',
  },
];

export const MATERIAL_STORIES: MaterialStory[] = [
  {
    id: 'boucle',
    name: 'Belgian Alpaca Bouclé',
    origin: 'Flanders, Belgium',
    summary:
      'Woven from unbleached alpaca and merino wool yarns into irregular tactile loops that catch afternoon daylight softly.',
    tactileNotes: 'Martindale 65,000 rubs · Breathable natural wool pile · Zero synthetic sheen',
    swatchHex: '#EAE6DE',
    image: IMAGES.aurelSofa,
  },
  {
    id: 'travertine',
    name: 'Honed Roman Travertine',
    origin: 'Tivoli, Italy',
    summary:
      'Unfilled sedimentary limestone cut along the vein to reveal delicate natural cavities and warm mineral strata.',
    tactileNotes: '28mm–40mm solid slabs · Matte honed finish · Breathable mineral seal',
    swatchHex: '#D7C8B3',
    image: IMAGES.monoTable,
  },
  {
    id: 'european-oak',
    name: 'Oiled European Oak & Walnut',
    origin: 'Bavaria & Jura Forests',
    summary:
      'Slow-grown hardwood air-dried for twenty-four months before precision milling and hand-rubbed botanical oil finishing.',
    tactileNotes: 'FSC-certified timber · Open-grain matte surface · Repairs seamlessly with oil',
    swatchHex: '#8B7055',
    image: IMAGES.formDining,
  },
  {
    id: 'aniline-leather',
    name: 'Vegetable-Tanned Saddle Hide',
    origin: 'Tärnsjö, Sweden',
    summary:
      'Full-grain Nordic hides tanned in tree bark extracts without synthetic surface coatings, deepening in patina every year.',
    tactileNotes: '1.4mm full-grain hide · Natural bark tannins · Develops rich amber patina',
    swatchHex: '#A46952',
    image: IMAGES.materialPalette,
  },
];

export const JOURNAL_ARTICLES: JournalArticle[] = [
  {
    id: 'timeless-living-room',
    title: 'Designing a Timeless Living Room',
    category: 'Architecture',
    readingTime: '5 min read',
    publishedAt: 'November 2026',
    excerpt:
      'Why low horizontal sightlines, generous circulation, and tactile acoustic textiles outlast seasonal interior trends.',
    image: IMAGES.heroLiving,
    paragraphs: [
      'A serene living room begins not with individual objects, but with the negative space between them. When low-slung seating sits below window sill lines, daylight travels uninterrupted across the floor plane.',
      'We compose rooms around three anchored volumes: a curved upholstered anchor such as the AUREL Lounge Sofa, a mineral counterpoint in honed travertine, and a single tall architectural luminaire that draws the eye upward.',
      'By limiting chromatic contrast to warm ivory plaster, oiled oak, and a muted olive or terracotta accent, the changing angle of afternoon sunlight becomes the room’s primary ornament.',
    ],
  },
  {
    id: 'understanding-natural-materials',
    title: 'Understanding Natural Materials',
    category: 'Craftsmanship',
    readingTime: '4 min read',
    publishedAt: 'October 2026',
    excerpt:
      'How open-pore travertine, unbleached flax linen, and bark-tanned leather age gracefully alongside daily life.',
    image: IMAGES.materialPalette,
    paragraphs: [
      'Synthetic finishes are designed to look identical on day one and day one thousand—until they crack or peel. Natural materials behave differently: they record light, touch, and warmth.',
      'Unfilled Roman travertine reveals tiny mineral pores that soften harsh specular glare. Similarly, solid European oak treated with plant-based oil can be renewed endlessly with a cloth rather than discarded.',
      'Selecting living surfaces is an investment in quiet permanence rather than fragile perfection.',
    ],
  },
  {
    id: 'art-of-minimal-interiors',
    title: 'The Art of Minimal Interiors',
    category: 'Philosophy',
    readingTime: '6 min read',
    publishedAt: 'September 2026',
    excerpt:
      'Warm minimalism rejects sterility in favor of honest joinery, soft plaster acoustics, and deliberate restraint.',
    image: IMAGES.lumaBed,
    paragraphs: [
      'Minimalism fails when it feels like an empty gallery. True architectural warmth emerges from texture: the nubby weave of bouclé, the subtle undulation of limewash walls, and the soft edge of a chamfered timber beam.',
      'Every piece in the SOLEN collection is proportioned so its structural logic remains quietly legible—never hidden behind unnecessary ornament.',
    ],
  },
  {
    id: 'architecture-and-furniture',
    title: 'Architecture and Furniture in Dialogue',
    category: 'Spatial Study',
    readingTime: '5 min read',
    publishedAt: 'August 2026',
    excerpt:
      'Treating the sofa, dining table, and floor lamp as interior micro-architecture shaped by light and movement.',
    image: IMAGES.formDining,
    paragraphs: [
      'When furniture aligns with the architectural rhythm of window mullions, floor planks, and ceiling beams, a room settles into immediate visual calm.',
      'In our digital 3D showroom, visitors can orbit around each piece and move continuously between living, dining, and sleeping thresholds to feel those spatial relationships directly.',
    ],
  },
];

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}
