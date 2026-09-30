// Line icons drawn for the corporate pages (24x24 grid, stroked with
// currentColor). No third-party or Amazon artwork.

/** SVG path for a circle, so every icon is a plain list of path strings. */
const circle = (cx: number, cy: number, r: number) =>
  `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0Z`;

export const ICONS = {
  accessibility: [circle(12, 12, 9.5), circle(12, 7.2, 1.3), 'M7.5 10.2 12 11l4.5-.8', 'M12 11v3.6l-2.6 3.6', 'M12 14.6l2.6 3.6'],
  book: ['M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H7a2 2 0 0 0-2 2Z', 'M5 20a2 2 0 0 0 2 2h12v-4', 'M9 7.5h6'],
  bulb: ['M9 18h6', 'M10 21h4', 'M12 3a6 6 0 0 0-3.6 10.8c.7.5 1.1 1.3 1.1 2.1v.1h5v-.1c0-.8.4-1.6 1.1-2.1A6 6 0 0 0 12 3Z'],
  box: ['M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4Z', 'M3.5 7.5 12 11.5l8.5-4', 'M12 11.5v9', 'M7.8 5.5l8.4 4'],
  briefcase: ['M3 8h18v12H3Z', 'M8.5 8V5.5h7V8', 'M3 13h18', 'M11 13v2h2v-2'],
  chart: ['M4 3.5v16.5h16.5', 'M8 16v-4', 'M12 16V8', 'M16 16v-6.5', 'M20 16V6'],
  chat: ['M4 4.5h16v11H9.5L4 20Z', 'M8 8.5h8', 'M8 11.8h5'],
  clock: [circle(12, 12, 9), 'M12 7v5.2l3.4 2.1'],
  cloud: ['M7 18.5h10.5a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.4 9.3 4.6 4.6 0 0 0 7 18.5Z'],
  code: ['M8 7.5 3.5 12 8 16.5', 'M16 7.5l4.5 4.5-4.5 4.5', 'M13.8 4.5l-3.6 15'],
  camera: ['M3 7.5h4.2L9 4.8h6l1.8 2.7H21v12H3Z', circle(12, 13.2, 3.8)],
  device: ['M6.5 2.5h11a1 1 0 0 1 1 1v17a1 1 0 0 1-1 1h-11a1 1 0 0 1-1-1v-17a1 1 0 0 1 1-1Z', 'M10.5 18.5h3', 'M8.5 6h7', 'M8.5 9h7', 'M8.5 12h4'],
  document: ['M6 2.8h8.2L18 6.6V21H6Z', 'M14 2.8v4h4', 'M9 11.5h6', 'M9 14.8h6', 'M9 18h3.5'],
  eye: ['M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z', circle(12, 12, 3)],
  flask: ['M9 3h6', 'M10 3v6.2L4.6 18.8A1.5 1.5 0 0 0 5.9 21h12.2a1.5 1.5 0 0 0 1.3-2.2L14 9.2V3', 'M7.2 15h9.6'],
  globe: [circle(12, 12, 9), 'M3 12h18', 'M12 3c3.2 3.4 3.2 14.6 0 18', 'M12 3c-3.2 3.4-3.2 14.6 0 18'],
  graduation: ['M2 9.5 12 4.5l10 5-10 5Z', 'M6 11.5v4.8c3.3 2.3 8.7 2.3 12 0v-4.8', 'M22 9.5v5'],
  heart: ['M12 20.2s-7.6-4.6-7.6-10.4A4.2 4.2 0 0 1 12 7.3a4.2 4.2 0 0 1 7.6 2.5c0 5.8-7.6 10.4-7.6 10.4Z'],
  info: [circle(12, 12, 9.5), 'M12 11v6', 'M12 7.4v.1'],
  keyboard: ['M2.5 6h19v12h-19Z', 'M6 9.5h.1', 'M9.3 9.5h.1', 'M12.6 9.5h.1', 'M15.9 9.5h.1', 'M18.2 9.5h.1', 'M6 12.5h.1', 'M18.2 12.5h.1', 'M8 15h8'],
  leaf: ['M5 19.5C5 10.5 10.5 5 20 4c-.8 9.8-6.3 15.5-15 15.5Z', 'M5 19.5l7.5-7.5'],
  lifebuoy: [circle(12, 12, 9), circle(12, 12, 4), 'M5.6 5.6l3.6 3.6', 'M14.8 14.8l3.6 3.6', 'M18.4 5.6l-3.6 3.6', 'M9.2 14.8l-3.6 3.6'],
  link: ['M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.1 1.1', 'M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.1-1.1'],
  mail: ['M3 5.5h18v13H3Z', 'M3.5 6.5 12 13l8.5-6.5'],
  megaphone: ['M3.5 10h3.5l9.5-5.5v15L7 14H3.5Z', 'M7 14l1.6 6H11l-1.3-5.2', 'M19.5 9.5v5'],
  motion: ['M2.5 12h4l2.2-5.5 4.6 11 2.2-5.5h6'],
  network: [circle(5.5, 6, 2), circle(5.5, 18, 2), circle(12, 12, 2.2), circle(18.5, 6, 2), circle(18.5, 18, 2), 'M7.2 7.2l3.1 3.1', 'M7.2 16.8l3.1-3.1', 'M16.8 7.2l-3.1 3.1', 'M16.8 16.8l-3.1-3.1'],
  newspaper: ['M4 4.5h12.5V19a2 2 0 0 0 2 2H6a2 2 0 0 1-2-2Z', 'M16.5 8.5H20V19a2 2 0 0 1-2 2', 'M7 8.5h6.5', 'M7 12h6.5', 'M7 15.5h4'],
  pen: ['M4 20l1.1-4.9L15.8 4.4a1.4 1.4 0 0 1 2 0l1.8 1.8a1.4 1.4 0 0 1 0 2L8.9 18.9Z', 'M13.8 6.4l3.8 3.8'],
  play: [circle(12, 12, 9), 'M10 8.4v7.2l5.8-3.6Z'],
  printer: ['M6.5 9V3.5h11V9', 'M6.5 17.5H4V9h16v8.5h-2.5', 'M6.5 14h11v7h-11Z'],
  robot: ['M6 8.5h12v10.5H6Z', 'M12 4.8v3.7', circle(12, 3.8, 1), 'M9.5 12.5v.1', 'M14.5 12.5v.1', 'M9.5 16h5', 'M3.5 12v3.5', 'M20.5 12v3.5'],
  search: [circle(10.5, 10.5, 6.5), 'M20 20l-4.7-4.7'],
  shield: ['M12 3l8 3v5.8c0 4.9-3.4 8-8 9.2-4.6-1.2-8-4.3-8-9.2V6Z', 'M8.8 12l2.2 2.2 4.2-4.4'],
  speaker: ['M4 9h3.6L12.5 5v14l-4.9-4H4Z', 'M15.5 9.2a3.8 3.8 0 0 1 0 5.6', 'M18 6.6a7.5 7.5 0 0 1 0 10.8'],
  star: ['M12 3.2l2.7 5.5 6 .9-4.4 4.2 1 6-5.3-2.8-5.3 2.8 1-6-4.4-4.2 6-.9Z'],
  store: ['M3.5 9.5 5.3 4h13.4l1.8 5.5', 'M3.5 9.5h17a2.8 2.8 0 0 1-5.6 0 2.8 2.8 0 0 1-5.8 0 2.8 2.8 0 0 1-5.6 0', 'M5 12v8.5h14V12', 'M10 20.5v-5h4v5'],
  tag: ['M3 12.2V3.5h8.7L21 12.8 12.8 21Z', circle(7.6, 7.8, 1.5)],
  target: [circle(12, 12, 9), circle(12, 12, 5), circle(12, 12, 1.2)],
  truck: ['M2 5.5h11.5V16H2Z', 'M13.5 9h4.2l3.8 4v3h-8', circle(6.5, 17.8, 2), circle(17, 17.8, 2)],
  users: [circle(9, 8, 3.2), 'M3 20a6 6 0 0 1 12 0', 'M15.5 4.9a3.2 3.2 0 0 1 0 6.2', 'M17.5 14.3A6 6 0 0 1 21 20'],
  warehouse: ['M2.5 21V9L12 3.5 21.5 9v12', 'M6.5 21v-8.5h11V21', 'M6.5 16.5h11'],
} satisfies Record<string, string[]>;

export type IconName = keyof typeof ICONS;

export function CorpIcon({
  name,
  size = 24,
  className,
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {ICONS[name].map((d, index) => (
        <path key={index} d={d} />
      ))}
    </svg>
  );
}

/**
 * Decorative hero composition: a soft backdrop, two "content cards" and the
 * page icon on a disc. Colours come from CSS custom properties per hero tone.
 */
export function HeroArt({ icon }: { icon: IconName }) {
  return (
    <svg
      viewBox="0 0 360 280"
      className="az-corp-art"
      aria-hidden="true"
      focusable="false"
    >
      <circle className="az-corp-art__soft" cx="200" cy="140" r="122" />
      <g className="az-corp-art__card">
        <rect x="22" y="54" width="124" height="74" rx="10" />
        <rect className="az-corp-art__accent" x="38" y="72" width="56" height="9" rx="4.5" />
        <rect className="az-corp-art__muted" x="38" y="92" width="92" height="6" rx="3" />
        <rect className="az-corp-art__muted" x="38" y="106" width="70" height="6" rx="3" />
      </g>
      <g className="az-corp-art__card">
        <rect x="232" y="182" width="112" height="66" rx="10" />
        <circle className="az-corp-art__accent" cx="256" cy="215" r="11" />
        <rect className="az-corp-art__muted" x="276" y="204" width="52" height="6" rx="3" />
        <rect className="az-corp-art__muted" x="276" y="218" width="38" height="6" rx="3" />
      </g>
      <circle className="az-corp-art__disc" cx="190" cy="140" r="72" />
      <g
        className="az-corp-art__icon"
        transform="translate(142 92) scale(4)"
        fill="none"
        strokeWidth={1.3}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {ICONS[icon].map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
      <circle className="az-corp-art__dot" cx="304" cy="58" r="9" />
      <circle className="az-corp-art__dot az-corp-art__dot--soft" cx="330" cy="98" r="5" />
      <circle className="az-corp-art__dot" cx="58" cy="206" r="6" />
    </svg>
  );
}
