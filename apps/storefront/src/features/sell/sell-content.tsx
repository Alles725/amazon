import { ReactNode } from 'react';

// Copy mirrors amazon.com.br "Comece a Vender na Amazon" (node 17877554011).
// Destinations are the ones that page links to on venda.amazon.com.br and
// Seller Central; keep them verbatim.
export const SELL_LINKS = {
  signUp:
    'https://sellercentral.amazon.com.br/gp/on-board/workflow/Registration/login.html?ie=UTF8&passthrough%2Faccount=soa&passthrough%2FsuperSource=OAR&passthrough%2FmarketplaceID=A2Q3Y263D00KWC&passthrough%2FsimplifiedLogin=1&passthrough%2Fld=SDBRSOA_REUS_N',
  terms: 'https://venda.amazon.com.br/termos/vender-com-amazon',
  story: 'https://www.youtube.com/watch?v=lUCbhg_sQe4',
  moreStories: 'https://venda.amazon.com.br/historias',
  rewards: 'https://venda.amazon.com.br/cresca/programa-de-recompensas-do-vendedor',
  fba: 'https://venda.amazon.com.br/cresca/fba',
  sellWithAmazon: 'https://venda.amazon.com.br/vender-com-amazon',
  sellingPlans: 'https://venda.amazon.com.br/precos#planos-de-venda',
  categories: 'https://venda.amazon.com.br/venda#publicar-seus-produtos',
  sellerCentral: 'https://sellercentral.amazon.com.br/',
} as const;

export type SellStat = { value: string; label: ReactNode };

export const HERO_STATS: SellStat[] = [
  {
    value: '1,9M+',
    label: (
      <>
        Vendedores parceiros confiam na Amazon
        <br />
        ao redor do mundo
      </>
    ),
  },
  {
    value: '300M+',
    label: (
      <>
        Clientes compram na Amazon
        <br />
        mundialmente
      </>
    ),
  },
  {
    value: '70%',
    label: 'Dos vendedores da Amazon fazem sua primeira venda em menos de 60 dias',
  },
];

export const STORY_STATS: SellStat[] = [
  {
    value: '74%',
    label: 'dos clientes da Amazon usam a Amazon para descobrir novos produtos ou marcas',
  },
  {
    value: '60%',
    label: 'das vendas na Amazon representam produtos de pequenas e médias empresas',
  },
  { value: '58%', label: 'das vendas na Amazon são de vendedores parceiros' },
];

export type BenefitCard = {
  title: string;
  image: { src: string; alt: string };
  bullets: boolean;
  items: ReactNode[];
  href: string;
};

export const BENEFIT_CARDS: BenefitCard[] = [
  {
    title: 'Receba dinheiro ao completar tarefas',
    image: { src: '/images/sell/card-deliveries.jpg', alt: 'Entregas e pacotes Amazon' },
    bullets: true,
    items: [
      'Ganhe até R$ 300.000 em créditos, se você for Proprietário de Marca;',
      'Ganhe até R$ 50.000 nos seus primeiros 90 dias de vendas, se for indicado por um vendedor da Amazon;',
      'Ganhe até R$ 5.300 em crédito publicitário ao anunciar com Produtos Patrocinados;',
      'Ganhe até R$ 1.200 por cada novo vendedor indicado para a Amazon.',
    ],
    href: SELL_LINKS.rewards,
  },
  {
    title: 'Comece no FBA sem pagar nada por 30 dias',
    image: { src: '/images/sell/card-logistics.jpg', alt: 'Logística Amazon' },
    bullets: false,
    items: [
      'Isenção total nas tarifas de logística, coleta e armazenagem.',
      'Você envia o estoque para o nosso Centro de Distribuição e a Amazon faz o resto: embalagem, envio, entrega com rastreamento e atendimento ao cliente.',
      'Após o período gratuito, tarifa fixa: R$ 6 por unidade',
    ],
    href: SELL_LINKS.fba,
  },
  {
    title: 'Mais benefícios para CNPJs do estado de SP',
    image: { src: '/images/sell/card-vem-de-amazon.jpg', alt: 'Sellers Amazon' },
    bullets: true,
    items: [
      'Venda até R$ 500 mil com comissão ZERO ao iniciar em qualquer programa logístico da Amazon;',
      'Tenha 50% OFF na tarifa de logística dos programas DBA ou FBA Onsite;',
      <>
        Participe do <strong>Programa de Relacionamento Vem de Amazon</strong> e concorra a uma
        viagem a Nova York!
      </>,
    ],
    href: SELL_LINKS.sellWithAmazon,
  },
];

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );
}

export type FaqEntry = { question: string; answer: ReactNode[] };

export const FAQ: FaqEntry[] = [
  {
    question: 'Por que vender na Amazon?',
    answer: [
      'Vender na Amazon é uma oportunidade para alavancar o crescimento do seu negócio, já que o marketplace e a marca possuem milhares de clientes fidelizados e que usam os serviços da Amazon para conhecer e testar novos produtos ou buscar por produtos.',
      'A Amazon quer ajudar empreendedores a impulsionar seus negócios e vender online, assegurando que possam satisfazer seus clientes com uma ferramenta simples e confiável.',
      'Trabalhamos para atrair mais consumidores para o nosso marketplace por meio da seleção de produtos, conveniência e atendimento ao clientes.',
      'Enquanto isso, os vendedores parceiros da Amazon se beneficiam por terem seus produtos à venda no site, possibilitando alcançarem números maiores de vendas e de clientes.',
      'Além disso, os vendedores que contratam os serviços de logística da Amazon, como o FBA, possuem ainda mais facilidades, podendo utilizar os centros de distribuição da empresa e sistema de logística para enviar os pacotes aos clientes e ter o serviço de atendimento realizado pela equipe da própria Amazon, aumentando ainda mais a facilidade do vendedor e a satisfação do cliente',
    ],
  },
  {
    question: 'Quem pode vender na Amazon?',
    answer: [
      'Qualquer pessoa ou empresa que possua um CPF ou CNPJ válido, uma conta de e-mail, conta bancária e cartão de crédito (Visa, MasterCard, Diners) ativos. O cartão de crédito é necessário para verificar que sua conta é real através da cobrança única de R$1,00. Também é usado para realizar as cobranças de taxas de vendas se o saldo de sua conta na Seller Central não for suficiente.',
      'Vendedores precisam gerar e enviar Notas Fiscais Eletrônicas referentes às vendas feitas.',
    ],
  },
  {
    question: 'Quanto custa vender na Amazon?',
    answer: [
      'A Amazon tem diversos planos de assinatura para vendedores parceiros. O plano de vendas Profissional tem mensalidade GRÁTIS por 1 ano. Assim, você pode começar sem custos adicionais. A partir do 13° mês de assinatura, o plano tem um custo mensal de R$ 19,00.',
      'Outra alternativa é a assinatura do Plano Individual, que é isento de mensalidade. Entretanto, cobra-se uma taxa de R$ 2,00 por item vendido.',
      <>
        As comissões e taxas de vendas cobradas aos vendedores parceiros variam conforme a
        categoria do produto.
        <br />
        <ExternalLink href={SELL_LINKS.sellingPlans}>
          Mais informações sobre tarifas e preços.
        </ExternalLink>
      </>,
    ],
  },
  {
    question: 'Quais categorias posso vender na Amazon?',
    answer: [
      <>
        Atualmente, podem ser vendidos produtos de 19 categorias diferentes na Amazon.com.br.
        Saiba mais na página de{' '}
        <ExternalLink href={SELL_LINKS.categories}>Categorias Disponíveis</ExternalLink>.
      </>,
    ],
  },
  {
    question: 'Quando a mensalidade começará a ser cobrada?',
    answer: [
      'Apenas o plano de vendas Profissional possui mensalidade e está com mensalidade GRÁTIS por 1 ano. A partir do 13º mês, tem custo mensal de R$19,00 que será cobrado mensalmente após a conclusão do cadastro, exceto caso haja uma condição promocional divulgada no site no momento da sua adesão.',
      <ExternalLink key="plans" href={SELL_LINKS.sellingPlans}>
        Saiba mais sobre os benefícios do plano Profissional
      </ExternalLink>,
    ],
  },
  {
    question: 'Como eu gerencio minha conta de vendedor na Amazon?',
    answer: [
      <>
        Toda a sua conta como vendedor na Amazon é gerenciada através da{' '}
        <ExternalLink href={SELL_LINKS.sellerCentral}>Seller Central</ExternalLink>. Nesse
        sistema, você tem acesso a ferramentas que vão te ajudar a gerenciar e crescer o seu
        negócio.
      </>,
    ],
  },
  {
    question: 'Qual a tarifa de envio para produtos vendidos na Amazon?',
    answer: [
      'No plano de vendas Profissional, quando um cliente compra seus produtos, a Amazon aplica as configurações de envio que você definiu para calcular a tarifa de envio por peso ou item, em cada pedido. Você pode definir suas taxas de envio com um modelo baseado em item/peso ou faixa de peso. No plano de vendas Individual, a Amazon define a tarifa de envio.',
    ],
  },
  {
    question: 'Como recebo o pagamento dos produtos vendidos na Amazon?',
    answer: [
      'A Amazon deposita o pagamento dos produtos vendidos no marketplace em sua conta bancária quinzenalmente e avisa quando o depósito for feito. Na Seller Central, você pode acompanhar o valor e a data dos próximos depósitos.',
    ],
  },
];
