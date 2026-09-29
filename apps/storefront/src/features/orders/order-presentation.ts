import type { OrderLineResponse, OrderResponse } from '@amazon-mvp/api-contract';
import type { ProductPhoto } from '@/features/home/catalog-mock';
import demoProducts from '../../../../../config/demo-products.json';

/** Pure order rules shared by "Seus pedidos", Atendimento ao Cliente and the Home.
 * Everything here derives from persisted orders; nothing is invented. */

const TIME_ZONE = 'America/Sao_Paulo';
const dateFormat = (options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('pt-BR', { ...options, timeZone: TIME_ZONE });
const shortDate = dateFormat({ day: 'numeric', month: 'short', year: 'numeric' });
const longDate = dateFormat({ day: 'numeric', month: 'long', year: 'numeric' });
const dayMonth = dateFormat({ day: 'numeric', month: 'long' });
const yearOnly = dateFormat({ year: 'numeric' });

/** "10 de ago. de 2026" */
export const formatOrderDate = (iso: string): string => shortDate.format(new Date(iso));
/** "10 de agosto de 2026" */
export const formatLongDate = (iso: string): string => longDate.format(new Date(iso));
/** "17 agosto" — Amazon's delivery headline drops the "de". */
const formatDayMonth = (iso: string): string =>
  dayMonth
    .formatToParts(new Date(iso))
    .filter((part) => part.type === 'day' || part.type === 'month')
    .map((part) => part.value)
    .join(' ');
/** Calendar year of the order in Brazilian time. */
export const orderYear = (iso: string): number => Number(yearOnly.format(new Date(iso)));

// Order items store no media. Photos come from the same presentation fixtures
// the product page uses, matched by the SKU snapshot saved on the order item.
export const photoForSku = (sku: string): ProductPhoto | undefined =>
  demoProducts.find((product) => product.sku === sku)?.image;

export interface DeliveryStatus {
  headline: string;
  detail: string | null;
}

export function deliveryStatus(order: OrderResponse): DeliveryStatus {
  if (order.status === 'CANCELLED') return { headline: 'Cancelado', detail: order.deliveryNote };
  if (order.deliveredAt)
    return {
      headline: `Entregue no dia ${formatDayMonth(order.deliveredAt)}`,
      detail: order.deliveryNote,
    };
  if (order.status === 'FULFILLED') return { headline: 'Enviado', detail: order.deliveryNote };
  return { headline: 'Pedido recebido', detail: order.deliveryNote ?? 'Ainda não enviado.' };
}

/** Placed but not shipped yet — the "Ainda não enviado" tab. */
export const isNotYetShipped = (order: OrderResponse): boolean =>
  order.status === 'PENDING' || order.status === 'PAID';

/** Returns close one calendar month after delivery. */
export function returnWindow(order: OrderResponse, now = new Date()): string | null {
  if (!order.deliveredAt || order.status === 'CANCELLED') return null;
  const end = new Date(order.deliveredAt);
  end.setMonth(end.getMonth() + 1);
  const date = formatLongDate(end.toISOString());
  return end < now
    ? `O período de devolução se encerrou em ${date}`
    : `Qualificado para devolução até ${date}`;
}

/** "last30" | "months3" | a calendar year such as "2026". */
export type OrderPeriod = string;
export const DEFAULT_PERIOD: OrderPeriod = 'months3';

export interface PeriodOption {
  value: OrderPeriod;
  label: string;
}

/** Relative periods, then ONLY the years that contain at least one order, newest first. */
export function periodOptions(orders: OrderResponse[]): PeriodOption[] {
  const years = [...new Set(orders.map((order) => orderYear(order.placedAt)))].sort(
    (a, b) => b - a,
  );
  return [
    { value: 'last30', label: 'últimos 30 dias' },
    { value: 'months3', label: 'nos últimos 3 meses' },
    ...years.map((year) => ({ value: String(year), label: String(year) })),
  ];
}

export function ordersInPeriod(
  orders: OrderResponse[],
  period: OrderPeriod,
  now = new Date(),
): OrderResponse[] {
  if (period === 'last30' || period === 'months3') {
    const from = new Date(now);
    if (period === 'last30') from.setDate(from.getDate() - 30);
    else from.setMonth(from.getMonth() - 3);
    return orders.filter((order) => new Date(order.placedAt) >= from);
  }
  return orders.filter((order) => String(orderYear(order.placedAt)) === period);
}

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

/** Matches product names and order numbers (with or without the dashes). */
export function searchOrders(orders: OrderResponse[], query: string): OrderResponse[] {
  const term = normalize(query);
  if (!term) return orders;
  const digits = /^[\d\s-]+$/.test(term) ? term.replace(/\D/g, '') : '';
  return orders.filter(
    (order) =>
      order.lines.some((line) => normalize(line.productName).includes(term)) ||
      normalize(order.orderNumber).includes(term) ||
      (digits.length > 0 && order.orderNumber.replace(/\D/g, '').includes(digits)),
  );
}

/** "1 pedido feito em" / "3 pedidos feitos em", split so the count can be bold. */
export function orderCountLabel(count: number): { count: string; verb: string } {
  return count === 1
    ? { count: '1 pedido', verb: 'feito em' }
    : { count: `${count} pedidos`, verb: 'feitos em' };
}

export interface OrderedProduct {
  line: OrderLineResponse;
  order: OrderResponse;
}

/** Each product once, from its most recent order, newest order first. */
export function distinctOrderedProducts(orders: OrderResponse[]): OrderedProduct[] {
  const seen = new Set<string>();
  const products: OrderedProduct[] = [];
  const newestFirst = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  for (const order of newestFirst)
    for (const line of order.lines) {
      if (seen.has(line.productId)) continue;
      seen.add(line.productId);
      products.push({ line, order });
    }
  return products;
}
