import Link from 'next/link';
import type { PreviousPurchase } from './product-rules';
import { formatPurchaseDate } from './product-rules';

/** Built from the signed-in user's persisted orders; never rendered without one. */
export function PurchaseNotice({
  purchase,
  options,
  reviewHref,
}: {
  purchase: PreviousPurchase;
  /** Variant options of the purchased catalog record (may be another color). */
  options: Array<{ name: string; value: string }>;
  reviewHref: string;
}) {
  return (
    <section className="az-pdp-bought" aria-label="Compra anterior">
      <div>
        <p className="az-pdp-bought__title">
          <span className="az-pdp-bought__icon" aria-hidden="true">
            i
          </span>
          Você comprou este produto pela última vez em {formatPurchaseDate(purchase.order.placedAt)}
        </p>
        <p className="az-pdp-bought__meta">
          {options.map((option) => (
            <span key={option.name}>
              {option.name}: <strong>{option.value}</strong>
            </span>
          ))}
          <Link href={`/orders/${encodeURIComponent(purchase.order.id)}`}>Ver pedido</Link>
        </p>
      </div>
      <nav aria-label="Ações da compra anterior">
        <Link href={reviewHref}>Incluir avaliação</Link>
        <Link href="/help">Suporte ao produto</Link>
      </nav>
    </section>
  );
}

/** Each level links to its category listing when `hrefFor` is given (the product page
 * passes it while the catalog listing is enabled); otherwise levels render as text. */
export function ProductBreadcrumb({
  path,
  hrefFor,
}: {
  path: Array<{ slug: string; name: string }>;
  hrefFor?: (slug: string) => string;
}) {
  if (!path.length) return null;
  return (
    <nav className="az-pdp-breadcrumb" aria-label="Categorias do produto">
      <ol>
        {path.map((category, index) => (
          <li key={category.slug}>
            {index > 0 && (
              <span className="az-pdp-breadcrumb__sep" aria-hidden="true">
                ›
              </span>
            )}
            {hrefFor ? (
              <Link href={hrefFor(category.slug)}>{category.name}</Link>
            ) : (
              <span>{category.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Visual only: Prime is not implemented, the link opens the Prime placeholder route. */
export function PrimeUpsell() {
  return (
    <section className="az-pdp-prime" aria-label="Amazon Prime">
      <p className="az-pdp-prime__logo" aria-hidden="true">
        prime
      </p>
      <p>Aproveite frete GRÁTIS e rápido, ofertas exclusivas, Prime Video e muito mais.</p>
      <Link href="/prime">Assine o Amazon Prime</Link>
    </section>
  );
}
