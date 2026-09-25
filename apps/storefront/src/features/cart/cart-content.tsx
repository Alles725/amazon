'use client';

import Link from 'next/link';
import { CatalogItem, MAX_CART_QUANTITY } from '@amazon-mvp/api-contract';
import { HorizontalRail } from '@/components/amazon/horizontal-rail';
import { ProductCard } from '@/components/amazon/product-card';
import { ProductImage } from '@/components/amazon/product-image';
import { useCart } from './cart-provider';
import { formatCartMoney } from './money';

export function CartContent({
  products,
  catalogFailed,
  checkoutEnabled,
}: {
  products: CatalogItem[];
  catalogFailed: boolean;
  checkoutEnabled: boolean;
}) {
  const { cart, status, pending, error, notice, refresh, add, update, remove, clear } = useCart();
  const hasItems = status === 'ready' && Boolean(cart?.lines.length);
  const count = cart?.itemCount ?? 0;
  const total = formatCartMoney(cart?.subtotalMinor ?? 0, cart?.currency);
  const unavailable = cart?.lines.some(
    (line) => !line.product.active || line.quantity > line.product.availableQuantity,
  );
  const subtotal = (
    <>
      Subtotal ({count} {count === 1 ? 'item' : 'itens'}): <strong>{total}</strong>
    </>
  );

  return (
    <>
      <main className="az-cart-main" aria-label="Carrinho de compras">
        <div className="az-cart-feedback" aria-live="polite" role="status">
          {notice}
        </div>
        {error && (
          <div className="az-cart-error" role="alert">
            {error}{' '}
            {status !== 'guest' && (
              <button type="button" onClick={() => void refresh()} disabled={pending}>
                Tentar novamente
              </button>
            )}
          </div>
        )}
        <div className={`az-cart-layout${hasItems ? ' az-cart-layout--filled' : ''}`}>
          <div className="az-cart-primary">
            {status === 'loading' ? (
              <section className="az-cart-panel" aria-busy="true">
                <h1>Seu carrinho</h1>
                <p>Carregando seus produtos…</p>
              </section>
            ) : status === 'error' ? (
              <section className="az-cart-panel">
                <h1>Seu carrinho</h1>
                <p>
                  Não foi possível carregar os itens. Tente novamente para consultar seu carrinho.
                </p>
              </section>
            ) : !hasItems ? (
              <section className="az-cart-panel az-cart-empty">
                <h1>Seu carrinho está vazio</h1>
                <p>Encontre o que você precisa e adicione seus produtos ao carrinho.</p>
                <p>
                  Continue comprando na <Link href="/">página inicial</Link> ou explore os{' '}
                  <a href="#cart-products">produtos disponíveis abaixo</a>.
                </p>
                {status === 'guest' && (
                  <div className="az-cart-signin">
                    <Link href="/login" className="az-cart-button">
                      Entre na sua conta
                    </Link>
                    <Link href="/register" className="az-cart-button az-cart-button--secondary">
                      Crie sua conta
                    </Link>
                    <p>Entre para consultar e salvar os itens do seu carrinho.</p>
                  </div>
                )}
              </section>
            ) : (
              <section className="az-cart-panel az-cart-items" aria-busy={pending}>
                <div className="az-cart-heading">
                  <h1>Carrinho de compras</h1>
                  <button
                    className="az-cart-text-button"
                    type="button"
                    disabled={pending}
                    onClick={() => void clear()}
                  >
                    Esvaziar carrinho
                  </button>
                </div>
                <div className="az-cart-price-label">Preço</div>
                <ul className="az-cart-list">
                  {cart?.lines.map((line) => (
                    <li
                      key={line.productId}
                      className="az-cart-item"
                      aria-label={line.product.name}
                    >
                      <div className="az-cart-item__image">
                        <ProductImage />
                      </div>
                      <div className="az-cart-item__details">
                        <h2>{line.product.name}</h2>
                        <p
                          className={`az-cart-stock${!line.product.inStock || line.quantity > line.product.availableQuantity ? ' az-cart-stock--unavailable' : ''}`}
                        >
                          {!line.product.inStock
                            ? 'Indisponível no momento'
                            : line.quantity > line.product.availableQuantity
                              ? 'Quantidade selecionada indisponível'
                              : 'Em estoque'}
                        </p>
                        {line.product.description && (
                          <p className="az-cart-description">{line.product.description}</p>
                        )}
                        <div className="az-cart-item__actions">
                          <div
                            className="az-cart-quantity"
                            role="group"
                            aria-label={`Quantidade de ${line.product.name}`}
                          >
                            <button
                              type="button"
                              aria-label={`Diminuir quantidade de ${line.product.name}`}
                              disabled={pending || line.quantity <= 1}
                              onClick={() => void update(line.productId, line.quantity - 1)}
                            >
                              −
                            </button>
                            <label>
                              <span className="visually-hidden">
                                Quantidade de {line.product.name}
                              </span>
                              <select
                                value={line.quantity}
                                disabled={pending}
                                onChange={(event) =>
                                  void update(line.productId, Number(event.target.value))
                                }
                              >
                                {Array.from(
                                  {
                                    length: Math.max(
                                      line.quantity,
                                      Math.min(MAX_CART_QUANTITY, line.product.availableQuantity),
                                    ),
                                  },
                                  (_, index) => index + 1,
                                ).map((quantity) => (
                                  <option key={quantity} value={quantity}>
                                    {quantity}
                                  </option>
                                ))}
                              </select>
                            </label>
                            <button
                              type="button"
                              aria-label={`Aumentar quantidade de ${line.product.name}`}
                              disabled={
                                pending ||
                                line.quantity >=
                                  Math.min(MAX_CART_QUANTITY, line.product.availableQuantity)
                              }
                              onClick={() => void update(line.productId, line.quantity + 1)}
                            >
                              +
                            </button>
                          </div>
                          <button
                            type="button"
                            className="az-cart-text-button"
                            aria-label={`Excluir ${line.product.name}`}
                            disabled={pending}
                            onClick={() => void remove(line.productId)}
                          >
                            Excluir
                          </button>
                        </div>
                      </div>
                      <div className="az-cart-item__price">
                        <strong>
                          {formatCartMoney(line.unitPriceMinor, line.product.currency)}
                        </strong>
                        <span>
                          Subtotal: {formatCartMoney(line.lineTotalMinor, line.product.currency)}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="az-cart-subtotal">{subtotal}</div>
              </section>
            )}
            <p className="az-cart-disclaimer">
              Os preços e a disponibilidade podem mudar. Adicionar um produto ao carrinho não
              reserva estoque.
            </p>
          </div>
          {hasItems && (
            <aside className="az-cart-summary" aria-label="Resumo da compra">
              <h2>Resumo do pedido</h2>
              <p>{subtotal}</p>
              {checkoutEnabled && !unavailable ? (
                <Link href="/checkout" className="az-cart-button">
                  Continuar para finalizar a compra
                </Link>
              ) : (
                <>
                  <button
                    type="button"
                    className="az-cart-button"
                    disabled
                    aria-describedby="cart-checkout-help"
                  >
                    Finalizar compra
                  </button>
                  <p id="cart-checkout-help" className="az-cart-summary__help">
                    {unavailable
                      ? 'Revise os itens indisponíveis antes de continuar.'
                      : 'A finalização de compras ainda não está disponível.'}
                  </p>
                </>
              )}
            </aside>
          )}
        </div>
      </main>
      <section
        id="cart-products"
        className="az-cart-discover"
        aria-labelledby="cart-products-title"
      >
        <div className="az-cart-discover__heading">
          <h2 id="cart-products-title">Explore nossos produtos</h2>
          <p>Escolha produtos para adicionar ao seu carrinho.</p>
        </div>
        {catalogFailed ? (
          <p role="status">
            Não foi possível carregar os produtos. Atualize a página para tentar novamente.
          </p>
        ) : products.length ? (
          <HorizontalRail label="Produtos disponíveis" className="az-cart-product-rail">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                action={
                  status === 'guest' ? (
                    <Link href="/login" className="az-cart-button">
                      Entre para comprar
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className="az-cart-button"
                      disabled={pending || status !== 'ready' || !product.inStock}
                      onClick={() => void add(product.id)}
                      aria-label={`Adicionar ${product.name} ao carrinho`}
                    >
                      {product.inStock ? 'Adicionar ao carrinho' : 'Indisponível'}
                    </button>
                  )
                }
              />
            ))}
          </HorizontalRail>
        ) : (
          <p>Nenhum produto disponível no momento.</p>
        )}
      </section>
    </>
  );
}
