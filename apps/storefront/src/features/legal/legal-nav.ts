/**
 * "Políticas legais" sidebar, in amazon.com.br order. Entries without `href`
 * have no page in this storefront and render as plain text.
 */
export const LEGAL_POLICIES: Array<{ title: string; href?: string }> = [
  { title: 'Condições de Uso', href: '/conditions-of-use' },
  { title: 'Notificação de Privacidade da Amazon', href: '/privacy' },
  { title: 'Mudanças na Notificação de privacidade - Versão anterior' },
  { title: 'Comunicações com funcionários da Amazon' },
  { title: 'Política de PLD/CFT' },
  { title: 'Lista não exaustiva das marcas da Amazon' },
];
