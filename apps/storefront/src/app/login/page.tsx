import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AmazonLogo } from '@/components/amazon-logo';
import { FeatureRoute } from '@/config/feature-gate';
import { LoginIdentifierForm } from '@/features/auth/login-identifier-form';
import { getServerSession } from '@/features/auth/server-session';

export default async function LoginPage() {
  if (await getServerSession()) redirect('/account');

  return (
    <FeatureRoute routeKey="login" title="Faça login ou crie uma conta">
      <main className="amazon-login">
        <Link href="/" className="amazon-login__logo" aria-label="Amazon">
          <AmazonLogo />
        </Link>

        <LoginIdentifierForm />

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
