import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import {
  FABRIC_COLORS,
  getProductById,
  PRODUCTS,
  UPHOLSTERY_MATERIALS,
  WOOD_FINISHES,
} from '../data/catalog';
import { ShowroomCanvas } from '../three/ShowroomCanvas';
import {
  PageView,
  Product,
  ProductConfiguration,
  RoomArrangement,
  RoomPreset,
} from '../types/furniture';
import { calculateConfiguredPrice, formatCurrency } from '../utils/commerce';

gsap.registerPlugin(ScrollTrigger);

interface ShowroomExperienceProps {
  sofaConfig: ProductConfiguration;
  onUpdateSofaConfig: (next: ProductConfiguration) => void;
  onAddToBag: (product: Product, config: ProductConfiguration, qty?: number) => void;
  onOpenProduct: (productId: string, initialConfig?: ProductConfiguration) => void;
  onNavigate: (view: PageView) => void;
}

const CHAPTER_LABELS = [
  { id: 'hero', range: [0, 0.18], index: '01', title: 'The Entrance' },
  { id: 'sofa', range: [0.18, 0.44], index: '02', title: 'AUREL Lounge Sofa' },
  { id: 'living', range: [0.44, 0.65], index: '03', title: 'Living Room' },
  { id: 'dining', range: [0.65, 0.84], index: '04', title: 'Dining Pavilion' },
  { id: 'bedroom', range: [0.84, 1.01], index: '05', title: 'Bedroom Sanctuary' },
] as const;

export const ShowroomExperience: React.FC<ShowroomExperienceProps> = ({
  sofaConfig,
  onUpdateSofaConfig,
  onAddToBag,
  onOpenProduct,
  onNavigate,
}) => {
  const scrollSectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [inspectMode, setInspectMode] = useState(false);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [dockTab, setDockTab] = useState<'material' | 'color' | 'craft'>('material');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [activePreset, setActivePreset] = useState<RoomPreset | null>(null);
  const [arrangement, setArrangement] = useState<RoomArrangement>('salon');
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomSignal, setZoomSignal] = useState({ seq: 0, dir: 1 });

  const aurelProduct = getProductById('aurel-lounge-sofa') ?? PRODUCTS[0];
  const sofaPrice = calculateConfiguredPrice(aurelProduct, sofaConfig);

  useEffect(() => {
    const el = scrollSectionRef.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      trigger.kill();
    };
  }, []);

  const currentChapter =
    CHAPTER_LABELS.find(
      (c) => scrollProgress >= c.range[0] && scrollProgress < c.range[1]
    ) ?? CHAPTER_LABELS[0];

  const selectedRoomProduct = selectedProductId ? getProductById(selectedProductId) : null;

  const jumpToChapterScroll = (targetProgress: number) => {
    const el = scrollSectionRef.current;
    if (!el) return;
    setInspectMode(false);
    setActivePreset(null);
    const top = el.offsetTop + (el.offsetHeight - window.innerHeight) * targetProgress;
    window.scrollTo({ top, behavior: 'smooth' });
  };

  return (
    <section
      ref={scrollSectionRef}
      aria-label="Interactive 3D Architectural Showroom"
      className="relative w-full h-[380vh]"
    >
      {/* Sticky Full-Bleed 3D Showroom Viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#EFECE5]">
        <ShowroomCanvas
          scrollProgress={scrollProgress}
          interactiveOrbit={inspectMode}
          activePreset={activePreset}
          arrangement={arrangement}
          sofaConfig={sofaConfig}
          selectedProductId={selectedProductId}
          onSelectProduct={(pid) => {
            setSelectedProductId(pid);
            if (pid && !inspectMode) setInspectMode(true);
          }}
          resetSignal={resetSignal}
          zoomDeltaSignal={zoomSignal}
        />

        {/* Subtle Chapter Wayfinder (Top-Right under Header, clean unboxed typography) */}
        <div className="pointer-events-none fixed top-20 right-6 md:right-10 z-20 hidden md:flex flex-col items-end gap-1.5">
          {CHAPTER_LABELS.map((chap, idx) => {
            const isActive = currentChapter.id === chap.id;
            const target = idx === 0 ? 0 : idx === 1 ? 0.24 : idx === 2 ? 0.48 : idx === 3 ? 0.74 : 0.96;
            return (
              <button
                key={chap.id}
                type="button"
                onClick={() => jumpToChapterScroll(target)}
                className={`pointer-events-auto inline-flex items-center gap-2 text-xs tracking-[0.06em] transition-colors cursor-pointer py-0.5 ${
                  isActive
                    ? 'text-[#242421] font-medium'
                    : 'text-[#242421]/45 hover:text-[#242421]/80'
                }`}
              >
                <span className="tabular-nums">{chap.index}.</span>
                <span>{chap.title}</span>
              </button>
            );
          })}
        </div>

        {/* CHAPTER 01: HERO OVERLAY */}
        {currentChapter.id === 'hero' && !inspectMode && (
          <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-end pb-10 md:pb-14 px-6 md:px-14 max-w-[1440px] mx-auto">
            <div className="pointer-events-auto max-w-lg bg-[#F6F4EF]/94 border border-[#242421]/10 p-6 md:p-8">
              <p className="text-xs tracking-[0.14em] uppercase text-[#737767] mb-3">
                Solen Architectural Showroom
              </p>
              <h1 className="font-editorial text-4xl md:text-5xl leading-[1.04] tracking-[-0.01em] text-[#242421] font-normal">
                Objects that shape the way we live.
              </h1>
              <p className="mt-4 text-sm md:text-base text-[#242421]/80 leading-relaxed max-w-md">
                Thoughtfully designed furniture. Timeless materials. Spaces that feel like home.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => onNavigate('collections')}
                  className="px-6 py-3 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.1em] uppercase hover:bg-[#3A3A35] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Explore Collection
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('story')}
                  className="px-5 py-3 border border-[#242421]/30 text-[#242421] text-xs tracking-[0.1em] uppercase hover:border-[#242421] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Discover Our Story
                </button>
              </div>
              <div className="mt-6 pt-4 border-t border-[#242421]/10 flex items-center justify-between text-xs text-[#737767]">
                <span>Scroll to move through the pavilion</span>
                <button
                  type="button"
                  onClick={() => jumpToChapterScroll(0.24)}
                  className="inline-flex items-center gap-1.5 text-[#242421] hover:opacity-70 cursor-pointer"
                >
                  <span>Enter Showroom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CHAPTER 02: SIGNATURE SOFA EDITORIAL INFO (Top-Left, never obscuring 3D center) */}
        {currentChapter.id === 'sofa' && !selectedRoomProduct && (
          <div className="pointer-events-none absolute top-24 left-6 md:left-12 z-10 max-w-sm">
            <div className="pointer-events-auto bg-[#F6F4EF]/94 border border-[#242421]/10 p-6">
              <div className="text-[11px] tracking-[0.12em] uppercase text-[#737767]">
                02 · Signature Piece
              </div>
              <h2 className="font-editorial text-3xl text-[#242421] mt-1 font-normal">
                {aurelProduct.name}
              </h2>
              <p className="text-xs text-[#242421]/75 mt-2 leading-relaxed">
                {aurelProduct.subtitle}. {aurelProduct.dimensions}.
              </p>
              <div className="mt-4 pt-3 border-t border-[#242421]/10 flex items-baseline justify-between">
                <span className="text-lg font-medium tabular-nums text-[#242421]" data-testid="showroom-sofa-price">
                  {formatCurrency(sofaPrice)}
                </span>
                <span className="text-[11px] text-[#737767]">{aurelProduct.availability}</span>
              </div>
              <div className="mt-4 flex items-center gap-2.5">
                <button
                  type="button"
                  data-testid="showroom-add-sofa"
                  onClick={() => onAddToBag(aurelProduct, sofaConfig, 1)}
                  className="flex-1 py-2.5 px-4 bg-[#242421] text-[#F6F4EF] text-[11px] tracking-[0.1em] uppercase hover:bg-[#3A3A35] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add to Bag
                </button>
                <button
                  type="button"
                  onClick={() => onOpenProduct(aurelProduct.id, sofaConfig)}
                  className="py-2.5 px-3.5 border border-[#242421]/25 text-[#242421] text-[11px] tracking-[0.08em] uppercase hover:border-[#242421] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Customize
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CHAPTERS 03 / 04 / 05 ARCHITECTURAL STORY OVERLAY */}
        {(currentChapter.id === 'living' ||
          currentChapter.id === 'dining' ||
          currentChapter.id === 'bedroom') &&
          !selectedRoomProduct && (
            <div className="pointer-events-none absolute top-24 left-6 md:left-12 z-10 max-w-sm">
              <div className="pointer-events-auto bg-[#F6F4EF]/94 border border-[#242421]/10 p-6">
                <div className="text-[11px] tracking-[0.12em] uppercase text-[#737767]">
                  {currentChapter.index} · Architectural Space
                </div>
                <h2 className="font-editorial text-3xl text-[#242421] mt-1 font-normal">
                  {currentChapter.id === 'living' && 'The Living Salon'}
                  {currentChapter.id === 'dining' && 'The Dining Pavilion'}
                  {currentChapter.id === 'bedroom' && 'The Bedroom Sanctuary'}
                </h2>
                <p className="text-xs text-[#242421]/75 mt-2 leading-relaxed">
                  {currentChapter.id === 'living' &&
                    'Low sculptural seating balanced with honed Roman travertine and brushed brass light.'}
                  {currentChapter.id === 'dining' &&
                    'Solid European oak planks and steam-bent joinery framed by quiet limewash walls.'}
                  {currentChapter.id === 'bedroom' &&
                    'Restorative linen upholstery paired with turned stone bedside tables and warm alabaster light.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setInspectMode(true);
                      setActivePreset(
                        currentChapter.id === 'living'
                          ? 'living'
                          : currentChapter.id === 'dining'
                            ? 'dining'
                            : 'bedroom'
                      );
                    }}
                    className="py-2 px-4 bg-[#242421] text-[#F6F4EF] text-[11px] tracking-[0.1em] uppercase hover:bg-[#3A3A35] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Inspect Room in 3D
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('collections')}
                    className="py-2 px-3.5 border border-[#242421]/25 text-[#242421] text-[11px] tracking-[0.08em] uppercase hover:border-[#242421] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    Shop Space
                  </button>
                </div>
              </div>
            </div>
          )}

        {/* SELECTED 3D OBJECT FLOATING CARD (RAYCAST CLICK) */}
        {selectedRoomProduct && (
          <div className="pointer-events-none absolute top-24 left-6 md:left-12 z-20 max-w-sm">
            <div className="pointer-events-auto bg-[#F6F4EF] border border-[#242421]/15 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[11px] tracking-[0.1em] uppercase text-[#737767]">
                    {selectedRoomProduct.category}
                  </span>
                  <h3 className="font-editorial text-2xl text-[#242421] mt-0.5">
                    {selectedRoomProduct.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedProductId(null)}
                  aria-label="Close selected piece"
                  className="text-xs text-[#737767] hover:text-[#242421] cursor-pointer px-2 py-1"
                >
                  Close
                </button>
              </div>
              <p className="text-xs text-[#242421]/75 mt-2">{selectedRoomProduct.subtitle}</p>
              <div className="mt-3 text-base font-medium tabular-nums text-[#242421]">
                {formatCurrency(selectedRoomProduct.basePrice)}
              </div>
              <div className="mt-4 flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenProduct(selectedRoomProduct.id)}
                  className="flex-1 py-2.5 px-4 bg-[#242421] text-[#F6F4EF] text-[11px] tracking-[0.1em] uppercase hover:bg-[#3A3A35] transition-colors cursor-pointer whitespace-nowrap"
                >
                  View Product
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onAddToBag(selectedRoomProduct, selectedRoomProduct.defaultConfig, 1)
                  }
                  className="py-2.5 px-3.5 border border-[#242421]/25 text-[#242421] text-[11px] tracking-[0.08em] uppercase hover:border-[#242421] transition-colors cursor-pointer whitespace-nowrap"
                >
                  Add to Bag
                </button>
              </div>
            </div>
          </div>
        )}

        {/* COLLAPSIBLE BOTTOM CONTROL DOCK (Only visible after scrolling past hero or in inspect mode) */}
        {(scrollProgress > 0.14 || inspectMode) && (
          <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[min(920px,94vw)] flex flex-col items-center">
            <button
              type="button"
              onClick={() => setDockCollapsed((v) => !v)}
              className="mb-1.5 px-3.5 py-1 bg-[#F6F4EF] border border-[#242421]/15 text-[11px] tracking-[0.08em] uppercase text-[#242421] inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#EAE6DE] transition-colors"
            >
              {dockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Show Showroom Controls</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Hide Controls</span>
                </>
              )}
            </button>

            {!dockCollapsed && (
              <div className="w-full bg-[#F6F4EF]/96 border border-[#242421]/15 px-4 py-3 flex flex-col gap-2.5">
                {/* Top row: Dock Tabs + 3D Camera Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242421]/10 pb-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setDockTab('material')}
                      className={`px-3 py-1 text-[11px] tracking-[0.06em] uppercase cursor-pointer transition-colors whitespace-nowrap ${
                        dockTab === 'material'
                          ? 'bg-[#242421] text-[#F6F4EF]'
                          : 'text-[#242421]/70 hover:text-[#242421]'
                      }`}
                    >
                      Upholstery
                    </button>
                    <button
                      type="button"
                      onClick={() => setDockTab('color')}
                      className={`px-3 py-1 text-[11px] tracking-[0.06em] uppercase cursor-pointer transition-colors whitespace-nowrap ${
                        dockTab === 'color'
                          ? 'bg-[#242421] text-[#F6F4EF]'
                          : 'text-[#242421]/70 hover:text-[#242421]'
                      }`}
                    >
                      Colour
                    </button>
                    <button
                      type="button"
                      onClick={() => setDockTab('craft')}
                      className={`px-3 py-1 text-[11px] tracking-[0.06em] uppercase cursor-pointer transition-colors whitespace-nowrap ${
                        dockTab === 'craft'
                          ? 'bg-[#242421] text-[#F6F4EF]'
                          : 'text-[#242421]/70 hover:text-[#242421]'
                      }`}
                    >
                      Base &amp; Size
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setInspectMode((v) => !v)}
                      className={`px-2.5 py-1 text-[11px] tracking-[0.05em] uppercase border cursor-pointer inline-flex items-center gap-1 whitespace-nowrap ${
                        inspectMode
                          ? 'bg-[#737767] text-[#F6F4EF] border-[#737767]'
                          : 'border-[#242421]/20 text-[#242421] hover:border-[#242421]'
                      }`}
                    >
                      <RotateCw className="w-3 h-3" />
                      <span>{inspectMode ? '360° Active' : '360° Orbit'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomSignal((s) => ({ seq: s.seq + 1, dir: 1 }))}
                      aria-label="Zoom in 3D showroom"
                      className="p-1.5 border border-[#242421]/20 text-[#242421] hover:border-[#242421] cursor-pointer"
                    >
                      <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setZoomSignal((s) => ({ seq: s.seq + 1, dir: -1 }))}
                      aria-label="Zoom out 3D showroom"
                      className="p-1.5 border border-[#242421]/20 text-[#242421] hover:border-[#242421] cursor-pointer"
                    >
                      <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setInspectMode(false);
                        setActivePreset(null);
                        setSelectedProductId(null);
                        setResetSignal((n) => n + 1);
                      }}
                      aria-label="Reset camera view"
                      className="p-1.5 border border-[#242421]/20 text-[#242421] hover:border-[#242421] cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setArrangement((a) => (a === 'salon' ? 'atelier' : 'salon'))
                      }
                      aria-label="Toggle room furniture arrangement"
                      className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 border border-[#242421]/20 text-[11px] text-[#242421] hover:border-[#242421] cursor-pointer whitespace-nowrap"
                    >
                      <SlidersHorizontal className="w-3 h-3" />
                      <span>{arrangement === 'salon' ? 'Salon Layout' : 'Atelier Layout'}</span>
                    </button>
                  </div>
                </div>

                {/* Bottom row: Active Customizer Options */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {dockTab === 'material' && (
                    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Sofa upholstery material">
                      {UPHOLSTERY_MATERIALS.map((mat) => {
                        const selected = sofaConfig.upholstery === mat.id;
                        return (
                          <button
                            key={mat.id}
                            type="button"
                            onClick={() =>
                              onUpdateSofaConfig({ ...sofaConfig, upholstery: mat.id })
                            }
                            className={`px-3 py-1.5 text-xs border transition-colors cursor-pointer whitespace-nowrap ${
                              selected
                                ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                                : 'bg-[#FFFFFF] text-[#242421] border-[#242421]/15 hover:border-[#242421]/50'
                            }`}
                          >
                            {mat.label}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {dockTab === 'color' && (
                    <div className="flex flex-wrap items-center gap-2.5" role="group" aria-label="Sofa fabric colour">
                      {FABRIC_COLORS.map((col) => {
                        const selected = sofaConfig.color === col.id;
                        return (
                          <button
                            key={col.id}
                            type="button"
                            onClick={() => onUpdateSofaConfig({ ...sofaConfig, color: col.id })}
                            aria-label={`Select colour ${col.label}`}
                            aria-pressed={selected}
                            className={`inline-flex items-center gap-2 px-2.5 py-1 border text-xs cursor-pointer transition-colors whitespace-nowrap ${
                              selected
                                ? 'border-[#242421] bg-[#FFFFFF] font-medium'
                                : 'border-[#242421]/15 bg-[#FFFFFF]/70 hover:border-[#242421]/40'
                            }`}
                          >
                            <span
                              className="w-3.5 h-3.5 rounded-full border border-[#242421]/20 shrink-0"
                              style={{ backgroundColor: col.hex }}
                            />
                            <span>{col.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {dockTab === 'craft' && (
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] uppercase tracking-[0.06em] text-[#737767] mr-1">
                          Plinth:
                        </span>
                        {WOOD_FINISHES.map((wood) => (
                          <button
                            key={wood.id}
                            type="button"
                            onClick={() =>
                              onUpdateSofaConfig({ ...sofaConfig, woodFinish: wood.id })
                            }
                            className={`px-2.5 py-1 text-xs border cursor-pointer whitespace-nowrap ${
                              sofaConfig.woodFinish === wood.id
                                ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                                : 'bg-[#FFFFFF] text-[#242421] border-[#242421]/15'
                            }`}
                          >
                            {wood.label}
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] uppercase tracking-[0.06em] text-[#737767] mr-1">
                          Module:
                        </span>
                        {aurelProduct.sizeOptions.map((sz) => (
                          <button
                            key={sz.id}
                            type="button"
                            onClick={() =>
                              onUpdateSofaConfig({ ...sofaConfig, sizeOption: sz.id })
                            }
                            className={`px-2.5 py-1 text-xs border cursor-pointer whitespace-nowrap ${
                              sofaConfig.sizeOption === sz.id
                                ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                                : 'bg-[#FFFFFF] text-[#242421] border-[#242421]/15'
                            }`}
                          >
                            {sz.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="ml-auto flex items-center gap-3">
                    <span className="text-xs tabular-nums text-[#242421]/80 hidden sm:inline">
                      AUREL · {formatCurrency(sofaPrice)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onAddToBag(aurelProduct, sofaConfig, 1)}
                      className="px-4 py-1.5 bg-[#242421] text-[#F6F4EF] text-[11px] tracking-[0.08em] uppercase hover:bg-[#3A3A35] cursor-pointer whitespace-nowrap"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};
