/** Static copy of the "Atendimento ao Cliente" page, in the order of the reference. */

export interface HelpTopicCard {
  title: string;
  body: string;
  href: string;
}

export interface HelpCategory {
  id: string;
  label: string;
  cards: HelpTopicCard[];
}

export const CS_NAV = [
  { label: 'Página inicial', href: '/help' },
  { label: 'Suporte para dispositivos e serviços digitais', href: '/content-and-devices' },
];

export const HERO_ACTIONS = [
  { label: 'Ajuda com um produto diferente', href: '/orders' },
  { label: 'Ajuda com outra coisa', href: '#az-help-topics' },
];

export const QUICK_LINKS = [
  {
    title: 'Onde está meu pedido?',
    body: 'Rastrear pacotes e receber atualizações de entrega',
    href: '/orders',
  },
  {
    title: 'Suas devoluções',
    body: 'Encontrar todas as devoluções e reembolsos',
    href: '/returns',
  },
  {
    title: 'Problemas com seu pagamento?',
    body: 'Encontrar transações e gerenciar pagamentos',
    href: '/payment-methods',
  },
  {
    title: 'Sua conta',
    body: 'Gerenciar dados de acesso, endereços e preferências',
    href: '/account',
  },
];

const TRACK: HelpTopicCard = {
  title: 'Rastrear seu pacote',
  body: 'Você pode encontrar as informações de rastreamento nos detalhes do seu pedido. Se um pedido incluir vários itens, cada um pode ter datas de entrega e informações de rastreamento diferentes.',
  href: '/orders',
};
const NOT_RECEIVED: HelpTopicCard = {
  title: 'Não recebeu o pedido, mas status indica entregue?',
  body: 'A maioria dos pacotes chega no prazo, mas, às vezes, o rastreamento pode indicar “entregue” e você não recebeu o pacote.',
  href: '/orders',
};
const LATE: HelpTopicCard = {
  title: 'Entregas com atraso',
  body: 'A maioria dos pacotes chega a tempo. Às vezes, os pedidos são entregues após a data estimada de entrega.',
  href: '/shipping',
};
const SHIPPING: HelpTopicCard = {
  title: 'Frete e prazo de entrega',
  body: 'Saiba mais sobre Frete e Prazos de entrega',
  href: '/shipping',
};
const CANCEL: HelpTopicCard = {
  title: 'Cancelar itens ou pedidos',
  body: 'Você pode cancelar itens ou pedidos que ainda não entraram em processo de envio.',
  href: '/orders',
};
const RETURN: HelpTopicCard = {
  title: 'Devolver itens que você comprou',
  body: 'Produtos vendidos na Amazon podem ser devolvidos. Há diferentes opções de devolução, dependendo do vendedor, do produto ou do motivo da devolução.',
  href: '/returns',
};
const REFUND_STATUS: HelpTopicCard = {
  title: 'Verificar o status do seu reembolso',
  body: 'Acompanhe sua devolução e reembolsos em Suas devoluções.',
  href: '/refunds',
};
const PRIME: HelpTopicCard = {
  title: 'Amazon Prime',
  body: 'Como membro Prime, você recebe vários benefícios, incluindo frete rápido GRÁTIS, streaming de filmes, séries de TV e música, ofertas de compras exclusivas, jogos, leitura e muito mais.',
  href: '/prime',
};
const CONTENT: HelpTopicCard = {
  title: 'Gerencie seu conteúdo e dispositivos',
  body: 'Obtenha ajuda com dúvidas gerais relacionadas ao seu dispositivo, conteúdo digital e conta da Amazon.',
  href: '/content-and-devices',
};
const FORUM: HelpTopicCard = {
  title: 'Pergunte à Comunidade da Amazon no Fórum de dispositivos e serviços digitais.',
  body: 'Veja respostas de outros clientes da Amazon no Fórum de dispositivos e serviços digitais.',
  href: '/community',
};
const DIGITAL: HelpTopicCard = {
  title: 'Serviços digitais e suporte a dispositivos',
  body: 'Saiba mais sobre dispositivos e serviços digitais da Amazon e obtenha ajuda para solucionar problemas comuns.',
  href: '/content-and-devices',
};

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'recommended',
    label: 'Tópicos recomendados',
    cards: [
      TRACK,
      NOT_RECEIVED,
      LATE,
      SHIPPING,
      CANCEL,
      RETURN,
      REFUND_STATUS,
      PRIME,
      CONTENT,
      FORUM,
      DIGITAL,
    ],
  },
  {
    id: 'where-is-my-order',
    label: 'Onde está meu pedido?',
    cards: [TRACK, NOT_RECEIVED, LATE, CANCEL],
  },
  {
    id: 'shipping',
    label: 'Envios e entregas',
    cards: [
      SHIPPING,
      LATE,
      {
        title: 'Alterar o endereço de entrega',
        body: 'Gerencie os endereços salvos e escolha para onde enviar seus próximos pedidos.',
        href: '/addresses',
      },
    ],
  },
  {
    id: 'prime',
    label: 'Amazon Prime',
    cards: [
      PRIME,
      {
        title: 'Gerenciar sua assinatura Prime',
        body: 'Veja a data de renovação, altere o plano ou cancele sua assinatura.',
        href: '/prime',
      },
    ],
  },
  {
    id: 'returns',
    label: 'Devoluções e Reembolsos',
    cards: [RETURN, REFUND_STATUS, CANCEL],
  },
  {
    id: 'account',
    label: 'Gerenciando Sua conta',
    cards: [
      {
        title: 'Editar os dados da sua conta',
        body: 'Altere nome, e-mail, senha e número de celular da sua conta Amazon.',
        href: '/account',
      },
      {
        title: 'Gerenciar endereços',
        body: 'Adicione, edite ou remova endereços de entrega.',
        href: '/addresses',
      },
      {
        title: 'Listas de compras e de desejos',
        body: 'Crie e organize listas para acompanhar produtos.',
        href: '/lists',
      },
    ],
  },
  {
    id: 'security',
    label: 'Segurança e Privacidade',
    cards: [
      {
        title: 'Acesso e segurança',
        body: 'Proteja sua conta com uma senha forte e a verificação em duas etapas.',
        href: '/security',
      },
      {
        title: 'Notificação de Privacidade',
        body: 'Saiba como coletamos e usamos suas informações pessoais.',
        href: '/security',
      },
    ],
  },
  {
    id: 'payment',
    label: 'Pagamento, preços e promoções',
    cards: [
      {
        title: 'Meios de pagamento aceitos',
        body: 'Cartões de crédito, Pix e outras formas de pagamento aceitas na Amazon.com.br.',
        href: '/payment-methods',
      },
      {
        title: 'Vale-presentes',
        body: 'Resgate, confira o saldo e compre vale-presentes.',
        href: '/gift-cards',
      },
      {
        title: 'Compre com Pontos',
        body: 'Use pontos de programas parceiros para pagar suas compras.',
        href: '/points',
      },
    ],
  },
  {
    id: 'digital',
    label: 'Dispositivos e Serviços Digitais',
    cards: [CONTENT, DIGITAL, FORUM],
  },
  {
    id: 'fraud',
    label: 'Identifique e denuncie fraudes',
    cards: [
      {
        title: 'Identificar mensagens suspeitas',
        body: 'Saiba reconhecer e-mails, ligações e mensagens que fingem ser da Amazon.',
        href: '/security',
      },
      {
        title: 'Denunciar uma fraude',
        body: 'Informe atividades suspeitas relacionadas à sua conta ou aos seus pedidos.',
        href: '/messages',
      },
    ],
  },
  {
    id: 'other',
    label: 'Outros tópicos e páginas de Ajuda',
    cards: [
      {
        title: 'Recalls e alertas de segurança do produto',
        body: 'Confira os recalls e alertas de segurança de produtos vendidos na Amazon.',
        href: '/recalls',
      },
      {
        title: 'Acessibilidade',
        body: 'Recursos de acessibilidade para comprar na Amazon.',
        href: '/accessibility',
      },
    ],
  },
];
