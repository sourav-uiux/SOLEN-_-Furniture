import test from 'node:test';
import assert from 'node:assert/strict';
import { PRODUCTS } from '../data/catalog';
import {
  calculateCartTotals,
  calculateConfiguredPrice,
  filterAndSortProducts,
  searchCatalog,
  validateCheckoutStep,
} from './commerce';
import { CheckoutFormState } from '../types/furniture';

test('calculateConfiguredPrice adds material, wood, and size deltas accurately', () => {
  const sofa = PRODUCTS.find((p) => p.id === 'aurel-lounge-sofa')!;
  const base = calculateConfiguredPrice(sofa, sofa.defaultConfig);
  assert.equal(base, 4850);

  const leatherGrand = calculateConfiguredPrice(sofa, {
    upholstery: 'premium-leather',
    color: 'charcoal',
    woodFinish: 'smoked-walnut',
    sizeOption: 'modular-grand',
  });
  // 4850 + 1150 (leather) + 340 (walnut) + 2150 (modular-grand) = 8490
  assert.equal(leatherGrand, 8490);
});

test('calculateCartTotals computes subtotal, complimentary white-glove threshold, and item count', () => {
  const totalsUnder = calculateCartTotals(
    [
      {
        cartItemId: '1',
        productId: 'mono-coffee-table',
        quantity: 1,
        config: {},
        unitPrice: 2290,
      },
    ],
    'white-glove'
  );
  assert.equal(totalsUnder.subtotal, 2290);
  assert.equal(totalsUnder.deliveryFee, 240);
  assert.equal(totalsUnder.total, 2530);
  assert.equal(totalsUnder.itemCount, 1);

  const totalsOver = calculateCartTotals(
    [
      {
        cartItemId: '2',
        productId: 'aurel-lounge-sofa',
        quantity: 2,
        config: {},
        unitPrice: 4850,
      },
    ],
    'white-glove'
  );
  assert.equal(totalsOver.subtotal, 9700);
  assert.equal(totalsOver.deliveryFee, 0);
  assert.equal(totalsOver.total, 9700);
  assert.equal(totalsOver.itemCount, 2);
});

test('filterAndSortProducts filters by category and sorts by price ascending', () => {
  const dining = filterAndSortProducts(PRODUCTS, {
    category: 'Dining Room',
    material: 'All',
    color: 'All',
    availability: 'All',
    style: 'All',
    maxPrice: 10000,
    sortBy: 'price-asc',
  });
  assert.equal(dining.length, 2);
  assert.equal(dining[0].id, 'noma-dining-chair');
  assert.equal(dining[1].id, 'form-dining-table');
});

test('searchCatalog matches product names and categories case-insensitively', () => {
  const results = searchCatalog('travertine');
  assert.ok(results.length >= 2);
  assert.ok(results.some((r) => r.id === 'mono-coffee-table'));
});

test('validateCheckoutStep catches missing required contact and address fields', () => {
  const blankForm: CheckoutFormState = {
    email: 'invalid',
    fullName: '',
    phone: '123',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    country: '',
    deliveryMethod: 'white-glove',
    paymentMode: 'demo-card',
    cardLast4: '',
    cardHolder: '',
  };

  const step1Errors = validateCheckoutStep(1, blankForm);
  assert.ok(step1Errors.fullName);
  assert.ok(step1Errors.email);
  assert.ok(step1Errors.phone);

  const step2Errors = validateCheckoutStep(2, blankForm);
  assert.ok(step2Errors.addressLine1);
  assert.ok(step2Errors.city);
  assert.ok(step2Errors.postalCode);
});
