import Link from 'next/link';
import { ProductImage } from '@/components/amazon/product-image';
import { HelpTopics } from './help-topics';
import { CS_NAV, HERO_ACTIONS, QUICK_LINKS } from './help-content';
import { RecentProduct, formatOrderDate } from './recent-products';

/** "amazon customer service" bar — only rendered inside the help area. */
export function CustomerServiceBar({ currentHref }: { currentHref: string }) {
  return (
    <nav className="az-cs-bar" aria-label="Atendimento ao Cliente">
      <Link href="/help" className="az-cs-bar__logo" aria-label="amazon customer service">
        <CustomerServiceLogo />
      </Link>
      <span className="az-cs-bar__divider" aria-hidden="true" />
      <ul className="az-cs-bar__links">
        {CS_NAV.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="az-cs-bar__link"
              aria-current={link.href === currentHref ? 'page' : undefined}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Customer-service body — everything between the header and the footer. */
export function HelpCenter({
  firstName,
  products,
}: {
  firstName?: string;
  products: RecentProduct[];
}) {
  return (
    <main className="az-help">
      <section className="az-help__hero" aria-labelledby="az-help-title">
        <div className="az-help__inner">
          {products.length ? (
            <>
              <h1 id="az-help-title" className="az-help__title">
                Você precisa de ajuda com um produto recente{firstName ? `, ${firstName}` : ''}?
              </h1>
              <p className="az-help__subtitle">
                Selecione abaixo o produto com o qual você precisa de ajuda ou obtenha ajuda com
                outra coisa.
              </p>

              <ul className="az-help__products" aria-label="Produtos recentes">
                {products.map((product) => (
                  <li key={product.key}>
                    <Link href={product.href} className="az-help__product">
                      <span className="az-help__product-media">
                        <ProductImage image={product.image} />
                      </span>
                      <span className="az-help__product-text">
                        <span className="az-help__product-name">{product.name}</span>
                        <span className="az-help__product-date">
                          Pedido em {formatOrderDate(product.orderedAt)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            // No placed orders (or signed out): no product cards, never placeholders.
            <>
              <h1 id="az-help-title" className="az-help__title">
                Bem-vindo ao Atendimento ao Cliente da Amazon{firstName ? `, ${firstName}` : ''}
              </h1>
              <p className="az-help__subtitle">
                Como podemos ajudar? Escolha uma opção abaixo ou pesquise na biblioteca de ajuda.
              </p>
            </>
          )}

          <div className="az-help__actions">
            {HERO_ACTIONS.map((action) => (
              <Link key={action.label} href={action.href} className="az-help__action">
                {action.label}
              </Link>
            ))}
          </div>

          <div className="az-help__quick">
            <div className="az-help__quick-intro">
              <p className="az-help__quick-heading">Tem dúvidas sobre suas compras?</p>
              <Link href="/orders" className="az-help__quick-all">
                Revisar tudo <span aria-hidden="true">→</span>
              </Link>
            </div>
            <ul className="az-help__quick-links">
              {QUICK_LINKS.map((link) => (
                <li key={link.title}>
                  <Link href={link.href} className="az-help__quick-link">
                    <span className="az-help__quick-title">{link.title}</span>
                    <span className="az-help__quick-body">{link.body}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <BoxesIllustration />
          </div>
        </div>
      </section>

      <HelpTopics />
    </main>
  );
}

// HTML text (not SVG) so the wordmark never clips when the font width varies.
function CustomerServiceLogo() {
  return (
    <span className="az-cs-bar__brand" aria-hidden="true">
      <span className="az-cs-bar__amazon">
        amazon
        <svg viewBox="0 0 44 10" width="44" height="10">
          <path
            d="M3 2.5c9 4.5 26 5 37-1"
            fill="none"
            stroke="#fff"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <path d="M36.5 0 41 1.3l-3 3.4Z" fill="#fff" />
        </svg>
      </span>{' '}
      customer service
    </span>
  );
}

/** Stand-in for the reference's stacked-parcels illustration. */
function BoxesIllustration() {
  return (
    <span className="az-help__quick-art" aria-hidden="true">
      <svg viewBox="0 0 80 80" width="80" height="80">
        <rect width="80" height="80" rx="6" fill="#37a6e4" />
        <path d="M14 48h28v22H14z" fill="#c8894b" />
        <path d="M14 48l6-7h28l-6 7z" fill="#e2a868" />
        <path d="M42 48l6-7v22l-6 7z" fill="#a86f38" />
        <path d="M34 26h28v20H34z" fill="#d6975a" />
        <path d="M34 26l6-6h28l-6 6z" fill="#efbb7f" />
        <path d="M62 26l6-6v20l-6 6z" fill="#b37a43" />
        <path d="M44 56h24v16H44z" fill="#c8894b" />
        <path d="M44 56l5-5h24l-5 5z" fill="#e2a868" />
        <path d="M68 56l5-5v16l-5 5z" fill="#a86f38" />
        <path d="M20 60c4 2.5 12 2.5 16 0" fill="none" stroke="#232f3e" strokeWidth="1.6" />
        <path d="M50 64c3 2 9 2 12 0" fill="none" stroke="#232f3e" strokeWidth="1.4" />
        <path d="M40 36c4 2.5 12 2.5 16 0" fill="none" stroke="#232f3e" strokeWidth="1.6" />
      </svg>
    </span>
  );
}
