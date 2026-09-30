import { createHash } from 'node:crypto';
import { HttpStatus } from '@nestjs/common';
import {
  CartResponse,
  CheckoutPricing,
  CheckoutQuote,
  ErrorCode,
  SimulatedPayment,
  paymentDiscountPercent,
  percentDiscountMinor,
} from '@amazon-mvp/api-contract';
import { ApiError } from '../../common/api-error';

export const conflict = (message: string) =>
  new ApiError(ErrorCode.CART_ITEM_UNAVAILABLE, message, HttpStatus.CONFLICT);

/**
 * Academic checkout: free shipping, no real charge. The only promotion is the Pix
 * discount (checkout.pixDiscountPercent), applied to the items subtotal and rounded
 * down to the cent (percentDiscountMinor). The revision binds everything the customer
 * reviewed — lines, prices, payment method and rate — so a POST whose payment method
 * or rate differs from the quote is rejected as stale instead of charging a total the
 * customer never saw.
 */
export function quoteCart(
  cart: CartResponse,
  paymentMethod: SimulatedPayment,
  pricing: CheckoutPricing,
): CheckoutQuote {
  if (!cart.lines.length) throw conflict('Seu carrinho está vazio.');
  if (
    cart.lines.some(
      (line) =>
        line.product.currency !== cart.currency ||
        !line.product.active ||
        line.quantity > line.product.availableQuantity,
    )
  )
    throw conflict('Revise os produtos e quantidades do carrinho.');
  if (
    !Number.isSafeInteger(cart.subtotalMinor) ||
    cart.subtotalMinor < 0 ||
    cart.subtotalMinor > 2147483647
  )
    throw conflict('O total do carrinho excede o limite permitido.');
  const discountPercent = paymentDiscountPercent(paymentMethod, pricing);
  const revision = createHash('sha256')
    .update(
      JSON.stringify([
        cart.id,
        cart.currency,
        [...cart.lines]
          .sort((a, b) => a.productId.localeCompare(b.productId))
          .map((line) => [line.productId, line.quantity, line.unitPriceMinor]),
        paymentMethod,
        discountPercent,
      ]),
    )
    .digest('hex');
  const shippingMinor = 0;
  const discountMinor = percentDiscountMinor(cart.subtotalMinor, discountPercent);
  return {
    cart,
    revision,
    subtotalMinor: cart.subtotalMinor,
    shippingMinor,
    discountMinor,
    totalMinor: cart.subtotalMinor + shippingMinor - discountMinor,
    currency: cart.currency,
    paymentMethod,
    discountPercent,
  };
}
