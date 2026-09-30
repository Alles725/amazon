import type { PageIcon } from './customer-page-content';

/** Line icons drawn for these pages (no Amazon artwork). Decorative only. */
export function CustomerIcon({ name, size = 40 }: { name: PageIcon; size?: number }) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {PATHS[name]}
    </svg>
  );
}

const PATHS: Record<PageIcon, JSX.Element> = {
  payment: (
    <>
      <rect x="5" y="10" width="30" height="20" rx="3" />
      <path d="M5 16h30M10 25h7" />
    </>
  ),
  card: (
    <>
      <rect x="5" y="10" width="30" height="20" rx="3" />
      <path d="M5 16h30M10 25h5M19 25h3" />
    </>
  ),
  creditCard: (
    <>
      <rect x="5" y="10" width="30" height="20" rx="3" />
      <rect x="9" y="15" width="6" height="5" rx="1" />
      <path d="M9 25h6M19 25h4M27 25h4" />
    </>
  ),
  pix: (
    <>
      <path d="M20 5 35 20 20 35 5 20Z" />
      <path d="M13 20h14M20 13v14" />
    </>
  ),
  points: (
    <>
      <circle cx="20" cy="20" r="14" />
      <path d="m20 11 2.6 5.4 5.9.8-4.3 4.1 1 5.8L20 24.4l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8Z" />
    </>
  ),
  shipping: (
    <>
      <path d="M4 12h19v15H4zM23 17h7l5 5v5H23z" />
      <circle cx="11" cy="29" r="3" fill="#fff" />
      <circle cx="29" cy="29" r="3" fill="#fff" />
    </>
  ),
  returns: (
    <>
      <path d="M8 15 20 9l12 6v13l-12 6-12-6z" />
      <path d="M8 15l12 6 12-6M20 21v13" />
      <path d="M5 4v5h5" />
      <path d="M5.5 9A10 10 0 0 1 15 4" />
    </>
  ),
  devices: (
    <>
      <rect x="5" y="7" width="20" height="26" rx="3" />
      <path d="M12 29h6" />
      <rect x="27" y="15" width="9" height="18" rx="2" />
    </>
  ),
  recalls: (
    <>
      <path d="M20 5 33 10v9c0 8-5.5 13.5-13 16-7.5-2.5-13-8-13-16v-9Z" />
      <path d="M20 13v8M20 26v.5" />
    </>
  ),
};
