import type { CorporatePage } from './corporate-types';

// "Ganhe dinheiro conosco" footer column (except /sell, which has its own
// landing in features/sell). Programs are described in general terms: no
// rates, fees, figures or sign-up flows. Every CTA stays inside this store.

const EYEBROW = 'Ganhe dinheiro conosco';

export const BRAND_PROTECTION_PAGE: CorporatePage = {
  key: 'brandProtection',
  href: '/brand-protection',
  group: 'earn',
  title: 'Proteja e construa a sua marca',
  description:
    'Registre sua marca na Amazon, controle como seus produtos aparecem e combata falsificações e violações de propriedade intelectual.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Proteja e construa a sua marca',
    lead: 'Ferramentas para registrar sua marca na loja, controlar como seus produtos aparecem e agir contra falsificações e violações de propriedade intelectual.',
    icon: 'shield',
    tone: 'ink',
    actions: [
      { label: 'Comece a vender', href: '/sell' },
      { label: 'Como começar', href: '#como-comecar' },
    ],
  },
  blocks: [
    {
      kind: 'cards',
      id: 'beneficios',
      title: 'Como sua marca se beneficia',
      cards: [
        {
          icon: 'tag',
          title: 'Controle do catálogo',
          text: 'Marcas registradas têm mais influência sobre títulos, imagens e descrições das páginas dos seus produtos.',
        },
        {
          icon: 'search',
          title: 'Busca e denúncia de violações',
          text: 'Pesquise o catálogo por texto ou imagem e denuncie ofertas que usem sua marca indevidamente.',
        },
        {
          icon: 'shield',
          title: 'Proteções proativas',
          text: 'As informações da marca alimentam verificações automáticas que ajudam a barrar anúncios suspeitos.',
        },
        {
          icon: 'star',
          title: 'Conteúdo da marca',
          text: 'Página da marca, imagens adicionais e comparativos ajudam a contar a história dos seus produtos.',
        },
        {
          icon: 'chart',
          title: 'Relatórios e análises',
          text: 'Dados de busca e desempenho mostram como os clientes encontram e compram a sua marca.',
        },
      ],
    },
    {
      kind: 'steps',
      id: 'como-comecar',
      title: 'Como começar',
      steps: [
        {
          title: 'Registre a marca',
          text: 'Tenha o registro ou o pedido de registro da marca no órgão oficial — no Brasil, o INPI.',
        },
        {
          title: 'Tenha uma conta',
          text: 'Use uma conta de vendedor (ou de fornecedor) para administrar a marca na loja.',
        },
        {
          title: 'Solicite o registro na Amazon',
          text: 'Informe os dados da marca e comprove que você é o titular ou um representante autorizado.',
        },
        {
          title: 'Use as ferramentas',
          text: 'Após a aprovação, acesse os recursos de proteção e de construção de marca no painel da conta.',
        },
      ],
    },
    {
      kind: 'split',
      id: 'propriedade-intelectual',
      eyebrow: 'Propriedade intelectual',
      title: 'Produtos autênticos, clientes confiantes',
      paragraphs: [
        'A confiança dos clientes depende de produtos autênticos. As políticas de propriedade intelectual valem para todos que vendem na loja, e violações de marca, direito autoral ou patente podem ser denunciadas pelos titulares.',
        'Mesmo quem ainda não concluiu o registro pode relatar problemas pelos canais de denúncia; o registro amplia as ferramentas disponíveis.',
      ],
      bullets: [
        'Denúncias analisadas conforme as políticas da loja',
        'Ofertas irregulares podem ser removidas',
        'Proteção que também beneficia o cliente final',
      ],
      icon: 'document',
    },
    {
      kind: 'faq',
      id: 'perguntas',
      title: 'Perguntas frequentes',
      items: [
        {
          question: 'Preciso ter marca registrada para participar?',
          answer: [
            'Sim. O registro de marcas na loja exige um registro ou pedido de registro ativo no órgão oficial. Os requisitos podem mudar e devem ser conferidos nos termos do programa.',
          ],
        },
        {
          question: 'Encontrei um produto que parece falsificado. O que faço?',
          answer: [
            'Se você comprou o produto, fale com o Atendimento ao Cliente informando o pedido. Itens comprados na loja podem ser devolvidos conforme a política de devoluções.',
          ],
        },
        {
          question: 'Esta loja acadêmica registra marcas?',
          answer: [
            'Não. Esta demonstração explica como o programa funciona, mas não recebe pedidos de registro nem dados de titulares.',
          ],
        },
      ],
    },
    {
      kind: 'cta',
      id: 'comecar',
      title: 'Pronto para levar sua marca para a Amazon?',
      text: 'Comece pela conta de vendedor e conheça as ferramentas para marcas.',
      actions: [
        { label: 'Comece a vender', href: '/sell' },
        { label: 'Atendimento ao Cliente', href: '/help' },
      ],
    },
  ],
};

export const SUPPLY_PAGE: CorporatePage = {
  key: 'supply',
  href: '/supply',
  group: 'earn',
  title: 'Forneça para a Amazon',
  description:
    'Forneça para a Amazon: como funciona vender diretamente para a Amazon como fornecedor e em que isso difere de ser vendedor parceiro.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Forneça para a Amazon',
    lead: 'Fabricantes e distribuidores podem vender seus produtos diretamente para a Amazon, que compra o estoque e o revende aos clientes da loja.',
    icon: 'warehouse',
    tone: 'sand',
    actions: [{ label: 'Compare os modelos', href: '#modelos' }],
  },
  blocks: [
    {
      kind: 'split',
      id: 'como-funciona',
      eyebrow: 'Como funciona',
      title: 'A Amazon como sua cliente',
      paragraphs: [
        'No modelo de fornecimento, também chamado de venda primária (1P), a sua empresa atua como fornecedora: recebe pedidos de compra da Amazon, entrega os produtos nos centros de distribuição e fatura a venda.',
        'A partir daí, a Amazon cuida do preço ao consumidor, da venda, da entrega e do atendimento. É um modelo diferente de ser vendedor parceiro, em que você mesmo anuncia, define preços e vende direto ao cliente.',
      ],
      icon: 'box',
    },
    {
      kind: 'compare',
      id: 'modelos',
      title: 'Fornecedor ou vendedor parceiro?',
      intro: 'Uma comparação geral entre os dois modelos.',
      columns: ['Fornecedor (1P)', 'Vendedor parceiro (3P)'],
      rows: [
        { label: 'Quem vende ao cliente final', values: ['A Amazon', 'A sua empresa'] },
        { label: 'Quem define o preço ao consumidor', values: ['A Amazon', 'A sua empresa'] },
        {
          label: 'Como você recebe',
          values: [
            'Pelo faturamento dos pedidos de compra, conforme os termos negociados',
            'Pelo repasse das vendas, descontadas as tarifas',
          ],
        },
        {
          label: 'Estoque',
          values: [
            'Enviado à Amazon conforme os pedidos de compra',
            'Administrado por você ou pela logística da Amazon',
          ],
        },
        {
          label: 'Como começar',
          values: ['Em geral, por convite ou avaliação comercial', 'Cadastro aberto como vendedor'],
        },
      ],
      caption: 'Comparação geral; as condições reais dependem de cada contrato.',
    },
    {
      kind: 'steps',
      id: 'jornada',
      title: 'A jornada de um fornecedor',
      steps: [
        {
          title: 'Avaliação comercial',
          text: 'A Amazon avalia o sortimento, a marca e a capacidade de fornecimento da empresa.',
        },
        {
          title: 'Termos e catálogo',
          text: 'As partes acertam condições comerciais e a empresa cadastra os produtos no catálogo.',
        },
        {
          title: 'Pedidos de compra',
          text: 'A Amazon emite pedidos com base na previsão de demanda.',
        },
        {
          title: 'Entrega e faturamento',
          text: 'Os produtos seguem para os centros de distribuição e são faturados conforme cada pedido.',
        },
      ],
    },
    {
      kind: 'cards',
      id: 'para-quem',
      title: 'Para quem faz sentido',
      cards: [
        {
          icon: 'warehouse',
          title: 'Fabricantes',
          text: 'Empresas que produzem em volume e querem ampliar a distribuição.',
        },
        {
          icon: 'tag',
          title: 'Donos de marca',
          text: 'Marcas que preferem focar no produto e deixar a venda ao consumidor com a Amazon.',
          action: { label: 'Proteja a sua marca', href: '/brand-protection' },
        },
        {
          icon: 'box',
          title: 'Distribuidores',
          text: 'Distribuidores autorizados, com sortimento e estoque consistentes.',
        },
      ],
    },
    {
      kind: 'notice',
      id: 'cadastro',
      title: 'Cadastro de fornecedores',
      message: 'Esta loja acadêmica não recebe cadastros de fornecedores.',
      detail:
        'Se você quer vender seus produtos agora, o caminho aberto a qualquer empresa é se tornar vendedor parceiro.',
      action: { label: 'Venda na Amazon', href: '/sell' },
    },
    {
      kind: 'faq',
      id: 'perguntas',
      title: 'Perguntas frequentes',
      items: [
        {
          question: 'Posso ser fornecedor e vendedor parceiro ao mesmo tempo?',
          answer: [
            'Algumas empresas combinam os dois modelos para produtos diferentes. A escolha depende da estratégia da marca e das condições acordadas.',
          ],
        },
        {
          question: 'Quem define o preço de venda?',
          answer: [
            'No modelo de fornecimento, o preço ao consumidor é definido pela Amazon. Como vendedor parceiro, você define os seus próprios preços.',
          ],
        },
      ],
    },
  ],
};

export const PUBLISH_PAGE: CorporatePage = {
  key: 'publish',
  href: '/publish',
  group: 'earn',
  title: 'Publique seus livros',
  description:
    'Publique seus livros: autopublicação de eBooks Kindle e livros impressos sob demanda, passo a passo e perguntas frequentes.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Publique seus livros',
    lead: 'Autores e editoras independentes podem publicar eBooks e livros impressos sob demanda e disponibilizá-los para leitores na loja Kindle e na Amazon.',
    icon: 'book',
    tone: 'sky',
    actions: [{ label: 'Veja o passo a passo', href: '#como-publicar' }],
  },
  blocks: [
    {
      kind: 'cards',
      id: 'formatos',
      title: 'Formatos de publicação',
      cards: [
        {
          icon: 'device',
          title: 'eBook Kindle',
          text: 'Seu livro disponível para leitura em leitores Kindle, celulares, tablets e computadores.',
        },
        {
          icon: 'printer',
          title: 'Livro impresso sob demanda',
          text: 'Exemplares impressos conforme os pedidos chegam, sem estoque nem tiragem mínima.',
        },
        {
          icon: 'star',
          title: 'Programas de leitura',
          text: 'Títulos podem participar de programas de assinatura de leitura e alcançar novos leitores.',
        },
      ],
    },
    {
      kind: 'steps',
      id: 'como-publicar',
      title: 'Como publicar',
      steps: [
        {
          title: 'Prepare o manuscrito',
          text: 'Revise o texto e formate-o para leitura digital ou para impressão.',
        },
        {
          title: 'Crie a capa',
          text: 'Use uma capa própria ou as ferramentas de criação de capa da plataforma.',
        },
        {
          title: 'Defina direitos e preço',
          text: 'Informe os territórios em que você detém os direitos e escolha o preço de venda.',
        },
        {
          title: 'Publique e acompanhe',
          text: 'Envie o livro para revisão e acompanhe vendas e leituras nos relatórios.',
        },
      ],
    },
    {
      kind: 'split',
      id: 'autopublicacao',
      eyebrow: 'Autopublicação',
      title: 'Você no controle da sua obra',
      paragraphs: [
        'Na autopublicação, é o autor quem decide o título, a capa, o preço e a data de lançamento. Alterações podem ser feitas depois da publicação, e os relatórios mostram como o livro está sendo lido e vendido.',
        'Os royalties variam conforme o formato, o preço e o território escolhidos, de acordo com os termos vigentes da plataforma.',
      ],
      bullets: [
        'Sem custo de tiragem ou de estoque',
        'Publicação em poucos passos',
        'Alcance de leitores em vários países',
      ],
      icon: 'pen',
    },
    {
      kind: 'notice',
      id: 'livros',
      title: 'Livros autopublicados',
      message: 'Nenhum livro autopublicado é exibido nesta loja acadêmica.',
      detail:
        'A demonstração não recebe manuscritos, não cadastra autores e não paga royalties.',
    },
    {
      kind: 'faq',
      id: 'perguntas',
      title: 'Perguntas frequentes',
      items: [
        {
          question: 'Continuo com os direitos sobre o meu livro?',
          answer: [
            'Em geral, na autopublicação o autor mantém os direitos sobre a obra e autoriza a plataforma a distribuí-la. Leia os termos do programa antes de publicar.',
          ],
        },
        {
          question: 'Posso publicar um livro que já saiu por outra editora?',
          answer: [
            'Somente se você detiver os direitos de publicação no formato e nos territórios escolhidos.',
          ],
        },
        {
          question: 'Preciso de conhecimentos técnicos?',
          answer: [
            'Não necessariamente. Ferramentas de conversão e de pré-visualização ajudam a conferir como o livro ficará antes do lançamento.',
          ],
        },
      ],
    },
    {
      kind: 'cta',
      id: 'conta',
      title: 'Tudo começa com uma conta',
      text: 'Leitores e autores usam a mesma conta Amazon.',
      actions: [
        { label: 'Criar sua conta', href: '/register' },
        { label: 'Fazer login', href: '/login' },
      ],
    },
  ],
};

export const ASSOCIATES_PAGE: CorporatePage = {
  key: 'associates',
  href: '/associates',
  group: 'earn',
  title: 'Seja um associado',
  description:
    'Seja um associado: recomende produtos da Amazon no seu conteúdo e receba comissões por compras qualificadas. Veja como funciona.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Seja um associado',
    lead: 'Criadores de conteúdo, sites e comunidades podem recomendar produtos da Amazon e receber comissões pelas compras qualificadas feitas a partir dos seus links.',
    icon: 'link',
    tone: 'sand',
    actions: [{ label: 'Como funciona', href: '#como-funciona' }],
  },
  blocks: [
    {
      kind: 'steps',
      id: 'como-funciona',
      title: 'Como funciona',
      steps: [
        {
          title: 'Cadastre-se',
          text: 'Informe seus sites, canais ou aplicativos e como pretende divulgar os produtos.',
        },
        {
          title: 'Crie seus links',
          text: 'Gere links e vitrines para os produtos que combinam com o seu público.',
        },
        {
          title: 'Compartilhe',
          text: 'Publique as recomendações no seu conteúdo, sempre indicando que são links de afiliado.',
        },
        {
          title: 'Receba comissões',
          text: 'Compras qualificadas geram comissões, de acordo com a categoria e as regras do programa.',
        },
      ],
    },
    {
      kind: 'cards',
      id: 'para-quem',
      title: 'Para quem é o programa',
      cards: [
        {
          icon: 'pen',
          title: 'Blogs e sites de conteúdo',
          text: 'Resenhas, guias de compra e comparativos que ajudam leitores a decidir.',
        },
        {
          icon: 'play',
          title: 'Criadores de vídeo',
          text: 'Canais que mostram produtos em uso, testes e recomendações.',
        },
        {
          icon: 'users',
          title: 'Comunidades e grupos',
          text: 'Espaços em que pessoas trocam indicações sobre interesses em comum.',
        },
        {
          icon: 'code',
          title: 'Aplicativos e ferramentas',
          text: 'Serviços que integram recomendações de produtos à experiência dos usuários.',
        },
      ],
    },
    {
      kind: 'split',
      id: 'transparencia',
      eyebrow: 'Transparência',
      title: 'Recomende com responsabilidade',
      paragraphs: [
        'Associados devem deixar claro para o público que recebem comissão pelas recomendações e seguir as regras do programa sobre uso da marca, preços e promoções.',
        'Recomendações honestas constroem confiança — e é a confiança que faz o público voltar.',
      ],
      bullets: [
        'Identifique os links de afiliado',
        'Não prometa preços ou prazos que podem mudar',
        'Respeite as políticas de uso da marca',
      ],
      icon: 'shield',
    },
    {
      kind: 'notice',
      id: 'inscricao',
      title: 'Inscrição no programa',
      message: 'Não é possível se inscrever no programa de associados por esta loja acadêmica.',
      detail:
        'Esta demonstração não gera links de afiliado, não rastreia cliques e não paga comissões.',
    },
    {
      kind: 'faq',
      id: 'perguntas',
      title: 'Perguntas frequentes',
      items: [
        {
          question: 'Quanto um associado ganha?',
          answer: [
            'As comissões variam por categoria de produto e seguem a tabela vigente do programa. Esta demonstração não publica taxas.',
          ],
        },
        {
          question: 'Preciso ter um site?',
          answer: [
            'É preciso ter um canal onde as recomendações serão publicadas — um site, um canal de vídeo ou um aplicativo —, que é analisado durante o cadastro.',
          ],
        },
        {
          question: 'Posso usar meus próprios links para comprar?',
          answer: [
            'Em geral, não. Programas de afiliados costumam excluir compras próprias do cálculo de comissões; confira os termos oficiais.',
          ],
        },
      ],
    },
    {
      kind: 'cta',
      id: 'vender',
      title: 'Tem produtos próprios?',
      text: 'Se você fabrica ou revende produtos, pode vendê-los diretamente na loja.',
      actions: [{ label: 'Venda na Amazon', href: '/sell' }],
    },
  ],
};

export const ADVERTISE_PAGE: CorporatePage = {
  key: 'advertise',
  href: '/advertise',
  group: 'earn',
  title: 'Anuncie seus produtos',
  description:
    'Anuncie seus produtos: formatos de anúncio, como criar uma campanha e como acompanhar resultados na Amazon.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Anuncie seus produtos',
    lead: 'Soluções de publicidade ajudam marcas e vendedores a serem encontrados por clientes que já estão buscando, comparando e comprando.',
    icon: 'megaphone',
    tone: 'ink',
    actions: [
      { label: 'Comece a vender', href: '/sell' },
      { label: 'Formatos de anúncio', href: '#formatos' },
    ],
  },
  blocks: [
    {
      kind: 'cards',
      id: 'formatos',
      title: 'Formatos de anúncio',
      cards: [
        {
          icon: 'search',
          title: 'Produtos Patrocinados',
          text: 'Anúncios de produtos individuais que aparecem nos resultados de busca e nas páginas de produto.',
        },
        {
          icon: 'tag',
          title: 'Marcas Patrocinadas',
          text: 'Destaque para a sua marca, com logotipo, título personalizado e uma seleção de produtos.',
        },
        {
          icon: 'target',
          title: 'Display',
          text: 'Anúncios gráficos que alcançam públicos relevantes dentro e fora da loja.',
        },
        {
          icon: 'play',
          title: 'Vídeo',
          text: 'Formatos em vídeo para contar a história da marca em diferentes telas.',
        },
      ],
    },
    {
      kind: 'split',
      id: 'por-que-anunciar',
      eyebrow: 'Por que anunciar',
      title: 'Presente no momento da decisão',
      paragraphs: [
        'Os anúncios aparecem em contextos de compra: quando o cliente pesquisa uma categoria, compara opções ou lê os detalhes de um produto. Isso ajuda produtos novos a ganhar visibilidade e marcas conhecidas a continuarem lembradas.',
        'Relatórios mostram impressões, cliques e vendas atribuídas, para que você ajuste as campanhas com base em dados.',
      ],
      icon: 'chart',
    },
    {
      kind: 'steps',
      id: 'campanha',
      title: 'Como criar uma campanha',
      steps: [
        {
          title: 'Defina o objetivo',
          text: 'Lançar um produto, aumentar as vendas ou fortalecer a marca.',
        },
        {
          title: 'Escolha produtos e formato',
          text: 'Selecione o que anunciar e onde os anúncios devem aparecer.',
        },
        {
          title: 'Defina orçamento e lances',
          text: 'Estabeleça quanto investir por dia e quanto pagar por clique.',
        },
        {
          title: 'Acompanhe e otimize',
          text: 'Analise os resultados e ajuste palavras-chave, lances e criativos.',
        },
      ],
    },
    {
      kind: 'notice',
      id: 'campanhas',
      title: 'Anúncios nesta loja',
      message: 'Nenhum anúncio patrocinado é exibido nesta loja acadêmica.',
      detail:
        'A demonstração não cria campanhas, não cobra por cliques e não usa dados de navegação para exibir anúncios.',
    },
    {
      kind: 'faq',
      id: 'perguntas',
      title: 'Perguntas frequentes',
      items: [
        {
          question: 'Preciso vender na Amazon para anunciar?',
          answer: [
            'Formatos como Produtos Patrocinados são voltados a quem vende na loja. Outros formatos podem estar disponíveis também para anunciantes que não vendem na Amazon.',
          ],
        },
        {
          question: 'Quanto custa anunciar?',
          answer: [
            'Nos anúncios de busca, o custo costuma ser por clique, e você controla o orçamento diário e os lances. Os valores dependem da concorrência por cada termo.',
          ],
        },
        {
          question: 'Como sei se meus anúncios funcionam?',
          answer: [
            'Os relatórios de campanha mostram impressões, cliques, gastos e vendas atribuídas, que ajudam a comparar resultados ao longo do tempo.',
          ],
        },
      ],
    },
    {
      kind: 'cta',
      id: 'comecar',
      title: 'Comece pela sua conta de vendedor',
      text: 'Anunciar fica mais simples quando seus produtos já estão na loja.',
      actions: [
        { label: 'Comece a vender', href: '/sell' },
        { label: 'Atendimento ao Cliente', href: '/help' },
      ],
    },
  ],
};

export const EARN_PAGES: CorporatePage[] = [
  BRAND_PROTECTION_PAGE,
  SUPPLY_PAGE,
  PUBLISH_PAGE,
  ASSOCIATES_PAGE,
  ADVERTISE_PAGE,
];
