/** Iteration 3 boundary placeholder. Orders owns orders/order_items only. */
export const ORDERS_API = 'ORDERS_API';

export interface OrderLineView {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

export interface OrderView {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED' | 'FULFILLED';
  totalMinor: number;
  currency: string;
  placedAt: string;
  lines: OrderLineView[];
}

export interface OrdersApi {
  /**
   * Snapshots product data into order_items at creation time so historical
   * orders never change when the catalog changes.
   */
  placeOrderFromCart(userId: string): Promise<OrderView>;
  listForUser(userId: string): Promise<OrderView[]>;
  findForUser(userId: string, orderId: string): Promise<OrderView | null>;
}
