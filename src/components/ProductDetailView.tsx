import React, { useState } from 'react';
import {
  ArrowLeft,
  Bookmark,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {
  FABRIC_COLORS,
  METAL_FINISHES,
  PRODUCTS,
  UPHOLSTERY_MATERIALS,
  WOOD_FINISHES,
} from '../data/catalog';
import { ProductViewer3D } from '../three/ProductViewer3D';
import { Product, ProductConfiguration } from '../types/furniture';
import {
  calculateConfiguredPrice,
  formatCurrency,
  summarizeConfiguration,
} from '../utils/commerce';
import { SmartImage } from './SmartImage';

interface ProductDetailViewProps {
  product: Product;
  initialConfig?: ProductConfiguration;
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToBag: (product: Product, config: ProductConfiguration, qty: number) => void;
  onSaveConfiguration: (
    product: Product,
    config: ProductConfiguration,
    unitPrice: number
  ) => void;
  onOpenProduct: (productId: string) => void;
  onBackToCatalog: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  initialConfig,
  wishlistIds,
  onToggleWishlist,
  onAddToBag,
  onSaveConfiguration,
  onOpenProduct,
  onBackToCatalog,
}) => {
  const [config, setConfig] = useState<ProductConfiguration>(
    initialConfig ?? product.defaultConfig
  );
  const [viewMode, setViewMode] = useState<'3d' | 'photo'>('3d');
  const [cameraPreset, setCameraPreset] = useState<
    'studio' | 'front' | 'side' | 'detail'
  >('studio');
  const [resetSeq, setResetSeq] = useState(0);
  const [zoomSeq, setZoomSeq] = useState({ seq: 0, dir: 1 });
  const [quantity, setQuantity] = useState(1);
  const [openAccordion, setOpenAccordion] = useState<string>('details');
  const [savedBanner, setSavedBanner] = useState(false);

  const unitPrice = calculateConfiguredPrice(product, config);
  const isSaved = wishlistIds.includes(product.id);

  const availableMaterials = UPHOLSTERY_MATERIALS.filter((m) =>
    product.supportedMaterials.includes(m.id)
  );
  const availableColors = FABRIC_COLORS.filter((c) =>
    product.supportedColors.includes(c.id)
  );
  const availableWoods = WOOD_FINISHES.filter((w) =>
    product.supportedWoods.includes(w.id)
  );
  const availableMetals = METAL_FINISHES.filter((m) =>
    product.supportedMetals.includes(m.id)
  );

  const activeSizeObj = product.sizeOptions.find((s) => s.id === config.sizeOption);
  const relatedProducts = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3);

  const handleSaveConfig = () => {
    onSaveConfiguration(product, config, unitPrice);
    setSavedBanner(true);
    window.setTimeout(() => setSavedBanner(false), 3000);
  };

  return (
    <main className="min-h-screen bg-[#F6F4EF] pt-24 pb-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToCatalog}
            className="inline-flex items-center gap-2 text-xs tracking-[0.08em] uppercase text-[#242421]/75 hover:text-[#242421] cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Collection</span>
          </button>
          <span className="text-xs text-[#737767]">
            {product.category} · {product.availability}
          </span>
        </div>

        {/* Main Split Composition: Left 3D / Gallery, Right Contiguous Configurator */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* LEFT: Interactive 3D Product Viewer & Studio Gallery */}
          <div className="lg:col-span-7 lg:sticky lg:top-24">
            <div className="relative bg-[#EAE6DE] border border-[#242421]/10 overflow-hidden aspect-[4/3]">
              {viewMode === '3d' ? (
                <ProductViewer3D
                  productId={product.id}
                  modelKey={product.model3D}
                  config={config}
                  cameraPreset={cameraPreset}
                  resetSeq={resetSeq}
                  zoomSeq={zoomSeq}
                />
              ) : (
                <SmartImage
                  src={product.primaryImage}
                  alt={product.name}
                  fallbackTitle={product.name}
                  className="w-full h-full object-cover"
                />
              )}

              {/* Viewer Mode & Angle Toolbar */}
              <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-[#F6F4EF]/95 border border-[#242421]/15 p-1">
                  <button
                    type="button"
                    onClick={() => setViewMode('3d')}
                    className={`px-3 py-1 text-[11px] uppercase tracking-[0.06em] cursor-pointer ${
                      viewMode === '3d'
                        ? 'bg-[#242421] text-[#F6F4EF]'
                        : 'text-[#242421]'
                    }`}
                  >
                    3D Studio
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('photo')}
                    className={`px-3 py-1 text-[11px] uppercase tracking-[0.06em] cursor-pointer ${
                      viewMode === 'photo'
                        ? 'bg-[#242421] text-[#F6F4EF]'
                        : 'text-[#242421]'
                    }`}
                  >
                    Photography
                  </button>
                </div>

                {viewMode === '3d' && (
                  <div className="flex items-center gap-1 bg-[#F6F4EF]/95 border border-[#242421]/15 p-1">
                    {(['studio', 'front', 'side', 'detail'] as const).map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setCameraPreset(preset)}
                        className={`px-2.5 py-1 text-[11px] uppercase cursor-pointer ${
                          cameraPreset === preset
                            ? 'bg-[#242421] text-[#F6F4EF]'
                            : 'text-[#242421]/75 hover:text-[#242421]'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setZoomSeq((z) => ({ seq: z.seq + 1, dir: 1 }))}
                      aria-label="Zoom in 3D product"
                      className="p-1.5 text-[#242421] hover:bg-[#EAE6DE] cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomSeq((z) => ({ seq: z.seq + 1, dir: -1 }))}
                      aria-label="Zoom out 3D product"
                      className="p-1.5 text-[#242421] hover:bg-[#EAE6DE] cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setCameraPreset('studio');
                        setResetSeq((n) => n + 1);
                      }}
                      aria-label="Reset 3D camera"
                      className="p-1.5 text-[#242421] hover:bg-[#EAE6DE] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-[#737767] mt-2.5">
              Drag to rotate 360°. All material and finish changes update directly on the 3D geometry.
            </p>
          </div>

          {/* RIGHT: Contiguous Customization & Purchase Module */}
          <div className="lg:col-span-5">
            <div className="border-b border-[#242421]/12 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="font-editorial text-4xl text-[#242421] font-normal">
                    {product.name}
                  </h1>
                  <p className="text-sm text-[#242421]/75 mt-1">{product.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onToggleWishlist(product.id)}
                  aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
                  className={`p-2.5 border cursor-pointer transition-colors ${
                    isSaved
                      ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                      : 'border-[#242421]/20 text-[#242421] hover:border-[#242421]'
                  }`}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={isSaved ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
              <div className="mt-4 text-2xl font-medium tabular-nums text-[#242421]" data-testid="pdp-price">
                {formatCurrency(unitPrice)}
              </div>
              <p className="mt-3 text-sm text-[#242421]/80 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Customization Studio Steps (Only Supported Options) */}
            <div className="py-6 space-y-6 border-b border-[#242421]/12">
              {product.supportsUpholstery && availableMaterials.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs uppercase tracking-[0.08em] text-[#737767]">
                      Upholstery Material
                    </span>
                    <span className="text-xs text-[#242421]">
                      {UPHOLSTERY_MATERIALS.find((m) => m.id === config.upholstery)?.label}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {availableMaterials.map((mat) => {
                      const active = config.upholstery === mat.id;
                      return (
                        <button
                          key={mat.id}
                          type="button"
                          onClick={() => setConfig({ ...config, upholstery: mat.id })}
                          className={`p-2.5 text-left border text-xs transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                              : 'bg-[#FFFFFF] text-[#242421] border-[#242421]/15 hover:border-[#242421]'
                          }`}
                        >
                          <div className="font-medium">{mat.label}</div>
                          <div
                            className={`text-[11px] tabular-nums mt-0.5 ${
                              active ? 'text-[#EAE6DE]' : 'text-[#737767]'
                            }`}
                          >
                            {mat.priceDelta === 0
                              ? 'Included'
                              : mat.priceDelta > 0
                                ? `+${formatCurrency(mat.priceDelta)}`
                                : formatCurrency(mat.priceDelta)}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {availableColors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs uppercase tracking-[0.08em] text-[#737767]">
                      Tone &amp; Finish Colour
                    </span>
                    <span className="text-xs text-[#242421]">
                      {FABRIC_COLORS.find((c) => c.id === config.color)?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {availableColors.map((col) => {
                      const active = config.color === col.id;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => setConfig({ ...config, color: col.id })}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs cursor-pointer transition-colors ${
                            active
                              ? 'border-[#242421] bg-[#FFFFFF] font-medium'
                              : 'border-[#242421]/15 bg-[#FFFFFF]/60 hover:border-[#242421]'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-[#242421]/20"
                            style={{ backgroundColor: col.hex }}
                          />
                          <span>{col.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.supportsWoodFinish && availableWoods.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs uppercase tracking-[0.08em] text-[#737767]">
                      Timber Finish
                    </span>
                    <span className="text-xs text-[#242421]">
                      {WOOD_FINISHES.find((w) => w.id === config.woodFinish)?.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableWoods.map((wood) => {
                      const active = config.woodFinish === wood.id;
                      return (
                        <button
                          key={wood.id}
                          type="button"
                          onClick={() => setConfig({ ...config, woodFinish: wood.id })}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs cursor-pointer ${
                            active
                              ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                              : 'bg-[#FFFFFF] text-[#242421] border-[#242421]/15 hover:border-[#242421]'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-[#FFFFFF]/30"
                            style={{ backgroundColor: wood.hex }}
                          />
                          <span>{wood.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.supportsMetalFinish && availableMetals.length > 0 && (
                <div>
                  <span className="block text-xs uppercase tracking-[0.08em] text-[#737767] mb-2.5">
                    Metal Hardware
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {availableMetals.map((metal) => {
                      const active = config.metalFinish === metal.id;
                      return (
                        <button
                          key={metal.id}
                          type="button"
                          onClick={() => setConfig({ ...config, metalFinish: metal.id })}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 border text-xs cursor-pointer ${
                            active
                              ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                              : 'bg-[#FFFFFF] text-[#242421] border-[#242421]/15'
                          }`}
                        >
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-[#242421]/20"
                            style={{ backgroundColor: metal.hex }}
                          />
                          <span>{metal.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {product.sizeOptions.length > 0 && (
                <div>
                  <span className="block text-xs uppercase tracking-[0.08em] text-[#737767] mb-2.5">
                    Configuration &amp; Scale
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {product.sizeOptions.map((sz) => {
                      const active = config.sizeOption === sz.id;
                      return (
                        <button
                          key={sz.id}
                          type="button"
                          onClick={() => setConfig({ ...config, sizeOption: sz.id })}
                          className={`px-3 py-2 border text-xs cursor-pointer ${
                            active
                              ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                              : 'bg-[#FFFFFF] text-[#242421] border-[#242421]/15 hover:border-[#242421]'
                          }`}
                        >
                          {sz.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Selected Configuration Summary */}
              <div className="bg-[#EAE6DE]/65 p-4 text-xs flex items-center justify-between gap-4">
                <div>
                  <div className="text-[#737767] uppercase tracking-[0.06em] text-[10px]">
                    Selected Specification
                  </div>
                  <div className="text-[#242421] mt-0.5">
                    {summarizeConfiguration(product, config)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setConfig(product.defaultConfig)}
                  className="text-[#737767] hover:text-[#242421] underline cursor-pointer shrink-0"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Quantity + Add to Bag + Save Config */}
            <div className="py-6 space-y-3 border-b border-[#242421]/12">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-[#242421]/25 bg-[#FFFFFF]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="p-3 text-[#242421] hover:bg-[#EAE6DE] cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-sm tabular-nums font-medium">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Increase quantity"
                    className="p-3 text-[#242421] hover:bg-[#EAE6DE] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  data-testid="pdp-add-to-bag"
                  onClick={() => onAddToBag(product, config, quantity)}
                  className="flex-1 py-3.5 px-6 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.12em] uppercase hover:bg-[#3A3A35] transition-colors cursor-pointer"
                >
                  Add to Bag — {formatCurrency(unitPrice * quantity)}
                </button>
              </div>

              <button
                type="button"
                onClick={handleSaveConfig}
                className="w-full py-2.5 border border-[#242421]/20 text-xs tracking-[0.08em] uppercase text-[#242421] hover:border-[#242421] inline-flex items-center justify-center gap-2 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>{savedBanner ? 'Configuration Saved to Account' : 'Save Configuration'}</span>
              </button>

              <p className="text-xs text-[#737767] pt-1">{product.leadTime}</p>
            </div>

            {/* Expandable Specification Panels */}
            <div className="divide-y divide-[#242421]/12">
              {[
                {
                  id: 'details',
                  title: 'Details & Dimensions',
                  body: `${activeSizeObj?.dimensions ?? product.dimensions}. ${product.description}`,
                },
                {
                  id: 'craft',
                  title: 'Materials & Craftsmanship',
                  body: product.craftsmanship,
                },
                {
                  id: 'care',
                  title: 'Care Instructions',
                  body: product.careInstructions,
                },
                {
                  id: 'delivery',
                  title: 'Delivery & Returns',
                  body: product.deliveryInfo,
                },
              ].map((panel) => {
                const isOpen = openAccordion === panel.id;
                return (
                  <div key={panel.id} className="py-4">
                    <button
                      type="button"
                      aria-expanded={isOpen}
                      onClick={() => setOpenAccordion(isOpen ? '' : panel.id)}
                      className="w-full flex items-center justify-between text-left text-sm font-medium text-[#242421] cursor-pointer"
                    >
                      <span>{panel.title}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="mt-3 text-xs text-[#242421]/75 leading-relaxed">
                        {panel.body}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Related Pieces */}
        <section className="mt-24 pt-16 border-t border-[#242421]/12">
          <h2 className="font-editorial text-3xl text-[#242421] mb-8">
            Companion Pieces
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedProducts.map((rel) => (
              <button
                key={rel.id}
                type="button"
                onClick={() => onOpenProduct(rel.id)}
                className="text-left group cursor-pointer"
              >
                <div className="aspect-[4/3] overflow-hidden bg-[#EAE6DE]">
                  <SmartImage
                    src={rel.primaryImage}
                    alt={rel.name}
                    fallbackTitle={rel.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="font-editorial text-2xl text-[#242421]">{rel.name}</span>
                  <span className="text-sm tabular-nums text-[#242421]">
                    {formatCurrency(rel.basePrice)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};
