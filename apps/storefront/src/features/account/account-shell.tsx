import 'server-only';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ReactNode } from 'react';
import { SessionResponse } from '@amazon-mvp/api-contract';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { getServerSession } from '@/features/auth/server-session';
import './account.css';

/** Every account page requires a session, like /account and /orders. Guests go
 * to login and come back here afterwards. */
export async function requireAccountSession(path: string): Promise<SessionResponse> {
  const session = await getServerSession();
  if (!session) redirect(`/login?next=${encodeURIComponent(path)}`);
  return session;
}

/** Amazon account-page frame: header, "Sua conta › X" breadcrumb, title, footer. */
export function AccountShell({
  title,
  lead,
  actions,
  wide = false,
  children,
}: {
  title: string;
  lead?: ReactNode;
  actions?: ReactNode;
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="amazon-account-page az-acct">
      <AmazonHeader />
      <main className={`az-acct-main${wide ? ' az-acct-main--wide' : ''}`}>
        <nav className="az-acct-crumbs" aria-label="Trilha de navegação">
          <ol>
            <li>
              <Link href="/account">Sua conta</Link>
            </li>
            <li aria-current="page">{title}</li>
          </ol>
        </nav>
        <div className="az-acct-top">
          <h1 className="az-acct-title">{title}</h1>
          {actions}
        </div>
        {lead && <p className="az-acct-lead">{lead}</p>}
        {children}
      </main>
      <AmazonFooter />
    </div>
  );
}

/** Truthful note for features this academic store does not operate. */
export function AcademicNotice({ children }: { children: ReactNode }) {
  return (
    <div className="az-acct-alert" role="note">
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="12" cy="12" r="10" fill="#007185" />
        <path d="M12 10.5v6M12 7.2v.1" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
      <div>{children}</div>
    </div>
  );
}

/** A titled box of an account page whose data area is honestly empty. */
export function EmptyPanel({
  heading,
  message,
  children,
}: {
  heading: string;
  message: string;
  children?: ReactNode;
}) {
  const id = `panel-${heading.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <section className="az-acct-box" aria-labelledby={id}>
      <h2 id={id} className="az-acct-box__heading">
        {heading}
      </h2>
      <div className="az-acct-box__body">
        <p className="az-acct-empty">{message}</p>
        {children}
      </div>
    </section>
  );
}
