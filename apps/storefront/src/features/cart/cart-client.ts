import {
  AddCartItemRequest,
  CART_ROUTES,
  CartResponse,
  isApiErrorBody,
} from '@amazon-mvp/api-contract';

export class CartRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function requestCart(path: string, method = 'GET', body?: unknown): Promise<CartResponse> {
  const response = await fetch(path, {
    method,
    credentials: 'same-origin',
    cache: 'no-store',
    headers: body === undefined ? undefined : { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new CartRequestError(
      isApiErrorBody(payload) ? payload.error.message : 'Não foi possível atualizar seu carrinho.',
      response.status,
    );
  }
  return payload as CartResponse;
}

export const cartClient = {
  get: () => requestCart(CART_ROUTES.current),
  add: (body: AddCartItemRequest) => requestCart(CART_ROUTES.items, 'POST', body),
  update: (id: string, quantity: number) =>
    requestCart(`${CART_ROUTES.items}/${encodeURIComponent(id)}`, 'PATCH', { quantity }),
  remove: (id: string) => requestCart(`${CART_ROUTES.items}/${encodeURIComponent(id)}`, 'DELETE'),
  clear: () => requestCart(CART_ROUTES.items, 'DELETE'),
};
