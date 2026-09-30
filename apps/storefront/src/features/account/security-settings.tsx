'use client';

import { useRouter } from 'next/navigation';
import { FormEvent, ReactNode, useEffect, useRef, useState } from 'react';
import {
  DISPLAY_NAME_MAX_LENGTH,
  DISPLAY_NAME_MIN_LENGTH,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  UserProfile,
} from '@amazon-mvp/api-contract';
import { accountClient, AccountRequestError } from './account-client';

type Field = 'name' | 'email' | 'password';

/** "Acesso e segurança": name, e-mail and password rows, each with "Editar". */
export function SecuritySettings({ user }: { user: UserProfile }) {
  const router = useRouter();
  const [profile, setProfile] = useState(user);
  const [editing, setEditing] = useState<Field | null>(null);
  const [status, setStatus] = useState('');
  const editButtons = useRef<Partial<Record<Field, HTMLButtonElement | null>>>({});

  function close(field: Field, message = '') {
    setEditing(null);
    setStatus(message);
    requestAnimationFrame(() => editButtons.current[field]?.focus());
  }

  function row(field: Field, label: string, value: ReactNode, form: ReactNode) {
    const open = editing === field;
    return (
      <li className="az-acct-row">
        <div className="az-acct-row__summary">
          <div>
            <h2 className="az-acct-row__label" id={`security-${field}`}>
              {label}
            </h2>
            <p className="az-acct-row__value">{value}</p>
          </div>
          {!open && (
            <button
              ref={(node) => {
                editButtons.current[field] = node;
              }}
              type="button"
              className="az-acct-button"
              aria-describedby={`security-${field}`}
              disabled={editing !== null}
              onClick={() => {
                setStatus('');
                setEditing(field);
              }}
            >
              Editar
            </button>
          )}
        </div>
        {open && form}
      </li>
    );
  }

  return (
    <>
      <div className="az-acct-status" role="status" aria-live="polite">
        {status && <p className="az-acct-success">{status}</p>}
      </div>
      <ul className="az-acct-rows">
        {row(
          'name',
          'Nome',
          profile.displayName,
          <EditForm
            label="Alterar seu nome"
            submitLabel="Salvar alterações"
            fields={[
              {
                name: 'displayName',
                label: 'Novo nome',
                type: 'text',
                autoComplete: 'name',
                defaultValue: profile.displayName,
                minLength: DISPLAY_NAME_MIN_LENGTH,
                maxLength: DISPLAY_NAME_MAX_LENGTH,
              },
            ]}
            onCancel={() => close('name')}
            onSubmit={async ({ displayName }) => {
              const updated = await accountClient.updateName(displayName.trim());
              setProfile(updated);
              close('name', 'Seu nome foi atualizado.');
              router.refresh(); // header greeting is server-rendered
            }}
            onUnauthorized={() => router.push('/login?next=%2Fsecurity')}
          />,
        )}
        {row(
          'email',
          'E-mail',
          profile.email,
          <EditForm
            label="Alterar seu e-mail"
            submitLabel="Salvar alterações"
            hint="Por segurança, confirme sua senha atual. As outras sessões conectadas à sua conta serão encerradas; esta continua ativa."
            fields={[
              {
                name: 'email',
                label: 'Novo e-mail',
                type: 'email',
                autoComplete: 'email',
                maxLength: 254,
              },
              {
                name: 'currentPassword',
                label: 'Senha atual',
                type: 'password',
                autoComplete: 'current-password',
                maxLength: PASSWORD_MAX_LENGTH,
              },
            ]}
            onCancel={() => close('email')}
            onSubmit={async ({ email, currentPassword }) => {
              const updated = await accountClient.changeEmail(email.trim(), currentPassword);
              setProfile(updated);
              close('email', 'Seu e-mail foi atualizado. Use-o no próximo login.');
            }}
            onUnauthorized={() => router.push('/login?next=%2Fsecurity')}
          />,
        )}
        {row(
          'password',
          'Senha',
          <span aria-label="Senha oculta">********</span>,
          <EditForm
            label="Alterar sua senha"
            submitLabel="Salvar alterações"
            hint={`A nova senha deve ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres. As outras sessões conectadas à sua conta serão encerradas; esta continua ativa.`}
            fields={[
              {
                name: 'currentPassword',
                label: 'Senha atual',
                type: 'password',
                autoComplete: 'current-password',
                maxLength: PASSWORD_MAX_LENGTH,
              },
              {
                name: 'newPassword',
                label: 'Nova senha',
                type: 'password',
                autoComplete: 'new-password',
                minLength: PASSWORD_MIN_LENGTH,
                maxLength: PASSWORD_MAX_LENGTH,
              },
              {
                name: 'confirmPassword',
                label: 'Digite a nova senha novamente',
                type: 'password',
                autoComplete: 'new-password',
                minLength: PASSWORD_MIN_LENGTH,
                maxLength: PASSWORD_MAX_LENGTH,
              },
            ]}
            validate={({ newPassword, confirmPassword, currentPassword }) =>
              newPassword !== confirmPassword
                ? 'As novas senhas não coincidem.'
                : newPassword === currentPassword
                  ? 'A nova senha deve ser diferente da senha atual.'
                  : ''
            }
            onCancel={() => close('password')}
            onSubmit={async ({ currentPassword, newPassword }) => {
              const result = await accountClient.changePassword(currentPassword, newPassword);
              close(
                'password',
                result.revokedSessions === 0
                  ? 'Sua senha foi alterada.'
                  : `Sua senha foi alterada. ${result.revokedSessions} ${
                      result.revokedSessions === 1
                        ? 'outra sessão foi encerrada'
                        : 'outras sessões foram encerradas'
                    }.`,
              );
            }}
            onUnauthorized={() => router.push('/login?next=%2Fsecurity')}
          />,
        )}
      </ul>
    </>
  );
}

interface FieldSpec {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password';
  autoComplete: string;
  defaultValue?: string;
  minLength?: number;
  maxLength?: number;
}

function EditForm({
  label,
  hint,
  fields,
  submitLabel,
  validate,
  onSubmit,
  onCancel,
  onUnauthorized,
}: {
  label: string;
  hint?: string;
  fields: FieldSpec[];
  submitLabel: string;
  validate?: (values: Record<string, string>) => string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onCancel: () => void;
  onUnauthorized: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    form.current?.querySelector('input')?.focus();
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const values = Object.fromEntries(fields.map(({ name }) => [name, String(data.get(name) ?? '')]));
    const problem = validate?.(values) ?? '';
    setError(problem);
    if (problem) return;
    setSaving(true);
    try {
      await onSubmit(values);
    } catch (reason) {
      // A 403 here is the wrong current password, not an expired session.
      if (reason instanceof AccountRequestError && reason.status === 401) return onUnauthorized();
      setError(reason instanceof Error ? reason.message : 'Não foi possível salvar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form ref={form} className="az-acct-form" aria-label={label} onSubmit={(e) => void submit(e)}>
      {error && (
        <p className="az-acct-error" role="alert">
          {error}
        </p>
      )}
      {hint && <p className="az-acct-form__hint">{hint}</p>}
      {fields.map((field) => (
        <label key={field.name}>
          {field.label}
          <input
            name={field.name}
            type={field.type}
            autoComplete={field.autoComplete}
            defaultValue={field.defaultValue}
            minLength={field.minLength}
            maxLength={field.maxLength}
            required
            disabled={saving}
          />
        </label>
      ))}
      <div className="az-acct-form__actions">
        <button type="submit" className="az-acct-button az-acct-button--primary" disabled={saving}>
          {saving ? 'Salvando…' : submitLabel}
        </button>
        <button type="button" className="az-acct-button" disabled={saving} onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
