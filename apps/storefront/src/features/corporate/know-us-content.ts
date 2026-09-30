import type { CorporatePage } from './corporate-types';

// "Conheça-nos" footer column. General, evergreen descriptions only — no
// figures, dates, names or documents presented as real (see corporate-types.ts).

const EYEBROW = 'Conheça-nos';

export const ABOUT_PAGE: CorporatePage = {
  key: 'about',
  href: '/about',
  group: 'knowUs',
  title: 'Sobre a Amazon',
  description:
    'Conheça a Amazon: o que fazemos, como pensamos e os princípios que orientam a experiência de compra na Amazon.com.br.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Sobre a Amazon',
    lead: 'Queremos ser a empresa mais centrada no cliente: oferecer seleção, preço justo e conveniência, e continuar inventando em nome de quem compra, vende e cria com a gente.',
    icon: 'heart',
    tone: 'ink',
    actions: [
      { label: 'Explore a loja', href: '/' },
      { label: 'Atendimento ao Cliente', href: '/help' },
    ],
  },
  blocks: [
    {
      kind: 'split',
      id: 'quem-somos',
      eyebrow: 'Quem somos',
      title: 'Uma loja construída a partir do cliente',
      paragraphs: [
        'A Amazon.com.br reúne em um só lugar produtos de muitas categorias, vendidos pela própria Amazon e por vendedores parceiros, com informações claras para comparar, avaliações de outros clientes e opções de entrega pensadas para o dia a dia.',
        'Por trás de cada pedido existe uma cadeia de pessoas e tecnologia — catálogo, pagamentos, logística e atendimento — trabalhando para que comprar seja simples do começo ao fim.',
      ],
      icon: 'store',
    },
    {
      kind: 'cards',
      id: 'o-que-fazemos',
      title: 'O que fazemos',
      intro: 'Algumas das frentes que compõem a experiência Amazon.',
      cards: [
        {
          icon: 'store',
          title: 'Loja on-line',
          text: 'Uma seleção ampla em categorias como livros, eletrônicos, casa, beleza e alimentos, com busca, filtros e páginas de produto detalhadas.',
          action: { label: 'Ir para a página inicial', href: '/' },
        },
        {
          icon: 'users',
          title: 'Vendedores parceiros',
          text: 'Empresas de todos os tamanhos vendem na loja e usam ferramentas e serviços da Amazon para alcançar novos clientes.',
          action: { label: 'Venda na Amazon', href: '/sell' },
        },
        {
          icon: 'truck',
          title: 'Entrega e logística',
          text: 'Centros de distribuição, transporte e rastreamento trabalham juntos para levar cada pedido até o cliente com previsibilidade.',
        },
        {
          icon: 'device',
          title: 'Dispositivos e conteúdo digital',
          text: 'Leitores digitais, assistentes de voz e serviços de conteúdo ampliam a forma como as pessoas leem, ouvem e se divertem.',
        },
        {
          icon: 'play',
          title: 'Assinaturas e entretenimento',
          text: 'Programas de assinatura combinam benefícios de entrega com filmes, séries, músicas e leitura.',
        },
        {
          icon: 'cloud',
          title: 'Tecnologia e nuvem',
          text: 'A infraestrutura de computação em nuvem da Amazon também atende empresas, governos e instituições de pesquisa.',
        },
      ],
    },
    {
      kind: 'cards',
      id: 'como-pensamos',
      title: 'Como pensamos',
      intro: 'Alguns princípios orientam nossas decisões, das grandes às do cotidiano.',
      cards: [
        {
          icon: 'heart',
          title: 'Obsessão pelo cliente',
          text: 'Começamos pelo cliente e trabalhamos de trás para frente, para conquistar e manter a confiança de quem compra com a gente.',
        },
        {
          icon: 'bulb',
          title: 'Inventar e simplificar',
          text: 'Procuramos boas ideias em todo lugar e buscamos formas de tornar produtos e processos mais simples.',
        },
        {
          icon: 'clock',
          title: 'Pensar no longo prazo',
          text: 'Preferimos decisões que criam valor duradouro, mesmo quando os resultados levam tempo para aparecer.',
        },
        {
          icon: 'star',
          title: 'Padrões elevados',
          text: 'Elevamos continuamente a qualidade do que entregamos e corrigimos os problemas na origem.',
        },
      ],
    },
    {
      kind: 'cta',
      id: 'explore',
      title: 'Pronto para explorar?',
      text: 'Encontre ofertas na página inicial ou tire suas dúvidas com o Atendimento ao Cliente.',
      actions: [
        { label: 'Ir para a página inicial', href: '/' },
        { label: 'Atendimento ao Cliente', href: '/help' },
      ],
    },
  ],
};

export const CORPORATE_INFORMATION_PAGE: CorporatePage = {
  key: 'corporateInformation',
  href: '/corporate-information',
  group: 'knowUs',
  title: 'Informações corporativas',
  description:
    'Governança, relações com investidores, sustentabilidade e políticas públicas: um guia sobre como a Amazon se organiza e presta contas.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Informações corporativas',
    lead: 'Governança, relações com investidores, sustentabilidade e políticas públicas: um guia para entender como a Amazon se organiza e presta contas.',
    icon: 'document',
    tone: 'sand',
  },
  blocks: [
    {
      kind: 'cards',
      id: 'areas',
      title: 'O que você encontra nesta seção',
      intro: 'As áreas que normalmente compõem as informações corporativas de uma empresa de capital aberto.',
      cards: [
        {
          icon: 'chart',
          title: 'Relações com investidores',
          text: 'Espaço dedicado a acionistas e analistas, com resultados periódicos, relatórios anuais e comunicações ao mercado.',
        },
        {
          icon: 'shield',
          title: 'Governança corporativa',
          text: 'Estrutura do conselho de administração, comitês, código de conduta e políticas que orientam a atuação da empresa.',
        },
        {
          icon: 'leaf',
          title: 'Sustentabilidade',
          text: 'Compromissos e iniciativas relacionados a energia, embalagens, operações e cadeia de suprimentos.',
        },
        {
          icon: 'globe',
          title: 'Políticas públicas',
          text: 'Posicionamentos sobre temas regulatórios e a forma como a empresa participa do debate público.',
        },
        {
          icon: 'users',
          title: 'Impacto na sociedade',
          text: 'Ações em educação, apoio a comunidades locais e resposta a emergências.',
          action: { label: 'Conheça a Comunidade', href: '/community' },
        },
        {
          icon: 'newspaper',
          title: 'Imprensa',
          text: 'Comunicados oficiais, temas de cobertura e recursos para jornalistas.',
          action: { label: 'Comunicados à imprensa', href: '/press' },
        },
      ],
    },
    {
      kind: 'notice',
      id: 'documentos',
      title: 'Documentos e relatórios',
      message: 'Nenhum documento corporativo é publicado nesta loja acadêmica.',
      detail:
        'Relatórios financeiros, apresentações a investidores, composição da liderança e dados de registro não são reproduzidos aqui, para evitar informações desatualizadas ou imprecisas. Consulte sempre os canais oficiais da empresa.',
    },
    {
      kind: 'split',
      id: 'conduta',
      eyebrow: 'Integridade',
      title: 'Conduta e ética nos negócios',
      paragraphs: [
        'Um código de conduta estabelece como funcionários, lideranças e parceiros devem agir no dia a dia: com honestidade, respeito às leis e cuidado com as informações de clientes.',
        'Programas de integridade costumam combinar políticas claras, treinamentos periódicos e canais para relatar preocupações com confidencialidade.',
      ],
      bullets: [
        'Prevenção à corrupção e a conflitos de interesse',
        'Respeito à privacidade e à proteção de dados',
        'Ambiente de trabalho seguro, inclusivo e sem discriminação',
      ],
      icon: 'shield',
    },
    {
      kind: 'faq',
      id: 'perguntas',
      title: 'Perguntas frequentes',
      items: [
        {
          question: 'Onde encontro os resultados financeiros da Amazon?',
          answer: [
            'Os resultados são divulgados pela empresa em seus canais oficiais de relações com investidores. Esta loja acadêmica não reproduz esses números.',
          ],
        },
        {
          question: 'Esta página traz dados oficiais da empresa?',
          answer: [
            'Não. O conteúdo tem finalidade educacional: ele explica o que costuma existir em uma área de informações corporativas, sem citar valores, datas ou nomes.',
          ],
        },
        {
          question: 'Como falo com a Amazon sobre um pedido?',
          answer: [
            'Dúvidas sobre compras, entregas e devoluções são tratadas pelo Atendimento ao Cliente, e não pelas áreas corporativas.',
          ],
        },
      ],
    },
    {
      kind: 'cta',
      id: 'ajuda',
      title: 'Precisa de ajuda com uma compra?',
      text: 'O Atendimento ao Cliente reúne respostas sobre pedidos, entregas, pagamentos e devoluções.',
      actions: [{ label: 'Atendimento ao Cliente', href: '/help' }],
    },
  ],
};

export const CAREERS_PAGE: CorporatePage = {
  key: 'careers',
  href: '/careers',
  group: 'knowUs',
  title: 'Carreiras',
  description:
    'Carreiras na Amazon: áreas de atuação, como trabalhamos e como costuma funcionar um processo seletivo.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Carreiras na Amazon',
    lead: 'Pessoas que gostam de resolver problemas reais para clientes encontram aqui espaço para aprender, construir e crescer — em operações, tecnologia, atendimento e muito mais.',
    icon: 'briefcase',
    tone: 'sky',
    actions: [{ label: 'Conheça as áreas', href: '#areas' }],
  },
  blocks: [
    {
      kind: 'cards',
      id: 'areas',
      title: 'Áreas de atuação',
      intro: 'Os tipos de trabalho que fazem a Amazon funcionar.',
      cards: [
        {
          icon: 'warehouse',
          title: 'Operações e logística',
          text: 'Receber, armazenar, separar e enviar pedidos com segurança, em centros de distribuição e estações de entrega.',
        },
        {
          icon: 'code',
          title: 'Tecnologia e engenharia',
          text: 'Desenvolvimento de software, infraestrutura, dados e segurança para sistemas que funcionam em grande escala.',
        },
        {
          icon: 'chat',
          title: 'Atendimento ao cliente',
          text: 'Ajudar clientes por telefone, chat e e-mail, resolvendo dúvidas com empatia e agilidade.',
        },
        {
          icon: 'store',
          title: 'Varejo e marketplace',
          text: 'Gestão de categorias, relacionamento com vendedores e fornecedores, preços e experiência de compra.',
        },
        {
          icon: 'network',
          title: 'Dados e ciência',
          text: 'Análise, aprendizado de máquina e pesquisa aplicada para prever demanda e melhorar recomendações.',
          action: { label: 'Amazon Science', href: '/amazon-science' },
        },
        {
          icon: 'briefcase',
          title: 'Áreas corporativas',
          text: 'Finanças, jurídico, recursos humanos, comunicação e outras funções que sustentam o negócio.',
        },
      ],
    },
    {
      kind: 'split',
      id: 'como-trabalhamos',
      eyebrow: 'Cultura',
      title: 'Como trabalhamos',
      paragraphs: [
        'Times pequenos e com autonomia, decisões orientadas por dados e disposição para experimentar fazem parte do dia a dia. Espera-se que cada pessoa pense como dona do resultado e cuide do cliente final, mesmo quando ele parece distante da sua função.',
      ],
      bullets: [
        'Aprendizado contínuo e desenvolvimento de carreira',
        'Diversidade e inclusão como parte do trabalho',
        'Segurança como prioridade nas operações',
      ],
      icon: 'users',
    },
    {
      kind: 'steps',
      id: 'processo-seletivo',
      title: 'Como costuma funcionar um processo seletivo',
      intro: 'As etapas variam conforme a vaga e a área.',
      steps: [
        {
          title: 'Candidatura',
          text: 'Você escolhe uma vaga e envia seu currículo pelos canais oficiais de recrutamento.',
        },
        {
          title: 'Avaliação inicial',
          text: 'Análise do perfil e, em algumas funções, testes on-line ou exercícios práticos.',
        },
        {
          title: 'Entrevistas',
          text: 'Conversas com recrutadores e com o time, geralmente sobre situações reais que você já viveu.',
        },
        {
          title: 'Proposta',
          text: 'Quando há alinhamento, a empresa apresenta a proposta e os próximos passos da contratação.',
        },
      ],
    },
    {
      kind: 'notice',
      id: 'vagas',
      title: 'Vagas abertas',
      message: 'Não há vagas abertas nesta demonstração.',
      detail:
        'Esta loja acadêmica não recruta nem recebe currículos. Processos seletivos reais acontecem apenas pelos canais oficiais de carreiras da empresa.',
    },
    {
      kind: 'faq',
      id: 'perguntas',
      title: 'Perguntas frequentes',
      items: [
        {
          question: 'Preciso pagar alguma taxa para me candidatar?',
          answer: [
            'Não. Processos seletivos legítimos não cobram taxas de candidatura, treinamento ou equipamento.',
            'Desconfie de mensagens que peçam pagamento, senhas ou dados bancários em troca de uma vaga.',
          ],
        },
        {
          question: 'Posso enviar meu currículo por esta loja?',
          answer: [
            'Não. Esta é uma demonstração acadêmica e não coleta currículos nem dados de candidatos.',
          ],
        },
        {
          question: 'Existem oportunidades para quem está começando?',
          answer: [
            'Grandes empresas costumam ter posições de entrada, estágios e programas para recém-formados, além de vagas para profissionais experientes. A disponibilidade muda ao longo do tempo.',
          ],
        },
      ],
    },
    {
      kind: 'cta',
      id: 'saiba-mais',
      title: 'Quer conhecer mais a empresa?',
      text: 'Veja o que fazemos, os princípios que nos orientam e as áreas de pesquisa.',
      actions: [
        { label: 'Sobre a Amazon', href: '/about' },
        { label: 'Amazon Science', href: '/amazon-science' },
      ],
    },
  ],
};

export const PRESS_PAGE: CorporatePage = {
  key: 'press',
  href: '/press',
  group: 'knowUs',
  title: 'Comunicados à imprensa',
  description:
    'Sala de imprensa da Amazon.com.br: comunicados oficiais, temas de cobertura e recursos para jornalistas.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Comunicados à imprensa',
    lead: 'Notícias oficiais, anúncios e materiais de apoio para jornalistas que cobrem varejo, tecnologia e logística.',
    icon: 'newspaper',
    tone: 'ink',
  },
  blocks: [
    {
      kind: 'notice',
      id: 'comunicados',
      title: 'Comunicados recentes',
      message: 'Nenhum comunicado publicado nesta loja acadêmica.',
      detail:
        'Esta demonstração não reproduz notícias, títulos ou declarações da empresa. Quando houver conteúdo, os comunicados aparecerão aqui em ordem cronológica, com data, título e resumo.',
    },
    {
      kind: 'cards',
      id: 'temas',
      title: 'Temas de cobertura',
      intro: 'Assuntos que costumam aparecer na sala de imprensa de uma empresa de varejo e tecnologia.',
      cards: [
        {
          icon: 'store',
          title: 'Clientes e compras',
          text: 'Novas categorias, recursos da loja e datas promocionais.',
        },
        {
          icon: 'users',
          title: 'Pequenas e médias empresas',
          text: 'Iniciativas para vendedores parceiros e empreendedores.',
        },
        {
          icon: 'truck',
          title: 'Operações e entregas',
          text: 'Logística, centros de distribuição e novas modalidades de entrega.',
        },
        {
          icon: 'device',
          title: 'Dispositivos e serviços',
          text: 'Lançamentos de dispositivos, aplicativos e conteúdo digital.',
        },
        {
          icon: 'leaf',
          title: 'Sustentabilidade',
          text: 'Embalagens, energia e compromissos ambientais.',
        },
        {
          icon: 'globe',
          title: 'Comunidade',
          text: 'Educação, voluntariado e resposta a emergências.',
        },
      ],
    },
    {
      kind: 'cards',
      id: 'recursos',
      title: 'Recursos para jornalistas',
      cards: [
        {
          icon: 'camera',
          title: 'Banco de imagens',
          text: 'Fotos e logotipos aprovados para uso editorial.',
        },
        {
          icon: 'document',
          title: 'Fichas informativas',
          text: 'Resumos sobre as áreas de negócio e os serviços da empresa.',
        },
        {
          icon: 'mail',
          title: 'Contato com a assessoria',
          text: 'Canal dedicado a pedidos de entrevista e de informações.',
        },
      ],
      note: 'Os materiais e o contato de assessoria não estão disponíveis nesta demonstração acadêmica.',
    },
    {
      kind: 'cta',
      id: 'ajuda',
      title: 'É cliente e precisa de ajuda?',
      text: 'A área de imprensa não trata pedidos. Para compras, entregas e devoluções, fale com o Atendimento ao Cliente.',
      actions: [{ label: 'Atendimento ao Cliente', href: '/help' }],
    },
  ],
};

export const COMMUNITY_PAGE: CorporatePage = {
  key: 'community',
  href: '/community',
  group: 'knowUs',
  title: 'Comunidade',
  description:
    'Comunidade: como a Amazon atua em educação, resposta a emergências, empreendedorismo local e voluntariado.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Comunidade',
    lead: 'Estar presente em tantos lugares traz a responsabilidade de fazer diferença onde vivemos e trabalhamos — com educação, apoio em emergências e incentivo ao empreendedorismo local.',
    icon: 'users',
    tone: 'sky',
  },
  blocks: [
    {
      kind: 'split',
      id: 'compromisso',
      eyebrow: 'Nosso compromisso',
      title: 'Perto de quem está perto de nós',
      paragraphs: [
        'Centros de distribuição, escritórios e estações de entrega fazem parte de bairros e cidades. Por isso, as ações de comunidade priorizam as regiões onde a empresa opera e as pessoas que convivem com essas operações.',
        'O trabalho costuma ser feito em parceria com organizações locais, que conhecem de perto as necessidades de cada lugar.',
      ],
      icon: 'globe',
    },
    {
      kind: 'cards',
      id: 'frentes',
      title: 'Frentes de atuação',
      cards: [
        {
          icon: 'graduation',
          title: 'Educação e tecnologia',
          text: 'Incentivo ao ensino de ciência, tecnologia e programação para estudantes e professores.',
        },
        {
          icon: 'lifebuoy',
          title: 'Resposta a emergências',
          text: 'Uso da estrutura de logística para levar doações e itens essenciais a regiões afetadas por desastres.',
        },
        {
          icon: 'store',
          title: 'Empreendedorismo local',
          text: 'Capacitação de pequenos negócios para vender on-line e crescer no digital.',
        },
        {
          icon: 'heart',
          title: 'Voluntariado',
          text: 'Funcionários dedicam tempo e conhecimento a causas das comunidades vizinhas.',
        },
        {
          icon: 'leaf',
          title: 'Meio ambiente',
          text: 'Ações de conservação, reciclagem e redução de resíduos com parceiros locais.',
        },
      ],
    },
    {
      kind: 'steps',
      id: 'como-acontece',
      title: 'Como uma iniciativa acontece',
      steps: [
        {
          title: 'Escuta',
          text: 'Entender com organizações locais o que a comunidade realmente precisa.',
        },
        {
          title: 'Parceria',
          text: 'Definir com os parceiros metas, papéis e recursos de cada lado.',
        },
        {
          title: 'Execução',
          text: 'Colocar o plano em prática com voluntários, doações ou a estrutura de logística.',
        },
        {
          title: 'Acompanhamento',
          text: 'Medir resultados e ajustar o projeto para os próximos ciclos.',
        },
      ],
    },
    {
      kind: 'notice',
      id: 'projetos',
      title: 'Projetos e parceiros',
      message: 'Nenhum projeto comunitário é listado nesta loja acadêmica.',
      detail:
        'Nomes de instituições parceiras, locais e resultados não são apresentados, para não divulgar informações que não podem ser verificadas.',
    },
    {
      kind: 'cta',
      id: 'vender',
      title: 'Pequenos negócios também fazem parte',
      text: 'Empreendedores podem vender seus produtos na loja e alcançar clientes de todo o país.',
      actions: [{ label: 'Venda na Amazon', href: '/sell' }],
    },
  ],
};

export const ACCESSIBILITY_PAGE: CorporatePage = {
  key: 'accessibility',
  href: '/accessibility',
  group: 'knowUs',
  title: 'Acessibilidade',
  description:
    'Acessibilidade na Amazon.com.br: recursos da loja para teclado e leitores de tela, recursos de dispositivos e como relatar barreiras.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Acessibilidade',
    lead: 'Queremos que todas as pessoas consigam encontrar, comparar e comprar com autonomia — com teclado, leitor de tela, ampliação ou qualquer outra forma de acesso.',
    icon: 'accessibility',
    tone: 'sky',
    actions: [{ label: 'Relatar uma barreira', href: '/help' }],
  },
  blocks: [
    {
      kind: 'split',
      id: 'compromisso',
      eyebrow: 'Nosso compromisso',
      title: 'Acessibilidade desde o projeto',
      paragraphs: [
        'Acessibilidade faz parte de como a loja é projetada: textos alternativos em imagens, estrutura de títulos consistente, contraste adequado e controles que funcionam sem mouse.',
        'As Diretrizes de Acessibilidade para Conteúdo Web (WCAG) servem de referência, e as páginas são revisadas à medida que novas funcionalidades são publicadas.',
      ],
      icon: 'eye',
    },
    {
      kind: 'cards',
      id: 'nesta-loja',
      title: 'Recursos desta loja',
      intro: 'O que as páginas foram projetadas para oferecer.',
      cards: [
        {
          icon: 'keyboard',
          title: 'Navegação por teclado',
          text: 'Links, botões e menus podem ser alcançados com Tab e acionados com Enter ou Espaço. Um atalho no início da página leva direto ao conteúdo principal.',
        },
        {
          icon: 'speaker',
          title: 'Leitores de tela',
          text: 'Regiões identificadas (cabeçalho, navegação, conteúdo e rodapé), títulos em ordem hierárquica e descrições em imagens informativas.',
        },
        {
          icon: 'eye',
          title: 'Foco visível e contraste',
          text: 'O elemento em foco recebe um contorno bem visível, e os textos usam combinações de cor com contraste adequado.',
        },
        {
          icon: 'device',
          title: 'Layout responsivo',
          text: 'As páginas se adaptam a celulares, tablets e computadores e aceitam a ampliação do navegador sem perder conteúdo.',
        },
        {
          icon: 'motion',
          title: 'Menos movimento',
          text: 'Quando o sistema pede redução de movimento, rolagens suaves e transições decorativas são desativadas.',
        },
      ],
    },
    {
      kind: 'cards',
      id: 'dispositivos',
      title: 'Acessibilidade em dispositivos e serviços',
      intro: 'Recursos comuns em leitores digitais, assistentes de voz e aplicativos de vídeo.',
      cards: [
        {
          icon: 'speaker',
          title: 'Leitor de tela',
          text: 'Leitura em voz alta de menus e conteúdos para pessoas cegas ou com baixa visão.',
        },
        {
          icon: 'search',
          title: 'Ampliação e tamanho de texto',
          text: 'Ajuste de fonte, espaçamento e zoom para facilitar a leitura.',
        },
        {
          icon: 'chat',
          title: 'Controle por voz',
          text: 'Comandos falados para buscar conteúdo e realizar tarefas sem usar as mãos.',
        },
        {
          icon: 'play',
          title: 'Legendas e audiodescrição',
          text: 'Legendas e faixas de audiodescrição em títulos que oferecem esses recursos.',
        },
      ],
    },
    {
      kind: 'faq',
      id: 'perguntas',
      title: 'Perguntas frequentes',
      items: [
        {
          question: 'Como navego pela loja usando só o teclado?',
          answer: [
            'Use Tab para avançar e Shift+Tab para voltar entre os elementos interativos. Enter abre links e botões; Espaço também aciona botões e abre ou fecha as perguntas frequentes.',
          ],
        },
        {
          question: 'Como aumento o tamanho do texto?',
          answer: [
            'Use o zoom do navegador (Ctrl e + no Windows e no Linux, Cmd e + no macOS). As páginas se reorganizam para continuar legíveis.',
          ],
        },
        {
          question: 'Encontrei uma barreira de acessibilidade. O que faço?',
          answer: [
            'Conte para a gente pelo Atendimento ao Cliente, descrevendo a página, o dispositivo e a tecnologia assistiva que você usa. Esses relatos ajudam a priorizar correções.',
          ],
        },
      ],
    },
    {
      kind: 'cta',
      id: 'ajuda',
      title: 'Precisa de ajuda?',
      text: 'O Atendimento ao Cliente recebe relatos de barreiras de acessibilidade e dúvidas sobre pedidos.',
      actions: [{ label: 'Atendimento ao Cliente', href: '/help' }],
    },
  ],
};

export const AMAZON_SCIENCE_PAGE: CorporatePage = {
  key: 'amazonScience',
  href: '/amazon-science',
  group: 'knowUs',
  title: 'Amazon Science',
  description:
    'Amazon Science: áreas de pesquisa como aprendizado de máquina, linguagem natural, visão computacional e robótica, e como a ciência chega ao cliente.',
  hero: {
    eyebrow: EYEBROW,
    title: 'Amazon Science',
    lead: 'Cientistas e engenheiros trabalham em problemas difíceis — de aprendizado de máquina a robótica — com um objetivo simples: melhorar a vida dos clientes.',
    icon: 'flask',
    tone: 'ink',
    actions: [{ label: 'Áreas de pesquisa', href: '#areas' }],
  },
  blocks: [
    {
      kind: 'split',
      id: 'abordagem',
      eyebrow: 'Nossa abordagem',
      title: 'Pesquisa que vira produto',
      paragraphs: [
        'A pesquisa na Amazon nasce de problemas concretos: prever quanto de cada produto manter em estoque, recomendar o item certo, entender uma pergunta feita em voz alta ou planejar a rota de uma entrega.',
        'Os resultados são testados em escala e, quando faz sentido, compartilhados com a comunidade científica por meio de artigos, conferências e colaborações com universidades.',
      ],
      icon: 'network',
    },
    {
      kind: 'cards',
      id: 'areas',
      title: 'Áreas de pesquisa',
      cards: [
        {
          icon: 'network',
          title: 'Aprendizado de máquina',
          text: 'Modelos que aprendem com dados para prever demanda, detectar fraudes e personalizar a experiência.',
        },
        {
          icon: 'chat',
          title: 'Linguagem natural e fala',
          text: 'Reconhecimento de voz, compreensão de linguagem e geração de texto para assistentes e buscas.',
        },
        {
          icon: 'camera',
          title: 'Visão computacional',
          text: 'Identificação de produtos, controle de qualidade e leitura de etiquetas por imagem.',
        },
        {
          icon: 'robot',
          title: 'Robótica',
          text: 'Robôs que ajudam a mover, separar e organizar itens nos centros de distribuição.',
        },
        {
          icon: 'chart',
          title: 'Otimização e economia',
          text: 'Planejamento de estoque, preços e logística com pesquisa operacional e econometria.',
        },
        {
          icon: 'shield',
          title: 'Segurança e privacidade',
          text: 'Técnicas para proteger dados, sistemas e a confiança dos clientes.',
        },
        {
          icon: 'search',
          title: 'Busca e recomendação',
          text: 'Sistemas que ajudam cada cliente a encontrar o que procura entre muitas opções.',
        },
        {
          icon: 'cloud',
          title: 'Sistemas em nuvem',
          text: 'Infraestrutura e sistemas distribuídos que sustentam serviços em grande escala.',
        },
      ],
    },
    {
      kind: 'steps',
      id: 'da-pesquisa-ao-cliente',
      title: 'Da pesquisa ao cliente',
      steps: [
        {
          title: 'Problema do cliente',
          text: 'Tudo começa com uma dificuldade real, descrita do ponto de vista de quem usa.',
        },
        {
          title: 'Hipótese e protótipo',
          text: 'Cientistas propõem abordagens e testam protótipos com dados históricos.',
        },
        {
          title: 'Experimento controlado',
          text: 'Mudanças são avaliadas com testes comparativos antes de chegar a todos.',
        },
        {
          title: 'Produção e aprendizado',
          text: 'O que funciona é lançado e monitorado; o que não funciona vira aprendizado.',
        },
      ],
    },
    {
      kind: 'notice',
      id: 'publicacoes',
      title: 'Publicações',
      message: 'Nenhum artigo ou publicação científica é reproduzido nesta loja acadêmica.',
      detail:
        'Para evitar citações imprecisas, esta demonstração não lista artigos, autores, conferências ou prêmios.',
    },
    {
      kind: 'cta',
      id: 'carreiras',
      title: 'Gosta de resolver problemas difíceis?',
      text: 'Conheça as áreas de atuação e como costuma funcionar um processo seletivo.',
      actions: [{ label: 'Carreiras', href: '/careers' }],
    },
  ],
};

export const KNOW_US_PAGES: CorporatePage[] = [
  ABOUT_PAGE,
  CORPORATE_INFORMATION_PAGE,
  CAREERS_PAGE,
  PRESS_PAGE,
  COMMUNITY_PAGE,
  ACCESSIBILITY_PAGE,
  AMAZON_SCIENCE_PAGE,
];
