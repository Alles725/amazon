import type { CatalogItem, OrderLineResponse, OrderResponse } from '@amazon-mvp/api-contract';
import type { ProductPhoto } from '@/features/home/catalog-mock';

/** Pure product-page rules. Everything derives from catalog records, persisted
 * orders and the product's content; nothing here fetches or invents data. */

export interface VariantMember {
  product: CatalogItem;
  options: Array<{ name: string; value: string }>;
  image?: ProductPhoto;
}

export interface VariantChoice {
  value: string;
  selected: boolean;
  /** Catalog record that best keeps the other current choices. */
  member: VariantMember;
}

export interface VariantDimension {
  name: string;
  selected: string;
  choices: VariantChoice[];
}

/** Amazon-style variation matrix. Each variant is its own catalog record (its own
 * price, stock and URL); a choice links to the record matching every other current
 * option, or to the first record with that value when no exact match exists. */
export function variantDimensions(
  current: VariantMember,
  members: VariantMember[],
): VariantDimension[] {
  const valueOf = (member: VariantMember, name: string) =>
    member.options.find((option) => option.name === name)?.value;
  return current.options.map(({ name, value: selected }) => {
    const values = [
      ...new Set(members.map((member) => valueOf(member, name)).filter(Boolean)),
    ] as string[];
    return {
      name,
      selected,
      choices: values.map((value) => {
        const candidates = members.filter((member) => valueOf(member, name) === value);
        const exact = candidates.find((member) =>
          current.options.every(
            (option) => option.name === name || valueOf(member, option.name) === option.value,
          ),
        );
        return { value, selected: value === selected, member: exact ?? candidates[0] };
      }),
    };
  });
}

export interface PreviousPurchase {
  order: OrderResponse;
  line: OrderLineResponse;
}

/** The newest non-cancelled order containing any of the given catalog IDs
 * (the product or one of its variants). */
export function lastPurchase(
  orders: OrderResponse[],
  productIds: string[],
): PreviousPurchase | null {
  const ids = new Set(productIds);
  const newestFirst = orders
    .filter((order) => order.status !== 'CANCELLED')
    .sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  for (const order of newestFirst) {
    const line = order.lines.find((item) => ids.has(item.productId));
    if (line) return { order, line };
  }
  return null;
}

const monthDate = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
});

/** "10 de Ago de 2026", as on Amazon's "Você comprou este produto" banner. */
export function formatPurchaseDate(iso: string): string {
  const parts = monthDate.formatToParts(new Date(iso));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  const month = get('month').replace('.', '');
  return `${get('day')} de ${month.charAt(0).toUpperCase()}${month.slice(1)} de ${get('year')}`;
}

const reviewDate = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});
/** "18 de julho de 2026" — review dates are calendar days, not instants. */
export const formatReviewDate = (isoDay: string): string =>
  reviewDate.format(new Date(`${isoDay}T12:00:00Z`));

/** Interest-free installments never change the total; the last one absorbs rounding. */
export function installmentPlan(totalMinor: number, count: number) {
  const each = Math.floor(totalMinor / count);
  return { count, eachMinor: each, lastMinor: totalMinor - each * (count - 1), totalMinor };
}

export const discountPercent = (priceMinor: number, oldPriceMinor?: number): number | undefined =>
  oldPriceMinor && oldPriceMinor > priceMinor
    ? Math.round((1 - priceMinor / oldPriceMinor) * 100)
    : undefined;

export const formatRating = (value: number): string =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
