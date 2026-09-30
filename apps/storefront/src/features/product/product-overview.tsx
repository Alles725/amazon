import Image from 'next/image';
import Link from 'next/link';
import type { CatalogItem } from '@amazon-mvp/api-contract';
import { formatCartMoney } from '@/features/cart/money';
import { PixPrice } from '@/features/checkout/pix-price';
import type { ProductContent } from './product-content';
import { ProductPrice } from './product-price';
import { ProductStars } from './product-stars';
import {
  discountPercent,
  formatRating,
  installmentPlan,
  type VariantDimension,
} from './product-rules';

export function ProductOverview({
  product,
  content,
  dimensions,
  brandHref,
  pixDiscountPercent = null,
}: {
  product: CatalogItem;
  content: ProductContent;
  dimensions: VariantDimension[];
  brandHref?: string;
  /** Rate from the API's checkout config (GET /orders/pricing); null = not advertised. */
  pixDiscountPercent?: number | null;
}) {
  const discount = discountPercent(product.priceMinor, content.oldPriceMinor);
  const plan =
    content.installments && installmentPlan(product.priceMinor, content.installments.count);
  return (
    <section className="az-pdp-info" aria-label="Informações do produto">
      <h1 id="product-title">{product.name}</h1>
      {content.brand && (
        <p className="az-pdp-brand">
          {brandHref ? (
            <Link href={brandHref}>Marca: {content.brand}</Link>
          ) : (
            <>Marca: {content.brand}</>
          )}
        </p>
      )}
      {content.attributes.map((attribute) => (
        <p key={attribute.label} className="az-pdp-attribute">
          <strong>{attribute.label}</strong> : {attribute.value}
        </p>
      ))}
      {content.rating && (
        <p className="az-pdp-rating">
          <span aria-hidden="true">{formatRating(content.rating.average)}</span>
          <ProductStars rating={content.rating.average} />
          <a
            href="#customer-reviews"
            aria-label={`${content.rating.count.toLocaleString('pt-BR')} avaliações de clientes`}
          >
            ({content.rating.count.toLocaleString('pt-BR')})
          </a>
        </p>
      )}
      {content.badges.amazonChoice && <p className="az-pdp-choice">Escolha da Amazon</p>}
      {content.badges.boughtLastMonth && (
        <p className="az-pdp-bought-count">
          <strong>{content.badges.boughtLastMonth}</strong> no mês passado
        </p>
      )}

      <div className="az-pdp-pricing">
        <p className="az-pdp-pricing__main">
          {discount && <span className="az-pdp-discount">-{discount}%</span>}
          <ProductPrice amount={product.priceMinor} currency={product.currency} />
        </p>
        {product.active && (
          <PixPrice
            amountMinor={product.priceMinor}
            currency={product.currency}
            percent={pixDiscountPercent}
          />
        )}
        {content.oldPriceMinor && discount && (
          <p className="az-pdp-muted">
            De: <del>{formatCartMoney(content.oldPriceMinor, product.currency)}</del>
          </p>
        )}
        {plan && (
          <p className="az-pdp-installments">
            ou em até{' '}
            <strong>
              {plan.count}x de {formatCartMoney(plan.eachMinor, product.currency)} sem juros
            </strong>
          </p>
        )}
        <p>
          <Link className="az-pdp-link" href="/payment-methods">
            Ver opções de pagamento
          </Link>
        </p>
      </div>

      <div className="az-pdp-benefits">
        <p>
          <Link href="/credit-card">
            Ganhe pontos nesta compra com o cartão Amazon: peça o seu com anuidade zero e vantagens
            exclusivas.
          </Link>
        </p>
        <ul aria-label="Benefícios">
          <li>
            <Link href="/payment-methods">
              <BenefitIcon kind="secure" />
              Pagamentos e Segurança
            </Link>
          </li>
          {content.fulfillment?.shippedBy === 'Amazon' && (
            <li>
              <Link href="/shipping">
                <BenefitIcon kind="shipping" />
                Enviado pela Amazon
              </Link>
            </li>
          )}
          {content.fulfillment?.returns && (
            <li>
              <Link href="/returns">
                <BenefitIcon kind="returns" />
                Política de devolução
              </Link>
            </li>
          )}
        </ul>
      </div>

      {dimensions.length > 0 && <ProductVariants dimensions={dimensions} />}

      {content.bullets.length > 0 && (
        <div className="az-pdp-about">
          <h2>Sobre este item</h2>
          <ul>
            {content.bullets.map((bullet) => (
              <li key={bullet}>{bullet}</li>
            ))}
          </ul>
        </div>
      )}
      {(content.details.length > 0 || product.description) && (
        <a className="az-pdp-link az-pdp-more" href="#product-details">
          › Ver mais detalhes do produto
        </a>
      )}
    </section>
  );
}

/** Each choice is a link to the variant's own catalog record, so image, price,
 * stock, cart line and URL all switch together. */
function ProductVariants({ dimensions }: { dimensions: VariantDimension[] }) {
  return (
    <div className="az-pdp-variants">
      {dimensions.map((dimension) => (
        <div key={dimension.name} className="az-pdp-variant">
          <p>
            {dimension.name}: <strong>{dimension.selected}</strong>
          </p>
          {dimension.choices.length > 1 && (
            <ul aria-label={`Escolher ${dimension.name.toLowerCase()}`}>
              {dimension.choices.map((choice) => {
                const { product, image } = choice.member;
                const label = `${dimension.name} ${choice.value}, ${formatCartMoney(product.priceMinor, product.currency)}${product.inStock ? '' : ', indisponível'}`;
                const className = `az-pdp-swatch${choice.selected ? ' az-pdp-swatch--selected' : ''}${product.inStock ? '' : ' az-pdp-swatch--unavailable'}${image ? '' : ' az-pdp-swatch--text'}`;
                return (
                  <li key={choice.value}>
                    <Link
                      href={`/products/${encodeURIComponent(product.slug)}`}
                      scroll={false}
                      className={className}
                      aria-label={label}
                      aria-current={choice.selected ? 'true' : undefined}
                      title={choice.value}
                    >
                      {image ? (
                        <Image src={image.src} alt="" width={64} height={64} />
                      ) : (
                        <span>{choice.value}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

function BenefitIcon({ kind }: { kind: 'secure' | 'shipping' | 'returns' }) {
  const paths = {
    secure: 'M7 11V8a5 5 0 0 1 10 0v3M6 11h12v9H6zM12 14v3',
    shipping: 'M3 7h11v9H3zM14 10h4l3 3v3h-7M7 19a2 2 0 1 0 0-.01M17 19a2 2 0 1 0 0-.01',
    returns: 'M4 12a8 8 0 1 0 3-6.3M4 4v4h4',
  };
  return (
    <span className="az-pdp-benefit-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="22" height="22">
        <path
          d={paths[kind]}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
