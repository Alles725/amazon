'use client';

import { FormEvent, useState } from 'react';

/**
 * First step of Amazon's real sign-in flow: collect an identifier only. There is
 * no second step here on purpose — see apps/storefront/src/app/login/page.tsx.
 */
export function LoginIdentifierForm() {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (identifier.trim() === '') {
      setError('Insira um número de celular ou endereço de e-mail válido.');
      return;
    }
    setError(null);
  };

  return (
    <form className="amazon-field" onSubmit={submit} noValidate>
      <label className="amazon-field__label" htmlFor="login-identifier">
        Insira um número de celular ou um endereço de e-mail
      </label>
      <input
        id="login-identifier"
        className="amazon-field__input"
        name="identifier"
        type="text"
        autoComplete="username"
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? 'login-identifier-error' : undefined}
        value={identifier}
        onChange={(event) => {
          setIdentifier(event.target.value);
          if (error) setError(null);
        }}
      />
      {error && (
        <p className="amazon-field__error" id="login-identifier-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="amazon-button">
        Continuar
      </button>
    </form>
  );
}
