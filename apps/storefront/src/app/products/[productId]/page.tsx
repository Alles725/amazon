import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CatalogPage, CatalogProductDetails } from '@amazon-mvp/api-contract';
import { FeatureRoute, isFeatureEnabled } from '@/config/feature-gate';
import { getConfig } from '@/config/storefront-config';
import {
  normalizeProductDetails,
  productPresentation,
} from '@/features/product/product-presentation';
import { formatCartMoney } from '@/features/cart/money';
import { ProductGallery } from '@/features/product/product-gallery';
import { ProductPurchase } from '@/features/product/product-purchase';
import { ProductPrice } from '@/features/product/product-price';
import { HorizontalRail } from '@/components/amazon/horizontal-rail';
import { ProductCard } from '@/components/amazon/product-card';

export default async function ProductDetailPage({ params }: { params: { productId: string } }) {
  if (!isFeatureEnabled('productDetails'))
    return (
      <FeatureRoute routeKey="productDetails" title="Produto">
        {null}
      </FeatureRoute>
    );
  const config = getConfig();
  const base = `${config.api.internalBaseUrl}${config.api.publicBasePath}/catalog/products`;
  const response = await fetch(`${base}/${encodeURIComponent(params.productId)}`, {
    cache: 'no-store',
  });
  if (response.status === 404) notFound();
  if (!response.ok) throw new Error('Product catalog unavailable');
  const product = normalizeProductDetails((await response.json()) as CatalogProductDetails);
  const presentation = productPresentation(product);
  // Same-category catalog selection, not personalized recommendations or fabricated history.
  const pages = await Promise.all(
    product.categories.map(async (category) => {
      try {
        const related = await fetch(
          `${base}?pageSize=12&category=${encodeURIComponent(category.slug)}`,
          { cache: 'no-store' },
        );
        return related.ok ? ((await related.json()) as CatalogPage).items : [];
      } catch {
        return [];
      }
    }),
  );
  const related = [
    ...new Map(
      pages
        .flat()
        .filter((item) => item.id !== product.id)
        .map((item) => [item.id, item]),
    ).values(),
  ].slice(0, 12);

  return (
    <main className="az-detail-main">
      <nav className="az-detail-breadcrumb" aria-label="Localização do produto">
        <Link href="/">Página inicial</Link>
        <span aria-hidden="true">›</span>
        <span>{product.categories.map((category) => category.name).join(' / ') || 'Produtos'}</span>
      </nav>
      <div className="az-detail-layout">
        <ProductGallery
          key={`gallery-${product.id}`}
          name={product.name}
          images={presentation.images}
        />
        <section className="az-detail-info" aria-label="Informações do produto">
          <h1>{product.name}</h1>
          {presentation.demo && <p className="az-detail-muted">Produto de demonstração</p>}
          <p className="az-detail-muted">Sem avaliações</p>
          <a className="az-detail-spec-link" href="#product-specifications">
            Ver detalhes do produto
          </a>
          <div className="az-detail-info__price">
            <ProductPrice amount={product.priceMinor} currency={product.currency} />
            {presentation.oldPriceMinor && (
              <p className="az-detail-muted">
                De: <del>{formatCartMoney(presentation.oldPriceMinor, product.currency)}</del>
              </p>
            )}
          </div>
          <dl className="az-detail-highlights">
            {product.sku && (
              <div>
                <dt>Código do produto</dt>
                <dd>{product.sku}</dd>
              </div>
            )}
            {product.categories.length > 0 && (
              <div>
                <dt>Categoria</dt>
                <dd>{product.categories.map((category) => category.name).join(', ')}</dd>
              </div>
            )}
          </dl>
          {product.description ? (
            <div className="az-detail-description">
              <h2>Sobre este item</h2>
              <p>{product.description}</p>
            </div>
          ) : (
            <p className="az-detail-muted">Descrição não disponível.</p>
          )}
        </section>
        <ProductPurchase
          key={`purchase-${product.id}`}
          product={product}
          cartEnabled={isFeatureEnabled('cart')}
        />
      </div>
      {related.length > 0 && (
        <section className="az-detail-section" aria-label="Produtos da mesma categoria">
          <h2>Explore produtos da mesma categoria</h2>
          <HorizontalRail label="Produtos da mesma categoria" className="az-detail-product-rail">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} compact />
            ))}
          </HorizontalRail>
        </section>
      )}
      <section className="az-detail-section" id="product-specifications">
        <h2>Detalhes e especificações do produto</h2>
        <div className="az-detail-specifications">
          <table>
            <caption>Informações do produto</caption>
            <tbody>
              <tr>
                <th scope="row">Nome</th>
                <td>{product.name}</td>
              </tr>
              {product.sku && (
                <tr>
                  <th scope="row">Código do produto</th>
                  <td>{product.sku}</td>
                </tr>
              )}
              {product.categories.length > 0 && (
                <tr>
                  <th scope="row">Categorias</th>
                  <td>{product.categories.map((category) => category.name).join(', ')}</td>
                </tr>
              )}
            </tbody>
          </table>
          {product.description && (
            <div>
              <h3>Descrição do produto</h3>
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
