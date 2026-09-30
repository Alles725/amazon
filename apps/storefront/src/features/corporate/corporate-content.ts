import type { CorporatePage } from './corporate-types';
import type { CorporatePageKey } from './corporate-routes';
import { EARN_PAGES } from './earn-content';
import { KNOW_US_PAGES } from './know-us-content';

/** Every footer corporate page, in footer order. */
export const CORPORATE_PAGES: CorporatePage[] = [...KNOW_US_PAGES, ...EARN_PAGES];

const BY_KEY = new Map(CORPORATE_PAGES.map((page) => [page.key, page]));

export function getCorporatePage(key: CorporatePageKey): CorporatePage {
  const page = BY_KEY.get(key);
  if (!page) throw new Error(`Unknown corporate page: ${key}`);
  return page;
}
