'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { ErrorState } from '@/components/states';
import { AuthRequestError, authClient } from './auth-client';

type Mode = 'login' | 'register';

/**
 * Used by /register (mode="register"). /login has its own Amazon-style
 * identifier screen (see features/auth/login-identifier-form.tsx) instead of
 * this form's combined email+password step. No <form> submit navigation: the
 * click handler owns the request so errors stay on the page.
 */
export function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    setPending(true);
    setFormError(null);
    setFieldErrors({});

    try {
      if (mode === 'register') {
        await authClient.register({ email, password, displayName });
      } else {
        await authClient.login({ email, password });
      }
      router.push('/account');
      router.refresh(); // server components re-read the new session cookie
    } catch (error) {
      if (error instanceof AuthRequestError) {
        setFieldErrors(error.fieldErrors);
        setFormError(Object.keys(error.fieldErrors).length > 0 ? null : error.message);
      } else {
        setFormError('Something went wrong. Try again.');
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="stack">
      {formError && <ErrorState body={formError} />}

      {mode === 'register' && (
        <Input
          label="Name"
          value={displayName}
          autoComplete="name"
          onChange={(event) => setDisplayName(event.target.value)}
          error={fieldErrors.displayName}
        />
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        autoComplete="email"
        onChange={(event) => setEmail(event.target.value)}
        error={fieldErrors.email}
      />

      <Input
        label="Password"
        type="password"
        value={password}
        autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
        hint={mode === 'register' ? 'At least 12 characters.' : undefined}
        onChange={(event) => setPassword(event.target.value)}
        error={fieldErrors.password}
      />

      <Button block disabled={pending} onClick={() => void submit()}>
        {pending ? 'Working…' : mode === 'register' ? 'Create account' : 'Sign in'}
      </Button>
    </div>
  );
}
