'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthRequestError, authClient } from './auth-client';

type Mode = 'login' | 'register';

const MIN_PASSWORD_LENGTH = 12;

/**
 * Used by /register (mode="register"). /login has its own Amazon-style
 * multi-step flow (see features/auth/login-identifier-form.tsx) instead of
 * this form's single-step login; the mode="login" path stays here in case a
 * future screen needs a plain combined email+password form.
 *
 * When `initialEmail` is set (arriving from the login flow's "new to Amazon"
 * step, via the ?email= query param), the email is shown as a locked
 * identity row with an "Alterar" link back to /login, matching Amazon's own
 * hand-off. Without it (a direct visit to /register), email stays a normal
 * editable field so the page keeps working standalone.
 */
export function AuthForm({ mode, initialEmail }: { mode: Mode; initialEmail?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const emailLocked = mode === 'register' && Boolean(initialEmail);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setFormError(null);
    setFieldErrors({});

    if (mode === 'register' && password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'As senhas não coincidem.' });
      return;
    }

    setPending(true);
    try {
      if (mode === 'register') {
        // Reuses the real /auth/register endpoint (AuthService.register):
        // Argon2id-hashed password, a row in `users`, and a Postgres-backed
        // session cookie. Nothing here is mocked.
        await authClient.register({ email, password, displayName });
      } else {
        await authClient.login({ email, password });
      }
      router.push('/account');
      router.refresh();
    } catch (error) {
      if (error instanceof AuthRequestError) {
        setFieldErrors(error.fieldErrors);
        setFormError(Object.keys(error.fieldErrors).length > 0 ? null : error.message);
      } else {
        setFormError('Algo deu errado. Tente novamente.');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={(event) => void submit(event)} noValidate>
      {formError && (
        <p className="amazon-field__error" role="alert" style={{ marginBottom: 12 }}>
          {formError}
        </p>
      )}

      <div className="amazon-field">
        <label className="amazon-field__label">E-mail</label>
        {emailLocked ? (
          <div className="amazon-identity">
            <span>{email}</span>
            <Link className="amazon-identity__change" href={`/login?email=${encodeURIComponent(email)}`}>
              Alterar
            </Link>
          </div>
        ) : (
          <>
            <input
              className="amazon-field__input"
              type="email"
              autoComplete="email"
              aria-invalid={fieldErrors.email ? 'true' : undefined}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            {fieldErrors.email && (
              <p className="amazon-field__error" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </>
        )}
      </div>

      {mode === 'register' && (
        <div className="amazon-field">
          <label className="amazon-field__label" htmlFor="register-name">
            Seu nome
          </label>
          <input
            id="register-name"
            className="amazon-field__input"
            placeholder="Nome e sobrenome"
            autoComplete="name"
            aria-invalid={fieldErrors.displayName ? 'true' : undefined}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          {fieldErrors.displayName && (
            <p className="amazon-field__error" role="alert">
              {fieldErrors.displayName}
            </p>
          )}
        </div>
      )}

      <div className="amazon-field">
        <label className="amazon-field__label" htmlFor="register-password">
          {mode === 'register' ? `Senha (pelo menos ${MIN_PASSWORD_LENGTH} caracteres)` : 'Senha'}
        </label>
        <input
          id="register-password"
          className="amazon-field__input"
          type="password"
          autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          aria-invalid={fieldErrors.password ? 'true' : undefined}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        {fieldErrors.password && (
          <p className="amazon-field__error" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>

      {mode === 'register' && (
        <div className="amazon-field">
          <label className="amazon-field__label" htmlFor="register-confirm-password">
            Insira a senha nova mais uma vez
          </label>
          <input
            id="register-confirm-password"
            className="amazon-field__input"
            type="password"
            autoComplete="new-password"
            aria-invalid={fieldErrors.confirmPassword ? 'true' : undefined}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
          {fieldErrors.confirmPassword && (
            <p className="amazon-field__error" role="alert">
              {fieldErrors.confirmPassword}
            </p>
          )}
        </div>
      )}

      <button type="submit" className="amazon-button" disabled={pending}>
        {pending ? 'Criando conta…' : mode === 'register' ? 'Continuar' : 'Fazer login'}
      </button>

      {mode === 'register' && (
        <p className="amazon-card__legal">
          Ao criar uma conta, você concorda com as <a href="#">Condições de Uso</a> da Amazon. Por
          favor verifique a <a href="#">Notificação de Privacidade</a>, a{' '}
          <a href="#">Notificação de Cookies</a> e a{' '}
          <a href="#">Notificação de Anúncios Baseados em Interesse</a>.
        </p>
      )}
    </form>
  );
}
