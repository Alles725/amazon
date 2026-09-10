/**
 * Illustrated icons for the /account card grid, styled after Amazon's own
 * account hub: a pale-blue circle badge with a flat, filled two-tone
 * illustration inside (never an outline/stroke glyph). Inline SVG, same
 * offline-safe approach as amazon-header.tsx and product-glyph.tsx — no
 * external assets, no CDN.
 */
export type AccountIconType =
  | 'orders'
  | 'security'
  | 'prime'
  | 'addresses'
  | 'payments'
  | 'giftCards'
  | 'refunds'
  | 'support'
  | 'messages'
  | 'lists'
  | 'devices';

const CIRCLE = '#DCEEFB';
const BLUE = '#146EB4';
const BLUE_DARK = '#0B3C6D';
const ORANGE = '#FF9900';
const WHITE = '#FFFFFF';

export function AccountIcon({ type }: { type: AccountIconType }) {
  return (
    <svg viewBox="0 0 56 56" width="52" height="52" aria-hidden="true" role="presentation">
      <circle cx="28" cy="28" r="28" fill={CIRCLE} />
      {ILLUSTRATIONS[type]}
    </svg>
  );
}

const ILLUSTRATIONS: Record<AccountIconType, JSX.Element> = {
  orders: (
    <g>
      <path d="M15 20 28 14l13 6-13 6-13-6Z" fill={BLUE} />
      <path d="M15 20v12l13 6V26z" fill={BLUE_DARK} />
      <path d="M41 20v12l-13 6V26z" fill={BLUE} />
      <circle cx="38" cy="38" r="8" fill={ORANGE} />
      <circle cx="38" cy="38" r="4.5" fill="none" stroke={WHITE} strokeWidth="2" />
      <path d="M41.2 41.2 44 44" stroke={WHITE} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),

  security: (
    <g>
      <path d="M28 12 41 16.5v9C41 33.5 35.5 40 28 44 20.5 40 15 33.5 15 25.5v-9L28 12Z" fill={BLUE} />
      <path d="M28 12 41 16.5v9C41 33.5 35.5 40 28 44V12Z" fill={BLUE_DARK} />
      <rect x="22.5" y="26" width="11" height="9" rx="2" fill={ORANGE} />
      <path d="M24.5 26v-3a3.5 3.5 0 0 1 7 0v3" fill="none" stroke={ORANGE} strokeWidth="2.4" />
      <circle cx="28" cy="30" r="1.6" fill={WHITE} />
    </g>
  ),

  prime: (
    <g>
      <rect x="14" y="20" width="28" height="18" rx="3" fill={BLUE} />
      <path d="M14 24h28" stroke={CIRCLE} strokeWidth="1.4" opacity="0.5" />
      <path d="M18 32c4 4 16 4 20 0" fill="none" stroke={ORANGE} strokeWidth="3" strokeLinecap="round" />
      <path d="M34 29.5 40 32l-6 2.5Z" fill={ORANGE} />
      <path d="M20 16h16l-3 5H23z" fill={BLUE_DARK} />
    </g>
  ),

  addresses: (
    <g>
      <path d="M28 14 44 27v3h-4v11H16V30h-4v-3Z" fill={BLUE} />
      <path d="M22 41V30h12v11" fill={WHITE} />
      <circle cx="28" cy="24" r="1.8" fill={BLUE_DARK} />
      <path d="M28 16 40 25.5" stroke={BLUE_DARK} strokeWidth="1.6" opacity="0.35" />
      <circle cx="38" cy="16" r="7" fill={ORANGE} />
      <path d="M38 12.2c-1.8 0-3.2 1.4-3.2 3.1 0 2.4 3.2 5.5 3.2 5.5s3.2-3.1 3.2-5.5c0-1.7-1.4-3.1-3.2-3.1Z" fill={WHITE} />
      <circle cx="38" cy="15.4" r="1.1" fill={ORANGE} />
    </g>
  ),

  payments: (
    <g>
      <rect x="12" y="18" width="28" height="20" rx="3" fill={BLUE} />
      <rect x="12" y="23" width="28" height="4" fill={BLUE_DARK} />
      <rect x="16" y="31" width="8" height="3" rx="1.2" fill={WHITE} />
      <circle cx="38" cy="36" r="8" fill={ORANGE} />
      <text x="38" y="39.5" fontSize="9" fontWeight="700" textAnchor="middle" fill={WHITE} fontFamily="Arial, Helvetica, sans-serif">
        $
      </text>
    </g>
  ),

  giftCards: (
    <g>
      <rect x="12" y="20" width="32" height="21" rx="3" fill={BLUE} />
      <rect x="12" y="27" width="32" height="4" fill={BLUE_DARK} />
      <rect x="26" y="20" width="4" height="21" fill={BLUE_DARK} opacity="0.5" />
      <path
        d="M28 20c-2-5-9-5-9-1.5S24 20 28 20c4 0 9-1.5 9-1.5S30 15 28 20Z"
        fill={ORANGE}
      />
      <circle cx="34" cy="35" r="4" fill={WHITE} opacity="0.9" />
    </g>
  ),

  refunds: (
    <g>
      <path
        d="M16 28a12 12 0 0 1 20.5-8.5L40 16"
        fill="none"
        stroke={BLUE}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M40 10v7h-7" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M40 28a12 12 0 0 1-20.5 8.5L16 40"
        fill="none"
        stroke={BLUE_DARK}
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path d="M16 46v-7h7" fill="none" stroke={BLUE_DARK} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="28" cy="28" r="8" fill={ORANGE} />
      <text x="28" y="31.5" fontSize="9" fontWeight="700" textAnchor="middle" fill={WHITE} fontFamily="Arial, Helvetica, sans-serif">
        R$
      </text>
    </g>
  ),

  support: (
    <g>
      <path d="M15 28a13 13 0 0 1 26 0" fill="none" stroke={BLUE} strokeWidth="4" strokeLinecap="round" />
      <rect x="12" y="27" width="7" height="11" rx="3.2" fill={BLUE_DARK} />
      <rect x="37" y="27" width="7" height="11" rx="3.2" fill={BLUE} />
      <path d="M41 38a7 7 0 0 1-7 6h-4" fill="none" stroke={BLUE_DARK} strokeWidth="3" strokeLinecap="round" />
      <circle cx="27" cy="44" r="3" fill={ORANGE} />
    </g>
  ),

  messages: (
    <g>
      <rect x="12" y="17" width="32" height="22" rx="3" fill={BLUE} />
      <path d="M13 19.5 28 30l15-10.5" fill="none" stroke={WHITE} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="40" cy="16" r="7" fill={ORANGE} />
      <path d="M37 16h6M40 13v6" stroke={WHITE} strokeWidth="2" strokeLinecap="round" />
    </g>
  ),

  lists: (
    <g>
      <rect x="15" y="12" width="26" height="32" rx="3" fill={BLUE} />
      <rect x="20" y="10" width="16" height="6" rx="2" fill={BLUE_DARK} />
      <rect x="20" y="22" width="16" height="2.6" fill={WHITE} />
      <rect x="20" y="28" width="16" height="2.6" fill={WHITE} />
      <rect x="20" y="34" width="10" height="2.6" fill={WHITE} />
      <circle cx="38" cy="36" r="7" fill={ORANGE} />
      <path d="m35 36 2.2 2.2L41.2 34" fill="none" stroke={WHITE} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </g>
  ),

  devices: (
    <g>
      <rect x="10" y="15" width="26" height="17" rx="2" fill={BLUE} />
      <rect x="13" y="18" width="20" height="11" fill={WHITE} opacity="0.85" />
      <path d="M7 35h32l-3 4H10z" fill={BLUE_DARK} />
      <rect x="33" y="24" width="13" height="20" rx="3" fill={ORANGE} />
      <rect x="35.5" y="27" width="8" height="13" fill={WHITE} opacity="0.85" />
      <circle cx="39.5" cy="41.2" r="1.3" fill={WHITE} />
    </g>
  ),
};
