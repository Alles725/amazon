import {
  ACCOUNT_ROUTES,
  AccountAddress,
  ChangePasswordResponse,
  CHECKOUT_ROUTES,
  ErrorCode,
  isApiErrorBody,
  LIST_ROUTES,
  ListDetails,
  ListSummary,
  UserProfile,
} from '@amazon-mvp/api-contract';

export class AccountRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
  }
}

/** pt-BR messages for the codes the account pages can hit; anything else falls
 * back to the API message or a generic one. */
function messageFor(status: number, code: string, fallback: string): string {
  if (code === ErrorCode.AUTH_INVALID_CREDENTIALS) return 'Sua senha atual está incorreta.';
  if (code === ErrorCode.AUTH_EMAIL_ALREADY_REGISTERED)
    return 'Já existe uma conta com este e-mail.';
  if (status === 401) return 'Sua sessão expirou. Entre novamente para continuar.';
  if (status === 404) return 'Este item não existe mais. Atualize a página.';
  return fallback;
}

async function request<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(path, {
      method,
      credentials: 'same-origin',
      cache: 'no-store',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AccountRequestError('Não foi possível conectar. Tente novamente.', 0, 'NETWORK');
  }
  if (response.status === 204) return undefined as T;
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const error = isApiErrorBody(payload) ? payload.error : null;
    const fallback = error?.details?.length
      ? 'Confira os campos e tente novamente.'
      : error?.code === ErrorCode.LIST_LIMIT_EXCEEDED ||
          error?.code === ErrorCode.LIST_DEFAULT_PROTECTED
        ? error.message
        : 'Não foi possível concluir a solicitação.';
    throw new AccountRequestError(
      messageFor(response.status, error?.code ?? '', fallback),
      response.status,
      error?.code ?? 'UNKNOWN',
    );
  }
  return payload as T;
}

const address = (id: string) => `${CHECKOUT_ROUTES.addresses}/${encodeURIComponent(id)}`;
const list = (id: string) => `${LIST_ROUTES.lists}/${encodeURIComponent(id)}`;

export const accountClient = {
  addresses: () => request<AccountAddress[]>(CHECKOUT_ROUTES.addresses),
  deleteAddress: (id: string) => request<AccountAddress[]>(address(id), 'DELETE'),
  setDefaultAddress: (id: string) => request<AccountAddress[]>(`${address(id)}/default`, 'POST'),

  updateName: (displayName: string) =>
    request<UserProfile>(ACCOUNT_ROUTES.profile, 'PATCH', { displayName }),
  changeEmail: (email: string, currentPassword: string) =>
    request<UserProfile>(ACCOUNT_ROUTES.email, 'POST', { email, currentPassword }),
  changePassword: (currentPassword: string, newPassword: string) =>
    request<ChangePasswordResponse>(ACCOUNT_ROUTES.password, 'POST', {
      currentPassword,
      newPassword,
    }),

  lists: () => request<ListSummary[]>(LIST_ROUTES.lists),
  list: (id: string) => request<ListDetails>(list(id)),
  createList: (name: string) => request<ListSummary>(LIST_ROUTES.lists, 'POST', { name }),
  renameList: (id: string, name: string) => request<ListSummary>(list(id), 'PATCH', { name }),
  deleteList: (id: string) => request<void>(list(id), 'DELETE'),
  addToList: (id: string, productId: string) =>
    request<ListDetails>(`${list(id)}/items`, 'POST', { productId }),
  removeFromList: (id: string, productId: string) =>
    request<ListDetails>(`${list(id)}/items/${encodeURIComponent(productId)}`, 'DELETE'),
};
