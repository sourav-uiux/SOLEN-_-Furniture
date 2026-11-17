import React, { useMemo, useState } from 'react';
import { Eye, Heart, SlidersHorizontal, X } from 'lucide-react';
import {
  COLLECTIONS,
  FABRIC_COLORS,
  PRODUCTS,
  UPHOLSTERY_MATERIALS,
  WOOD_FINISHES,
} from '../data/catalog';
import { Product, ProductConfiguration, SpaceCategory } from '../types/furniture';
import {
  CatalogFilterState,
  filterAndSortProducts,
  formatCurrency,
} from '../utils/commerce';
import { SmartImage } from './SmartImage';

interface CatalogViewProps {
  initialCategory: SpaceCategory | 'All';
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onOpenProduct: (productId: string) => void;
  onAddToBag: (product: Product, config: ProductConfiguration, qty?: number) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  initialCategory,
  wishlistIds,
  onToggleWishlist,
  onOpenProduct,
  onAddToBag,
}) => {
  const [filters, setFilters] = useState<CatalogFilterState>({
    category: initialCategory,
    material: 'All',
    color: 'All',
    availability: 'All',
    style: 'All',
    maxPrice: 6000,
    sortBy: 'featured',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const visibleProducts = useMemo(
    () => filterAndSortProducts(PRODUCTS, filters),
    [filters]
  );

  const activeCollection =
    filters.category === 'All'
      ? null
      : COLLECTIONS.find((c) => c.id === filters.category) ?? null;

  const resetFilters = () =>
    setFilters({
      category: 'All',
      material: 'All',
      color: 'All',
      availability: 'All',
      style: 'All',
      maxPrice: 6000,
      sortBy: 'featured',
    });

  return (
    <main className="min-h-screen bg-[#F6F4EF] pt-28 pb-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        {/* Editorial Collection Heading */}
        <div className="border-b border-[#242421]/12 pb-10 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.14em] uppercase text-[#737767] mb-2">
              Solen Collection
            </p>
            <h1 className="font-editorial text-4xl md:text-6xl text-[#242421] font-normal">
              {activeCollection ? activeCollection.title : 'All Architectural Pieces'}
            </h1>
            <p className="text-sm md:text-base text-[#242421]/75 mt-3 max-w-xl">
              {activeCollection
                ? activeCollection.description
                : 'Crafted from solid European oak, honed Roman travertine, and unbleached Belgian upholstery.'}
            </p>
          </div>
          <div className="text-xs text-[#737767] tabular-nums">
            Showing {visibleProducts.length} of {PRODUCTS.length} pieces
          </div>
        </div>

        {/* Category Tabs + Minimal Filter Toggle + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by space">
            {(['All', ...COLLECTIONS.map((c) => c.id)] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilters((f) => ({ ...f, category: cat }))}
                className={`px-3.5 py-2 text-xs tracking-[0.06em] uppercase transition-colors cursor-pointer whitespace-nowrap border ${
                  filters.category === cat
                    ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                    : 'bg-transparent text-[#242421]/80 border-[#242421]/15 hover:border-[#242421]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((v) => !v)}
              aria-expanded={showFilters}
              className="inline-flex items-center gap-2 px-4 py-2 border border-[#242421]/20 text-xs tracking-[0.06em] uppercase text-[#242421] hover:border-[#242421] cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
            </button>

            <label className="sr-only" htmlFor="catalog-sort">
              Sort products
            </label>
            <select
              id="catalog-sort"
              value={filters.sortBy}
              onChange={(e) =>
                setFilters((f) => ({
                  ...f,
                  sortBy: e.target.value as CatalogFilterState['sortBy'],
                }))
              }
              className="px-3.5 py-2 border border-[#242421]/20 bg-[#F6F4EF] text-xs text-[#242421] cursor-pointer"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <div className="bg-[#EAE6DE]/75 border border-[#242421]/12 p-6 mb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div>
              <label htmlFor="filter-material" className="block text-[11px] uppercase tracking-[0.1em] text-[#737767] mb-2">
                Material
              </label>
              <select
                id="filter-material"
                value={filters.material}
                onChange={(e) => setFilters((f) => ({ ...f, material: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F6F4EF] border border-[#242421]/15 text-xs text-[#242421]"
              >
                <option value="All">All Materials</option>
                {UPHOLSTERY_MATERIALS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
                {WOOD_FINISHES.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-color" className="block text-[11px] uppercase tracking-[0.1em] text-[#737767] mb-2">
                Colour
              </label>
              <select
                id="filter-color"
                value={filters.color}
                onChange={(e) => setFilters((f) => ({ ...f, color: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F6F4EF] border border-[#242421]/15 text-xs text-[#242421]"
              >
                <option value="All">All Colours</option>
                {FABRIC_COLORS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-availability" className="block text-[11px] uppercase tracking-[0.1em] text-[#737767] mb-2">
                Availability
              </label>
              <select
                id="filter-availability"
                value={filters.availability}
                onChange={(e) => setFilters((f) => ({ ...f, availability: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F6F4EF] border border-[#242421]/15 text-xs text-[#242421]"
              >
                <option value="All">All Availability</option>
                <option value="In Stock">In Stock</option>
                <option value="Made to Order">Made to Order</option>
                <option value="Limited Atelier Run">Limited Atelier Run</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-style" className="block text-[11px] uppercase tracking-[0.1em] text-[#737767] mb-2">
                Style
              </label>
              <select
                id="filter-style"
                value={filters.style}
                onChange={(e) => setFilters((f) => ({ ...f, style: e.target.value }))}
                className="w-full px-3 py-2 bg-[#F6F4EF] border border-[#242421]/15 text-xs text-[#242421]"
              >
                <option value="All">All Styles</option>
                <option value="Sculptural">Sculptural</option>
                <option value="Architectural">Architectural</option>
                <option value="Minimalist">Minimalist</option>
                <option value="Organic">Organic</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-price" className="block text-[11px] uppercase tracking-[0.1em] text-[#737767] mb-2">
                Max Price: <span className="tabular-nums text-[#242421]">{formatCurrency(filters.maxPrice)}</span>
              </label>
              <input
                id="filter-price"
                type="range"
                min={800}
                max={6000}
                step={100}
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))
                }
                className="w-full accent-[#242421] mt-2"
              />
              <button
                type="button"
                onClick={resetFilters}
                className="mt-2 text-[11px] underline text-[#737767] hover:text-[#242421] cursor-pointer"
              >
                Reset all filters
              </button>
            </div>
          </div>
        )}

        {/* Product Grid or Empty State */}
        {visibleProducts.length === 0 ? (
          <div className="py-20 text-center border border-[#242421]/10 bg-[#EAE6DE]/40">
            <h2 className="font-editorial text-3xl text-[#242421]">
              No pieces match your current selection.
            </h2>
            <p className="text-sm text-[#737767] mt-2">
              Adjust your material, colour, or price threshold to view more of the collection.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 px-6 py-2.5 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.1em] uppercase cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {visibleProducts.map((product) => {
              const isSaved = wishlistIds.includes(product.id);
              const colorDots = FABRIC_COLORS.filter((c) =>
                product.supportedColors.includes(c.id)
              );

              return (
                <article key={product.id} className="group flex flex-col">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#EAE6DE]">
                    <button
                      type="button"
                      onClick={() => onOpenProduct(product.id)}
                      className="w-full h-full block cursor-pointer"
                      aria-label={`View ${product.name}`}
                    >
                      <SmartImage
                        src={product.primaryImage}
                        alt={product.name}
                        fallbackTitle={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      />
                      <SmartImage
                        src={product.secondaryImage}
                        alt={`${product.name} interior view`}
                        fallbackTitle={product.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    </button>

                    {/* Top-right wishlist & quick view affordances */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setQuickViewProduct(product)}
                        aria-label={`Quick view ${product.name}`}
                        className="p-2 bg-[#F6F4EF]/92 text-[#242421] hover:bg-[#242421] hover:text-[#F6F4EF] transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleWishlist(product.id)}
                        aria-label={
                          isSaved
                            ? `Remove ${product.name} from wishlist`
                            : `Save ${product.name} to wishlist`
                        }
                        aria-pressed={isSaved}
                        className={`p-2 transition-colors cursor-pointer ${
                          isSaved
                            ? 'bg-[#242421] text-[#F6F4EF]'
                            : 'bg-[#F6F4EF]/92 text-[#242421] hover:bg-[#242421] hover:text-[#F6F4EF]'
                        }`}
                      >
                        <Heart
                          className="w-4 h-4"
                          strokeWidth={1.5}
                          fill={isSaved ? 'currentColor' : 'none'}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Minimal Product Info */}
                  <div className="mt-4 flex items-start justify-between gap-4">
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.08em] text-[#737767]">
                        {product.category} · {product.availability}
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenProduct(product.id)}
                        className="text-left font-editorial text-2xl text-[#242421] mt-0.5 hover:opacity-75 cursor-pointer"
                      >
                        {product.name}
                      </button>
                    </div>
                    <span className="text-sm font-medium tabular-nums text-[#242421] mt-1 shrink-0">
                      {formatCurrency(product.basePrice)}
                    </span>
                  </div>

                  {colorDots.length > 0 && (
                    <div className="mt-2.5 flex items-center gap-1.5" aria-label="Available colours">
                      {colorDots.map((c) => (
                        <span
                          key={c.id}
                          title={c.label}
                          className="w-3 h-3 rounded-full border border-[#242421]/20"
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Quick view ${quickViewProduct.name}`}
          className="fixed inset-0 z-50 bg-[#242421]/55 flex items-center justify-center p-4"
        >
          <div className="bg-[#F6F4EF] max-w-3xl w-full grid grid-cols-1 md:grid-cols-2 border border-[#242421]/15 overflow-hidden">
            <div className="aspect-[4/3] md:aspect-auto bg-[#EAE6DE]">
              <SmartImage
                src={quickViewProduct.primaryImage}
                alt={quickViewProduct.name}
                fallbackTitle={quickViewProduct.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-7 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-[0.1em] text-[#737767]">
                    {quickViewProduct.category}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuickViewProduct(null)}
                    aria-label="Close quick view"
                    className="p-1 text-[#242421] hover:opacity-65 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h2 className="font-editorial text-3xl text-[#242421] mt-1">
                  {quickViewProduct.name}
                </h2>
                <div className="text-base font-medium tabular-nums text-[#242421] mt-2">
                  {formatCurrency(quickViewProduct.basePrice)}
                </div>
                <p className="text-xs text-[#242421]/80 mt-3 leading-relaxed">
                  {quickViewProduct.description}
                </p>
                <p className="text-xs text-[#737767] mt-3 tabular-nums">
                  {quickViewProduct.dimensions}
                </p>
              </div>
              <div className="mt-6 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onAddToBag(quickViewProduct, quickViewProduct.defaultConfig, 1);
                    setQuickViewProduct(null);
                  }}
                  className="w-full py-3 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.1em] uppercase hover:bg-[#3A3A35] cursor-pointer"
                >
                  Add to Bag
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = quickViewProduct.id;
                    setQuickViewProduct(null);
                    onOpenProduct(id);
                  }}
                  className="w-full py-3 border border-[#242421]/30 text-[#242421] text-xs tracking-[0.1em] uppercase hover:border-[#242421] cursor-pointer"
                >
                  Open 3D Configurator &amp; Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
