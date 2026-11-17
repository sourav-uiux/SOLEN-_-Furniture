import React, { useState } from 'react';
import {
  CheckCircle2,
  Minus,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { COLLECTIONS, getProductById, PRODUCTS } from '../data/catalog';
import {
  CartItem,
  CheckoutFormState,
  OrderRecord,
  SavedConfiguration,
  SpaceCategory,
  UserAccount,
} from '../types/furniture';
import {
  calculateCartTotals,
  formatCurrency,
  searchCatalog,
  summarizeConfiguration,
  validateCheckoutStep,
} from '../utils/commerce';
import { SmartImage } from './SmartImage';

/* ============================================================================
   1. SEARCH OVERLAY
============================================================================ */
interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
  recentSearches: string[];
  onRecordSearch: (term: string) => void;
  onSelectProduct: (productId: string) => void;
  onSelectCollection: (category: SpaceCategory) => void;
}

const POPULAR_SEARCHES = ['Aurel Sofa', 'Travertine', 'Dining', 'Bouclé', 'Arco Lamp'];

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  open,
  onClose,
  recentSearches,
  onRecordSearch,
  onSelectProduct,
  onSelectCollection,
}) => {
  const [query, setQuery] = useState('');
  if (!open) return null;

  const matchingProducts = searchCatalog(query);
  const matchingCollections = query.trim()
    ? COLLECTIONS.filter((c) =>
        c.title.toLowerCase().includes(query.trim().toLowerCase())
      )
    : [];

  const handleSelectProduct = (id: string) => {
    if (query.trim()) onRecordSearch(query.trim());
    onSelectProduct(id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search Solen catalog"
      className="fixed inset-0 z-50 bg-[#F6F4EF] overflow-y-auto px-6 md:px-14 py-10"
    >
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between border-b border-[#242421]/15 pb-4">
          <div className="flex items-center gap-3 flex-1">
            <Search className="w-5 h-5 text-[#737767]" strokeWidth={1.5} />
            <label htmlFor="global-search-input" className="sr-only">
              Search furniture and collections
            </label>
            <input
              id="global-search-input"
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search furniture, materials, or rooms..."
              className="w-full bg-transparent text-xl md:text-3xl font-editorial text-[#242421] placeholder:text-[#737767]/60 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="p-2 text-[#242421] hover:opacity-60 cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Empty / Initial Suggestions State */}
        {!query.trim() && (
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <h2 className="text-xs uppercase tracking-[0.1em] text-[#737767] mb-4">
                Popular Searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => setQuery(term)}
                    className="px-4 py-2 border border-[#242421]/15 bg-[#EAE6DE]/50 text-xs text-[#242421] hover:border-[#242421] cursor-pointer"
                  >
                    {term}
                  </button>
                ))}
              </div>
              {recentSearches.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-xs uppercase tracking-[0.1em] text-[#737767] mb-3">
                    Recent Searches
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term) => (
                      <button
                        key={term}
                        type="button"
                        onClick={() => setQuery(term)}
                        className="px-3 py-1.5 border border-[#242421]/12 text-xs text-[#242421]/80 hover:text-[#242421] cursor-pointer"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-xs uppercase tracking-[0.1em] text-[#737767] mb-4">
                Collections
              </h2>
              <div className="divide-y divide-[#242421]/10">
                {COLLECTIONS.map((col) => (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => {
                      onSelectCollection(col.id);
                      onClose();
                    }}
                    className="w-full py-3 text-left flex items-center justify-between text-sm text-[#242421] hover:opacity-70 cursor-pointer"
                  >
                    <span className="font-editorial text-xl">{col.title}</span>
                    <span className="text-xs text-[#737767] tabular-nums">
                      {col.productCount} pieces
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Active Search Results / No Results State */}
        {query.trim() && (
          <div className="mt-10">
            {matchingProducts.length === 0 && matchingCollections.length === 0 ? (
              <div className="py-16 text-center border border-[#242421]/10 bg-[#EAE6DE]/30">
                <p className="font-editorial text-3xl text-[#242421]">
                  No pieces found for “{query}”.
                </p>
                <p className="text-sm text-[#737767] mt-2">
                  Try searching for Aurel, Travertine, Dining, Oak, or Luma.
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {matchingCollections.length > 0 && (
                  <div>
                    <h2 className="text-xs uppercase tracking-[0.1em] text-[#737767] mb-4">
                      Matching Spaces
                    </h2>
                    <div className="flex flex-wrap gap-3">
                      {matchingCollections.map((col) => (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            onSelectCollection(col.id);
                            onClose();
                          }}
                          className="px-4 py-2 border border-[#242421]/20 bg-[#EAE6DE] text-xs text-[#242421] cursor-pointer"
                        >
                          {col.title} ({col.productCount})
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h2 className="text-xs uppercase tracking-[0.1em] text-[#737767] mb-4">
                    Products ({matchingProducts.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matchingProducts.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleSelectProduct(p.id)}
                        className="text-left group cursor-pointer"
                      >
                        <div className="aspect-[4/3] bg-[#EAE6DE] overflow-hidden">
                          <SmartImage
                            src={p.primaryImage}
                            alt={p.name}
                            fallbackTitle={p.name}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                          />
                        </div>
                        <div className="mt-3 flex items-baseline justify-between">
                          <span className="font-editorial text-2xl text-[#242421]">
                            {p.name}
                          </span>
                          <span className="text-sm tabular-nums text-[#242421]">
                            {formatCurrency(p.basePrice)}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   2. SHOPPING BAG DRAWER
============================================================================ */
interface BagDrawerProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQty: (cartItemId: string, delta: number) => void;
  onRemoveItem: (cartItemId: string) => void;
  onProceedToCheckout: () => void;
}

export const BagDrawer: React.FC<BagDrawerProps> = ({
  open,
  onClose,
  items,
  onUpdateQty,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!open) return null;
  const totals = calculateCartTotals(items, 'white-glove');

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag"
      className="fixed inset-0 z-50 bg-[#242421]/45 flex justify-end"
    >
      <div className="bg-[#F6F4EF] w-full max-w-md h-full flex flex-col border-l border-[#242421]/15">
        <div className="px-6 py-5 border-b border-[#242421]/12 flex items-center justify-between">
          <h2 className="font-editorial text-2xl text-[#242421]">
            Shopping Bag ({totals.itemCount})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close shopping bag"
            className="p-2 text-[#242421] hover:opacity-60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {items.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-editorial text-2xl text-[#242421]">
                Your bag is currently empty.
              </p>
              <p className="text-xs text-[#737767] mt-2">
                Explore the 3D showroom or catalog to add configured pieces.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-5 py-2.5 border border-[#242421] text-xs uppercase tracking-[0.08em] cursor-pointer"
              >
                Continue Exploring
              </button>
            </div>
          ) : (
            items.map((item) => {
              const product = getProductById(item.productId) ?? PRODUCTS[0];
              return (
                <div
                  key={item.cartItemId}
                  className="flex gap-4 pb-6 border-b border-[#242421]/10"
                >
                  <div className="w-24 h-20 bg-[#EAE6DE] shrink-0 overflow-hidden">
                    <SmartImage
                      src={product.primaryImage}
                      alt={product.name}
                      fallbackTitle={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-editorial text-xl text-[#242421] truncate">
                        {product.name}
                      </h3>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.cartItemId)}
                        aria-label={`Remove ${product.name}`}
                        className="text-[#737767] hover:text-[#242421] cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs text-[#737767] mt-0.5">
                      {summarizeConfiguration(product, item.config)}
                    </p>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center border border-[#242421]/20">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, -1)}
                          aria-label={`Decrease ${product.name} quantity`}
                          className="p-1.5 hover:bg-[#EAE6DE] cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-3 text-xs tabular-nums">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(item.cartItemId, 1)}
                          aria-label={`Increase ${product.name} quantity`}
                          className="p-1.5 hover:bg-[#EAE6DE] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <span className="text-sm font-medium tabular-nums text-[#242421]">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-[#242421]/12 bg-[#EAE6DE]/50 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#737767]">Subtotal</span>
              <span className="font-medium tabular-nums text-[#242421]">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-[#737767]">
              Complimentary white-glove delivery on orders over $5,000.
            </p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                data-testid="bag-proceed-checkout"
                onClick={onProceedToCheckout}
                className="w-full py-3.5 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.12em] uppercase hover:bg-[#3A3A35] cursor-pointer"
              >
                Proceed to Checkout
              </button>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs text-[#242421] underline cursor-pointer"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   3. 5-STEP VALIDATED CHECKOUT MODAL
============================================================================ */
interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderCompleted: (order: OrderRecord) => void;
}

const INITIAL_FORM: CheckoutFormState = {
  email: '',
  fullName: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: '',
  country: 'United States',
  deliveryMethod: 'white-glove',
  paymentMode: 'demo-card',
  cardLast4: '4242',
  cardHolder: '',
};

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  open,
  onClose,
  items,
  onOrderCompleted,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  if (!open) return null;

  const totals = calculateCartTotals(items, form.deliveryMethod);

  const handleNext = () => {
    const stepErrors = validateCheckoutStep(step, form);
    setErrors(stepErrors);
    if (Object.keys(stepErrors).length > 0) return;
    setStep((s) => Math.min(5, s + 1) as 1 | 2 | 3 | 4 | 5);
  };

  const handlePlaceOrder = () => {
    setSubmitting(true);
    window.setTimeout(() => {
      const order: OrderRecord = {
        orderNumber: `SLN-${Math.floor(100000 + Math.random() * 899999)}`,
        placedAt: new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        items: [...items],
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        total: totals.total,
        customerName: form.fullName,
        city: form.city,
        deliveryMethod:
          form.deliveryMethod === 'white-glove'
            ? 'White-Glove Inside Placement'
            : 'Standard Freight Threshold',
        status: 'Confirmed (Demo Order — No Real Charge)',
      };
      setConfirmedOrder(order);
      onOrderCompleted(order);
      setSubmitting(false);
    }, 350);
  };

  const handleCloseReset = () => {
    setConfirmedOrder(null);
    setStep(1);
    setErrors({});
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Checkout"
      className="fixed inset-0 z-50 bg-[#242421]/60 flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-[#F6F4EF] max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-[#242421]/15 p-6 md:p-10">
        <div className="flex items-center justify-between border-b border-[#242421]/12 pb-4 mb-6">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#737767]">
              Solen Client Checkout
            </p>
            <h2 className="font-editorial text-3xl text-[#242421]">
              {confirmedOrder ? 'Order Confirmed' : `Step 0${step} of 05`}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleCloseReset}
            aria-label="Close checkout"
            className="p-2 text-[#242421] hover:opacity-60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedOrder ? (
          <div className="py-8 space-y-6" data-testid="checkout-confirmation">
            <div className="flex items-center gap-3 text-[#737767]">
              <CheckCircle2 className="w-7 h-7" />
              <span className="text-xs uppercase tracking-[0.1em]">
                {confirmedOrder.status}
              </span>
            </div>
            <h3 className="font-editorial text-4xl text-[#242421]">
              Thank you, {confirmedOrder.customerName}.
            </h3>
            <p className="text-sm text-[#242421]/80">
              Reference <strong className="tabular-nums">{confirmedOrder.orderNumber}</strong> has been logged in your Solen account order history for {confirmedOrder.city}. (Simulated test payment—no real financial transaction occurred.)
            </p>
            <div className="border-t border-b border-[#242421]/12 py-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#737767]">Delivery Method</span>
                <span>{confirmedOrder.deliveryMethod}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span className="tabular-nums">{formatCurrency(confirmedOrder.total)}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCloseReset}
              className="px-6 py-3 bg-[#242421] text-[#F6F4EF] text-xs tracking-[0.1em] uppercase cursor-pointer"
            >
              Return to Showroom
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7 space-y-5">
              {/* Step Indicator */}
              <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.06em] pb-2">
                {[
                  { n: 1, label: '01 Contact' },
                  { n: 2, label: '02 Address' },
                  { n: 3, label: '03 Delivery' },
                  { n: 4, label: '04 Payment' },
                  { n: 5, label: '05 Review' },
                ].map((s) => (
                  <span
                    key={s.n}
                    className={`px-2 py-1 ${
                      step === s.n
                        ? 'bg-[#242421] text-[#F6F4EF]'
                        : step > s.n
                          ? 'text-[#242421]'
                          : 'text-[#737767]/60'
                    }`}
                  >
                    {s.label}
                  </span>
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="chk-name" className="block text-xs text-[#737767] mb-1">
                      Full Name *
                    </label>
                    <input
                      id="chk-name"
                      type="text"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      className="w-full p-3 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-[#A46952] mt-1">{errors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="chk-email" className="block text-xs text-[#737767] mb-1">
                      Email Address *
                    </label>
                    <input
                      id="chk-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-3 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                    />
                    {errors.email && (
                      <p className="text-xs text-[#A46952] mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="chk-phone" className="block text-xs text-[#737767] mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="chk-phone"
                      type="tel"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full p-3 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                    />
                    {errors.phone && (
                      <p className="text-xs text-[#A46952] mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="chk-addr1" className="block text-xs text-[#737767] mb-1">
                      Street Address *
                    </label>
                    <input
                      id="chk-addr1"
                      type="text"
                      value={form.addressLine1}
                      onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                      className="w-full p-3 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                    />
                    {errors.addressLine1 && (
                      <p className="text-xs text-[#A46952] mt-1">{errors.addressLine1}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="chk-city" className="block text-xs text-[#737767] mb-1">
                        City *
                      </label>
                      <input
                        id="chk-city"
                        type="text"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        className="w-full p-3 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                      />
                      {errors.city && (
                        <p className="text-xs text-[#A46952] mt-1">{errors.city}</p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="chk-zip" className="block text-xs text-[#737767] mb-1">
                        Postal Code *
                      </label>
                      <input
                        id="chk-zip"
                        type="text"
                        value={form.postalCode}
                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                        className="w-full p-3 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                      />
                      {errors.postalCode && (
                        <p className="text-xs text-[#A46952] mt-1">{errors.postalCode}</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="chk-country" className="block text-xs text-[#737767] mb-1">
                      Country *
                    </label>
                    <input
                      id="chk-country"
                      type="text"
                      value={form.country}
                      onChange={(e) => setForm({ ...form, country: e.target.value })}
                      className="w-full p-3 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border border-[#242421]/20 bg-[#FFFFFF] cursor-pointer">
                    <input
                      type="radio"
                      name="delivery"
                      checked={form.deliveryMethod === 'white-glove'}
                      onChange={() => setForm({ ...form, deliveryMethod: 'white-glove' })}
                      className="mt-1 accent-[#242421]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>White-Glove In-Room Placement</span>
                        <span className="tabular-nums">
                          {totals.subtotal >= 5000 ? 'Complimentary' : '$240'}
                        </span>
                      </div>
                      <p className="text-xs text-[#737767] mt-1">
                        Two-person architectural team carries pieces to your room, assembles, levels, and removes all crating.
                      </p>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border border-[#242421]/20 bg-[#FFFFFF] cursor-pointer">
                    <input
                      type="radio"
                      name="delivery"
                      checked={form.deliveryMethod === 'standard-freight'}
                      onChange={() =>
                        setForm({ ...form, deliveryMethod: 'standard-freight' })
                      }
                      className="mt-1 accent-[#242421]"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Scheduled Threshold Freight</span>
                        <span>Complimentary</span>
                      </div>
                      <p className="text-xs text-[#737767] mt-1">
                        Scheduled appointment delivery to your building entrance or covered threshold.
                      </p>
                    </div>
                  </label>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <div className="p-3 bg-[#EAE6DE] text-xs text-[#242421]">
                    Test / Demo Payment Mode: No real credit card is processed or charged.
                  </div>
                  <div>
                    <label htmlFor="chk-holder" className="block text-xs text-[#737767] mb-1">
                      Cardholder Name *
                    </label>
                    <input
                      id="chk-holder"
                      type="text"
                      value={form.cardHolder}
                      onChange={(e) => setForm({ ...form, cardHolder: e.target.value })}
                      className="w-full p-3 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                    />
                    {errors.cardHolder && (
                      <p className="text-xs text-[#A46952] mt-1">{errors.cardHolder}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="chk-last4" className="block text-xs text-[#737767] mb-1">
                      Test Card Last 4 Digits *
                    </label>
                    <input
                      id="chk-last4"
                      type="text"
                      maxLength={4}
                      value={form.cardLast4}
                      onChange={(e) => setForm({ ...form, cardLast4: e.target.value })}
                      className="w-full p-3 bg-[#FFFFFF] border border-[#242421]/20 text-sm tabular-nums"
                    />
                    {errors.cardLast4 && (
                      <p className="text-xs text-[#A46952] mt-1">{errors.cardLast4}</p>
                    )}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 text-sm bg-[#FFFFFF] border border-[#242421]/15 p-5">
                  <div>
                    <div className="text-xs uppercase tracking-[0.08em] text-[#737767]">
                      Recipient
                    </div>
                    <div className="mt-1">
                      {form.fullName} · {form.email} · {form.phone}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.08em] text-[#737767]">
                      Destination
                    </div>
                    <div className="mt-1">
                      {form.addressLine1}, {form.city} {form.postalCode}, {form.country}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-[0.08em] text-[#737767]">
                      Payment (Demo Mode)
                    </div>
                    <div className="mt-1 tabular-nums">
                      Test Card ending in {form.cardLast4}
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex items-center justify-between gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3 | 4 | 5)}
                    className="px-5 py-2.5 border border-[#242421]/25 text-xs uppercase tracking-[0.08em] cursor-pointer"
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}

                {step < 5 ? (
                  <button
                    type="button"
                    data-testid="checkout-next-btn"
                    onClick={handleNext}
                    className="px-6 py-3 bg-[#242421] text-[#F6F4EF] text-xs uppercase tracking-[0.1em] cursor-pointer"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    data-testid="checkout-submit-btn"
                    disabled={submitting}
                    onClick={handlePlaceOrder}
                    className="px-6 py-3 bg-[#242421] text-[#F6F4EF] text-xs uppercase tracking-[0.1em] cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? 'Confirming...' : 'Place Demo Order'}
                  </button>
                )}
              </div>
            </div>

            {/* Order Summary Column */}
            <div className="lg:col-span-5 bg-[#EAE6DE]/60 border border-[#242421]/12 p-5 h-fit space-y-4">
              <h3 className="font-editorial text-2xl text-[#242421]">Order Summary</h3>
              <div className="space-y-3 divide-y divide-[#242421]/10">
                {items.map((item) => {
                  const p = getProductById(item.productId) ?? PRODUCTS[0];
                  return (
                    <div key={item.cartItemId} className="pt-3 first:pt-0 flex justify-between gap-3 text-xs">
                      <div>
                        <div className="font-medium text-[#242421]">
                          {p.name} × {item.quantity}
                        </div>
                        <div className="text-[#737767]">
                          {summarizeConfiguration(p, item.config)}
                        </div>
                      </div>
                      <span className="tabular-nums shrink-0">
                        {formatCurrency(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-[#242421]/12 pt-3 space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#737767]">Subtotal</span>
                  <span className="tabular-nums">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737767]">Delivery</span>
                  <span className="tabular-nums">
                    {totals.deliveryFee === 0 ? 'Complimentary' : formatCurrency(totals.deliveryFee)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-medium pt-2 border-t border-[#242421]/10">
                  <span>Total</span>
                  <span className="tabular-nums">{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================
   4. WISHLIST DRAWER
============================================================================ */
interface WishlistDrawerProps {
  open: boolean;
  onClose: () => void;
  wishlistIds: string[];
  onRemoveWishlist: (productId: string) => void;
  onMoveToBag: (productId: string) => void;
  onOpenProduct: (productId: string) => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({
  open,
  onClose,
  wishlistIds,
  onRemoveWishlist,
  onMoveToBag,
  onOpenProduct,
}) => {
  if (!open) return null;
  const savedProducts = wishlistIds
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Saved Wishlist"
      className="fixed inset-0 z-50 bg-[#242421]/45 flex justify-end"
    >
      <div className="bg-[#F6F4EF] w-full max-w-md h-full flex flex-col border-l border-[#242421]/15">
        <div className="px-6 py-5 border-b border-[#242421]/12 flex items-center justify-between">
          <h2 className="font-editorial text-2xl text-[#242421]">
            Saved Wishlist ({savedProducts.length})
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close wishlist"
            className="p-2 text-[#242421] hover:opacity-60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {savedProducts.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-editorial text-2xl text-[#242421]">No saved pieces yet.</p>
              <p className="text-xs text-[#737767] mt-2">
                Save any furniture piece from the collection or product configurator.
              </p>
            </div>
          ) : (
            savedProducts.map((product) => (
              <div
                key={product.id}
                className="flex gap-4 pb-6 border-b border-[#242421]/10"
              >
                <div className="w-24 h-20 bg-[#EAE6DE] shrink-0 overflow-hidden">
                  <SmartImage
                    src={product.primaryImage}
                    alt={product.name}
                    fallbackTitle={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenProduct(product.id);
                      onClose();
                    }}
                    className="font-editorial text-xl text-[#242421] text-left hover:opacity-70 cursor-pointer"
                  >
                    {product.name}
                  </button>
                  <div className="text-xs tabular-nums text-[#737767] mt-0.5">
                    {formatCurrency(product.basePrice)}
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onMoveToBag(product.id)}
                      className="px-3 py-1.5 bg-[#242421] text-[#F6F4EF] text-[11px] uppercase tracking-[0.06em] cursor-pointer"
                    >
                      Add to Bag
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveWishlist(product.id)}
                      className="text-xs text-[#737767] hover:text-[#242421] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   5. ACCOUNT DRAWER (Sign In, Create Account, Orders, Addresses, Saved Configs)
============================================================================ */
interface AccountDrawerProps {
  open: boolean;
  onClose: () => void;
  account: UserAccount;
  onUpdateAccount: (next: UserAccount) => void;
  orders: OrderRecord[];
  savedConfigs: SavedConfiguration[];
  onLoadConfig: (saved: SavedConfiguration) => void;
}

export const AccountDrawer: React.FC<AccountDrawerProps> = ({
  open,
  onClose,
  account,
  onUpdateAccount,
  orders,
  savedConfigs,
  onLoadConfig,
}) => {
  const [authMode, setAuthMode] = useState<'signin' | 'create'>('signin');
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [newCity, setNewCity] = useState('');
  const [newStreet, setNewStreet] = useState('');

  if (!open) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.trim())) {
      setAuthError('Please enter a valid email address.');
      return;
    }
    if (passwordInput.length < 4) {
      setAuthError('Password must be at least 4 characters.');
      return;
    }
    if (authMode === 'create' && !nameInput.trim()) {
      setAuthError('Please enter your full name.');
      return;
    }
    onUpdateAccount({
      ...account,
      signedIn: true,
      name:
        authMode === 'create'
          ? nameInput.trim()
          : account.name || emailInput.split('@')[0],
      email: emailInput.trim(),
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Client Account"
      className="fixed inset-0 z-50 bg-[#242421]/45 flex justify-end"
    >
      <div className="bg-[#F6F4EF] w-full max-w-md h-full flex flex-col border-l border-[#242421]/15">
        <div className="px-6 py-5 border-b border-[#242421]/12 flex items-center justify-between">
          <h2 className="font-editorial text-2xl text-[#242421]">
            {account.signedIn ? `Client · ${account.name}` : 'Solen Client Account'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close account"
            className="p-2 text-[#242421] hover:opacity-60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
          {!account.signedIn ? (
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="flex gap-2 border-b border-[#242421]/12 pb-3">
                <button
                  type="button"
                  onClick={() => setAuthMode('signin')}
                  className={`text-xs uppercase tracking-[0.08em] px-3 py-1.5 cursor-pointer ${
                    authMode === 'signin'
                      ? 'bg-[#242421] text-[#F6F4EF]'
                      : 'text-[#737767]'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode('create')}
                  className={`text-xs uppercase tracking-[0.08em] px-3 py-1.5 cursor-pointer ${
                    authMode === 'create'
                      ? 'bg-[#242421] text-[#F6F4EF]'
                      : 'text-[#737767]'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authMode === 'create' && (
                <div>
                  <label htmlFor="acc-name" className="block text-xs text-[#737767] mb-1">
                    Full Name
                  </label>
                  <input
                    id="acc-name"
                    type="text"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full p-2.5 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                  />
                </div>
              )}
              <div>
                <label htmlFor="acc-email" className="block text-xs text-[#737767] mb-1">
                  Email
                </label>
                <input
                  id="acc-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full p-2.5 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                />
              </div>
              <div>
                <label htmlFor="acc-pass" className="block text-xs text-[#737767] mb-1">
                  Password
                </label>
                <input
                  id="acc-pass"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full p-2.5 bg-[#FFFFFF] border border-[#242421]/20 text-sm"
                />
              </div>
              {authError && <p className="text-xs text-[#A46952]">{authError}</p>}
              <button
                type="submit"
                className="w-full py-3 bg-[#242421] text-[#F6F4EF] text-xs uppercase tracking-[0.1em] cursor-pointer"
              >
                {authMode === 'signin' ? 'Sign In' : 'Create Client Account'}
              </button>
            </form>
          ) : (
            <div className="space-y-4 border-b border-[#242421]/12 pb-6">
              <div className="text-xs text-[#737767]">{account.email}</div>
              <button
                type="button"
                onClick={() => onUpdateAccount({ ...account, signedIn: false })}
                className="text-xs underline text-[#242421] cursor-pointer"
              >
                Sign out
              </button>
            </div>
          )}

          {/* Saved Configurations */}
          <section>
            <h3 className="text-xs uppercase tracking-[0.1em] text-[#737767] mb-3">
              Saved 3D Configurations ({savedConfigs.length})
            </h3>
            {savedConfigs.length === 0 ? (
              <p className="text-xs text-[#737767]">
                No custom configurations saved yet.
              </p>
            ) : (
              <div className="space-y-3">
                {savedConfigs.map((sc) => {
                  const p = getProductById(sc.productId);
                  if (!p) return null;
                  return (
                    <div
                      key={sc.id}
                      className="p-3 bg-[#EAE6DE]/60 border border-[#242421]/10 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-[#242421]">{p.name}</div>
                        <div className="text-[11px] text-[#737767]">
                          {summarizeConfiguration(p, sc.config)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadConfig(sc);
                          onClose();
                        }}
                        className="px-3 py-1.5 bg-[#242421] text-[#F6F4EF] text-[11px] uppercase cursor-pointer"
                      >
                        Load
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Order History */}
          <section>
            <h3 className="text-xs uppercase tracking-[0.1em] text-[#737767] mb-3">
              Order History ({orders.length})
            </h3>
            {orders.length === 0 ? (
              <p className="text-xs text-[#737767]">No orders placed yet.</p>
            ) : (
              <div className="space-y-3">
                {orders.map((ord) => (
                  <div
                    key={ord.orderNumber}
                    className="p-3 border border-[#242421]/12 bg-[#FFFFFF] text-xs space-y-1"
                  >
                    <div className="flex justify-between font-medium">
                      <span className="tabular-nums">{ord.orderNumber}</span>
                      <span className="tabular-nums">{formatCurrency(ord.total)}</span>
                    </div>
                    <div className="text-[#737767]">
                      {ord.placedAt} · {ord.city}
                    </div>
                    <div className="text-[#737767]">{ord.status}</div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Saved Addresses */}
          <section>
            <h3 className="text-xs uppercase tracking-[0.1em] text-[#737767] mb-3">
              Saved Delivery Addresses
            </h3>
            <div className="space-y-2 mb-3">
              {account.savedAddresses.map((addr) => (
                <div key={addr.id} className="p-3 bg-[#FFFFFF] border border-[#242421]/12 text-xs">
                  <div className="font-medium">{addr.label}</div>
                  <div className="text-[#737767]">
                    {addr.street}, {addr.city} {addr.postalCode}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Street address"
                value={newStreet}
                onChange={(e) => setNewStreet(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-[#FFFFFF] border border-[#242421]/15 text-xs"
              />
              <input
                type="text"
                placeholder="City"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                className="w-24 px-2.5 py-1.5 bg-[#FFFFFF] border border-[#242421]/15 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newStreet.trim() || !newCity.trim()) return;
                  onUpdateAccount({
                    ...account,
                    savedAddresses: [
                      ...account.savedAddresses,
                      {
                        id: String(Date.now()),
                        label: 'Residence',
                        street: newStreet.trim(),
                        city: newCity.trim(),
                        postalCode: '10013',
                        country: 'United States',
                      },
                    ],
                  });
                  setNewStreet('');
                  setNewCity('');
                }}
                className="px-3 py-1.5 bg-[#242421] text-[#F6F4EF] text-xs cursor-pointer"
              >
                Add
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
