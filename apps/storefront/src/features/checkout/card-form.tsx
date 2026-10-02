'use client';
import { FormEvent, useState } from 'react';
import {
  CARD_BRAND_LABELS,
  CARD_HOLDER_MAX_LENGTH,
  SavedPaymentCard,
  isCardExpired,
} from '@amazon-mvp/api-contract';
import { checkoutClient } from './checkout-client';
import { cardDigits, cardNumberError, detectCardBrand, formatCardNumber } from './card-number';

const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);

/**
 * "Adicionar cartão" (CARD-001). Simulation: the number is validated here (brand and
 * Luhn) and only brand + last four digits are sent; there is no CVV field at all.
 */
export function CardForm({
  name,
  onSave,
  onCancel,
}: {
  name: string;
  onSave: (card: SavedPaymentCard) => void;
  onCancel: () => void;
}) {
  const thisYear = new Date().getFullYear();
  const years = Array.from({ length: 16 }, (_, i) => thisYear + i);
  const [number, setNumber] = useState('');
  const [holderName, setHolderName] = useState(name);
  const [expMonth, setExpMonth] = useState('');
  const [expYear, setExpYear] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const brand = detectCardBrand(number);
  async function submit(event: FormEvent) {
    event.preventDefault();
    const numberError = cardNumberError(number);
    const expiry = { expMonth: Number(expMonth), expYear: Number(expYear) };
    const message = numberError
      ? numberError
      : holderName.trim().length < 2
        ? 'Informe o nome impresso no cartão.'
        : !expMonth || !expYear
          ? 'Informe a validade do cartão.'
          : isCardExpired(expiry)
            ? 'Cartão vencido.'
            : '';
    setError(message);
    if (message || !brand) return;
    setSaving(true);
    try {
      onSave(
        await checkoutClient.saveCard({
          brand,
          last4: cardDigits(number).slice(-4),
          holderName: holderName.trim(),
          ...expiry,
        }),
      );
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o cartão.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <form
      className="az-checkout-address-form az-checkout-card-form"
      aria-label="Adicionar cartão"
      noValidate
      onSubmit={(event) => void submit(event)}
    >
      {error && (
        <p className="az-checkout-error" role="alert">
          {error}
        </p>
      )}
      <div>
        <label>
          Número do cartão
          <input
            name="cardNumber"
            value={formatCardNumber(number)}
            inputMode="numeric"
            autoComplete="cc-number"
            maxLength={23}
            disabled={saving}
            aria-describedby="card-brand-hint"
            onChange={(event) => setNumber(cardDigits(event.target.value))}
          />
        </label>
        <span id="card-brand-hint" className="az-checkout-muted">
          {brand
            ? CARD_BRAND_LABELS[brand]
            : 'Visa, Mastercard, Elo, American Express ou Hipercard'}
        </span>
        <label>
          Nome no cartão
          <input
            name="holderName"
            value={holderName}
            maxLength={CARD_HOLDER_MAX_LENGTH}
            autoComplete="cc-name"
            disabled={saving}
            onChange={(event) => setHolderName(event.target.value)}
          />
        </label>
        <fieldset className="az-checkout-card-expiry" disabled={saving}>
          <legend>Data de validade</legend>
          <select
            aria-label="Mês de validade"
            autoComplete="cc-exp-month"
            value={expMonth}
            onChange={(event) => setExpMonth(event.target.value)}
          >
            <option value="">Mês</option>
            {MONTHS.map((month) => (
              <option key={month} value={month}>
                {String(month).padStart(2, '0')}
              </option>
            ))}
          </select>
          <select
            aria-label="Ano de validade"
            autoComplete="cc-exp-year"
            value={expYear}
            onChange={(event) => setExpYear(event.target.value)}
          >
            <option value="">Ano</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </fieldset>
      </div>
      <p className="az-checkout-muted">
        Simulação: guardamos apenas a bandeira, os 4 últimos dígitos, o nome e a validade. O número
        completo não é enviado e nenhum código de segurança é pedido.
      </p>
      <button className="az-cart-button" disabled={saving}>
        {saving ? 'Salvando…' : 'Adicionar cartão'}
      </button>
      <button type="button" className="az-checkout-link" disabled={saving} onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}
