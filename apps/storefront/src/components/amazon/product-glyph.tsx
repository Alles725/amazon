export type GlyphKind =
  | 'headphones'
  | 'echo'
  | 'ereader'
  | 'blender'
  | 'sneaker'
  | 'controller'
  | 'plant'
  | 'beauty'
  | 'laptop'
  | 'watch'
  | 'backpack'
  | 'camera'
  | 'airfryer'
  | 'book'
  | 'lamp'
  | 'bottle';

/**
 * Flat inline-SVG illustrations used as product/category art. The storefront
 * ships offline (no CDN, no /public images), so these stand in for product
 * photography. Real Amazon product tiles sit on plain white, not a colored
 * swatch, so the background here is always white — only the artwork itself
 * carries color — with a flat contact shadow so objects read as sitting on
 * a surface rather than floating icons.
 */
export function ProductGlyph({ kind }: { kind: GlyphKind }) {
  return (
    <svg viewBox="0 0 120 120" className="pg" role="presentation" aria-hidden="true">
      <rect width="120" height="120" fill="#fff" />
      <ellipse cx="60" cy="99" rx="32" ry="6" fill="#0f1111" opacity="0.08" />
      {GLYPHS[kind]}
    </svg>
  );
}

const GLYPHS: Record<GlyphKind, JSX.Element> = {
  headphones: (
    <g>
      <path d="M30 65a30 30 0 0 1 60 0" fill="none" stroke="#232f3e" strokeWidth="7" />
      <rect x="24" y="62" width="16" height="26" rx="6" fill="#febd69" />
      <rect x="80" y="62" width="16" height="26" rx="6" fill="#febd69" />
    </g>
  ),
  echo: (
    <g>
      <rect x="34" y="46" width="52" height="40" rx="10" fill="#232f3e" />
      <ellipse cx="60" cy="46" rx="26" ry="10" fill="#3a4553" />
      <circle cx="60" cy="46" r="5" fill="#00c2ff" />
    </g>
  ),
  ereader: (
    <g>
      <rect x="38" y="24" width="44" height="60" rx="4" fill="#232f3e" />
      <rect x="43" y="30" width="34" height="48" fill="#f7f5ef" />
      <rect x="48" y="38" width="24" height="3" fill="#b8b2a4" />
      <rect x="48" y="46" width="24" height="3" fill="#b8b2a4" />
      <rect x="48" y="54" width="16" height="3" fill="#b8b2a4" />
    </g>
  ),
  blender: (
    <g>
      <path d="M46 30h28l6 44H40z" fill="#c7ecee" stroke="#232f3e" strokeWidth="3" />
      <rect x="38" y="74" width="44" height="14" rx="3" fill="#232f3e" />
      <rect x="54" y="18" width="12" height="14" rx="2" fill="#febd69" />
    </g>
  ),
  sneaker: (
    <g>
      <path
        d="M22 78c0-10 8-14 18-18l24-10c6-2 10 0 12 5l4 9h14c4 0 8 3 8 8v6z"
        fill="#febd69"
        stroke="#232f3e"
        strokeWidth="3"
      />
      <path d="M22 78h80" stroke="#232f3e" strokeWidth="3" />
    </g>
  ),
  controller: (
    <g>
      <rect x="20" y="46" width="80" height="34" rx="17" fill="#232f3e" />
      <circle cx="42" cy="63" r="7" fill="#f7f5ef" />
      <rect x="39" y="60" width="6" height="6" fill="#232f3e" />
      <circle cx="80" cy="57" r="4" fill="#febd69" />
      <circle cx="90" cy="67" r="4" fill="#febd69" />
    </g>
  ),
  plant: (
    <g>
      <path d="M42 70h36l-6 22H48z" fill="#c47a3d" />
      <path d="M60 70c0-22-18-24-18-24s-2 22 18 24" fill="#4c8c4a" />
      <path d="M60 70c0-26 20-30 20-30s4 26-20 30" fill="#6bb45f" />
    </g>
  ),
  beauty: (
    <g>
      <rect x="53" y="20" width="14" height="14" rx="2" fill="#232f3e" />
      <rect x="50" y="34" width="20" height="40" rx="4" fill="#febd69" />
      <rect x="50" y="60" width="20" height="14" rx="4" fill="#e0507a" />
    </g>
  ),
  laptop: (
    <g>
      <rect x="32" y="30" width="56" height="36" rx="3" fill="#232f3e" />
      <rect x="36" y="34" width="48" height="28" fill="#c7ecee" />
      <path d="M22 74h76l-6 10H28z" fill="#37475a" />
    </g>
  ),
  watch: (
    <g>
      <rect x="52" y="16" width="16" height="16" rx="3" fill="#232f3e" />
      <rect x="52" y="88" width="16" height="16" rx="3" fill="#232f3e" />
      <circle cx="60" cy="60" r="24" fill="#f7f5ef" stroke="#232f3e" strokeWidth="4" />
      <path d="M60 46v14l10 6" stroke="#febd69" strokeWidth="4" fill="none" strokeLinecap="round" />
    </g>
  ),
  backpack: (
    <g>
      <rect x="34" y="38" width="52" height="50" rx="12" fill="#febd69" />
      <rect x="44" y="50" width="32" height="20" rx="4" fill="#232f3e" />
      <path d="M42 38v-8a18 18 0 0 1 36 0v8" fill="none" stroke="#232f3e" strokeWidth="5" />
    </g>
  ),
  camera: (
    <g>
      <rect x="26" y="42" width="68" height="42" rx="6" fill="#232f3e" />
      <circle cx="60" cy="64" r="16" fill="#c7ecee" stroke="#f7f5ef" strokeWidth="3" />
      <rect x="46" y="30" width="20" height="12" rx="2" fill="#37475a" />
    </g>
  ),
  airfryer: (
    <g>
      <path d="M36 44h48l-6 40a6 6 0 0 1-6 5H48a6 6 0 0 1-6-5z" fill="#232f3e" />
      <rect x="30" y="34" width="60" height="12" rx="6" fill="#37475a" />
      <circle cx="60" cy="58" r="9" fill="#febd69" />
    </g>
  ),
  book: (
    <g>
      <rect x="34" y="22" width="52" height="66" rx="3" fill="#c0392b" />
      <rect x="34" y="22" width="10" height="66" fill="#8f2a20" />
      <rect x="52" y="34" width="26" height="4" fill="#f7f5ef" />
      <rect x="52" y="44" width="26" height="4" fill="#f7f5ef" />
    </g>
  ),
  lamp: (
    <g>
      <path d="M38 34h44l-8 24H46z" fill="#febd69" />
      <rect x="58" y="58" width="4" height="24" fill="#232f3e" />
      <rect x="44" y="82" width="32" height="6" rx="3" fill="#232f3e" />
    </g>
  ),
  bottle: (
    <g>
      <rect x="48" y="20" width="14" height="10" fill="#232f3e" />
      <path d="M46 30h18l4 12v42a6 6 0 0 1-6 6H48a6 6 0 0 1-6-6V42z" fill="#4c8c4a" />
    </g>
  ),
};
