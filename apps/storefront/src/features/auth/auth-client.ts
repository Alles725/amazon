'use client';

import { ApiErrorBody, LoginRequest, RegisterRequest, SessionResponse, isApiErrorBody } from '@amazon-mvp/api-contract';

/**
 * Browser-side calls are same-origin: the Ingress routes /api to the API, so the
 * session cookie is sent automatically and CORS never enters the picture.
 * Types come from the shared contract package — never from apps/api.
 */
const BASE = '/api/v1';

export class AuthRequestError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly fieldErrors: Record<string, string> = {},
  ) {
    super(message);
    this.name = 'AuthRequestError';
  }
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      credentials: 'same-origin',
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new AuthRequestError('Could not reach the server. Check your connection and try again.', 'NETWORK_ERROR');
  }

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiErrorBody(payload)) {
      const error = (payload as ApiErrorBody).error;
      const fieldErrors = Object.fromEntries(
        (error.details ?? []).map((detail) => [detail.field, detail.message]),
      );
      throw new AuthRequestError(error.message, error.code, fieldErrors);
    }
    throw new AuthRequestError('Something went wrong. Try again.', 'UNKNOWN');
  }

  return payload as T;
}

export const authClient = {
  register: (input: RegisterRequest) => post<SessionResponse>('/auth/register', input),
  login: (input: LoginRequest) => post<SessionResponse>('/auth/login', input),
  logout: () => post<{ success: true }>('/auth/logout'),
};
