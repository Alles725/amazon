import { AmazonLogo } from '@/components/amazon-logo';

const COLUMNS = [
  {
    title: 'Conheça-nos',
    links: [
      'Sobre a Amazon',
      'Informações corporativas',
      'Carreiras',
      'Comunicados à imprensa',
      'Comunidade',
      'Acessibilidade',
      'Amazon Science',
    ],
  },
  {
    title: 'Ganhe dinheiro conosco',
    links: [
      'Venda na Amazon',
      'Proteja e construa a sua marca',
      'Forneça para a Amazon',
      'Publique seus livros',
      'Seja um associado',
      'Anuncie seus produtos',
    ],
  },
  {
    title: 'Pagamento',
    links: ['Meios de Pagamento', 'Compre com Pontos', 'Cartão de crédito Amazon'],
  },
  {
    title: 'Deixe-nos ajudar você',
    links: [
      'Sua conta',
      'Frete e prazo de entrega',
      'Devoluções e reembolsos',
      'Gerencie seu conteúdo e dispositivos',
      'Recalls e alertas de segurança do produto',
      'Ajuda',
    ],
  },
];

const BOTTOM_LINKS = [
  'Condições de Uso',
  'Notificação de Privacidade',
  'Cookies',
  'Anúncios Baseados em Interesses',
];

export function AmazonFooter() {
  return (
    <footer className="az-footer">
      <a href="#top" className="az-footer__back-to-top">
        Voltar ao início
      </a>

      <div className="az-footer__main">
        <div className="az-footer__columns">
          {COLUMNS.map((column) => (
            <div key={column.title} className="az-footer__column">
              <h3 className="az-footer__heading">{column.title}</h3>
              <ul className="az-footer__list">
                {column.links.map((link) => (
                  <li key={link}>
                    <a href="#">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="az-footer__bottom">
        <AmazonLogo variant="light" className="az-footer__logo" />
        <span className="az-footer__country">
          <FlagIcon /> Brasil
        </span>
      </div>

      <div className="az-footer__legal">
        <nav className="az-footer__legal-links" aria-label="Legal">
          {BOTTOM_LINKS.map((link) => (
            <a key={link} href="#">
              {link}
            </a>
          ))}
        </nav>
        <p className="az-footer__copyright">© 2021-2026 Amazon.com, Inc. ou suas afiliadas</p>
        <p className="az-footer__company">
          Amazon Serviços de Varejo do Brasil Ltda. | CNPJ 15.436.940/0001-03
        </p>
        <p className="az-footer__address">
          Av. Juscelino Kubitschek, 2041, Torre E, 18º andar - São Paulo CEP: 04543-011 |{' '}
          <a href="#">Fale conosco</a> | ajuda-amazon@amazon.com.br
        </p>
        <p className="az-footer__payments">
          Formas de pagamento aceitas: cartões de crédito (Visa, Mastercard, Elo e Amex), Pix, Nupay,
          pontos Livelo e parcelamento sem cartão.
        </p>
      </div>
    </footer>
  );
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 16" width="20" height="14" aria-hidden="true">
      <rect width="24" height="16" fill="#009c3b" />
      <path d="M12 2 22 8 12 14 2 8Z" fill="#ffdf00" />
      <circle cx="12" cy="8" r="3.2" fill="#002776" />
    </svg>
  );
}
