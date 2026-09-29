import 'server-only';
import { cookies } from 'next/headers';
import { OrderResponse } from '@amazon-mvp/api-contract';
import { getConfig } from '@/config/storefront-config';

/** The only storefront reader of the orders API. Every page that shows orders
 * (Seus pedidos, Atendimento ao Cliente, Home) goes through here. */
async function getOrders(path: string): Promise<Response | null> {
  const config = getConfig();
  try {
    return await fetch(`${config.api.internalBaseUrl}${config.api.publicBasePath}/orders${path}`, {
      headers: { cookie: cookies().toString() },
      cache: 'no-store',
    });
  } catch {
    return null;
  }
}

/** The signed-in user's orders, newest first; null when the API is unavailable. */
export async function fetchOrders(): Promise<OrderResponse[] | null> {
  const response = await getOrders('');
  return response?.ok ? ((await response.json()) as OrderResponse[]) : null;
}

/** One order of the signed-in user; 'not-found' also covers other users' orders. */
export async function fetchOrder(orderId: string): Promise<OrderResponse | 'not-found' | null> {
  const response = await getOrders(`/${encodeURIComponent(orderId)}`);
  if (response?.status === 404) return 'not-found';
  return response?.ok ? ((await response.json()) as OrderResponse) : null;
}
