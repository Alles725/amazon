import 'server-only';
import { cache } from 'react';
import type { CheckoutPricing } from '@amazon-mvp/api-contract';
import { getConfig } from '@/config/storefront-config';

const isPricing = (value: unknown): value is CheckoutPricing => {
  const percent = (value as { pixDiscountPercent?: unknown } | null)?.pixDiscountPercent;
  return Number.isInteger(percent) && (percent as number) >= 0 && (percent as number) <= 100;
};

/**
 * Pricing rules owned by the API configuration (checkout.pixDiscountPercent), read
 * once per request. null when the API cannot answer: callers then advertise no Pix
 * price rather than guessing a rate the checkout might not honour.
 */
export const getCheckoutPricing = cache(async (): Promise<CheckoutPricing | null> => {
  try {
    const config = getConfig();
    const response = await fetch(
      `${config.api.internalBaseUrl}${config.api.publicBasePath}/orders/pricing`,
      { cache: 'no-store' },
    );
    if (!response.ok) return null;
    const body: unknown = await response.json();
    return isPricing(body) ? { pixDiscountPercent: body.pixDiscountPercent } : null;
  } catch {
    return null;
  }
});
