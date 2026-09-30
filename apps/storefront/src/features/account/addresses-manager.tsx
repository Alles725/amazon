'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AccountAddress, SavedAddress } from '@amazon-mvp/api-contract';
import { AddressForm } from '@/features/checkout/address-form';
import { accountClient, AccountRequestError } from './account-client';
import { formatPostalCode } from './account-presentation';

type Editor = { mode: 'new' } | { mode: 'edit'; address: AccountAddress } | null;

/** "Seus endereços": add tile + one card per saved address, Amazon layout. The
 * form is checkout's AddressForm, so validation rules live in one place. */
export function AddressesManager({
  initial,
  name,
}: {
  initial: AccountAddress[];
  name: string;
}) {
  const router = useRouter();
  const [addresses, setAddresses] = useState(initial);
  const [editor, setEditor] = useState<Editor>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const editorHeading = useRef<HTMLHeadingElement>(null);
  const addTile = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (editor) editorHeading.current?.focus();
  }, [editor]);

  function fail(reason: unknown) {
    if (reason instanceof AccountRequestError && reason.status === 401) {
      router.push('/login?next=%2Faddresses');
      return;
    }
    setError(reason instanceof Error ? reason.message : 'Não foi possível concluir a solicitação.');
  }

  async function run(id: string, work: () => Promise<AccountAddress[]>, done: string) {
    setBusy(id);
    setError('');
    setStatus('');
    try {
      setAddresses(await work());
      setStatus(done);
    } catch (reason) {
      fail(reason);
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  }

  async function saved(address: SavedAddress) {
    const wasNew = editor?.mode === 'new';
    setEditor(null);
    setError('');
    try {
      // Reload: the server decides ordering and which address is the default.
      setAddresses(await accountClient.addresses());
      setStatus(wasNew ? 'Endereço adicionado.' : 'Endereço atualizado.');
    } catch (reason) {
      fail(reason);
    }
    // Keep keyboard users where the change happened.
    requestAnimationFrame(() =>
      document.getElementById(`address-${address.id}`)?.focus({ preventScroll: false }),
    );
  }

  return (
    <>
      <div className="az-acct-status" role="status" aria-live="polite">
        {status && <p className="az-acct-success">{status}</p>}
      </div>
      {error && (
        <p className="az-acct-error" role="alert">
          {error}
        </p>
      )}

      {editor && (
        <section className="az-acct-editor" aria-labelledby="address-editor-title">
          <h2 id="address-editor-title" ref={editorHeading} tabIndex={-1}>
            {editor.mode === 'new' ? 'Adicionar um novo endereço' : 'Editar seu endereço'}
          </h2>
          <AddressForm
            key={editor.mode === 'edit' ? editor.address.id : 'new'}
            initial={editor.mode === 'edit' ? editor.address : undefined}
            name={name}
            onSave={(address) => void saved(address)}
            onCancel={() => {
              setEditor(null);
              requestAnimationFrame(() => addTile.current?.focus());
            }}
          />
        </section>
      )}

      <ul className="az-acct-addresses" aria-label="Endereços salvos">
        <li>
          <button
            ref={addTile}
            type="button"
            className="az-acct-address-add"
            disabled={Boolean(editor)}
            onClick={() => {
              setStatus('');
              setEditor({ mode: 'new' });
            }}
          >
            <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">
              <path d="M24 6v36M6 24h36" stroke="currentColor" strokeWidth="5" />
            </svg>
            Adicionar endereço
          </button>
        </li>
        {addresses.map((address) => (
          <li
            key={address.id}
            id={`address-${address.id}`}
            tabIndex={-1}
            className={`az-acct-address${address.isDefault ? ' az-acct-address--default' : ''}`}
            aria-label={`${address.isDefault ? 'Endereço padrão: ' : 'Endereço: '}${address.recipient}, ${address.street}, ${address.number}`}
          >
            {address.isDefault && (
              <p className="az-acct-address__badge">
                <strong>Padrão:</strong> usado primeiro no checkout
              </p>
            )}
            <address className="az-acct-address__body">
              <strong>{address.recipient}</strong>
              {address.street}, {address.number}
              {address.complement ? ` - ${address.complement}` : ''}
              <br />
              {address.neighborhood}
              <br />
              {address.city.toUpperCase()}, {address.state} {formatPostalCode(address.postalCode)}
              <br />
              Brasil
            </address>
            {confirming === address.id ? (
              <div className="az-acct-address__confirm" role="group" aria-label="Confirmar remoção">
                <p>Remover este endereço?</p>
                <div className="az-acct-form__actions">
                  <button
                    type="button"
                    className="az-acct-button az-acct-button--primary"
                    disabled={busy === address.id}
                    autoFocus
                    onClick={() =>
                      void run(
                        address.id,
                        () => accountClient.deleteAddress(address.id),
                        'Endereço removido.',
                      )
                    }
                  >
                    {busy === address.id ? 'Removendo…' : 'Sim, remover'}
                  </button>
                  <button
                    type="button"
                    className="az-acct-button"
                    disabled={busy === address.id}
                    onClick={() => setConfirming(null)}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="az-acct-address__actions">
                <button
                  type="button"
                  className="az-acct-linkbutton"
                  disabled={Boolean(busy)}
                  aria-label={`Editar endereço de ${address.recipient}, ${address.street}`}
                  onClick={() => {
                    setStatus('');
                    setEditor({ mode: 'edit', address });
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="az-acct-linkbutton"
                  disabled={Boolean(busy)}
                  aria-label={`Remover endereço de ${address.recipient}, ${address.street}`}
                  onClick={() => setConfirming(address.id)}
                >
                  Remover
                </button>
                {!address.isDefault && (
                  <button
                    type="button"
                    className="az-acct-linkbutton"
                    disabled={Boolean(busy)}
                    aria-label={`Definir como padrão o endereço de ${address.recipient}, ${address.street}`}
                    onClick={() =>
                      void run(
                        address.id,
                        () => accountClient.setDefaultAddress(address.id),
                        'Endereço padrão atualizado.',
                      )
                    }
                  >
                    {busy === address.id ? 'Salvando…' : 'Definir como padrão'}
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      {addresses.length === 0 && (
        <p className="az-acct-muted az-acct-note">
          Você ainda não tem endereços salvos. Os endereços adicionados aqui aparecem no checkout.
        </p>
      )}
    </>
  );
}
