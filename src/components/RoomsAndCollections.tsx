import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { COLLECTIONS } from '../data/catalog';
import { SpaceCategory } from '../types/furniture';
import { SmartImage } from './SmartImage';

interface RoomsAndCollectionsProps {
  onSelectCollection: (category: SpaceCategory) => void;
  onOpenSpacesExplorer: () => void;
}

export const RoomsAndCollections: React.FC<RoomsAndCollectionsProps> = ({
  onSelectCollection,
  onOpenSpacesExplorer,
}) => {
  return (
    <section
      aria-labelledby="collections-heading"
      className="bg-[#F6F4EF] py-24 md:py-32 px-6 md:px-12 border-t border-[#242421]/10"
    >
      <div className="max-w-[1440px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14 md:mb-20">
          <div className="max-w-xl">
            <p className="text-xs tracking-[0.14em] uppercase text-[#737767] mb-3">
              06 · Explore By Space
            </p>
            <h2
              id="collections-heading"
              className="font-editorial text-4xl md:text-5xl text-[#242421] font-normal leading-[1.08]"
            >
              Curated rooms composed for quiet living.
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenSpacesExplorer}
              className="px-6 py-3 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.1em] uppercase hover:bg-[#3A3A35] transition-colors cursor-pointer whitespace-nowrap"
            >
              Launch 3D Room Explorer
            </button>
          </div>
        </div>

        {/* Asymmetrical Editorial Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
          {COLLECTIONS.map((col, idx) => {
            // Asymmetrical architectural spans
            const spanClass =
              idx === 0
                ? 'md:col-span-7'
                : idx === 1
                  ? 'md:col-span-5'
                  : idx === 2
                    ? 'md:col-span-5'
                    : idx === 3
                      ? 'md:col-span-7'
                      : idx === 4
                        ? 'md:col-span-6'
                        : 'md:col-span-6';
            const aspectClass =
              idx === 0 || idx === 3 ? 'aspect-[16/10]' : 'aspect-[4/3]';

            return (
              <article key={col.id} className={`${spanClass} group`}>
                <button
                  type="button"
                  onClick={() => onSelectCollection(col.id)}
                  className="w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#242421]"
                >
                  <div className={`w-full overflow-hidden bg-[#EAE6DE] ${aspectClass}`}>
                    <SmartImage
                      src={col.image}
                      alt={`${col.title} collection interior`}
                      fallbackTitle={col.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4 flex items-start justify-between gap-4 border-b border-[#242421]/10 pb-5">
                    <div>
                      <div className="text-xs text-[#737767] flex items-center gap-2">
                        <span>{col.accentNote}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums">{col.productCount} Pieces</span>
                      </div>
                      <h3 className="font-editorial text-2xl md:text-3xl text-[#242421] mt-1 group-hover:translate-x-1 transition-transform duration-300">
                        {col.title}
                      </h3>
                      <p className="text-sm text-[#242421]/75 mt-1.5 max-w-md">
                        {col.description}
                      </p>
                    </div>
                    <span
                      aria-hidden="true"
                      className="mt-2 p-2 border border-[#242421]/20 text-[#242421] group-hover:bg-[#242421] group-hover:text-[#F6F4EF] transition-colors shrink-0"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
