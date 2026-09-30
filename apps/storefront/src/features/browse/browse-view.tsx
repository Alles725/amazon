import Link from 'next/link';
import { CATALOG_SORTS, type CatalogFacets } from '@amazon-mvp/api-contract';
import { ProductCard } from '@/components/amazon/product-card';
import {
  departmentFacet,
  lastPage,
  listingTitle,
  pageWindow,
  resultsSummary,
  type BrandOption,
  type CategoryTree,
} from './browse-model';
import {
  browseHref,
  priceLabel,
  priceParam,
  SORT_LABELS,
  type BrowseParams,
} from './browse-params';
import { BROWSE_PAGE_SIZE, loadBrowse, type BrowseData } from './browse-server';
import { FiltersToggle } from './filters-toggle';
import { SortSelect } from './sort-select';

/** The result area of /products (bar, filters, grid, pagination) for one URL. */
export async function BrowseResults({ params }: { params: BrowseParams }) {
  if (!params.pageValid)
    return (
      <BrowseMessage
        title="Página inválida"
        body="O número da página informado não existe."
        action={{ href: browseHref(params), label: 'Ir para a primeira página' }}
      />
    );
  let data: BrowseData;
  try {
    data = await loadBrowse(params);
  } catch {
    return (
      <BrowseMessage
        alert
        title="Não foi possível carregar os produtos"
        body="O catálogo não respondeu. Tente novamente em instantes."
        action={{ href: browseHref(params, { page: params.page }), label: 'Tentar novamente' }}
      />
    );
  }
  if (data.kind === 'unknown-category')
    return (
      <BrowseMessage
        title="Categoria não encontrada"
        body="Esta categoria não existe ou foi removida do catálogo."
        action={{ href: '/products', label: 'Ver todos os produtos' }}
      />
    );
  if (data.kind === 'unknown-brand')
    return (
      <BrowseMessage
        title="Marca não encontrada"
        body="Não há produtos desta marca no catálogo."
        action={{ href: '/products', label: 'Ver todos os produtos' }}
      />
    );

  const { page, facets, tree, brands, brandName } = data;
  const categoryName = params.category ? tree.bySlug.get(params.category)?.name : undefined;
  const title = listingTitle({ q: params.q, categoryName, brandName });
  const last = lastPage(page.total, BROWSE_PAGE_SIZE);
  const refined = Boolean(params.price || params.inStock);
  const filtered = Boolean(refined || params.brand || params.category);

  return (
    <>
      <div className="az-browse-bar">
        <p className="az-browse-bar__summary" role="status">
          {page.total > 0 && params.page <= last
            ? resultsSummary(params.page, BROWSE_PAGE_SIZE, page.total)
            : `${page.total.toLocaleString('pt-BR')} resultados`}
          {params.q && (
            <>
              {' para '}
              <span className="az-browse-bar__query">“{params.q}”</span>
            </>
          )}
        </p>
        {page.total > 0 && (
          <SortSelect
            value={params.sort}
            options={CATALOG_SORTS.map((sort) => ({
              value: sort,
              label: SORT_LABELS[sort],
              href: browseHref(params, { sort }),
            }))}
            hidden={hiddenFields(params)}
          />
        )}
      </div>

      <div className="az-browse">
        {facets.total > 0 && (
          <FiltersToggle
            active={
              [params.category, params.brand, params.price, params.inStock].filter(Boolean).length
            }
          >
            <BrowseSidebar params={params} tree={tree} facets={facets} brands={brands} />
          </FiltersToggle>
        )}

        <section className="az-browse-results" aria-labelledby="az-browse-title">
          <h1 id="az-browse-title" className="az-browse-results__title">
            {title}
          </h1>
          {page.total === 0 ? (
            <div className="az-browse-empty">
              <p className="az-browse-empty__title">
                {params.q ? `Nenhum resultado para “${params.q}”` : 'Nenhum produto encontrado'}
                {filtered ? ' com os filtros selecionados' : ''}.
              </p>
              <ul>
                {params.q && <li>Verifique a ortografia ou use termos mais gerais.</li>}
                {refined && (
                  <li>
                    <Link href={browseHref(params, { price: null, inStock: false })}>
                      Remover filtros de preço e disponibilidade
                    </Link>
                  </li>
                )}
                {filtered && (
                  <li>
                    <Link
                      href={browseHref(params, {
                        category: '',
                        brand: '',
                        price: null,
                        inStock: false,
                      })}
                    >
                      Limpar todos os filtros
                    </Link>
                  </li>
                )}
                <li>
                  <Link href="/products">Ver todos os produtos</Link>
                </li>
              </ul>
            </div>
          ) : params.page > last ? (
            <div className="az-browse-empty">
              <p className="az-browse-empty__title">A página {params.page} não existe.</p>
              <p>
                Estes resultados vão até a página {last}.{' '}
                <Link href={browseHref(params, { page: 1 })}>Ir para a primeira página</Link>
              </p>
            </div>
          ) : (
            <>
              <ul className="az-browse-grid">
                {page.items.map((item) => (
                  <li key={item.id}>
                    <ProductCard product={item} freeDelivery availability />
                  </li>
                ))}
              </ul>
              {last > 1 && <Pagination params={params} last={last} />}
            </>
          )}
        </section>
      </div>
    </>
  );
}

/** Current filters as GET fields, for the no-JavaScript sort form. */
function hiddenFields(params: BrowseParams): Array<[string, string]> {
  const fields: Array<[string, string]> = [];
  if (params.q) fields.push(['q', params.q]);
  if (params.category) fields.push(['category', params.category]);
  if (params.brand) fields.push(['brand', params.brand]);
  if (params.price) fields.push(['price', priceParam(params.price)]);
  if (params.inStock) fields.push(['inStock', '1']);
  return fields;
}

function BrowseSidebar({
  params,
  tree,
  facets,
  brands,
}: {
  params: BrowseParams;
  tree: CategoryTree;
  facets: CatalogFacets;
  brands: BrandOption[];
}) {
  const departments = departmentFacet(tree, facets.categories, params.category);
  const prices = facets.priceBuckets
    .filter((bucket) => bucket.count > 0)
    .map((bucket) => ({
      range: { min: bucket.minMinor, max: bucket.maxMinor },
      count: bucket.count,
    }));
  const isPrice = (range: { min: number; max: number | null }) =>
    params.price?.min === range.min && params.price?.max === range.max;
  const showStock = params.inStock || (facets.inStock > 0 && facets.inStock < facets.total);
  const [topBrands, moreBrands] = [brands.slice(0, 8), brands.slice(8)];
  const brandLink = (brand: BrandOption) => {
    const selected = brand.key === params.brand;
    return (
      <li key={brand.key}>
        <Link
          href={browseHref(params, { brand: selected ? '' : brand.key })}
          className="az-browse-check"
          aria-current={selected ? 'true' : undefined}
        >
          <span className="az-browse-check__box" aria-hidden="true">
            {selected ? '✓' : ''}
          </span>
          {brand.name} <span className="az-browse-count">({brand.count})</span>
        </Link>
      </li>
    );
  };

  return (
    <nav className="az-browse-sidebar" aria-label="Filtros de resultados">
      {(departments.selected || departments.options.length > 0) && (
        <section className="az-browse-facet" aria-labelledby="az-facet-department">
          <h2 id="az-facet-department">Departamento</h2>
          <ul>
            {departments.selected && (
              <li>
                <Link href={browseHref(params, { category: '' })} className="az-browse-back">
                  <span aria-hidden="true">‹ </span>Qualquer departamento
                </Link>
              </li>
            )}
            {departments.trail.map((node) => (
              <li key={node.slug}>
                <Link href={browseHref(params, { category: node.slug })} className="az-browse-back">
                  <span aria-hidden="true">‹ </span>
                  {node.name}
                </Link>
              </li>
            ))}
            {departments.selected && (
              <li>
                <span className="az-browse-selected" aria-current="true">
                  {departments.selected.name}
                </span>
              </li>
            )}
            {departments.options.map(({ node, count }) => (
              <li key={node.slug} className={departments.selected ? 'az-browse-child' : undefined}>
                <Link href={browseHref(params, { category: node.slug })}>
                  {node.name} <span className="az-browse-count">({count})</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {brands.length > 0 && (
        <section className="az-browse-facet" aria-labelledby="az-facet-brand">
          <h2 id="az-facet-brand">Marcas</h2>
          {params.brand && (
            <Link href={browseHref(params, { brand: '' })} className="az-browse-clear">
              <span aria-hidden="true">‹ </span>Limpar
            </Link>
          )}
          <ul>{topBrands.map(brandLink)}</ul>
          {moreBrands.length > 0 && (
            <details
              className="az-browse-more"
              open={moreBrands.some((b) => b.key === params.brand)}
            >
              <summary>Ver mais {moreBrands.length} marcas</summary>
              <ul>{moreBrands.map(brandLink)}</ul>
            </details>
          )}
        </section>
      )}

      {prices.length > 0 && (
        <section className="az-browse-facet" aria-labelledby="az-facet-price">
          <h2 id="az-facet-price">Preço</h2>
          {params.price && (
            <Link href={browseHref(params, { price: null })} className="az-browse-clear">
              <span aria-hidden="true">‹ </span>Qualquer preço
            </Link>
          )}
          <ul>
            {prices.map(({ range, count }) => (
              <li key={priceParam(range)}>
                {isPrice(range) ? (
                  <span className="az-browse-selected" aria-current="true">
                    {priceLabel(range)}
                  </span>
                ) : (
                  <Link href={browseHref(params, { price: range })}>
                    {priceLabel(range)} <span className="az-browse-count">({count})</span>
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {showStock && (
        <section className="az-browse-facet" aria-labelledby="az-facet-stock">
          <h2 id="az-facet-stock">Disponibilidade</h2>
          <ul>
            <li>
              <Link
                href={browseHref(params, { inStock: !params.inStock })}
                className="az-browse-check"
                aria-current={params.inStock ? 'true' : undefined}
              >
                <span className="az-browse-check__box" aria-hidden="true">
                  {params.inStock ? '✓' : ''}
                </span>
                Em estoque <span className="az-browse-count">({facets.inStock})</span>
              </Link>
            </li>
          </ul>
        </section>
      )}
    </nav>
  );
}

function Pagination({ params, last }: { params: BrowseParams; last: number }) {
  const current = params.page;
  return (
    <nav className="az-browse-pages" aria-label="Paginação">
      <ul>
        <li>
          {current > 1 ? (
            <Link href={browseHref(params, { page: current - 1 })} rel="prev">
              <span aria-hidden="true">‹ </span>Anterior
            </Link>
          ) : (
            <span className="az-browse-pages__disabled" aria-disabled="true">
              <span aria-hidden="true">‹ </span>Anterior
            </span>
          )}
        </li>
        {pageWindow(current, last).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className="az-browse-pages__gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              {item === current ? (
                <span className="az-browse-pages__current" aria-current="page">
                  {item}
                </span>
              ) : (
                <Link href={browseHref(params, { page: item })} aria-label={`Página ${item}`}>
                  {item}
                </Link>
              )}
            </li>
          ),
        )}
        <li>
          {current < last ? (
            <Link href={browseHref(params, { page: current + 1 })} rel="next">
              Próximo<span aria-hidden="true"> ›</span>
            </Link>
          ) : (
            <span className="az-browse-pages__disabled" aria-disabled="true">
              Próximo<span aria-hidden="true"> ›</span>
            </span>
          )}
        </li>
      </ul>
    </nav>
  );
}

function BrowseMessage({
  title,
  body,
  action,
  alert = false,
}: {
  title: string;
  body: string;
  action: { href: string; label: string };
  alert?: boolean;
}) {
  return (
    <div className="az-browse az-browse--message">
      <section className="az-browse-results" role={alert ? 'alert' : undefined}>
        <h1 className="az-browse-results__title">{title}</h1>
        <p>{body}</p>
        <p>
          <Link href={action.href} className="az-browse-button">
            {action.label}
          </Link>
        </p>
      </section>
    </div>
  );
}

/** Streaming placeholder while a result page loads (keyed per URL in the page). */
export function BrowseSkeleton() {
  return (
    <div className="az-browse az-browse--loading" aria-busy="true">
      <p role="status" className="visually-hidden">
        Carregando resultados…
      </p>
      <div className="az-browse-skeleton az-browse-skeleton--sidebar" aria-hidden="true" />
      <ul className="az-browse-grid" aria-hidden="true">
        {Array.from({ length: 8 }, (_, index) => (
          <li key={index} className="az-browse-skeleton az-browse-skeleton--card" />
        ))}
      </ul>
    </div>
  );
}
