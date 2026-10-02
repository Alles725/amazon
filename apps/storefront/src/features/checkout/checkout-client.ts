import {
  AddressInput,
  SavedAddress,
  CheckoutQuote,
  OrderResponse,
  PaymentCardInput,
  PlaceOrderRequest,
  SavedPaymentCard,
  SimulatedPayment,
  CHECKOUT_ROUTES,
  isApiErrorBody,
  CartResponse,
} from '@amazon-mvp/api-contract';
export class CheckoutError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}
async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: body ? { 'content-type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok)
    throw new CheckoutError(
      isApiErrorBody(payload)
        ? payload.error.details?.length
          ? 'Confira os campos obrigatórios e seus formatos.'
          : payload.error.message
        : 'Não foi possível completar a solicitação.',
      response.status,
    );
  return payload as T;
}
export const checkoutClient = {
  addresses: () => request<SavedAddress[]>(CHECKOUT_ROUTES.addresses),
  saveAddress: (data: AddressInput, id?: string) =>
    request<SavedAddress>(
      `${CHECKOUT_ROUTES.addresses}${id ? `/${encodeURIComponent(id)}` : ''}`,
      id ? 'PUT' : 'POST',
      data,
    ),
  cards: () => request<SavedPaymentCard[]>(CHECKOUT_ROUTES.paymentCards),
  /** Brand + last four digits only; the full number never reaches this call. */
  saveCard: (data: PaymentCardInput) =>
    request<SavedPaymentCard>(CHECKOUT_ROUTES.paymentCards, 'POST', data),
  /** Returns the remaining cards. */
  deleteCard: (id: string) =>
    request<SavedPaymentCard[]>(
      `${CHECKOUT_ROUTES.paymentCards}/${encodeURIComponent(id)}`,
      'DELETE',
    ),
  /** Totals (and the Pix discount) are always computed by the API for this method. */
  quote: (paymentMethod?: SimulatedPayment) =>
    request<CheckoutQuote>(
      paymentMethod
        ? `${CHECKOUT_ROUTES.quote}?paymentMethod=${encodeURIComponent(paymentMethod)}`
        : CHECKOUT_ROUTES.quote,
    ),
  place: (data: PlaceOrderRequest) => request<OrderResponse>(CHECKOUT_ROUTES.orders, 'POST', data),
};
/** Used only to suppress confirmation while the provider and server quote disagree. */
export function cartContentKey(cart: CartResponse | null): string {
  return JSON.stringify(
    cart && [
      cart.id,
      cart.currency,
      ...[...cart.lines]
        .sort((a, b) => a.productId.localeCompare(b.productId))
        .map((l) => [
          l.productId,
          l.quantity,
          l.unitPriceMinor,
          l.product.active,
          l.product.availableQuantity,
        ]),
    ],
  );
}
