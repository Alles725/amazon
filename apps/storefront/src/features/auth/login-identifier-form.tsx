'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthRequestError, authClient } from './auth-client';

type Step = 'identifier' | 'password' | 'new-user';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Amazon's real sign-in split: an identifier step, then either a password
 * step (existing account) or a "new to Amazon" step that hands off to
 * /register (unknown account). All three live in one component so the
 * password/new-user steps can show a page-level alert or note above the card,
 * and so "Alterar" can return to the identifier step without a round trip.
 */
export function LoginIdentifierForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>('identifier');

  const [email, setEmail] = useState(() => searchParams.get('email') ?? '');
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [checkingEmail, setCheckingEmail] = useState(false);

  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === 'password') passwordInputRef.current?.focus();
  }, [step]);

  const submitIdentifier = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim();
    if (trimmed === '' || !EMAIL_PATTERN.test(trimmed)) {
      setIdentifierError('Insira um número de celular ou endereço de e-mail válido.');
      return;
    }
    setEmail(trimmed);
    setIdentifierError(null);
    setCheckingEmail(true);

    try {
      // Reuses AuthService.identify (POST /auth/identify), which reads the
      // same users table as register/login — no separate lookup, no mock.
      const { exists } = await authClient.identify({ email: trimmed });
      setStep(exists ? 'password' : 'new-user');
    } catch {
      setIdentifierError('Não foi possível continuar agora. Tente novamente.');
    } finally {
      setCheckingEmail(false);
    }
  };

  /** Used by every "go back" affordance: password step, new-user step, and its "other email" link. */
  const backToIdentifier = (clearEmail: boolean) => {
    setStep('identifier');
    if (clearEmail) setEmail('');
    setPassword('');
    setPasswordError(null);
    setAuthError(null);
  };

  const submitPassword = async (event: FormEvent) => {
    event.preventDefault();
    if (password === '') {
      setPasswordError('Insira sua senha.');
      return;
    }
    setPasswordError(null);
    setAuthError(null);
    setPending(true);

    try {
      // Reuses the real /auth/login endpoint (AuthService + SessionService):
      // Argon2id verification against the stored hash and a Postgres-backed
      // session, delivered as an httpOnly cookie. Nothing here is mocked.
      await authClient.login({ email, password });
      router.push('/account');
      router.refresh();
    } catch (error) {
      if (error instanceof AuthRequestError && error.code === 'AUTH_INVALID_CREDENTIALS') {
        setAuthError('Sua senha está incorreta.');
      } else if (error instanceof AuthRequestError) {
        setAuthError(error.message);
      } else {
        setAuthError('Algo deu errado. Tente novamente.');
      }
      setPassword('');
      passwordInputRef.current?.focus();
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      {authError && (
        <div className="amazon-alert" role="alert">
          <svg className="amazon-alert__icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 6a1 1 0 112 0v5a1 1 0 11-2 0V6zm1 9a1.25 1.25 0 100-2.5A1.25 1.25 0 0010 15z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <p className="amazon-alert__title">Houve um problema</p>
            <p className="amazon-alert__body">{authError}</p>
          </div>
        </div>
      )}

      <div className="amazon-card">
        {step === 'identifier' && (
          <>
            <h1 className="amazon-card__title">Faça login ou crie uma conta</h1>
            <form className="amazon-field" onSubmit={(event) => void submitIdentifier(event)} noValidate>
              <label className="amazon-field__label" htmlFor="login-identifier">
                Insira um número de celular ou um endereço de e-mail
              </label>
              <input
                id="login-identifier"
                className="amazon-field__input"
                name="identifier"
                type="text"
                autoComplete="username"
                aria-invalid={identifierError ? 'true' : undefined}
                aria-describedby={identifierError ? 'login-identifier-error' : undefined}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (identifierError) setIdentifierError(null);
                }}
              />
              {identifierError && (
                <p className="amazon-field__error" id="login-identifier-error" role="alert">
                  {identifierError}
                </p>
              )}
              <button type="submit" className="amazon-button" disabled={checkingEmail}>
                {checkingEmail ? 'Verificando…' : 'Continuar'}
              </button>
            </form>

            <p className="amazon-card__legal">
              Ao continuar, você concorda com as <a href="#">Condições de Uso</a> e a{' '}
              <a href="#">Notificação de privacidade da Amazon</a>.
            </p>

            <a className="amazon-card__help" href="#">
              Precisa de ajuda?
            </a>
          </>
        )}

        {step === 'password' && (
          <>
            <h1 className="amazon-card__title">Fazer login</h1>
            <form onSubmit={(event) => void submitPassword(event)} noValidate>
              <div className="amazon-identity">
                <span>{email}</span>
                <button type="button" className="amazon-identity__change" onClick={() => backToIdentifier(false)}>
                  Alterar
                </button>
              </div>

              <div className="amazon-field">
                <div className="amazon-field__row">
                  <label className="amazon-field__label" htmlFor="login-password">
                    Senha
                  </label>
                  <a href="#">Esqueci a senha</a>
                </div>
                <input
                  id="login-password"
                  ref={passwordInputRef}
                  className="amazon-field__input"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={passwordError ? 'true' : undefined}
                  aria-describedby={passwordError ? 'login-password-error' : undefined}
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (passwordError) setPasswordError(null);
                  }}
                />
                {passwordError && (
                  <p className="amazon-field__error" id="login-password-error" role="alert">
                    {passwordError}
                  </p>
                )}
              </div>

              <button type="submit" className="amazon-button" disabled={pending}>
                {pending ? 'Entrando…' : 'Fazer login'}
              </button>

              <div className="amazon-divider">Ou</div>

              <button type="button" className="amazon-button amazon-button--secondary">
                Fazer login com uma chave de acesso
              </button>
            </form>
          </>
        )}

        {step === 'new-user' && (
          <>
            <h1 className="amazon-card__title">Parece que você é novo na Amazon</h1>

            <div className="amazon-identity">
              <span>{email}</span>
              <button type="button" className="amazon-identity__change" onClick={() => backToIdentifier(false)}>
                Alterar
              </button>
            </div>

            <p className="amazon-card__prose">Vamos criar uma conta usando seu e-mail</p>

            <Link href={`/register?email=${encodeURIComponent(email)}`} className="amazon-button">
              Prossiga com a criação de uma conta
            </Link>

            <hr className="amazon-hr" />

            <div className="amazon-note">
              <p className="amazon-note__title">Já é cliente?</p>
              <button type="button" className="amazon-identity__change" onClick={() => backToIdentifier(true)}>
                Faça login com outro e-mail ou celular
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
