import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { IMAGES, JOURNAL_ARTICLES, MATERIAL_STORIES } from '../data/catalog';
import { JournalArticle, PageView } from '../types/furniture';
import { SmartImage } from './SmartImage';

interface MaterialsAndStoryProps {
  onNavigate: (view: PageView) => void;
  onOpenArticle: (article: JournalArticle) => void;
}

export const MaterialsAndStory: React.FC<MaterialsAndStoryProps> = ({
  onNavigate,
  onOpenArticle,
}) => {
  const [activeMaterialId, setActiveMaterialId] = useState(MATERIAL_STORIES[0].id);
  const activeMaterial =
    MATERIAL_STORIES.find((m) => m.id === activeMaterialId) ?? MATERIAL_STORIES[0];

  return (
    <div className="bg-[#F6F4EF]">
      {/* MATERIALS & CRAFTSMANSHIP */}
      <section
        aria-labelledby="materials-heading"
        className="py-24 md:py-32 px-6 md:px-12 bg-[#EAE6DE] border-t border-[#242421]/10"
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <div className="aspect-square overflow-hidden bg-[#DFD8CA]">
              <SmartImage
                src={activeMaterial.image}
                alt={activeMaterial.name}
                fallbackTitle={activeMaterial.name}
                className="w-full h-full object-cover transition-transform duration-700"
              />
            </div>
          </div>

          <div className="lg:col-span-6 lg:pl-8">
            <p className="text-xs tracking-[0.14em] uppercase text-[#737767] mb-3">
              07 · Materials &amp; Craftsmanship
            </p>
            <h2
              id="materials-heading"
              className="font-editorial text-4xl md:text-5xl text-[#242421] font-normal leading-[1.08]"
            >
              Tactile surfaces selected to deepen with age.
            </h2>

            <div className="mt-8 divide-y divide-[#242421]/12 border-t border-b border-[#242421]/12">
              {MATERIAL_STORIES.map((mat) => {
                const selected = mat.id === activeMaterial.id;
                return (
                  <button
                    key={mat.id}
                    type="button"
                    onClick={() => setActiveMaterialId(mat.id)}
                    onMouseEnter={() => setActiveMaterialId(mat.id)}
                    className={`w-full py-4 text-left flex items-center justify-between gap-4 cursor-pointer transition-colors ${
                      selected ? 'text-[#242421]' : 'text-[#242421]/60 hover:text-[#242421]'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className="w-5 h-5 rounded-full border border-[#242421]/20 shrink-0"
                        style={{ backgroundColor: mat.swatchHex }}
                      />
                      <div>
                        <div className="font-editorial text-2xl">{mat.name}</div>
                        <div className="text-xs text-[#737767]">{mat.origin}</div>
                      </div>
                    </div>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        selected ? 'translate-x-0 opacity-100' : '-translate-x-2 opacity-0'
                      }`}
                    />
                  </button>
                );
              })}
            </div>

            <div className="mt-6">
              <p className="text-sm text-[#242421]/85 leading-relaxed">
                {activeMaterial.summary}
              </p>
              <p className="text-xs text-[#737767] mt-3">{activeMaterial.tactileNotes}</p>
            </div>
          </div>
        </div>
      </section>

      {/* BRAND STORY */}
      <section
        aria-labelledby="story-heading"
        className="py-24 md:py-36 px-6 md:px-12 bg-[#F6F4EF] border-t border-[#242421]/10"
      >
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5">
            <p className="text-xs tracking-[0.14em] uppercase text-[#737767] mb-3">
              08 · Philosophy
            </p>
            <h2
              id="story-heading"
              className="font-editorial text-4xl md:text-6xl text-[#242421] font-normal leading-[1.06]"
            >
              Designed to belong. Made to last.
            </h2>
            <p className="mt-6 text-base text-[#242421]/80 leading-relaxed">
              Every Solen piece begins as an architectural study in proportion, light, and daily ritual. We collaborate with independent timber workshops and family-run stone quarries to craft furniture that settles naturally into the rhythm of a home.
            </p>
            <p className="mt-4 text-sm text-[#242421]/70 leading-relaxed">
              Rather than chasing seasonal excess, we refine a focused collection of enduring forms—each engineered with repairable joinery, unbleached natural textiles, and honest mineral finishes.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('story')}
                className="px-6 py-3 border border-[#242421] text-[#242421] text-xs tracking-[0.1em] uppercase hover:bg-[#242421] hover:text-[#F6F4EF] transition-colors cursor-pointer"
              >
                Read Our Story
              </button>
              <button
                type="button"
                onClick={() => onNavigate('studio')}
                className="px-6 py-3 bg-[#737767] text-[#F6F4EF] text-xs tracking-[0.1em] uppercase hover:bg-[#5F6355] transition-colors cursor-pointer"
              >
                Open Visualization Studio
              </button>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="aspect-[16/10] overflow-hidden bg-[#EAE6DE]">
              <SmartImage
                src={IMAGES.heroLiving}
                alt="Solen architectural living room bathed in natural afternoon light"
                fallbackTitle="Solen Atelier"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* EDITORIAL JOURNAL PREVIEW */}
      <section
        aria-labelledby="journal-heading"
        className="py-24 px-6 md:px-12 bg-[#EAE6DE]/60 border-t border-[#242421]/10"
      >
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs tracking-[0.14em] uppercase text-[#737767] mb-2">
                09 · The Solen Journal
              </p>
              <h2
                id="journal-heading"
                className="font-editorial text-4xl text-[#242421] font-normal"
              >
                Essays on space and materiality.
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('journal')}
              className="text-xs tracking-[0.1em] uppercase text-[#242421] border-b border-[#242421] pb-1 hover:opacity-70 cursor-pointer self-start sm:self-auto"
            >
              View All Essays
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {JOURNAL_ARTICLES.slice(0, 3).map((article) => (
              <article key={article.id} className="group">
                <button
                  type="button"
                  onClick={() => onOpenArticle(article)}
                  className="w-full text-left cursor-pointer"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-[#EAE6DE]">
                    <SmartImage
                      src={article.image}
                      alt={article.title}
                      fallbackTitle={article.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-4 text-xs text-[#737767] flex items-center gap-2">
                    <span>{article.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.readingTime}</span>
                    <span aria-hidden="true">·</span>
                    <span>{article.publishedAt}</span>
                  </div>
                  <h3 className="font-editorial text-2xl text-[#242421] mt-1.5 group-hover:opacity-75 transition-opacity">
                    {article.title}
                  </h3>
                  <p className="text-sm text-[#242421]/75 mt-2 line-clamp-2">
                    {article.excerpt}
                  </p>
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL ARCHITECTURAL CTA */}
      <section className="py-24 md:py-32 px-6 md:px-12 bg-[#242421] text-[#F6F4EF]">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
          <div className="md:col-span-7">
            <p className="text-xs tracking-[0.14em] uppercase text-[#B8AA98] mb-3">
              Private Consultation &amp; Showroom
            </p>
            <h2 className="font-editorial text-4xl md:text-6xl font-normal leading-[1.06]">
              Compose your architectural interior.
            </h2>
            <p className="mt-4 text-sm md:text-base text-[#EAE6DE]/80 max-w-lg leading-relaxed">
              Browse the full collection, customize materials in real time in 3D, or visualize your own room with our studio suite.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                type="button"
                onClick={() => onNavigate('collections')}
                className="px-6 py-3 bg-[#F6F4EF] text-[#242421] text-xs tracking-[0.1em] uppercase hover:bg-[#EAE6DE] transition-colors cursor-pointer"
              >
                Shop All Furniture
              </button>
              <button
                type="button"
                onClick={() => onNavigate('spaces')}
                className="px-6 py-3 border border-[#F6F4EF]/35 text-[#F6F4EF] text-xs tracking-[0.1em] uppercase hover:border-[#F6F4EF] transition-colors cursor-pointer"
              >
                Explore 3D Spaces
              </button>
            </div>
          </div>
          <div className="md:col-span-5">
            <div className="aspect-[4/3] overflow-hidden bg-[#2E2E2B]">
              <SmartImage
                src={IMAGES.formDining}
                alt="Solen dining pavilion architectural composition"
                fallbackTitle="Solen Flagship"
                className="w-full h-full object-cover opacity-90"
              />
            </div>
          </div>
        </div>
      </section>

      {/* QUIET ARCHITECTURAL FOOTER */}
      <footer className="bg-[#242421] text-[#EAE6DE]/75 border-t border-[#F6F4EF]/10 py-12 px-6 md:px-12">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <span className="font-editorial text-xl tracking-[0.18em] uppercase text-[#F6F4EF]">
              SOLEN
            </span>
            <p className="text-xs text-[#B8AA98] mt-1">
              Architectural Furniture &amp; Digital Showroom · Copenhagen · Milan · New York
            </p>
          </div>
          <div className="flex flex-wrap gap-6 text-xs">
            <button type="button" onClick={() => onNavigate('collections')} className="hover:text-[#F6F4EF] cursor-pointer">
              Collections
            </button>
            <button type="button" onClick={() => onNavigate('spaces')} className="hover:text-[#F6F4EF] cursor-pointer">
              3D Spaces
            </button>
            <button type="button" onClick={() => onNavigate('studio')} className="hover:text-[#F6F4EF] cursor-pointer">
              Studio
            </button>
            <button type="button" onClick={() => onNavigate('story')} className="hover:text-[#F6F4EF] cursor-pointer">
              Our Story
            </button>
            <button type="button" onClick={() => onNavigate('journal')} className="hover:text-[#F6F4EF] cursor-pointer">
              Journal
            </button>
          </div>
          <p className="text-xs text-[#B8AA98] tabular-nums">
            © 2026 Solen Atelier. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
