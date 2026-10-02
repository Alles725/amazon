import { describe, expect, it } from 'vitest';
import type { CatalogItem, OrderResponse } from '@amazon-mvp/api-contract';
import {
  discountPercent,
  formatPurchaseDate,
  formatReviewDate,
  installmentPlan,
  lastPurchase,
  variantDimensions,
  type VariantMember,
} from '../src/features/product/product-rules';

const item = (slug: string, inStock = true): CatalogItem => ({
  id: `id-${slug}`,
  slug,
  sku: `SKU-${slug}`,
  name: slug,
  description: null,
  priceMinor: 1000,
  currency: 'BRL',
  active: true,
  availableQuantity: inStock ? 3 : 0,
  inStock,
});
const member = (slug: string, color: string, size?: string): VariantMember => ({
  product: item(slug),
  options: [{ name: 'Cor', value: color }, ...(size ? [{ name: 'Tamanho', value: size }] : [])],
});

describe('variant matrix', () => {
  it('lists every value once, marks the current one and links each to its own record', () => {
    const current = member('mint', 'Hortelã');
    const members = [current, member('peach', 'Pêssego'), member('purple', 'Roxa')];
    const [color] = variantDimensions(current, members);
    expect(color.name).toBe('Cor');
    expect(color.selected).toBe('Hortelã');
    expect(color.choices.map((c) => [c.value, c.selected, c.member.product.slug])).toEqual([
      ['Hortelã', true, 'mint'],
      ['Pêssego', false, 'peach'],
      ['Roxa', false, 'purple'],
    ]);
  });

  it('keeps the other current options when switching one dimension', () => {
    const current = member('black-m', 'Preto', 'M');
    const members = [
      current,
      member('black-g', 'Preto', 'G'),
      member('white-p', 'Branco', 'P'),
      member('white-m', 'Branco', 'M'),
    ];
    const [color, size] = variantDimensions(current, members);
    // White keeps size M instead of jumping to the first white record (P).
    expect(color.choices.find((c) => c.value === 'Branco')?.member.product.slug).toBe('white-m');
    // No black P exists, so P falls back to the first record with that size.
    expect(size.choices.find((c) => c.value === 'P')?.member.product.slug).toBe('white-p');
  });
});

const order = (
  id: string,
  placedAt: string,
  productIds: string[],
  status: OrderResponse['status'] = 'FULFILLED',
): OrderResponse => ({
  id,
  orderNumber: id,
  status,
  subtotalMinor: 0,
  shippingMinor: 0,
  discountMinor: 0,
  totalMinor: 0,
  currency: 'BRL',
  shippingAddress: null,
  paymentMethod: null,
  paymentCard: null,
  installments: null,
  placedAt,
  deliveredAt: null,
  deliveryNote: null,
  lines: productIds.map((productId) => ({
    productId,
    productName: productId,
    sku: productId,
    quantity: 1,
    unitPriceMinor: 0,
    lineTotalMinor: 0,
    currency: 'BRL',
  })),
});

describe('previous purchase', () => {
  it('returns the newest order that contains the product or one of its variants', () => {
    const orders = [
      order('old', '2026-01-10T10:00:00Z', ['mint']),
      order('new', '2026-08-10T13:32:00Z', ['peach', 'other']),
      order('unrelated', '2026-09-01T10:00:00Z', ['other']),
    ];
    const found = lastPurchase(orders, ['mint', 'peach']);
    expect(found?.order.id).toBe('new');
    expect(found?.line.productId).toBe('peach');
  });

  it('ignores cancelled orders and never invents a purchase', () => {
    expect(
      lastPurchase([order('c', '2026-08-10T00:00:00Z', ['mint'], 'CANCELLED')], ['mint']),
    ).toBeNull();
    expect(lastPurchase([], ['mint'])).toBeNull();
  });

  it('formats the banner date like Amazon, in Brazilian time', () => {
    expect(formatPurchaseDate('2026-08-10T13:32:00.000Z')).toBe('10 de Ago de 2026');
    // 01:00 UTC is still the previous day in São Paulo.
    expect(formatPurchaseDate('2026-08-11T01:00:00.000Z')).toBe('10 de Ago de 2026');
    expect(formatReviewDate('2026-07-18')).toBe('18 de julho de 2026');
  });
});

describe('prices', () => {
  it('splits interest-free installments without changing the total', () => {
    expect(installmentPlan(20520, 6)).toEqual({
      count: 6,
      eachMinor: 3420,
      lastMinor: 3420,
      totalMinor: 20520,
    });
    const odd = installmentPlan(1000, 3);
    expect(odd.eachMinor * 2 + odd.lastMinor).toBe(1000);
  });

  it('shows a discount only when the previous price is really higher', () => {
    expect(discountPercent(27900, 34900)).toBe(20);
    expect(discountPercent(27900)).toBeUndefined();
    expect(discountPercent(27900, 27900)).toBeUndefined();
  });
});
