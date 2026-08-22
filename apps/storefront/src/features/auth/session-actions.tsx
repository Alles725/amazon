'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@amazon-mvp/api-contract';
import { authClient } from './auth-client';

export function SessionActions({ user }: { user: UserProfile | null }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  if (!user) {
    return (
      <>
        <Link className="nav__link" href="/login">
          Sign in
        </Link>
        <Link className="nav__link" href="/register">
          Create account
        </Link>
      </>
    );
  }

  const signOut = async () => {
    setPending(true);
    try {
      await authClient.logout();
      router.push('/');
      router.refresh();
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <Link className="nav__link" href="/account">
        {user.displayName}
      </Link>
      <button className="button button--quiet" disabled={pending} onClick={() => void signOut()}>
        {pending ? 'Signing out…' : 'Sign out'}
      </button>
    </>
  );
}
