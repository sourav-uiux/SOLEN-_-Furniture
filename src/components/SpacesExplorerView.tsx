import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { getProductById } from '../data/catalog';
import { ShowroomCanvas } from '../three/ShowroomCanvas';
import {
  Product,
  ProductConfiguration,
  RoomArrangement,
  RoomPreset,
} from '../types/furniture';
import { formatCurrency } from '../utils/commerce';

interface SpacesExplorerViewProps {
  sofaConfig: ProductConfiguration;
  onOpenProduct: (productId: string) => void;
  onAddToBag: (product: Product, config: ProductConfiguration, qty?: number) => void;
}

const ROOM_TABS: Array<{ id: RoomPreset; label: string }> = [
  { id: 'living', label: 'Living Room' },
  { id: 'dining', label: 'Dining Room' },
  { id: 'bedroom', label: 'Bedroom' },
  { id: 'overview', label: 'Full Pavilion' },
];

export const SpacesExplorerView: React.FC<SpacesExplorerViewProps> = ({
  sofaConfig,
  onOpenProduct,
  onAddToBag,
}) => {
  const [activeRoom, setActiveRoom] = useState<RoomPreset>('living');
  const [arrangement, setArrangement] = useState<RoomArrangement>('salon');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [zoomSignal, setZoomSignal] = useState({ seq: 0, dir: 1 });

  const selectedProduct = selectedProductId ? getProductById(selectedProductId) : null;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#EFECE5] pt-16">
      <ShowroomCanvas
        scrollProgress={activeRoom === 'dining' ? 0.74 : activeRoom === 'bedroom' ? 1 : 0.48}
        interactiveOrbit={true}
        activePreset={activeRoom}
        arrangement={arrangement}
        sofaConfig={sofaConfig}
        selectedProductId={selectedProductId}
        onSelectProduct={setSelectedProductId}
        resetSignal={resetSignal}
        zoomDeltaSignal={zoomSignal}
      />

      {/* Minimal Top-Left Context Header */}
      <div className="pointer-events-none fixed top-20 left-6 md:left-10 z-20 max-w-xs">
        <div className="pointer-events-auto bg-[#F6F4EF]/94 border border-[#242421]/12 p-5">
          <p className="text-[11px] tracking-[0.12em] uppercase text-[#737767]">
            Interactive 3D Spaces
          </p>
          <h1 className="font-editorial text-2xl md:text-3xl text-[#242421] mt-1 font-normal">
            Click any piece to inspect.
          </h1>
          <p className="text-xs text-[#242421]/70 mt-1.5">
            Drag to orbit 360°, scroll to zoom, or toggle between room layouts below.
          </p>
        </div>
      </div>

      {/* Selected Object Floating Overlay */}
      {selectedProduct && (
        <div
          data-testid="room-selected-panel"
          className="fixed top-20 right-6 md:right-10 z-20 w-[min(340px,90vw)] bg-[#F6F4EF] border border-[#242421]/15 p-6"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.1em] text-[#737767]">
                {selectedProduct.category}
              </div>
              <h2 className="font-editorial text-2xl text-[#242421] mt-0.5">
                {selectedProduct.name}
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setSelectedProductId(null)}
              className="text-xs text-[#737767] hover:text-[#242421] cursor-pointer px-2 py-1"
            >
              Close
            </button>
          </div>
          <p className="text-xs text-[#242421]/75 mt-2 leading-relaxed">
            {selectedProduct.subtitle}
          </p>
          <div className="mt-3 pt-3 border-t border-[#242421]/10 flex items-baseline justify-between">
            <span className="text-base font-medium tabular-nums text-[#242421]">
              {formatCurrency(selectedProduct.basePrice)}
            </span>
            <span className="text-[11px] text-[#737767]">{selectedProduct.availability}</span>
          </div>
          <div className="mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onOpenProduct(selectedProduct.id)}
              className="flex-1 py-2.5 px-4 bg-[#242421] text-[#F6F4EF] text-[11px] tracking-[0.1em] uppercase hover:bg-[#3A3A35] cursor-pointer whitespace-nowrap"
            >
              View Product
            </button>
            <button
              type="button"
              onClick={() =>
                onAddToBag(selectedProduct, selectedProduct.defaultConfig, 1)
              }
              className="py-2.5 px-3.5 border border-[#242421]/25 text-[#242421] text-[11px] tracking-[0.08em] uppercase hover:border-[#242421] cursor-pointer whitespace-nowrap"
            >
              Add to Bag
            </button>
          </div>
        </div>
      )}

      {/* Collapsible Bottom Control Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 w-[min(860px,94vw)] flex flex-col items-center">
        <button
          type="button"
          onClick={() => setDockCollapsed((v) => !v)}
          className="mb-1.5 px-3.5 py-1 bg-[#F6F4EF] border border-[#242421]/15 text-[11px] tracking-[0.08em] uppercase text-[#242421] inline-flex items-center gap-1.5 cursor-pointer hover:bg-[#EAE6DE]"
        >
          {dockCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5" />
              <span>Show Room Controls</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Hide Controls</span>
            </>
          )}
        </button>

        {!dockCollapsed && (
          <div className="w-full bg-[#F6F4EF]/96 border border-[#242421]/15 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Showroom rooms">
              {ROOM_TABS.map((room) => (
                <button
                  key={room.id}
                  type="button"
                  role="tab"
                  aria-selected={activeRoom === room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className={`px-3.5 py-1.5 text-xs tracking-[0.05em] uppercase cursor-pointer transition-colors whitespace-nowrap ${
                    activeRoom === room.id
                      ? 'bg-[#242421] text-[#F6F4EF]'
                      : 'bg-[#FFFFFF] text-[#242421] border border-[#242421]/15 hover:border-[#242421]/50'
                  }`}
                >
                  {room.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setArrangement((a) => (a === 'salon' ? 'atelier' : 'salon'))
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#242421]/20 bg-[#FFFFFF] text-xs text-[#242421] hover:border-[#242421] cursor-pointer whitespace-nowrap"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>{arrangement === 'salon' ? 'Arrangement: Salon' : 'Arrangement: Atelier'}</span>
              </button>
              <button
                type="button"
                onClick={() => setZoomSignal((s) => ({ seq: s.seq + 1, dir: 1 }))}
                aria-label="Zoom in room camera"
                className="p-2 border border-[#242421]/20 bg-[#FFFFFF] text-[#242421] hover:border-[#242421] cursor-pointer"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomSignal((s) => ({ seq: s.seq + 1, dir: -1 }))}
                aria-label="Zoom out room camera"
                className="p-2 border border-[#242421]/20 bg-[#FFFFFF] text-[#242421] hover:border-[#242421] cursor-pointer"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedProductId(null);
                  setResetSignal((n) => n + 1);
                }}
                aria-label="Reset room camera"
                className="p-2 border border-[#242421]/20 bg-[#FFFFFF] text-[#242421] hover:border-[#242421] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
