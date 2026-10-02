import {
  CartResponse,
  installmentOptions,
  percentDiscountMinor,
  pixPriceMinor,
} from '@amazon-mvp/api-contract';
import { quoteCart } from './checkout-quote';

const cartOf = (unitPriceMinor: number, quantity = 1): CartResponse => ({
  id: '00000000-0000-4000-8000-000000000001',
  userId: 'user',
  itemCount: quantity,
  subtotalMinor: unitPriceMinor * quantity,
  currency: 'BRL',
  lines: [
    {
      productId: 'product',
      quantity,
      unitPriceMinor,
      lineTotalMinor: unitPriceMinor * quantity,
      product: {
        id: 'product',
        sku: 'SKU',
        slug: 'product',
        name: 'Product',
        description: null,
        priceMinor: unitPriceMinor,
        currency: 'BRL',
        active: true,
        availableQuantity: 99,
        inStock: true,
      },
    },
  ],
});
const pricing = { pixDiscountPercent: 5, maxInstallments: 10, minInstallmentMinor: 500 };

describe('percentDiscountMinor (floor rule)', () => {
  it.each([
    [0, 0],
    [1, 0],
    [19, 0],
    [20, 1],
    [39, 1],
    [40, 2],
    [32900, 1645],
    [99999, 4999],
    [2147483647, 107374182],
  ])('5%% of %i cents is %i cents', (amount, discount) => {
    expect(percentDiscountMinor(amount, 5)).toBe(discount);
    expect(pixPriceMinor(amount, pricing)).toBe(amount - discount);
  });

  it('handles 0% and 100%', () => {
    expect(percentDiscountMinor(99999, 0)).toBe(0);
    expect(percentDiscountMinor(99999, 100)).toBe(99999);
  });

  it.each([
    [-1, 5],
    [1.5, 5],
    [Number.NaN, 5],
    [100, -1],
    [100, 101],
    [100, 2.5],
  ])('rejects amount %s with rate %s', (amount, percent) => {
    expect(() => percentDiscountMinor(amount, percent)).toThrow(RangeError);
  });
});

describe('quoteCart', () => {
  it('gives no discount to card payments', () => {
    const quote = quoteCart(cartOf(99999), 'SIMULATED_CARD', pricing);
    expect(quote).toMatchObject({
      subtotalMinor: 99999,
      shippingMinor: 0,
      discountMinor: 0,
      totalMinor: 99999,
      paymentMethod: 'SIMULATED_CARD',
      discountPercent: 0,
    });
  });

  it('applies the configured Pix rate to the whole subtotal', () => {
    // 3 x 1234 = 3702; 5% = 185.1 -> 185 (per-unit rounding would give only 3 x 61).
    const quote = quoteCart(cartOf(1234, 3), 'SIMULATED_PIX', pricing);
    expect(quote).toMatchObject({
      subtotalMinor: 3702,
      discountMinor: 185,
      totalMinor: 3517,
      paymentMethod: 'SIMULATED_PIX',
      discountPercent: 5,
    });
    expect(
      quoteCart(cartOf(1234, 3), 'SIMULATED_PIX', { ...pricing, pixDiscountPercent: 0 }),
    ).toMatchObject({
      discountMinor: 0,
      totalMinor: 3702,
    });
  });

  it('binds payment method and rate into the revision', () => {
    const card = quoteCart(cartOf(1234), 'SIMULATED_CARD', pricing).revision;
    const pix = quoteCart(cartOf(1234), 'SIMULATED_PIX', pricing).revision;
    const otherRate = quoteCart(cartOf(1234), 'SIMULATED_PIX', {
      ...pricing,
      pixDiscountPercent: 10,
    }).revision;
    expect(new Set([card, pix, otherRate]).size).toBe(3);
    expect(quoteCart(cartOf(1234), 'SIMULATED_PIX', pricing).revision).toBe(pix);
    // A card quote does not depend on the Pix rate.
    expect(
      quoteCart(cartOf(1234), 'SIMULATED_CARD', { ...pricing, pixDiscountPercent: 10 }).revision,
    ).toBe(card);
  });
});

describe('installmentOptions (interest-free)', () => {
  const rules = { maxInstallments: 10, minInstallmentMinor: 500 };
  it('offers up to the maximum and puts the remainder in the first installment', () => {
    const options = installmentOptions(10000, rules);
    expect(options.map((o) => o.count)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(options[2]).toEqual({ count: 3, installmentMinor: 3333, firstInstallmentMinor: 3334 });
    for (const o of options)
      expect(o.firstInstallmentMinor + o.installmentMinor * (o.count - 1)).toBe(10000);
  });
  it('stops when an installment would fall below the minimum', () => {
    expect(installmentOptions(1999, rules).map((o) => o.count)).toEqual([1, 2, 3]);
    expect(installmentOptions(499, rules)).toEqual([
      { count: 1, installmentMinor: 499, firstInstallmentMinor: 499 },
    ]);
  });
  it('offers only 1x when installments are disabled', () => {
    expect(installmentOptions(100000, { ...rules, maxInstallments: 1 })).toHaveLength(1);
  });
  it('is part of card quotes only, computed on the discounted total', () => {
    expect(quoteCart(cartOf(1000), 'SIMULATED_CARD', pricing).installmentOptions).toHaveLength(2);
    expect(quoteCart(cartOf(1000), 'SIMULATED_PIX', pricing).installmentOptions).toEqual([]);
  });
});
