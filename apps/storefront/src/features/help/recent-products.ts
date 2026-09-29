import 'server-only';
import { OrderResponse } from '@amazon-mvp/api-contract';
import type { ProductPhoto } from '@/features/home/catalog-mock';
import {
  distinctOrderedProducts,
  formatOrderDate,
  photoForSku,
} from '@/features/orders/order-presentation';
import { fetchOrders } from '@/features/orders/orders-server';

export { formatOrderDate };

/** One card = one item of an order the signed-in user actually placed. */
export interface RecentProduct {
  key: string;
  name: string;
  orderedAt: string;
  href: string;
  image?: ProductPhoto;
}

const GRID_SIZE = 6;

/** Distinct products of the user's orders, newest order first, at most six. */
export function recentProductsFromOrders(orders: OrderResponse[]): RecentProduct[] {
  return distinctOrderedProducts(orders)
    .slice(0, GRID_SIZE)
    .map(({ line, order }) => ({
      key: line.productId,
      name: line.productName,
      orderedAt: order.placedAt,
      href: `/orders/${order.id}`,
      image: photoForSku(line.sku),
    }));
}

export async function getRecentProducts(signedIn: boolean): Promise<RecentProduct[]> {
  // API unreachable: render the page without the recent-products grid.
  return signedIn ? recentProductsFromOrders((await fetchOrders()) ?? []) : [];
}
