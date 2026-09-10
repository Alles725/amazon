import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AmazonLogo } from '@/components/amazon-logo';
import { FeatureRoute } from '@/config/feature-gate';
import { AuthForm } from '@/features/auth/auth-form';
import { getServerSession } from '@/features/auth/server-session';

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: { email?: string };
}) {
  if (await getServerSession()) redirect('/account');

  return (
    <FeatureRoute routeKey="register" title="Criar conta">
      <main className="amazon-login">
        <Link href="/" className="amazon-login__logo" aria-label="Amazon">
          <AmazonLogo />
        </Link>

        <div className="amazon-card">
          <h1 className="amazon-card__title">Criar conta</h1>

          <AuthForm mode="register" initialEmail={searchParams.email} />

          <hr className="amazon-hr" />

          <div className="amazon-note">
            <p className="amazon-note__title">Já é cliente?</p>
            <Link href="/login">Faça login</Link>
          </div>
        </div>

        <footer className="amazon-login__footer">
          <nav className="amazon-login__footer-links" aria-label="Amazon">
            <a href="#">Condições de uso</a>
            <a href="#">Notificação de privacidade</a>
            <a href="#">Ajuda</a>
            <a href="#">Cookies</a>
            <a href="#">Anúncios Baseados em Interesses</a>
          </nav>
          <p className="amazon-login__footer-copyright">
            © 1996-2026, Amazon.com, Inc. ou suas afiliadas
          </p>
        </footer>
      </main>
    </FeatureRoute>
  );
}
