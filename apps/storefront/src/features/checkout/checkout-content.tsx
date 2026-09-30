'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  CheckoutQuote,
  MAX_CART_QUANTITY,
  PlaceOrderRequest,
  SavedAddress,
  SimulatedPayment,
} from '@amazon-mvp/api-contract';
import { useCart } from '@/features/cart/cart-provider';
import { formatCartMoney } from '@/features/cart/money';
import { ProductImage } from '@/components/amazon/product-image';
import { productPresentation } from '@/features/product/product-presentation';
import { AddressForm } from './address-form';
import { checkoutClient, CheckoutError, cartContentKey } from './checkout-client';
import './pix-price.css';

/** Until a method is chosen the API quotes card, i.e. no discount. */
const DEFAULT_QUOTE_METHOD: SimulatedPayment = 'SIMULATED_CARD';

export function CheckoutContent({
  name,
  pixDiscountPercent = null,
}: {
  name: string;
  /** Advertised next to the Pix option only; totals always come from the quote. */
  pixDiscountPercent?: number | null;
}) {
  const router = useRouter();
  const { cart, status, pending, error: cartError, update, remove, refresh } = useCart();
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [addressId, setAddressId] = useState('');
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState('');
  const [editor, setEditor] = useState<SavedAddress | 'new' | null>(null);
  const [payment, setPayment] = useState<SimulatedPayment | ''>('');
  const [quote, setQuote] = useState<CheckoutQuote | null>(null);
  const [quoteError, setQuoteError] = useState('');
  const [retry, setRetry] = useState(0);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [uncertain, setUncertain] = useState<PlaceOrderRequest | null>(null);
  const busy = useRef(false);
  const currentKey = cartContentKey(cart);
  const locked = pending || submitting || Boolean(uncertain);
  const quoteMethod = payment || DEFAULT_QUOTE_METHOD;
  // A quote is usable only for the current cart AND the selected payment method: the
  // revision binds both, so switching card <-> Pix waits for a fresh API quote.
  const validQuote =
    quote && cartContentKey(quote.cart) === currentKey && quote.paymentMethod === quoteMethod;
  useEffect(() => {
    let active = true;
    setAddressLoading(true);
    checkoutClient
      .addresses()
      .then((data) => {
        if (active) {
          setAddresses(data);
          setAddressId((previous) =>
            data.some((a) => a.id === previous) ? previous : (data[0]?.id ?? ''),
          );
          setAddressError('');
        }
      })
      .catch((reason) => {
        if (active)
          setAddressError(
            reason instanceof Error ? reason.message : 'Não foi possível carregar os endereços.',
          );
      })
      .finally(() => {
        if (active) setAddressLoading(false);
      });
    return () => {
      active = false;
    };
  }, [retry]);
  useEffect(() => {
    let active = true;
    setQuote(null);
    setQuoteError('');
    if (status === 'ready' && cart?.lines.length && !pending && !uncertain) {
      checkoutClient
        .quote(quoteMethod)
        .then((data) => {
          if (active) setQuote(data);
        })
        .catch((reason) => {
          if (active)
            setQuoteError(
              reason instanceof Error ? reason.message : 'Não foi possível calcular o total.',
            );
        });
    }
    return () => {
      active = false;
    };
  }, [currentKey, status, pending, retry, uncertain, cart?.lines.length, quoteMethod]);
  async function confirm() {
    if (busy.current || pending) return;
    setError('');
    if (!uncertain) {
      if (!addressId || editor) {
        setError('Selecione e salve um endereço de entrega.');
        return;
      }
      if (!payment) {
        setError('Selecione uma forma de pagamento simulada.');
        return;
      }
      if (!cart?.id || !cart.lines.length) {
        setError('Seu carrinho está vazio.');
        return;
      }
      if (!quote || !validQuote) {
        setError('Atualize e revise o resumo antes de confirmar.');
        return;
      }
    }
    const request = uncertain ?? {
      cartId: cart!.id!,
      revision: quote!.revision,
      addressId,
      paymentMethod: payment as SimulatedPayment,
    };
    busy.current = true;
    setSubmitting(true);
    try {
      const order = await checkoutClient.place(request);
      setPlaced(true);
      setUncertain(null);
      await refresh();
      router.push(`/checkout/success/${order.id}`);
    } catch (reason) {
      if (!(reason instanceof CheckoutError) || reason.status >= 500) {
        setUncertain(request);
        setError(
          'Não foi possível confirmar a resposta. Tente novamente para consultar o mesmo pedido com segurança.',
        );
      } else {
        setUncertain(null);
        setError(reason.message);
        if (reason.status === 401) router.push('/login?next=checkout');
        else {
          await refresh();
          setRetry((value) => value + 1);
        }
      }
    } finally {
      busy.current = false;
      setSubmitting(false);
    }
  }
  if (placed)
    return (
      <main className="az-checkout-main">
        <section className="az-checkout-panel" role="status">
          Pedido salvo. Abrindo confirmação…
        </section>
      </main>
    );
  if (status === 'guest')
    return (
      <main className="az-checkout-main">
        <section className="az-checkout-panel">
          <h1>Entre para finalizar sua compra</h1>
          <Link href="/login?next=checkout">Entrar na sua conta</Link>
        </section>
      </main>
    );
  if (status === 'loading')
    return (
      <main className="az-checkout-main">
        <section className="az-checkout-panel" role="status">
          Carregando seu carrinho…
        </section>
      </main>
    );
  if (status === 'error')
    return (
      <main className="az-checkout-main">
        <section className="az-checkout-panel">
          <h1>Não foi possível carregar seu carrinho</h1>
          <p role="alert">{cartError}</p>
          <button className="az-cart-button" onClick={() => void refresh()}>
            Tentar novamente
          </button>
        </section>
      </main>
    );
  if (!cart?.lines.length && !uncertain)
    return (
      <main className="az-checkout-main">
        <section className="az-checkout-panel">
          <h1>Seu carrinho está vazio</h1>
          <p>Adicione produtos antes de finalizar a compra.</p>
          <Link href="/cart">Voltar ao carrinho</Link>
        </section>
      </main>
    );
  const selected = addresses.find((a) => a.id === addressId);
  const total = validQuote ? formatCartMoney(quote.totalMinor, quote.currency) : '—';
  const confirmDisabled =
    (locked && !uncertain) || submitting || (!uncertain && (!validQuote || addressLoading));
  const confirmButton = (
    <button
      type="button"
      className="az-cart-button"
      disabled={confirmDisabled}
      onClick={() => void confirm()}
    >
      {submitting ? 'Confirmando…' : uncertain ? 'Tentar confirmar novamente' : 'Confirmar pedido'}
    </button>
  );
  return (
    <main className="az-checkout-main">
      <h1 className="visually-hidden">Finalizar compra</h1>
      {(error || cartError) && (
        <div className="az-checkout-error" role="alert">
          {error || cartError}
        </div>
      )}
      <div className="az-checkout-layout">
        <div className="az-checkout-primary">
          <section className="az-checkout-panel" aria-labelledby="delivery-title">
            <div className="az-checkout-heading">
              <h2 id="delivery-title">
                {selected ? `Entrega para ${selected.recipient}` : 'Endereço de entrega'}
              </h2>
              {selected && !editor && (
                <button
                  className="az-checkout-link"
                  disabled={locked}
                  onClick={() => setEditor(selected)}
                >
                  Alterar
                </button>
              )}
            </div>
            {addressLoading ? (
              <p role="status">Carregando endereços…</p>
            ) : addressError ? (
              <p className="az-checkout-error" role="alert">
                {addressError}{' '}
                <button onClick={() => setRetry((v) => v + 1)}>Tentar novamente</button>
              </p>
            ) : (
              <>
                {addresses.length > 0 && (
                  <label className="az-checkout-address-choice">
                    Endereço salvo
                    <select
                      disabled={locked || Boolean(editor)}
                      value={addressId}
                      onChange={(event) => setAddressId(event.target.value)}
                    >
                      {addresses.map((address) => (
                        <option key={address.id} value={address.id}>
                          {address.recipient} — {address.street}, {address.number}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
                {selected && (
                  <p>
                    {selected.street}, {selected.number}
                    {selected.complement ? `, ${selected.complement}` : ''}
                    <br />
                    {selected.neighborhood}, {selected.city} — {selected.state}
                    <br />
                    CEP {selected.postalCode} · Brasil
                  </p>
                )}
                {!selected && !editor && (
                  <p>Nenhum endereço cadastrado. Adicione um endereço para continuar.</p>
                )}
                {!editor && (
                  <button
                    className="az-checkout-link"
                    disabled={locked}
                    onClick={() => setEditor('new')}
                  >
                    Adicionar endereço
                  </button>
                )}
                {editor && (
                  <AddressForm
                    key={editor === 'new' ? 'new' : editor.id}
                    initial={editor === 'new' ? undefined : editor}
                    name={name}
                    onCancel={() => setEditor(null)}
                    onSave={(address) => {
                      setAddresses((old) => [...old.filter((a) => a.id !== address.id), address]);
                      setAddressId(address.id);
                      setEditor(null);
                      setError('');
                    }}
                  />
                )}
              </>
            )}
          </section>
          <section className="az-checkout-panel">
            <h2>Forma de pagamento</h2>
            <p className="az-checkout-muted">
              Simulação acadêmica. Nenhuma cobrança será realizada.
            </p>
            <fieldset disabled={locked} className="az-checkout-payment">
              <legend className="visually-hidden">Pagamento simulado</legend>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="SIMULATED_CARD"
                  checked={payment === 'SIMULATED_CARD'}
                  onChange={() => setPayment('SIMULATED_CARD')}
                />{' '}
                Cartão fictício · Visa final 4242
              </label>
              <label>
                <input
                  type="radio"
                  name="payment"
                  value="SIMULATED_PIX"
                  checked={payment === 'SIMULATED_PIX'}
                  onChange={() => setPayment('SIMULATED_PIX')}
                  aria-describedby={pixDiscountPercent ? 'checkout-pix-hint' : undefined}
                />{' '}
                Pix simulado
              </label>
              {pixDiscountPercent ? (
                <span id="checkout-pix-hint" className="az-checkout-pix-hint">
                  {pixDiscountPercent}% de desconto à vista no Pix
                </span>
              ) : null}
            </fieldset>
          </section>
          <section className="az-checkout-panel">
            <h2>Revise os produtos</h2>
            <p className="az-checkout-muted">
              Entrega gratuita nesta simulação. Prazo de entrega não calculado.
            </p>
            <ul className="az-checkout-items">
              {cart?.lines.map((line) => (
                <li key={line.productId} aria-label={line.product.name}>
                  <Link href={`/products/${line.productId}`} className="az-checkout-product-image">
                    <ProductImage image={productPresentation(line.product).images[0]} />
                  </Link>
                  <div>
                    <h3>
                      <Link href={`/products/${line.productId}`}>{line.product.name}</Link>
                    </h3>
                    <strong>{formatCartMoney(line.unitPriceMinor, line.product.currency)}</strong>
                    <p className="az-checkout-muted">
                      Subtotal: {formatCartMoney(line.lineTotalMinor, line.product.currency)}
                    </p>
                    {(!line.product.inStock || line.quantity > line.product.availableQuantity) && (
                      <p className="az-checkout-error">Quantidade indisponível</p>
                    )}
                    <div className="az-checkout-item-actions">
                      <label>
                        Quantidade
                        <select
                          aria-label={`Quantidade de ${line.product.name}`}
                          disabled={locked}
                          value={line.quantity}
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
                            (_, i) => i + 1,
                          ).map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="az-checkout-link"
                        disabled={locked}
                        onClick={() => void remove(line.productId)}
                        aria-label={`Remover ${line.product.name}`}
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <section className="az-checkout-panel az-checkout-bottom">
            {confirmButton}
            <div>
              <strong>Total do pedido: {total}</strong>
              <p className="az-checkout-muted">Pagamento simulado, sem cobrança real.</p>
            </div>
          </section>
          <section className="az-checkout-panel">
            <p>
              Precisa de ajuda? <Link href="/help">Acesse a página de ajuda.</Link>
            </p>
            <Link href="/cart">Voltar ao carrinho</Link>
          </section>
        </div>
        <aside className="az-checkout-panel az-checkout-summary" aria-label="Resumo do pedido">
          {confirmButton}
          <p className="az-checkout-muted">
            Revise o endereço, os produtos e a forma de pagamento antes de confirmar.
          </p>
          <hr />
          {quoteError && (
            <p className="az-checkout-error" role="alert">
              {quoteError}
            </p>
          )}
          {!validQuote && (
            <p role="status">
              {quoteError ? 'O resumo precisa ser atualizado.' : 'Atualizando resumo…'}{' '}
              <button
                className="az-checkout-link"
                disabled={locked}
                onClick={() => {
                  void refresh();
                  setRetry((v) => v + 1);
                }}
              >
                Atualizar resumo
              </button>
            </p>
          )}
          <dl>
            <div>
              <dt>Itens ({cart?.itemCount ?? 0})</dt>
              <dd>{validQuote ? formatCartMoney(quote.subtotalMinor, quote.currency) : '—'}</dd>
            </div>
            <div>
              <dt>Frete</dt>
              <dd>{validQuote ? formatCartMoney(quote.shippingMinor, quote.currency) : '—'}</dd>
            </div>
            {validQuote && quote.discountMinor > 0 && (
              <div className="az-checkout-discount">
                <dt>
                  {quote.paymentMethod === 'SIMULATED_PIX'
                    ? `Desconto Pix (${quote.discountPercent}%)`
                    : 'Descontos'}
                </dt>
                <dd>− {formatCartMoney(quote.discountMinor, quote.currency)}</dd>
              </div>
            )}
            <div className="az-checkout-total">
              <dt>Total do pedido</dt>
              <dd>{total}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
