import Link from 'next/link';
import { redirect } from 'next/navigation';
import { AmazonFooter } from '@/components/amazon/amazon-footer';
import { AmazonHeader } from '@/components/amazon/amazon-header';
import { AccountIcon, AccountIconType } from '@/components/amazon/account-icons';
import { getServerSession } from '@/features/auth/server-session';

const CARDS: { title: string; description: string; href: string; icon: AccountIconType }[] = [
  { title: 'Seus pedidos', description: 'Rastrear, devolver ou comprar produtos novamente', href: '/orders', icon: 'orders' },
  { title: 'Acesso e segurança', description: 'Gerenciar senha, e-mail, CPF e número de celular', href: '/security', icon: 'security' },
  { title: 'Prime', description: 'Gerenciar sua assinatura, ver os benefícios e as configurações de pagamento', href: '/prime', icon: 'prime' },

  { title: 'Seus endereços', description: 'Alterar endereços para pedidos e presentes', href: '/addresses', icon: 'addresses' },
  { title: 'Seus pagamentos', description: 'Gerenciar ou adicionar formas de pagamento e ver suas transações', href: '/payment-methods', icon: 'payments' },
  { title: 'Vales-presente', description: 'Ver saldo ou resgatar um vale-presente', href: '/gift-cards', icon: 'giftCards' },

  { title: 'Reembolsos Boleto/Pix', description: 'Ver saldo ou resgatar reembolsos de Boleto e Pix', href: '/refunds', icon: 'refunds' },
  { title: 'Atendimento ao Cliente', description: 'Explorar opções de autoatendimento, artigos de ajuda ou fale conosco', href: '/help', icon: 'support' },
  { title: 'Suas mensagens', description: 'Visualize ou responda às mensagens da Amazon, vendedores e compradores', href: '/messages', icon: 'messages' },

  { title: 'Suas Listas', description: 'Gerenciar, compartilhar, ou criar listas de desejos', href: '/lists', icon: 'lists' },
  { title: 'Serviços digitais e suporte a dispositivos', description: 'Solução problemas com dispositivos, gerencie ou cancele assinaturas digitais', href: '/content-and-devices', icon: 'devices' },
];

/**
 * Not wrapped in FeatureRoute: the authenticated shell belongs to the
 * `authentication` feature, which is the vertical slice that must always
 * work. The `account` feature covers profile management, which is not built
 * yet — each card below routes to its own flag-gated destination instead.
 */
export default async function AccountPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');

  return (
    <div className="amazon-account-page">
      <AmazonHeader />

      <main className="az-account-main">
        <h1 className="az-account-main__title">Sua conta</h1>

        <div className="az-account-grid">
          {CARDS.map(({ title, description, href, icon }) => (
            <Link key={title} href={href} className="az-account-card">
              <span className="az-account-card__icon">
                <AccountIcon type={icon} />
              </span>
              <span>
                <span className="az-account-card__title">{title}</span>
                <span className="az-account-card__desc">{description}</span>
              </span>
            </Link>
          ))}
        </div>
      </main>

      <AmazonFooter />
    </div>
  );
}
