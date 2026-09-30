/**
 * Copy of the footer help/payment pages ("Pagamento" and "Deixe-nos ajudar você").
 *
 * Every statement about THIS store mirrors what the code actually does
 * (checkout, orders, catalog). Program pages (points, credit card, content and
 * devices) describe the Amazon area in general, evergreen terms and say plainly
 * that it is not available here. No numbers, partners, fees or dates are invented.
 */

import type { Metadata } from 'next';

export type CustomerPageKey =
  | 'paymentMethods'
  | 'points'
  | 'creditCard'
  | 'shipping'
  | 'returns'
  | 'contentAndDevices'
  | 'recalls';

/** Plain text, or text mixed with internal links. */
export type RichText = string | Array<string | { text: string; href: string }>;

export type PageIcon =
  | 'payment'
  | 'points'
  | 'creditCard'
  | 'shipping'
  | 'returns'
  | 'devices'
  | 'recalls'
  | 'card'
  | 'pix';

export type ContentBlock =
  | { kind: 'text'; paragraphs: RichText[] }
  | { kind: 'list'; items: RichText[] }
  | { kind: 'steps'; items: Array<{ title: string; body: RichText }> }
  | { kind: 'facts'; caption: string; items: Array<{ term: string; detail: RichText }> }
  | {
      kind: 'methods';
      items: Array<{ icon: PageIcon; title: string; label: string; points: RichText[] }>;
    }
  | { kind: 'installments'; totalMinor: number; count: number }
  | { kind: 'links'; items: Array<{ title: string; body: string; href: string }> }
  | { kind: 'faq'; items: Array<{ question: string; answer: RichText[] }> }
  | { kind: 'empty'; title: string; body: string }
  /** Filled by the page with request-time data (e.g. the user's orders). */
  | { kind: 'slot'; name: 'transactions' };

export interface ContentSection {
  id: string;
  title: string;
  blocks: ContentBlock[];
}

export interface CustomerPage {
  key: CustomerPageKey;
  href: string;
  /** Sidebar group, matching the footer column. */
  group: 'payment' | 'help';
  /** Help-library category shown in the breadcrumb (same labels as /help). */
  category: string;
  title: string;
  /** Short text for sidebar/related cards and the meta description. */
  summary: string;
  lead: string;
  icon: PageIcon;
  notice?: { tone: 'info' | 'warning'; title: string; body: RichText };
  sections: ContentSection[];
  related: CustomerPageKey[];
}

export const GROUP_LABELS: Record<CustomerPage['group'], string> = {
  payment: 'Pagamento',
  help: 'Deixe-nos ajudar você',
};

const ORDERS = { text: 'Seus pedidos', href: '/orders' };

const paymentMethods: CustomerPage = {
  key: 'paymentMethods',
  href: '/payment-methods',
  group: 'payment',
  category: 'Pagamento, preços e promoções',
  title: 'Meios de pagamento',
  summary: 'Cartão e Pix simulados, parcelamento e as transações dos seus pedidos.',
  lead: 'Veja quais formas de pagamento o checkout desta loja aceita, como o parcelamento aparece nas páginas de produto e onde encontrar as transações dos seus pedidos.',
  icon: 'payment',
  notice: {
    tone: 'info',
    title: 'Pagamentos simulados',
    body: 'Esta é uma loja acadêmica: nenhuma forma de pagamento gera cobrança real. A loja não coleta número de cartão, código de segurança (CVV), senha bancária nem chave Pix.',
  },
  sections: [
    {
      id: 'formas-aceitas',
      title: 'Formas de pagamento aceitas',
      blocks: [
        {
          kind: 'methods',
          items: [
            {
              icon: 'card',
              title: 'Cartão de crédito',
              label: 'Cartão fictício · Visa final 4242',
              points: [
                'Um cartão fictício, já cadastrado para a simulação: não é preciso digitar nenhum dado.',
                'O pedido é registrado com o total calculado pela loja, sem cobrança.',
                'Nos detalhes do pedido, a forma de pagamento aparece com o mesmo nome.',
              ],
            },
            {
              icon: 'pix',
              title: 'Pix',
              label: 'Pix simulado',
              points: [
                'Nenhum QR Code ou chave Pix é gerado e nenhuma transferência acontece.',
                'Quando houver desconto para pagamento com Pix, ele aparece no resumo do pedido antes da confirmação.',
                'Nos detalhes do pedido, a forma de pagamento aparece como “Pix simulado”.',
              ],
            },
          ],
        },
        {
          kind: 'text',
          paragraphs: [
            'Boleto, vale-presente, pontos de programas de fidelidade, carteiras digitais e cartões reais não estão disponíveis nesta loja.',
          ],
        },
      ],
    },
    {
      id: 'como-pagar',
      title: 'Como escolher a forma de pagamento',
      blocks: [
        {
          kind: 'steps',
          items: [
            {
              title: 'Revise o carrinho',
              body: [
                'Confira produtos e quantidades no ',
                { text: 'Carrinho', href: '/cart' },
                ' e clique em “Continuar para finalizar a compra”.',
              ],
            },
            {
              title: 'Escolha o endereço de entrega',
              body: 'No checkout, selecione um endereço salvo ou cadastre um novo.',
            },
            {
              title: 'Selecione a forma de pagamento',
              body: 'Em “Forma de pagamento”, escolha “Cartão fictício · Visa final 4242” ou “Pix simulado”. Nenhuma opção vem marcada: o pedido só pode ser confirmado depois da escolha.',
            },
            {
              title: 'Confira o resumo e confirme',
              body: 'O resumo mostra itens, frete e total do pedido. Clique em “Confirmar pedido” para registrá-lo.',
            },
          ],
        },
        {
          kind: 'text',
          paragraphs: [
            'O total é sempre calculado pelo servidor com os preços atuais do catálogo. Se preços ou quantidades mudarem entre a revisão e a confirmação, o checkout pede uma nova revisão antes de concluir a compra.',
          ],
        },
      ],
    },
    {
      id: 'parcelamento',
      title: 'Parcelamento',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Alguns produtos mostram, abaixo do preço, uma condição como “ou em até 6x sem juros”. O valor de cada parcela é o preço dividido pelo número de parcelas, arredondado para baixo no centavo; a última parcela absorve a diferença, e o total nunca muda.',
          ],
        },
        { kind: 'installments', totalMinor: 100000, count: 6 },
        {
          kind: 'text',
          paragraphs: [
            'O checkout desta loja não oferece a escolha do número de parcelas: o pedido registra apenas a forma de pagamento e o total, sem juros.',
          ],
        },
      ],
    },
    {
      id: 'transacoes',
      title: 'Suas transações',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'A loja não guarda cartões nem outras formas de pagamento na sua conta, então não há carteira para gerenciar. Cada pedido registra a forma de pagamento escolhida no checkout.',
          ],
        },
        { kind: 'slot', name: 'transactions' },
      ],
    },
    {
      id: 'seguranca',
      title: 'Pagamentos e segurança',
      blocks: [
        {
          kind: 'list',
          items: [
            'O checkout nunca pede número de cartão, validade, CVV, senha bancária ou chave Pix.',
            'Preços e totais são recalculados pelo servidor; valores enviados pelo navegador não são aceitos.',
            'Desconfie de mensagens, e-mails ou páginas que peçam dados de pagamento em nome da loja.',
            'Não informe dados reais de cartão ou documentos em nenhuma página desta loja acadêmica.',
          ],
        },
      ],
    },
    {
      id: 'perguntas',
      title: 'Perguntas frequentes',
      blocks: [
        {
          kind: 'faq',
          items: [
            {
              question: 'Serei cobrado ao confirmar um pedido?',
              answer: [
                'Não. O pedido é gravado com a forma de pagamento escolhida e o total, mas nenhuma cobrança ou transferência acontece.',
              ],
            },
            {
              question: 'Posso alterar a forma de pagamento de um pedido já feito?',
              answer: [
                'Não. A forma de pagamento fica registrada no pedido no momento da confirmação e não há opção para alterá-la depois.',
              ],
            },
            {
              question: 'Posso pagar com boleto ou com um cartão real?',
              answer: [
                'Não. O checkout aceita somente as duas formas simuladas: cartão fictício e Pix simulado.',
              ],
            },
          ],
        },
      ],
    },
  ],
  related: ['shipping', 'returns', 'points', 'creditCard'],
};

const points: CustomerPage = {
  key: 'points',
  href: '/points',
  group: 'payment',
  category: 'Pagamento, preços e promoções',
  title: 'Compre com Pontos',
  summary: 'Como funciona o pagamento de compras com pontos de programas de fidelidade.',
  lead: 'Entenda como funciona, em geral, o pagamento de compras com pontos de programas de fidelidade e o que está disponível nesta loja.',
  icon: 'points',
  notice: {
    tone: 'warning',
    title: 'Indisponível nesta loja acadêmica',
    body: 'Não é possível pagar com pontos aqui. O checkout aceita apenas cartão fictício e Pix simulado, e nenhuma conta de programa de fidelidade pode ser vinculada.',
  },
  sections: [
    {
      id: 'o-que-e',
      title: 'O que é Compre com Pontos',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Compre com Pontos é uma forma de pagamento em que o cliente usa pontos acumulados em um programa de fidelidade parceiro para pagar uma compra, total ou parcialmente. Os pontos são convertidos em reais de acordo com as regras do programa de origem.',
          ],
        },
      ],
    },
    {
      id: 'como-funciona',
      title: 'Como funciona',
      blocks: [
        {
          kind: 'steps',
          items: [
            {
              title: 'Vincule sua conta',
              body: 'Conecte a conta do programa de fidelidade à sua conta de compras, pelo processo de autorização do próprio programa.',
            },
            {
              title: 'Escolha usar pontos no checkout',
              body: 'Na etapa de pagamento, indique quanto do valor do pedido deseja pagar com pontos.',
            },
            {
              title: 'Complete o valor, se necessário',
              body: 'Se os pontos não cobrirem o total, a diferença é paga com outra forma de pagamento.',
            },
            {
              title: 'Confira antes de confirmar',
              body: 'O resumo do pedido mostra quantos pontos serão usados e o valor correspondente.',
            },
          ],
        },
      ],
    },
    {
      id: 'antes-de-usar',
      title: 'Antes de usar seus pontos',
      blocks: [
        {
          kind: 'list',
          items: [
            'A taxa de conversão, a validade dos pontos e as regras de estorno são definidas pelo programa de fidelidade, não pela loja.',
            'Nem todos os produtos, vendedores ou formas de entrega podem aceitar pagamento com pontos.',
            'Em cancelamentos e devoluções, a forma como os pontos retornam depende das regras do programa.',
            'Nunca informe a senha do seu programa de fidelidade fora do ambiente oficial do próprio programa.',
          ],
        },
      ],
    },
    {
      id: 'nesta-loja',
      title: 'Nesta loja',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Esta loja acadêmica não tem programa de pontos, não mostra saldo de pontos e não se conecta a programas de fidelidade. Os pedidos não geram nem consomem pontos.',
          ],
        },
        {
          kind: 'links',
          items: [
            {
              title: 'Meios de pagamento',
              body: 'Veja as formas de pagamento simuladas aceitas no checkout.',
              href: '/payment-methods',
            },
            {
              title: 'Seus pedidos',
              body: 'Consulte a forma de pagamento e o total de cada pedido.',
              href: '/orders',
            },
          ],
        },
      ],
    },
    {
      id: 'perguntas',
      title: 'Perguntas frequentes',
      blocks: [
        {
          kind: 'faq',
          items: [
            {
              question: 'Posso ver meu saldo de pontos nesta loja?',
              answer: [
                'Não. Esta loja não mantém saldo de pontos nem consulta programas parceiros.',
              ],
            },
            {
              question: 'Meus pedidos aqui acumulam pontos?',
              answer: [
                'Não. Os pedidos desta loja são simulados e não geram pontos em nenhum programa.',
              ],
            },
          ],
        },
      ],
    },
  ],
  related: ['paymentMethods', 'creditCard', 'returns'],
};

const creditCard: CustomerPage = {
  key: 'creditCard',
  href: '/credit-card',
  group: 'payment',
  category: 'Pagamento, preços e promoções',
  title: 'Cartão de crédito Amazon',
  summary: 'Como funciona um cartão de crédito com a marca da loja.',
  lead: 'Saiba o que é um cartão de crédito com a marca de uma loja, como ele costuma funcionar e por que não é possível solicitá-lo nesta loja acadêmica.',
  icon: 'creditCard',
  notice: {
    tone: 'warning',
    title: 'Não é possível solicitar cartão aqui',
    body: 'Esta loja acadêmica não oferece cartão de crédito, não faz análise de crédito e não recebe pedidos de cartão. Não envie CPF, renda ou dados de cartão por nenhuma página desta loja.',
  },
  sections: [
    {
      id: 'como-funciona',
      title: 'Como funciona um cartão com a marca da loja',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Um cartão de crédito com a marca de uma loja (cartão co-branded) é emitido por uma instituição financeira em parceria com a varejista. A emissora é responsável pela análise de crédito, pelo limite, pela fatura e pelas tarifas; a loja costuma oferecer benefícios ligados às compras.',
            'Em geral, esse tipo de cartão também pode ser usado fora da loja, como qualquer cartão de crédito da mesma bandeira.',
          ],
        },
      ],
    },
    {
      id: 'beneficios',
      title: 'Benefícios que podem existir',
      blocks: [
        {
          kind: 'list',
          items: [
            'Acúmulo de pontos por compra, com regras de conversão definidas no regulamento do cartão.',
            'Condições especiais de parcelamento em compras na loja parceira.',
            'Ofertas e promoções exclusivas para quem tem o cartão.',
          ],
        },
        {
          kind: 'text',
          paragraphs: [
            'Os benefícios reais, quando existem, constam do regulamento oficial do cartão e podem mudar ao longo do tempo.',
          ],
        },
      ],
    },
    {
      id: 'antes-de-solicitar',
      title: 'Antes de solicitar um cartão',
      blocks: [
        {
          kind: 'list',
          items: [
            'Leia o contrato e o regulamento do programa de benefícios.',
            'Confira anuidade, juros do rotativo e do parcelamento da fatura e o Custo Efetivo Total (CET), informados pela emissora.',
            'A aprovação e o limite dependem da análise de crédito feita pela emissora.',
            'Solicite apenas pelos canais oficiais da instituição emissora.',
          ],
        },
      ],
    },
    {
      id: 'nesta-loja',
      title: 'Nesta loja',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'O checkout aceita somente o cartão fictício (Visa final 4242) e o Pix simulado. Mensagens sobre o cartão Amazon exibidas nas páginas de produto fazem parte da reprodução visual da loja e não representam uma oferta: não há pontos, anuidade, limite ou fatura associados.',
          ],
        },
        {
          kind: 'links',
          items: [
            {
              title: 'Meios de pagamento',
              body: 'Veja as formas de pagamento simuladas aceitas no checkout.',
              href: '/payment-methods',
            },
            {
              title: 'Compre com Pontos',
              body: 'Entenda como funciona o pagamento com pontos de programas de fidelidade.',
              href: '/points',
            },
          ],
        },
      ],
    },
    {
      id: 'perguntas',
      title: 'Perguntas frequentes',
      blocks: [
        {
          kind: 'faq',
          items: [
            {
              question: 'Posso usar meu cartão de crédito real nesta loja?',
              answer: [
                'Não. O checkout não aceita cartões reais e não tem campos para dados de cartão.',
              ],
            },
            {
              question: 'Onde vejo a fatura do cartão?',
              answer: [
                'Não há fatura. Nenhum cartão é emitido e nenhuma compra é cobrada nesta loja acadêmica.',
              ],
            },
          ],
        },
      ],
    },
  ],
  related: ['paymentMethods', 'points', 'returns'],
};

const shipping: CustomerPage = {
  key: 'shipping',
  href: '/shipping',
  group: 'help',
  category: 'Envios e entregas',
  title: 'Frete e prazo de entrega',
  summary: 'Custo do frete, endereço de entrega e status dos seus pedidos.',
  lead: 'Veja como o frete é calculado no checkout, como o endereço de entrega é usado e o que significa cada status de entrega dos seus pedidos.',
  icon: 'shipping',
  notice: {
    tone: 'info',
    title: 'Entregas simuladas',
    body: 'Nesta loja acadêmica nenhum pedido é despachado de verdade: não há transportadora, código de rastreamento nem cálculo de prazo de entrega.',
  },
  sections: [
    {
      id: 'custo',
      title: 'Custo do frete',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'O frete é calculado pelo servidor junto com o resumo do pedido e, nesta simulação, é sempre R$ 0,00 — para qualquer endereço, produto ou quantidade.',
            'O valor aparece na linha “Frete” do resumo no checkout e em “Frete e manuseio” nos detalhes do pedido.',
          ],
        },
      ],
    },
    {
      id: 'prazo',
      title: 'Prazo de entrega',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'O checkout não calcula nem promete uma data de entrega; por isso, nenhuma data estimada é exibida antes da compra.',
            'Indicações como “Entrega GRÁTIS” e “Enviado pela Amazon” nas páginas de produto fazem parte da apresentação do catálogo e não definem prazo.',
          ],
        },
      ],
    },
    {
      id: 'endereco',
      title: 'Endereço de entrega',
      blocks: [
        {
          kind: 'steps',
          items: [
            {
              title: 'Escolha ou cadastre um endereço',
              body: 'No checkout, selecione um dos seus endereços salvos ou cadastre um novo.',
            },
            {
              title: 'Edite antes de confirmar',
              body: 'Enquanto o pedido não é confirmado, você pode editar o endereço escolhido.',
            },
            {
              title: 'O pedido guarda uma cópia',
              body: 'Ao confirmar, o endereço é copiado para o pedido. Alterações posteriores no cadastro não mudam pedidos já feitos.',
            },
          ],
        },
      ],
    },
    {
      id: 'status',
      title: 'Status de entrega',
      blocks: [
        {
          kind: 'facts',
          caption: 'Status exibidos em Seus pedidos',
          items: [
            {
              term: 'Pedido recebido',
              detail:
                'O pedido foi registrado e ainda não foi enviado. Pedidos feitos no checkout permanecem neste status, pois não há integração com transportadora.',
            },
            { term: 'Enviado', detail: 'O pedido foi marcado como enviado.' },
            {
              term: 'Entregue no dia…',
              detail:
                'O pedido tem data de entrega registrada. A partir dela, cada item mostra o prazo de devolução.',
            },
            { term: 'Cancelado', detail: 'O pedido foi cancelado.' },
          ],
        },
        {
          kind: 'text',
          paragraphs: [
            [
              'A aba “Ainda não enviado” de ',
              ORDERS,
              ' reúne os pedidos que ainda não saíram para entrega.',
            ],
          ],
        },
      ],
    },
    {
      id: 'acompanhar',
      title: 'Acompanhar um pedido',
      blocks: [
        {
          kind: 'links',
          items: [
            {
              title: 'Seus pedidos',
              body: 'Veja todos os seus pedidos, filtre por período e pesquise por produto ou número do pedido.',
              href: '/orders',
            },
            {
              title: 'Atendimento ao Cliente',
              body: 'Encontre ajuda para seus produtos recentes e outros tópicos.',
              href: '/help',
            },
          ],
        },
        {
          kind: 'text',
          paragraphs: [
            'O botão “Rastrear pacote” abre os detalhes do pedido, com status, endereço de entrega, forma de pagamento, resumo de valores e itens.',
          ],
        },
      ],
    },
    {
      id: 'perguntas',
      title: 'Perguntas frequentes',
      blocks: [
        {
          kind: 'faq',
          items: [
            {
              question: 'Por que meu pedido continua como “Pedido recebido”?',
              answer: [
                'Porque os pedidos desta loja não são enviados de verdade. Não há transportadora nem atualização automática de status.',
              ],
            },
            {
              question: 'Posso mudar o endereço de um pedido já feito?',
              answer: [
                'Não. O endereço fica registrado no pedido no momento da confirmação. Para os próximos pedidos, escolha ou edite o endereço no checkout.',
              ],
            },
            {
              question: 'O frete é diferente para membros Prime?',
              answer: [
                'Não. Esta loja não tem assinatura Prime, e o frete é R$ 0,00 para todos os pedidos da simulação.',
              ],
            },
          ],
        },
      ],
    },
  ],
  related: ['returns', 'paymentMethods', 'recalls'],
};

const returns: CustomerPage = {
  key: 'returns',
  href: '/returns',
  group: 'help',
  category: 'Devoluções e Reembolsos',
  title: 'Devoluções e reembolsos',
  summary: 'Como funciona uma devolução e o prazo exibido nos seus pedidos.',
  lead: 'Entenda como funciona o processo de devolução em uma loja Amazon, onde conferir o prazo de devolução dos seus pedidos e o que está disponível nesta loja acadêmica.',
  icon: 'returns',
  notice: {
    tone: 'warning',
    title: 'Devoluções não podem ser solicitadas online nesta loja',
    body: 'Esta loja acadêmica não tem fluxo de devolução, troca ou cancelamento. Como os pagamentos são simulados, também não há valores a reembolsar.',
  },
  sections: [
    {
      id: 'como-funciona',
      title: 'Como funciona uma devolução',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Em uma loja Amazon, a devolução normalmente segue as etapas abaixo. As opções variam conforme o vendedor, o produto e o motivo da devolução.',
          ],
        },
        {
          kind: 'steps',
          items: [
            {
              title: 'Encontre o pedido',
              body: 'Em Seus pedidos, localize o item e escolha a opção de devolução.',
            },
            {
              title: 'Informe o motivo',
              body: 'Selecione o motivo da devolução e, quando houver, a preferência por reembolso ou substituição.',
            },
            {
              title: 'Escolha como devolver',
              body: 'Selecione uma das formas de envio oferecidas para aquele item.',
            },
            {
              title: 'Embale e envie',
              body: 'Embale o produto com seus acessórios e manuais e envie dentro do prazo indicado.',
            },
            {
              title: 'Acompanhe o reembolso',
              body: 'O reembolso é processado depois que a devolução é recebida e analisada.',
            },
          ],
        },
      ],
    },
    {
      id: 'prazo',
      title: 'Prazo de devolução nos seus pedidos',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            [
              'Em ',
              ORDERS,
              ', cada item de um pedido entregue mostra até quando está qualificado para devolução — um mês após a data de entrega. Depois dessa data, a mensagem passa a informar que o período de devolução se encerrou.',
            ],
            'Pedidos ainda não entregues ou cancelados não mostram prazo de devolução. A política de devolução de cada produto também aparece na página do produto.',
          ],
        },
        {
          kind: 'links',
          items: [
            {
              title: 'Seus pedidos',
              body: 'Confira status, prazo de devolução e detalhes de cada pedido.',
              href: '/orders',
            },
          ],
        },
      ],
    },
    {
      id: 'reembolsos',
      title: 'Reembolsos',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Como nenhuma cobrança real acontece nesta loja, não há reembolso a receber. Os valores exibidos nos pedidos existem apenas para a simulação.',
          ],
        },
      ],
    },
    {
      id: 'cancelamentos',
      title: 'Cancelamentos',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Esta loja não tem opção para cancelar pedidos ou itens pelo site. Um pedido cancelado aparece com o status “Cancelado” em Seus pedidos.',
          ],
        },
      ],
    },
    {
      id: 'perguntas',
      title: 'Perguntas frequentes',
      blocks: [
        {
          kind: 'faq',
          items: [
            {
              question: 'Recebi um produto com defeito. O que faço?',
              answer: [
                'Nesta loja acadêmica nenhum produto é entregue de verdade. Em uma compra real, procure o vendedor pelo canal de atendimento da loja onde comprou e consulte a garantia do fabricante.',
              ],
            },
            {
              question: 'Onde vejo o status do meu reembolso?',
              answer: [
                'Não há reembolsos nesta loja, porque os pagamentos são simulados e nenhum valor é cobrado.',
              ],
            },
            {
              question: 'Posso trocar um produto por outro?',
              answer: [
                'Não pelo site. Se quiser outro produto, basta fazer um novo pedido; o anterior continua registrado em Seus pedidos.',
              ],
            },
          ],
        },
      ],
    },
  ],
  related: ['shipping', 'paymentMethods', 'recalls'],
};

const contentAndDevices: CustomerPage = {
  key: 'contentAndDevices',
  href: '/content-and-devices',
  group: 'help',
  category: 'Dispositivos e Serviços Digitais',
  title: 'Gerencie seu conteúdo e dispositivos',
  summary: 'Conteúdo digital, dispositivos registrados e preferências da conta.',
  lead: 'Conheça a área em que clientes da Amazon gerenciam conteúdo digital, dispositivos e preferências, e veja o que existe nesta loja acadêmica.',
  icon: 'devices',
  notice: {
    tone: 'info',
    title: 'Área não disponível nesta loja',
    body: 'Esta loja vende apenas produtos físicos simulados. Não há biblioteca de conteúdo digital, registro de dispositivos nem assinaturas digitais vinculadas à sua conta.',
  },
  sections: [
    {
      id: 'o-que-e',
      title: 'O que é esta área',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Na Amazon, “Gerencie seu conteúdo e dispositivos” reúne em um só lugar o conteúdo digital comprado ou baixado — como eBooks Kindle e aplicativos — e os dispositivos registrados na conta, como leitores Kindle, dispositivos Echo e Fire TV.',
          ],
        },
      ],
    },
    {
      id: 'o-que-fazer',
      title: 'O que costuma ser possível fazer',
      blocks: [
        {
          kind: 'facts',
          caption: 'Seções da área de conteúdo e dispositivos',
          items: [
            {
              term: 'Conteúdo',
              detail:
                'Ver, baixar, enviar para um dispositivo ou excluir conteúdo digital da biblioteca.',
            },
            {
              term: 'Dispositivos',
              detail:
                'Ver os dispositivos registrados, renomeá-los ou cancelar o registro de um deles.',
            },
            {
              term: 'Preferências',
              detail:
                'Ajustar configurações de país, pagamento digital e sincronização entre dispositivos.',
            },
            {
              term: 'Privacidade',
              detail:
                'Gerenciar as configurações de privacidade dos dispositivos e dos serviços de voz.',
            },
          ],
        },
      ],
    },
    {
      id: 'nesta-loja',
      title: 'Dispositivos comprados nesta loja',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            [
              'O catálogo inclui dispositivos como Kindle e Echo. Na simulação, eles são pedidos como qualquer outro produto: aparecem em ',
              ORDERS,
              ', mas não são registrados na sua conta nem recebem conteúdo digital.',
            ],
          ],
        },
      ],
    },
    {
      id: 'seguranca',
      title: 'Cuidados com seus dispositivos',
      blocks: [
        {
          kind: 'list',
          items: [
            'Antes de vender ou doar um dispositivo, cancele o registro na sua conta e restaure as configurações de fábrica.',
            'Mantenha o software do dispositivo atualizado.',
            'Use uma senha forte na conta vinculada aos seus dispositivos e não a compartilhe.',
          ],
        },
      ],
    },
    {
      id: 'perguntas',
      title: 'Perguntas frequentes',
      blocks: [
        {
          kind: 'faq',
          items: [
            {
              question: 'Comprei um Kindle aqui. Ele aparece como dispositivo registrado?',
              answer: [
                'Não. Nesta loja os pedidos são simulados e nenhum dispositivo é registrado na sua conta.',
              ],
            },
            {
              question: 'Posso comprar eBooks ou aplicativos nesta loja?',
              answer: ['Não. Esta loja não vende nem entrega conteúdo digital.'],
            },
          ],
        },
      ],
    },
  ],
  related: ['recalls', 'returns', 'shipping'],
};

const recalls: CustomerPage = {
  key: 'recalls',
  href: '/recalls',
  group: 'help',
  category: 'Outros tópicos e páginas de Ajuda',
  title: 'Recalls e alertas de segurança do produto',
  summary: 'Recalls ativos e o que fazer se um produto seu for afetado.',
  lead: 'Consulte recalls e alertas de segurança de produtos vendidos nesta loja e saiba o que fazer se um produto que você tem for afetado.',
  icon: 'recalls',
  sections: [
    {
      id: 'recalls-ativos',
      title: 'Recalls ativos',
      blocks: [
        {
          kind: 'empty',
          title: 'Não há recalls ativos para produtos desta loja',
          body: 'Nenhum produto do catálogo desta loja acadêmica tem recall ou alerta de segurança registrado.',
        },
      ],
    },
    {
      id: 'o-que-e',
      title: 'O que é um recall',
      blocks: [
        {
          kind: 'text',
          paragraphs: [
            'Recall é o chamamento feito pelo fabricante ou fornecedor para corrigir, trocar ou recolher um produto que apresenta risco à saúde ou à segurança do consumidor, identificado depois que o produto chegou ao mercado.',
            'No Brasil, o Código de Defesa do Consumidor determina que o fornecedor que descobre esse tipo de risco comunique o fato às autoridades competentes e aos consumidores.',
          ],
        },
      ],
    },
    {
      id: 'se-for-afetado',
      title: 'Se um produto que você tem for afetado',
      blocks: [
        {
          kind: 'steps',
          items: [
            {
              title: 'Pare de usar o produto',
              body: 'Interrompa o uso imediatamente, a menos que o aviso de recall oriente de outra forma.',
            },
            {
              title: 'Confira o modelo e o lote',
              body: 'Compare modelo, lote ou número de série do seu produto com os informados no aviso.',
            },
            {
              title: 'Siga as instruções do fabricante',
              body: 'O aviso explica como obter reparo, troca ou recolhimento. O atendimento do recall não deve gerar custo para o consumidor.',
            },
            {
              title: 'Tenha os dados da compra em mãos',
              body: ['Guarde a nota fiscal e consulte os dados do pedido em ', ORDERS, '.'],
            },
          ],
        },
      ],
    },
    {
      id: 'uso-seguro',
      title: 'Uso seguro no dia a dia',
      blocks: [
        {
          kind: 'list',
          items: [
            'Leia o manual e as advertências antes do primeiro uso.',
            'Use carregadores e cabos compatíveis, indicados pelo fabricante.',
            'Mantenha peças pequenas, baterias tipo moeda e ímãs longe do alcance de crianças.',
            'Não use produtos com sinais de superaquecimento, bateria estufada, fumaça ou cheiro de queimado.',
            'Quando possível, cadastre o produto junto ao fabricante para receber avisos de segurança.',
          ],
        },
      ],
    },
  ],
  related: ['returns', 'shipping', 'contentAndDevices'],
};

export const CUSTOMER_PAGES: Record<CustomerPageKey, CustomerPage> = {
  paymentMethods,
  points,
  creditCard,
  shipping,
  returns,
  contentAndDevices,
  recalls,
};

/** Sidebar/footer order. */
export const CUSTOMER_PAGE_ORDER: CustomerPageKey[] = [
  'paymentMethods',
  'points',
  'creditCard',
  'shipping',
  'returns',
  'contentAndDevices',
  'recalls',
];

export function customerPageMetadata(key: CustomerPageKey): Metadata {
  const page = CUSTOMER_PAGES[key];
  return { title: `${page.title} | Amazon.com.br`, description: page.lead };
}
