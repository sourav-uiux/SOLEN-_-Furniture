import React, { useState } from 'react';
import { X } from 'lucide-react';
import { IMAGES, JOURNAL_ARTICLES, MATERIAL_STORIES } from '../data/catalog';
import { JournalArticle, PageView } from '../types/furniture';
import { SmartImage } from './SmartImage';

export const StoryView: React.FC<{ onNavigate: (view: PageView) => void }> = ({
  onNavigate,
}) => {
  return (
    <main className="min-h-screen bg-[#F6F4EF] pt-28 pb-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto space-y-24">
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end border-b border-[#242421]/12 pb-14">
          <div className="lg:col-span-7">
            <p className="text-xs tracking-[0.14em] uppercase text-[#737767] mb-3">
              Our Story &amp; Ethos
            </p>
            <h1 className="font-editorial text-5xl md:text-7xl text-[#242421] font-normal leading-[1.02]">
              Designed to belong. Made to last.
            </h1>
          </div>
          <div className="lg:col-span-5">
            <p className="text-base text-[#242421]/80 leading-relaxed">
              Founded between Copenhagen and Milan, Solen builds quiet architectural furniture from European hardwood, Roman limestone, and unbleached natural textiles.
            </p>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 aspect-[16/10] bg-[#EAE6DE] overflow-hidden">
            <SmartImage
              src={IMAGES.heroLiving}
              alt="Solen flagship architectural pavilion"
              fallbackTitle="Solen Atelier"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="lg:col-span-5 space-y-5">
            <h2 className="font-editorial text-3xl md:text-4xl text-[#242421]">
              Architecture at human scale.
            </h2>
            <p className="text-sm text-[#242421]/80 leading-relaxed">
              We believe furniture should never compete with the serenity of a room. Each silhouette is proportioned to preserve sightlines, anchor conversation, and respond gracefully to shifting daylight.
            </p>
            <p className="text-sm text-[#242421]/80 leading-relaxed">
              Every structural joint is engineered for longevity—solid timber mortises, removable wool covers, and hand-rubbed botanical oils that allow each piece to mature across decades.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('collections')}
              className="px-6 py-3 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.1em] uppercase hover:bg-[#3A3A35] cursor-pointer"
            >
              Browse the Collection
            </button>
          </div>
        </section>

        <section className="border-t border-[#242421]/12 pt-16">
          <h2 className="font-editorial text-3xl md:text-4xl text-[#242421] mb-10">
            Material Provenance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {MATERIAL_STORIES.map((m) => (
              <div key={m.id} className="space-y-3">
                <div className="aspect-square bg-[#EAE6DE] overflow-hidden">
                  <SmartImage
                    src={m.image}
                    alt={m.name}
                    fallbackTitle={m.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-xs text-[#737767]">{m.origin}</div>
                <h3 className="font-editorial text-2xl text-[#242421]">{m.name}</h3>
                <p className="text-xs text-[#242421]/75 leading-relaxed">{m.summary}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export const JournalView: React.FC<{
  activeArticle: JournalArticle | null;
  onSelectArticle: (article: JournalArticle | null) => void;
}> = ({ activeArticle, onSelectArticle }) => {
  const [category, setCategory] = useState<string>('All');
  const categories = ['All', ...Array.from(new Set(JOURNAL_ARTICLES.map((a) => a.category)))];
  const filtered =
    category === 'All'
      ? JOURNAL_ARTICLES
      : JOURNAL_ARTICLES.filter((a) => a.category === category);

  return (
    <main className="min-h-screen bg-[#F6F4EF] pt-28 pb-24 px-6 md:px-12">
      <div className="max-w-[1440px] mx-auto">
        <div className="border-b border-[#242421]/12 pb-10 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-xs tracking-[0.14em] uppercase text-[#737767] mb-2">
              Design Inspiration
            </p>
            <h1 className="font-editorial text-4xl md:text-6xl text-[#242421] font-normal">
              The Solen Journal
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3.5 py-1.5 text-xs uppercase tracking-[0.06em] border cursor-pointer ${
                  category === cat
                    ? 'bg-[#242421] text-[#F6F4EF] border-[#242421]'
                    : 'border-[#242421]/20 text-[#242421]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {filtered.map((article) => (
            <article key={article.id} className="group">
              <button
                type="button"
                onClick={() => onSelectArticle(article)}
                className="w-full text-left cursor-pointer"
              >
                <div className="aspect-[16/10] bg-[#EAE6DE] overflow-hidden">
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
                <h2 className="font-editorial text-3xl text-[#242421] mt-1.5">
                  {article.title}
                </h2>
                <p className="text-sm text-[#242421]/75 mt-2 leading-relaxed">
                  {article.excerpt}
                </p>
              </button>
            </article>
          ))}
        </div>
      </div>

      {/* Article Reader Modal */}
      {activeArticle && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activeArticle.title}
          className="fixed inset-0 z-50 bg-[#242421]/60 flex items-center justify-center p-4 overflow-y-auto"
        >
          <article className="bg-[#F6F4EF] max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#242421]/15 p-7 md:p-10">
            <div className="flex items-center justify-between text-xs text-[#737767] mb-4">
              <span>
                {activeArticle.category} · {activeArticle.readingTime} ·{' '}
                {activeArticle.publishedAt}
              </span>
              <button
                type="button"
                onClick={() => onSelectArticle(null)}
                aria-label="Close article"
                className="p-1.5 text-[#242421] hover:opacity-60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 className="font-editorial text-4xl text-[#242421] leading-tight">
              {activeArticle.title}
            </h2>
            <div className="aspect-[16/9] bg-[#EAE6DE] my-6 overflow-hidden">
              <SmartImage
                src={activeArticle.image}
                alt={activeArticle.title}
                fallbackTitle={activeArticle.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-4 text-sm md:text-base text-[#242421]/85 leading-relaxed">
              {activeArticle.paragraphs.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>
          </article>
        </div>
      )}
    </main>
  );
};
