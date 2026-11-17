export type PageView =
  | 'showroom'
  | 'collections'
  | 'spaces'
  | 'product'
  | 'studio'
  | 'story'
  | 'journal';

export type SpaceCategory =
  | 'Living Room'
  | 'Dining Room'
  | 'Bedroom'
  | 'Workspace'
  | 'Outdoor'
  | 'Lighting & Accessories';

export type UpholsteryMaterialId =
  | 'natural-linen'
  | 'boucle'
  | 'premium-leather'
  | 'velvet'
  | 'cotton-blend';

export type FabricColorId =
  | 'ivory'
  | 'sand'
  | 'charcoal'
  | 'olive'
  | 'terracotta'
  | 'warm-grey';

export type WoodFinishId = 'natural-oak' | 'smoked-walnut' | 'ebonized-ash';

export type MetalFinishId = 'brushed-brass' | 'bronzed-steel' | 'matte-nickel';

export type SofaConfigId = '3-seater' | 'l-chaise' | 'modular-grand';

export type Model3DKey =
  | 'aurel-sofa'
  | 'mono-coffee-table'
  | 'form-dining-table'
  | 'noma-dining-chair'
  | 'arco-floor-lamp'
  | 'luma-bed'
  | 'stone-side-table'
  | 'atelier-lounge-chair';

export interface MaterialOption {
  id: UpholsteryMaterialId;
  label: string;
  description: string;
  priceDelta: number;
  roughness: number;
  sheen: number;
  bumpScale: number;
}

export interface ColorOption {
  id: FabricColorId;
  label: string;
  hex: string;
}

export interface WoodOption {
  id: WoodFinishId;
  label: string;
  hex: string;
  priceDelta: number;
}

export interface MetalOption {
  id: MetalFinishId;
  label: string;
  hex: string;
  priceDelta: number;
}

export interface SizeConfigOption {
  id: string;
  label: string;
  dimensions: string;
  priceDelta: number;
}

export interface ProductConfiguration {
  upholstery?: UpholsteryMaterialId;
  color?: FabricColorId;
  woodFinish?: WoodFinishId;
  metalFinish?: MetalFinishId;
  sizeOption?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: SpaceCategory;
  style: 'Sculptural' | 'Architectural' | 'Minimalist' | 'Organic';
  basePrice: number;
  dimensions: string;
  availability: 'In Stock' | 'Made to Order' | 'Limited Atelier Run';
  leadTime: string;
  description: string;
  craftsmanship: string;
  careInstructions: string;
  deliveryInfo: string;
  primaryImage: string;
  secondaryImage: string;
  model3D: Model3DKey;
  supportsUpholstery: boolean;
  supportsWoodFinish: boolean;
  supportsMetalFinish: boolean;
  supportedMaterials: UpholsteryMaterialId[];
  supportedColors: FabricColorId[];
  supportedWoods: WoodFinishId[];
  supportedMetals: MetalFinishId[];
  sizeOptions: SizeConfigOption[];
  defaultConfig: ProductConfiguration;
}

export interface CollectionMeta {
  id: SpaceCategory;
  slug: string;
  title: string;
  description: string;
  productCount: number;
  image: string;
  accentNote: string;
}

export interface MaterialStory {
  id: string;
  name: string;
  origin: string;
  summary: string;
  tactileNotes: string;
  swatchHex: string;
  image: string;
}

export interface JournalArticle {
  id: string;
  title: string;
  category: string;
  readingTime: string;
  publishedAt: string;
  excerpt: string;
  image: string;
  paragraphs: string[];
}

export interface CartItem {
  cartItemId: string;
  productId: string;
  quantity: number;
  config: ProductConfiguration;
  unitPrice: number;
}

export interface SavedConfiguration {
  id: string;
  productId: string;
  name: string;
  config: ProductConfiguration;
  unitPrice: number;
  savedAt: string;
}

export interface CheckoutFormState {
  email: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  deliveryMethod: 'white-glove' | 'standard-freight';
  paymentMode: 'demo-card' | 'atelier-invoice';
  cardLast4: string;
  cardHolder: string;
}

export interface OrderRecord {
  orderNumber: string;
  placedAt: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  customerName: string;
  city: string;
  deliveryMethod: string;
  status: string;
}

export interface UserAccount {
  signedIn: boolean;
  name: string;
  email: string;
  savedAddresses: Array<{
    id: string;
    label: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  }>;
}

export type ShowroomChapter =
  | 'hero'
  | 'sofa'
  | 'living'
  | 'dining'
  | 'bedroom';

export type RoomPreset = 'living' | 'dining' | 'bedroom' | 'overview';
export type RoomArrangement = 'salon' | 'atelier';
