// Footer "Conheça-nos" / "Ganhe dinheiro conosco" destinations served by the
// shared corporate template. Kept free of page content so the root layout can
// import the route list cheaply.

export type CorporatePageKey =
  | 'about'
  | 'corporateInformation'
  | 'careers'
  | 'press'
  | 'community'
  | 'accessibility'
  | 'amazonScience'
  | 'brandProtection'
  | 'supply'
  | 'publish'
  | 'associates'
  | 'advertise';

export type CorporateGroupId = 'knowUs' | 'earn';

export type CorporateNavLink = { label: string; href: string; pageKey?: CorporatePageKey };

export type CorporateGroup = { id: CorporateGroupId; label: string; links: CorporateNavLink[] };

/** Same labels and order as the footer columns (components/amazon/amazon-footer.tsx). */
export const CORPORATE_GROUPS: CorporateGroup[] = [
  {
    id: 'knowUs',
    label: 'Conheça-nos',
    links: [
      { label: 'Sobre a Amazon', href: '/about', pageKey: 'about' },
      {
        label: 'Informações corporativas',
        href: '/corporate-information',
        pageKey: 'corporateInformation',
      },
      { label: 'Carreiras', href: '/careers', pageKey: 'careers' },
      { label: 'Comunicados à imprensa', href: '/press', pageKey: 'press' },
      { label: 'Comunidade', href: '/community', pageKey: 'community' },
      { label: 'Acessibilidade', href: '/accessibility', pageKey: 'accessibility' },
      { label: 'Amazon Science', href: '/amazon-science', pageKey: 'amazonScience' },
    ],
  },
  {
    id: 'earn',
    label: 'Ganhe dinheiro conosco',
    links: [
      // /sell has its own landing (features/sell); listed here for navigation only.
      { label: 'Venda na Amazon', href: '/sell' },
      {
        label: 'Proteja e construa a sua marca',
        href: '/brand-protection',
        pageKey: 'brandProtection',
      },
      { label: 'Forneça para a Amazon', href: '/supply', pageKey: 'supply' },
      { label: 'Publique seus livros', href: '/publish', pageKey: 'publish' },
      { label: 'Seja um associado', href: '/associates', pageKey: 'associates' },
      { label: 'Anuncie seus produtos', href: '/advertise', pageKey: 'advertise' },
    ],
  },
];

/** Paths rendered by the corporate template (bare Amazon chrome in the root layout). */
export const CORPORATE_ROUTES: string[] = CORPORATE_GROUPS.flatMap((group) =>
  group.links.filter((link) => link.pageKey).map((link) => link.href),
);
