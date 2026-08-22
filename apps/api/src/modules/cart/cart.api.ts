/** Iteration 3 boundary placeholder. Cart owns carts/cart_items only. */
export const CART_API = 'CART_API';

export interface CartLine {
  productId: string;
  quantity: number;
  unitPriceMinor: number;
  lineTotalMinor: number;
}

export interface CartView {
  id: string;
  userId: string;
  lines: CartLine[];
  subtotalMinor: number;
  currency: string;
}

export interface CartApi {
  getActiveCart(userId: string): Promise<CartView>;
  addItem(userId: string, productId: string, quantity: number): Promise<CartView>;
  removeItem(userId: string, productId: string): Promise<CartView>;
  /** Orders calls this during checkout; it never writes cart tables itself. */
  markConverted(cartId: string): Promise<void>;
}
