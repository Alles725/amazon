'use client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  MAX_SAVED_CARDS,
  SavedPaymentCard,
  cardLabel,
  isCardExpired,
} from '@amazon-mvp/api-contract';
import { CardForm } from '../checkout/card-form';
import { checkoutClient } from '../checkout/checkout-client';
import '../checkout/payment-card.css';
import { PRIME_NOTICE_COOKIE } from './product-rules';
const ONE_YEAR = 60 * 60 * 24 * 365;

/** Visual demo: there is no Prime subscription. The product page shows this only to
 * signed-in users without a valid saved card who have not dismissed it; "Atualizar
 * meio de pagamento" saves a simulated card through the checkout's /payment-cards API. */
export function PrimePaymentNotice({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [editing, setEditing] = useState(false);
  if (hidden) return null;

  function dismiss() {
    document.cookie = `${PRIME_NOTICE_COOKIE}=${encodeURIComponent(userId)}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax`;
    setHidden(true);
  }

  return (
    <section className="az-pdp-alert" aria-labelledby="prime-alert-title">
      <div>
        <h2 id="prime-alert-title">
          <span className="az-pdp-alert__icon" aria-hidden="true">
            !
          </span>
          Sua assinatura Prime está pausada devido a um problema no meio de pagamento
        </h2>
        <p>
          Adicione um meio de pagamento válido para assinar o Amazon Prime novamente e recuperar o
          acesso aos seus benefícios.
        </p>
      </div>
      <button type="button" className="az-pdp-pill" onClick={() => setEditing(true)}>
        Atualizar meio de pagamento
      </button>
      <button
        type="button"
        className="az-pdp-alert__close"
        aria-label="Dispensar aviso"
        onClick={dismiss}
      >
        ×
      </button>
      {editing && (
        <PaymentCardDialog
          userName={userName}
          onClose={() => setEditing(false)}
          onValidCard={() => {
            setEditing(false);
            setHidden(true);
            router.refresh();
          }}
        />
      )}
    </section>
  );
}

function PaymentCardDialog({
  userName,
  onClose,
  onValidCard,
}: {
  userName: string;
  onClose: () => void;
  onValidCard: () => void;
}) {
  const [cards, setCards] = useState<SavedPaymentCard[] | null>(null);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState('');
  const close = useRef<HTMLButtonElement>(null);
  const latestClose = useRef(onClose);
  latestClose.current = onClose;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    close.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') latestClose.current();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      previous?.focus();
    };
  }, []);

  useEffect(() => {
    let active = true;
    checkoutClient
      .cards()
      .then((data) => active && setCards(data))
      .catch(() => {
        if (!active) return;
        setCards([]);
        setError('Não foi possível carregar seus cartões salvos.');
      });
    return () => {
      active = false;
    };
  }, []);

  async function remove(card: SavedPaymentCard) {
    setRemoving(card.id);
    setError('');
    try {
      setCards(await checkoutClient.deleteCard(card.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível remover o cartão.');
    } finally {
      setRemoving('');
    }
  }

  return (
    <div className="az-pdp-viewer" role="presentation" onClick={onClose}>
      <div
        className="az-prime-card-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="prime-card-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={close}
          type="button"
          className="az-pdp-viewer__close"
          aria-label="Fechar"
          onClick={onClose}
        >
          ×
        </button>
        <h2 id="prime-card-title">Atualizar meio de pagamento</h2>
        {error && (
          <p className="az-checkout-error" role="alert">
            {error}
          </p>
        )}
        {cards === null ? (
          <p className="az-checkout-muted">Carregando seus cartões…</p>
        ) : (
          <>
            {cards.length > 0 && (
              <ul className="az-prime-card-list" aria-label="Cartões salvos">
                {cards.map((card) => {
                  const expired = isCardExpired(card);
                  return (
                    <li key={card.id} className={expired ? 'az-checkout-card-expired' : undefined}>
                      <span>
                        {cardLabel(card)} · {card.holderName} ·{' '}
                        {expired
                          ? 'Vencido'
                          : `Validade ${String(card.expMonth).padStart(2, '0')}/${card.expYear}`}
                      </span>
                      {expired && (
                        <button
                          type="button"
                          className="az-checkout-link"
                          disabled={removing === card.id}
                          aria-label={`Remover ${cardLabel(card)}`}
                          onClick={() => void remove(card)}
                        >
                          Remover
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
            {cards.length < MAX_SAVED_CARDS ? (
              <CardForm
                name={userName}
                onCancel={onClose}
                onSave={(card) => {
                  // CardForm already refuses expired cards; check anyway before hiding.
                  if (isCardExpired(card)) setCards([...cards, card]);
                  else onValidCard();
                }}
              />
            ) : (
              <p className="az-checkout-muted">
                Você atingiu o limite de {MAX_SAVED_CARDS} cartões salvos. Remova um cartão vencido
                para adicionar outro.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
