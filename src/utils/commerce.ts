import {
  FABRIC_COLORS,
  METAL_FINISHES,
  PRODUCTS,
  UPHOLSTERY_MATERIALS,
  WOOD_FINISHES,
} from '../data/catalog';
import {
  CartItem,
  CheckoutFormState,
  Product,
  ProductConfiguration,
  SpaceCategory,
} from '../types/furniture';

export interface CatalogFilterState {
  category: SpaceCategory | 'All';
  material: string;
  color: string;
  availability: string;
  style: string;
  maxPrice: number;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'name';
}

export function calculateConfiguredPrice(
  product: Product,
  config: ProductConfiguration
): number {
  let price = product.basePrice;

  if (product.supportsUpholstery && config.upholstery) {
    const mat = UPHOLSTERY_MATERIALS.find((m) => m.id === config.upholstery);
    if (mat) price += mat.priceDelta;
  }

  if (product.supportsWoodFinish && config.woodFinish) {
    const wood = WOOD_FINISHES.find((w) => w.id === config.woodFinish);
    if (wood) price += wood.priceDelta;
  }

  if (product.supportsMetalFinish && config.metalFinish) {
    const metal = METAL_FINISHES.find((m) => m.id === config.metalFinish);
    if (metal) price += metal.priceDelta;
  }

  if (config.sizeOption) {
    const size = product.sizeOptions.find((s) => s.id === config.sizeOption);
    if (size) price += size.priceDelta;
  }

  return Math.max(0, price);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function summarizeConfiguration(
  product: Product,
  config: ProductConfiguration
): string {
  const parts: string[] = [];
  if (product.supportsUpholstery && config.upholstery) {
    const mat = UPHOLSTERY_MATERIALS.find((m) => m.id === config.upholstery);
    if (mat) parts.push(mat.label);
  }
  if (config.color && product.supportedColors.includes(config.color)) {
    const col = FABRIC_COLORS.find((c) => c.id === config.color);
    if (col) parts.push(col.label);
  }
  if (product.supportsWoodFinish && config.woodFinish) {
    const wood = WOOD_FINISHES.find((w) => w.id === config.woodFinish);
    if (wood) parts.push(wood.label);
  }
  if (product.supportsMetalFinish && config.metalFinish) {
    const metal = METAL_FINISHES.find((m) => m.id === config.metalFinish);
    if (metal) parts.push(metal.label);
  }
  if (config.sizeOption) {
    const size = product.sizeOptions.find((s) => s.id === config.sizeOption);
    if (size) parts.push(size.label);
  }
  return parts.join(' · ') || product.dimensions;
}

export function createCartItemKey(
  productId: string,
  config: ProductConfiguration
): string {
  return [
    productId,
    config.upholstery ?? '-',
    config.color ?? '-',
    config.woodFinish ?? '-',
    config.metalFinish ?? '-',
    config.sizeOption ?? '-',
  ].join('|');
}

export function calculateCartTotals(
  items: CartItem[],
  deliveryMethod: 'white-glove' | 'standard-freight' = 'white-glove'
): { subtotal: number; deliveryFee: number; total: number; itemCount: number } {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  if (items.length === 0) {
    return { subtotal: 0, deliveryFee: 0, total: 0, itemCount: 0 };
  }
  const deliveryFee =
    deliveryMethod === 'white-glove'
      ? subtotal >= 5000
        ? 0
        : 240
      : 0;
  return {
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    itemCount,
  };
}

export function filterAndSortProducts(
  products: Product[],
  filters: CatalogFilterState
): Product[] {
  const filtered = products.filter((p) => {
    if (filters.category !== 'All') {
      if (filters.category === 'Outdoor') {
        // Outdoor features stone & architectural pieces suited for covered courtyards
        if (p.category !== 'Outdoor' && p.id !== 'mono-coffee-table' && p.id !== 'stone-side-table') {
          return false;
        }
      } else if (p.category !== filters.category) {
        return false;
      }
    }
    if (filters.material !== 'All') {
      if (
        !p.supportedMaterials.includes(filters.material as never) &&
        !p.supportedWoods.includes(filters.material as never)
      ) {
        return false;
      }
    }
    if (filters.color !== 'All') {
      if (!p.supportedColors.includes(filters.color as never)) {
        return false;
      }
    }
    if (filters.availability !== 'All' && p.availability !== filters.availability) {
      return false;
    }
    if (filters.style !== 'All' && p.style !== filters.style) {
      return false;
    }
    if (p.basePrice > filters.maxPrice) {
      return false;
    }
    return true;
  });

  const sorted = [...filtered];
  if (filters.sortBy === 'price-asc') {
    sorted.sort((a, b) => a.basePrice - b.basePrice);
  } else if (filters.sortBy === 'price-desc') {
    sorted.sort((a, b) => b.basePrice - a.basePrice);
  } else if (filters.sortBy === 'name') {
    sorted.sort((a, b) => a.name.localeCompare(b.name));
  }
  return sorted;
}

export function searchCatalog(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.style.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
  );
}

export function validateCheckoutStep(
  step: number,
  form: CheckoutFormState
): Record<string, string> {
  const errors: Record<string, string> = {};

  if (step === 1) {
    if (!form.fullName.trim()) {
      errors.fullName = 'Full name is required.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Please enter a valid email address.';
    }
    if (form.phone.replace(/\D/g, '').length < 7) {
      errors.phone = 'Please enter a valid contact phone number.';
    }
  }

  if (step === 2) {
    if (!form.addressLine1.trim()) {
      errors.addressLine1 = 'Street address is required.';
    }
    if (!form.city.trim()) {
      errors.city = 'City is required.';
    }
    if (form.postalCode.trim().length < 3) {
      errors.postalCode = 'Valid postal code is required.';
    }
    if (!form.country.trim()) {
      errors.country = 'Country is required.';
    }
  }

  if (step === 4 && form.paymentMode === 'demo-card') {
    if (!form.cardHolder.trim()) {
      errors.cardHolder = 'Cardholder name is required.';
    }
    if (!/^\d{4}$/.test(form.cardLast4.trim())) {
      errors.cardLast4 = 'Enter 4 test digits (e.g., 4242) for demo checkout.';
    }
  }

  return errors;
}
