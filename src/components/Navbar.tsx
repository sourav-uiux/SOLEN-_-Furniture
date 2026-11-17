import React, { useState } from 'react';
import { Heart, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { PageView } from '../types/furniture';

interface NavbarProps {
  currentView: PageView;
  onNavigate: (view: PageView) => void;
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  onOpenWishlist: () => void;
  onOpenBag: () => void;
  bagCount: number;
  wishlistCount: number;
  isOverShowroom: boolean;
}

const NAV_LINKS: Array<{ label: string; view: PageView }> = [
  { label: 'Shop', view: 'collections' },
  { label: 'Spaces', view: 'spaces' },
  { label: 'Studio', view: 'studio' },
  { label: 'Our Story', view: 'story' },
  { label: 'Journal', view: 'journal' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  onOpenSearch,
  onOpenAccount,
  onOpenWishlist,
  onOpenBag,
  bagCount,
  wishlistCount,
  isOverShowroom,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 border-b ${
        isOverShowroom
          ? 'bg-[#F6F4EF]/90 border-[#242421]/10 text-[#242421]'
          : 'bg-[#F6F4EF] border-[#242421]/12 text-[#242421]'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-5 md:px-10 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Minimal Brand Wordmark */}
        <button
          type="button"
          onClick={() => {
            onNavigate('showroom');
            setMobileOpen(false);
          }}
          className="font-editorial text-2xl tracking-[0.18em] uppercase font-medium text-[#242421] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#242421]"
        >
          SOLEN
        </button>

        {/* Zone 2: Center Navigation Links */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((item) => {
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => onNavigate(item.view)}
                className={`group relative py-1 text-[13px] tracking-[0.06em] whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                  active ? 'text-[#242421] font-medium' : 'text-[#242421]/75 hover:text-[#242421]'
                }`}
              >
                <span>{item.label}</span>
                <span
                  aria-hidden="true"
                  className={`absolute left-0 bottom-0 h-[1px] bg-[#242421] transition-transform duration-300 origin-left w-full ${
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Right Utility Actions */}
        <div className="flex items-center gap-2 md:gap-4 shrink-0">
          <button
            type="button"
            onClick={onOpenSearch}
            aria-label="Search catalog and collections"
            className="p-2 text-[#242421]/80 hover:text-[#242421] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={onOpenAccount}
            aria-label="Account and orders"
            className="hidden sm:flex p-2 text-[#242421]/80 hover:text-[#242421] transition-colors cursor-pointer min-w-[40px] min-h-[40px] items-center justify-center"
          >
            <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
          </button>

          <button
            type="button"
            onClick={onOpenWishlist}
            aria-label={`Wishlist (${wishlistCount} saved)`}
            className="relative p-2 text-[#242421]/80 hover:text-[#242421] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center gap-1"
          >
            <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="text-[11px] tabular-nums font-medium">{wishlistCount}</span>
            )}
          </button>

          <button
            type="button"
            onClick={onOpenBag}
            aria-label={`Shopping bag (${bagCount} items)`}
            data-testid="nav-bag-button"
            className="flex items-center gap-2 pl-2 pr-3 py-2 text-[13px] tracking-[0.04em] text-[#242421] hover:bg-[#EAE6DE] transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[40px]"
          >
            <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
            <span className="tabular-nums font-medium">Bag ({bagCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((prev) => !prev)}
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            className="lg:hidden p-2 text-[#242421] min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden bg-[#F6F4EF] border-t border-[#242421]/10 px-6 py-6 space-y-4">
          <div className="flex flex-col space-y-3">
            <button
              type="button"
              onClick={() => {
                onNavigate('showroom');
                setMobileOpen(false);
              }}
              className="text-left font-editorial text-2xl text-[#242421] py-1 cursor-pointer"
            >
              3D Showroom
            </button>
            {NAV_LINKS.map((item) => (
              <button
                key={item.view}
                type="button"
                onClick={() => {
                  onNavigate(item.view);
                  setMobileOpen(false);
                }}
                className="text-left font-editorial text-2xl text-[#242421] py-1 cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="pt-4 border-t border-[#242421]/10 flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenAccount();
              }}
              className="text-sm text-[#242421] py-2 cursor-pointer"
            >
              Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onOpenSearch();
              }}
              className="text-sm text-[#242421] py-2 cursor-pointer"
            >
              Search
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
