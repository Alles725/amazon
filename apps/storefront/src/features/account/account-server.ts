import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { AccountAddress, ListDetails, ListSummary } from '@amazon-mvp/api-contract';
import { getConfig } from '@/config/storefront-config';

/** Server-side reads for the account pages; the browser's cookie is forwarded. */
async function get(path: string): Promise<Response | null> {
  const config = getConfig();
  try {
    return await fetch(`${config.api.internalBaseUrl}${config.api.publicBasePath}${path}`, {
      headers: { cookie: cookies().toString() },
      cache: 'no-store',
    });
  } catch {
    return null;
  }
}

/** null when the API is unavailable. One read per request: the header and the
 * "Seus endereços" page share it. */
export const fetchAddresses = cache(async (): Promise<AccountAddress[] | null> => {
  const response = await get('/addresses');
  return response?.ok ? ((await response.json()) as AccountAddress[]) : null;
});

/** null when the API is unavailable. Creates the default list on first use. */
export async function fetchLists(): Promise<ListSummary[] | null> {
  const response = await get('/lists');
  return response?.ok ? ((await response.json()) as ListSummary[]) : null;
}

/** 'not-found' also covers another user's list. */
export async function fetchList(id: string): Promise<ListDetails | 'not-found' | null> {
  const response = await get(`/lists/${encodeURIComponent(id)}`);
  if (response?.status === 404 || response?.status === 400) return 'not-found';
  return response?.ok ? ((await response.json()) as ListDetails) : null;
}
