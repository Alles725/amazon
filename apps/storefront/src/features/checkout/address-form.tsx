'use client';
import { FormEvent, useState } from 'react';
import { AddressInput, SavedAddress } from '@amazon-mvp/api-contract';
import { checkoutClient } from './checkout-client';
const fields = [
  ['recipient', 'Nome de quem recebe', 100, 'name'],
  ['postalCode', 'CEP (8 números)', 8, 'postal-code'],
  ['street', 'Rua / Avenida', 150, 'address-line1'],
  ['number', 'Número', 20, 'off'],
  ['complement', 'Complemento (opcional)', 100, 'address-line2'],
  ['neighborhood', 'Bairro', 100, 'off'],
  ['city', 'Cidade', 100, 'address-level2'],
  ['state', 'Estado (UF)', 2, 'address-level1'],
  ['phone', 'Telefone com DDD (opcional)', 15, 'tel-national'],
] as const;
const optional: readonly string[] = ['complement', 'phone'];
export function AddressForm({
  initial,
  name,
  onSave,
  onCancel,
}: {
  initial?: SavedAddress;
  name: string;
  onSave: (address: SavedAddress) => void;
  onCancel: () => void;
}) {
  const [values, setValues] = useState<AddressInput>(
    initial
      ? {
          recipient: initial.recipient,
          postalCode: initial.postalCode,
          street: initial.street,
          number: initial.number,
          complement: initial.complement ?? '',
          neighborhood: initial.neighborhood,
          city: initial.city,
          state: initial.state,
          phone: initial.phone ?? '',
        }
      : {
          recipient: name,
          postalCode: '',
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          phone: '',
        },
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      onSave(await checkoutClient.saveAddress(values, initial?.id));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar o endereço.');
    } finally {
      setSaving(false);
    }
  }
  return (
    <form className="az-checkout-address-form" onSubmit={(event) => void submit(event)}>
      {error && (
        <p className="az-checkout-error" role="alert">
          {error}
        </p>
      )}
      <div>
        {fields.map(([field, label, maxLength, autoComplete]) => (
          <label key={field}>
            {label}
            <input
              name={field}
              value={values[field] ?? ''}
              type={field === 'phone' ? 'tel' : undefined}
              required={!optional.includes(field)}
              maxLength={maxLength}
              minLength={
                ['recipient', 'street', 'neighborhood', 'city', 'state'].includes(field)
                  ? 2
                  : undefined
              }
              pattern={
                field === 'postalCode' ? '[0-9]{8}' : field === 'state' ? '[A-Z]{2}' : undefined
              }
              inputMode={field === 'postalCode' ? 'numeric' : field === 'phone' ? 'tel' : undefined}
              autoComplete={autoComplete}
              disabled={saving}
              onChange={(event) =>
                setValues({
                  ...values,
                  [field]:
                    field === 'state' ? event.target.value.toUpperCase() : event.target.value,
                })
              }
            />
          </label>
        ))}
      </div>
      <button className="az-cart-button" disabled={saving}>
        {saving ? 'Salvando…' : 'Salvar endereço'}
      </button>
      <button type="button" className="az-checkout-link" disabled={saving} onClick={onCancel}>
        Cancelar
      </button>
    </form>
  );
}
