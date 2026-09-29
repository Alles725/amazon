import 'server-only';
import { cookies } from 'next/headers';
import { OrderResponse } from '@amazon-mvp/api-contract';
import { getConfig } from '@/config/storefront-config';
import type { ProductPhoto } from '@/features/home/catalog-mock';
import demoProducts from '../../../../../config/demo-products.json';

/** One card = one item of an order the signed-in user actually placed. */
export interface RecentProduct {
  key: string;
  name: string;
  orderedAt: string;
  href: string;
  image?: ProductPhoto;
}

const GRID_SIZE = 6;

const orderDate = new Intl.DateTimeFormat('pt-BR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'America/Sao_Paulo',
});

/** "10 de ago. de 2026" — same format as the reference. */
export const formatOrderDate = (iso: string): string => orderDate.format(new Date(iso));

// Order items store no media. Photos come from the same presentation fixtures
// the product page uses, matched by the SKU snapshot saved on the order item.
const photoForSku = (sku: string): ProductPhoto | undefined =>
  demoProducts.find((product) => product.sku === sku)?.image;

/** Distinct products of the user's orders, newest order first, at most six. */
export function recentProductsFromOrders(orders: OrderResponse[]): RecentProduct[] {
  const seen = new Set<string>();
  const recent: RecentProduct[] = [];
  const newestFirst = [...orders].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
  for (const order of newestFirst) {
    for (const line of order.lines) {
      if (seen.has(line.productId) || recent.length === GRID_SIZE) continue;
      seen.add(line.productId);
      recent.push({
        key: line.productId,
        name: line.productName,
        orderedAt: order.placedAt,
        href: `/orders/${order.id}`,
        image: photoForSku(line.sku),
      });
    }
  }
  return recent;
}

/** The signed-in user's orders from the orders API; empty when unavailable. */
async function fetchOrders(): Promise<OrderResponse[]> {
  const config = getConfig();
  try {
    const response = await fetch(
      `${config.api.internalBaseUrl}${config.api.publicBasePath}/orders`,
      {
        headers: { cookie: cookies().toString() },
        cache: 'no-store',
      },
    );
    return response.ok ? ((await response.json()) as OrderResponse[]) : [];
  } catch {
    // API unreachable: render the page without the recent-products grid.
    return [];
  }
}

export async function getRecentProducts(signedIn: boolean): Promise<RecentProduct[]> {
  return signedIn ? recentProductsFromOrders(await fetchOrders()) : [];
}
