import { CheckoutQuote, OrderResponse, PlaceOrderRequest } from '@amazon-mvp/api-contract';
export const ORDERS_API = 'ORDERS_API';
export interface OrdersApi {
  quote(userId: string): Promise<CheckoutQuote>;
  placeOrderFromCart(userId: string, input: PlaceOrderRequest): Promise<OrderResponse>;
  listForUser(userId: string): Promise<OrderResponse[]>;
  findForUser(userId: string, orderId: string): Promise<OrderResponse | null>;
}
