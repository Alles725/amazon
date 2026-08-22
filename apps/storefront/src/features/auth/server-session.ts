import 'server-only';
import { cookies } from 'next/headers';
import { SessionResponse } from '@amazon-mvp/api-contract';
import { getConfig } from '@/config/storefront-config';

/**
 * Server-side session lookup. Forwards the browser's cookie to the API instead
 * of decoding anything locally — the token is opaque and the API is the only
 * component that can validate it.
 */
export async function getServerSession(): Promise<SessionResponse | null> {
  const config = getConfig();
  const cookieHeader = cookies().toString();
  if (!cookieHeader) return null;

  try {
    const response = await fetch(`${config.api.internalBaseUrl}${config.api.publicBasePath}/auth/me`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return (await response.json()) as SessionResponse;
  } catch {
    // API unreachable: render as signed out rather than failing the whole page.
    return null;
  }
}
