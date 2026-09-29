'use client';

import { useEffect, useRef, useState } from 'react';

type MenuLink = { label: string; href: string };
// `submenu` sections show Amazon's trailing chevron on every item but "Ver tudo".
type MenuSection = { title: string; links: MenuLink[]; submenu?: boolean };

const HOME = 'https://www.amazon.com.br/ref=nav_logo';

export const ALL_MENU_SECTIONS: MenuSection[] = [
  {
    title: 'Destaques',
    links: [
      {
        label: 'Mais Vendidos',
        href: 'https://www.amazon.com.br/gp/bestsellers/?ref_=nav_em_cs_bestsellers_0_1_1_2',
      },
      {
        label: 'Novidades na Amazon',
        href: 'https://www.amazon.com.br/b?node=207658984011&ref_=nav_em_0_1_1_3',
      },
    ],
  },
  {
    title: 'Conteúdo digital e dispositivos',
    submenu: true,
    links: [
      { label: 'Amazon Fire TV', href: HOME },
      { label: 'Amazon Music', href: HOME },
      { label: 'Prime Video', href: HOME },
      { label: 'Aplicativos Amazon', href: HOME },
      { label: 'Dispositivos Kindle e eBooks', href: HOME },
      { label: 'Echo e Alexa', href: HOME },
      { label: 'Audiolivros Audible', href: HOME },
    ],
  },
  {
    title: 'Comprar por categoria',
    submenu: true,
    links: [
      { label: 'Alimentos e Bebidas', href: HOME },
      { label: 'Automotivo', href: HOME },
      { label: 'Bebês', href: HOME },
      { label: 'Beleza e Cuidados Pessoais', href: HOME },
      { label: 'Ver tudo', href: HOME },
    ],
  },
  {
    title: 'PROGRAMAS E RECURSOS',
    links: [
      {
        label: 'Amazon Prime',
        href: 'https://www.amazon.com.br/prime?ref_=nav_em_nav_prime_0_1_1_33',
      },
      {
        label: 'Mercado',
        href: 'https://www.amazon.com.br/fmc/everyday-essentials?ref_=nav_em_ee_desktop_hm_0_1_1_34',
      },
      {
        label: 'Garantia Estendida',
        href: 'https://www.amazon.com.br/gp/browse.html?node=205045905011&ref_=nav_em_amazon_warranty_0_1_1_35',
      },
      {
        label: 'Compras Internacionais',
        href: 'https://www.amazon.com.br/fmc/global-store?ref_=nav_em_comprasinternacionais_0_1_1_36',
      },
      { label: 'Ver tudo', href: HOME },
    ],
  },
  {
    title: 'AJUDA E CONFIGURAÇÕES',
    links: [
      {
        label: 'Atendimento ao Cliente',
        href: 'https://www.amazon.com.br/hz/contact-us/foresight/hubgateway?ref_=nav_em_cs_help_0_1_1_51',
      },
      {
        label: 'Sua conta',
        href: 'https://www.amazon.com.br/gp/css/homepage.html?ref_=nav_em_ya_0_1_1_52',
      },
      { label: 'Sair', href: 'javascript:void(0)' },
    ],
  },
];

/**
 * The navbar's "Todos" trigger and the left slide-in panel it opens (Amazon's
 * "hmenu"). Client component for the open/close state; the greeting name is
 * resolved on the server by AmazonHeader.
 */
export function AllMenu({ firstName }: { firstName?: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const trigger = triggerRef.current;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKeyDown);
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="az-navbar__link az-navbar__link--all"
        aria-expanded={open}
        aria-controls="az-all-menu"
        onClick={() => setOpen((value) => !value)}
      >
        <MenuIcon />
        Todos
      </button>

      {open && (
        <div className="az-all-menu" data-testid="az-all-menu-overlay" onClick={() => setOpen(false)}>
          <div
            ref={panelRef}
            id="az-all-menu"
            className="az-all-menu__panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menu Todos"
            tabIndex={-1}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="az-all-menu__header">
              <UserIcon />
              Olá, {firstName ?? 'faça seu login'}
            </div>

            <div className="az-all-menu__content">
              {ALL_MENU_SECTIONS.map((section) => (
                <section key={section.title} className="az-all-menu__section">
                  <h2 className="az-all-menu__title">{section.title}</h2>
                  <ul className="az-all-menu__list">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a href={link.href} className="az-all-menu__link">
                          {link.label}
                          {section.submenu && link.label !== 'Ver tudo' && <ChevronIcon />}
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="az-all-menu__close"
            aria-label="Fechar menu"
            onClick={() => setOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>
      )}
    </>
  );
}

function MenuIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M3 6h18M3 12h18M3 18h18" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="currentColor">
      <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.4 0-8 2.2-8 5v2h16v-2c0-2.8-3.6-5-8-5Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="26"
      height="26"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
    >
      <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
    </svg>
  );
}
