import {
  CheckoutPricing,
  CheckoutQuote,
  OrderResponse,
  PlaceOrderRequest,
  SimulatedPayment,
} from '@amazon-mvp/api-contract';
export const ORDERS_API = 'ORDERS_API';
export interface OrdersApi {
  /** Public pricing rules (Pix discount rate) from the validated API config. */
  pricing(): CheckoutPricing;
  /** Omitting the payment method quotes SIMULATED_CARD (no discount). */
  quote(userId: string, paymentMethod?: SimulatedPayment): Promise<CheckoutQuote>;
  placeOrderFromCart(userId: string, input: PlaceOrderRequest): Promise<OrderResponse>;
  listForUser(userId: string): Promise<OrderResponse[]>;
  findForUser(userId: string, orderId: string): Promise<OrderResponse | null>;
}
