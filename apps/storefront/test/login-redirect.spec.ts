import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ useRouter: vi.fn(), useSearchParams: vi.fn() }));

import { afterLogin } from '../src/features/auth/login-identifier-form';

describe('post-login redirect', () => {
  it('returns shoppers to the product they were buying', () => {
    expect(afterLogin('/products/p6')).toBe('/products/p6');
    expect(afterLogin('checkout')).toBe('/checkout');
    expect(afterLogin(null)).toBe('/account');
  });

  it('never redirects off-site', () => {
    const attacks = [
      'https://evil.example',
      '//evil.example',
      '/\\evil.example',
      'evil',
      // Browsers strip tab/newline, turning these into "//evil.example".
      '/\t/evil.example',
      '/\n/evil.example',
      '/\r/evil.example',
      ' /evil.example',
    ];
    for (const next of attacks) expect(afterLogin(next)).toBe('/account');
  });

  it('only ever returns same-origin destinations', () => {
    const origin = 'http://localhost:3000';
    for (const next of ['/products/p6?ref=x#reviews', '/%2F/evil.example', '/orders/abc'])
      expect(new URL(afterLogin(next), origin).origin).toBe(origin);
  });
});
