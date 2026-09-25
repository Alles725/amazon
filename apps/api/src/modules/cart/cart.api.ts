import { CartItemResponse, CartResponse } from '@amazon-mvp/api-contract';

export const CART_API = 'CART_API';
export type CartLine = CartItemResponse;
export type CartView = CartResponse;

export interface CartApi {
  getActiveCart(userId: string): Promise<CartView>;
  addItem(userId: string, productId: string, quantity: number): Promise<CartView>;
  updateQuantity(userId: string, productId: string, quantity: number): Promise<CartView>;
  removeItem(userId: string, productId: string): Promise<CartView>;
  clear(userId: string): Promise<CartView>;
  /** Internal application boundary for a future checkout. */
  markConverted(cartId: string): Promise<void>;
}
