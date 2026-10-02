/**
 * Copy of the "Notificação de Privacidade da Amazon" help article (/privacy),
 * transcribed from the amazon.com.br page (see legal-types.ts for link rules).
 */

import type { LegalSection, LegalDocument } from './legal-types';

const SECTIONS: LegalSection[] = [
  {
    id: 'controladores',
    title: 'Controladores de informações pessoais',
    blocks: [
      {
        kind: 'text',
        body: 'A Amazon Serviços de Varejo do Brasil Ltda. e a Amazon Logística do Brasil Ltda., ambas com endereço na Avenida Presidente Juscelino Kubitschek, 2.041, Torre E, 18º andar, São Paulo/SP ("Amazon") são as controladoras dos dados pessoais coletados e tratados pelos Serviços da Amazon.',
      },
    ],
  },
  {
    id: 'informacoes-coletadas',
    title: 'Quais informações pessoais sobre clientes a Amazon coleta?',
    blocks: [
      {
        kind: 'text',
        body: 'Coletamos suas informações pessoais para prestar e continuamente melhorar nossos produtos e serviços.',
      },
      { kind: 'text', body: 'Esses são os tipos de informações pessoais que coletamos:' },
      {
        kind: 'list',
        items: [
          {
            lead: 'Informações que você nos fornece:',
            body: [
              'Recebemos e armazenamos as informações que você nos fornece em relação aos Serviços da Amazon. ',
              { text: 'Clique aqui', href: '#exemplos-fornecidas' },
              ' para ver exemplos de informações que coletamos. Você pode optar por não fornecer certas informações, mas, neste caso, pode não conseguir se beneficiar de muitos de nossos Serviços da Amazon.',
            ],
          },
          {
            lead: 'Informações automáticas:',
            body: [
              'Coletamos e armazenamos automaticamente alguns tipos de informações sobre o seu uso dos Serviços da Amazon, incluindo sua interação com o conteúdo e os serviços disponibilizados pelos Serviços da Amazon. Assim como muitos web sites, usamos cookies e outros identificadores únicos e coletamos certos tipos de informações quando o seu navegador ou dispositivo acessa os Serviços da Amazon e outros conteúdos fornecidos por ou em nome da Amazon em outros web sites. ',
              { text: 'Clique aqui', href: '#exemplos-automaticas' },
              ' para ver exemplos do que coletamos.',
            ],
          },
          {
            lead: 'Informações de outras fontes:',
            body: [
              'Poderemos receber informações sobre você de outras fontes, tais como informações atualizadas de entrega e informações de endereço das nossas transportadoras, as quais usamos para corrigir nossos registros e entregar sua próxima entrega de forma mais fácil. ',
              { text: 'Clique aqui', href: '#exemplos-outras-fontes' },
              ' para ver exemplos adicionais das informações que recebemos.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'finalidades',
    title: 'Para quais finalidades a Amazon trata suas informações pessoais?',
    blocks: [
      {
        kind: 'text',
        body: 'Tratamos suas informações pessoais para operar, prestar, desenvolver e melhorar os produtos e serviços que oferecemos a nossos clientes. Essas finalidades incluem:',
      },
      {
        kind: 'list',
        items: [
          {
            lead: 'Compra e entrega de produtos e serviços.',
            body: 'Usamos suas informações pessoais para receber e organizar pedidos, entregar produtos e serviços, processar pagamentos e nos comunicar com você sobre pedidos, produtos, serviços e ofertas promocionais.',
          },
          {
            lead: 'Fornecimento, correção e melhoria de Serviços da Amazon.',
            body: 'Usamos suas informações pessoais para oferecer funcionalidades, analisar desempenhos, corrigir erros e melhorar a usabilidade e a efetividade dos Serviços da Amazon.',
          },
          {
            lead: 'Recomendações e personalização.',
            body: 'Usamos suas informações pessoais para recomendar funcionalidades/recursos, produtos e serviços que podem ser de seu interesse, identificar suas preferências, e personalizar sua experiência com os Serviços da Amazon.',
          },
          {
            lead: 'Serviços de voz, imagem e câmera.',
            body: 'Quando você usa nossos serviços de voz, imagem ou câmera, processamos os dados de sua voz, imagem, vídeos e outras informações pessoais para responder às suas dúvidas, prestar os serviços solicitados para você e melhorar nossos serviços. Para mais informações sobre os serviços de voz da Alexa, clique aqui.',
          },
          {
            lead: 'Cumprimento de obrigações legais.',
            body: 'Em alguns casos, coletamos e usamos suas informações pessoais para cumprir com leis. Por exemplo, coletamos de vendedores informações sobre o local do estabelecimento e as informações da conta bancária para verificação de identidade e outros fins.',
          },
          {
            lead: 'Comunicação com você.',
            body: 'Usamos suas informações pessoais para nos comunicarmos com você com relação aos Serviços da Amazon por diferentes canais (por exemplo, telefone, e-mail, chat).',
          },
          {
            lead: 'Publicidade.',
            body: [
              'Usamos suas informações pessoais para exibir anúncios baseados em interesses sobre recursos, produtos e serviços que possam ser do seu interesse. Nós não usamos informações que identificam você diretamente para mostrar anúncios baseados em interesse. Para saber mais, leia a seção ',
              { text: 'E a publicidade?', href: '#publicidade' },
              ' desta Notificação de Privacidade.',
            ],
          },
          {
            lead: 'Prevenção de fraude e riscos de crédito.',
            body: 'Tratamos informações pessoais para impedir e detectar fraude e abuso a fim de proteger a segurança de nossos clientes, da Amazon e de terceiros. Também podemos usar métodos de score/avaliação para avaliar e administrar os riscos de crédito.',
          },
          {
            lead: 'Finalidades para as quais pedimos seu consentimento.',
            body: 'Também podemos pedir o seu consentimento para tratar suas informações pessoais para uma finalidade específica que comunicarmos a você. Quando você concorda com o tratamento de suas informações pessoais para uma finalidade específica, você pode revogar o seu consentimento a qualquer momento e nós pararemos de tratar seus dados para essa finalidade específica.',
          },
        ],
      },
    ],
  },
  {
    id: 'cookies',
    title: 'E os cookies e outros identificadores?',
    blocks: [
      {
        kind: 'text',
        body: 'Para que nossos sistemas possam reconhecer o seu navegador ou dispositivo e oferecer e melhorar os Serviços da Amazon, utilizamos cookies e outros identificadores. Para mais informações sobre cookies e como os utilizamos, leia nossa Notificação sobre Cookies.',
      },
    ],
  },
  {
    id: 'compartilhamento',
    title: 'A Amazon compartilha suas informações pessoais?',
    blocks: [
      {
        kind: 'text',
        body: 'As informações sobre nossos clientes são parte importante de nosso negócio, e nós não atuamos no ramo de venda de informações pessoais de nossos clientes. A Amazon compartilha as informações pessoais de seus clientes somente conforme descrito abaixo e com a Amazon.com, Inc. e com suas subsidiárias que também estão sujeitas a esta Notificação de Privacidade ou seguem práticas pelo menos tão protetivas quanto as descritas nesta Notificação de Privacidade.',
      },
      {
        kind: 'list',
        items: [
          {
            lead: 'Transações envolvendo terceiros:',
            body: 'Disponibilizamos a você serviços, produtos, aplicativos ou funcionalidades/skills fornecidos por terceiros para uso nos ou através dos Serviços da Amazon. Por exemplo, você pode pedir produtos de terceiros por meio de nossas lojas, baixar aplicativos de terceiros provedores de aplicações em nossa App Store, e habilitar skills de terceiros por meio dos nossos serviços da Alexa. Nós também oferecemos serviços ou comercializamos linhas de produtos junto com terceiros como, por exemplo, cartões de crédito com marca conjunta. Você consegue identificar quando um terceiro estiver envolvido em suas transações, e nós compartilhamos informações pessoais de clientes relativas a tais transações com o terceiro envolvido.',
          },
          {
            lead: 'Terceiros prestadores de serviços:',
            body: 'Usamos outras pessoas e empresas para desempenhar funções para nós. Exemplos incluem o atendimento de pedidos de produtos ou serviços, entrega de pacotes, envio de correspondências e e-mails, remoção de informações repetitivas das listas de clientes, análise de dados, prestação de assistência em marketing, fornecimento de resultados de pesquisa e links (incluindo listas e links pagos), processamento de pagamentos, transmissão de conteúdo, score, avaliação e gerenciamento de crédito e prestação de serviço de atendimento ao cliente. Esses terceiros prestadores de serviços têm acesso às informações pessoais necessárias para o desempenho de suas funções, mas não podem usá-las para outras finalidades. Além disso, eles devem tratar as informações pessoais de acordo com esta Notificação de Privacidade e conforme permitido pela lei de proteção de dados aplicável.',
          },
          {
            lead: 'Transferências de negócios:',
            body: 'Nosso negócio continua em desenvolvimento e, portanto, poderemos comprar ou vender outros negócios ou serviços. Nessas transações, geralmente as informações de clientes são um dos ativos transferidos, mas elas permanecem sujeitas às promessas feitas em qualquer Notificação de Privacidade pré-existente (a menos, é claro, que o cliente concorde de outro modo). Ainda, na hipótese remota de a Amazon.com, Inc. ou substancialmente todos os seus ativos serem adquiridos, as informações de cliente serão certamente um dos ativos transferidos.',
          },
          {
            lead: 'Proteção da Amazon e de terceiros:',
            body: [
              'Nós fornecemos informações sobre contas e outras informações pessoais quando acreditamos que esse fornecimento é adequado para fins de cumprimento com a lei; de execução ou aplicação de nossas ',
              { text: 'Condições de Uso', href: '/conditions-of-use' },
              ' e outros acordos; ou de proteção dos direitos, bens e segurança da Amazon, de nossos usuários ou de terceiros. Isso inclui a troca de informações com outras empresas e organizações para proteção de fraude e redução do risco de crédito.',
            ],
          },
        ],
      },
      {
        kind: 'text',
        body: 'Exceto conforme indicado acima, você receberá aviso quando informações pessoais sobre você forem compartilhadas com terceiros e terá a oportunidade de optar pelo não compartilhamento das informações.',
      },
      {
        kind: 'text',
        body: 'Transferências para fora do Brasil. Quando transferirmos informações pessoais para outros países ao compartilharmos informações conforme previsto acima, nós nos certificaremos de que essas informações sejam transferidas de acordo com esta Notificação de Privacidade e conforme permitido pelas leis aplicáveis sobre proteção de dados. Consulte a página sobre Transferência Internacional de Dados Pessoais para obter mais informações.',
      },
    ],
  },
  {
    id: 'seguranca',
    title: 'Quão seguras são as informações sobre mim?',
    blocks: [
      {
        kind: 'text',
        body: 'Desenvolvemos nossos sistemas sempre pensando em sua segurança e privacidade.',
      },
      {
        kind: 'list',
        items: [
          {
            body: 'Trabalhamos para proteger a segurança de suas informações pessoais durante a transmissão usando protocolos e software de criptografia.',
          },
          {
            body: 'Seguimos o Padrão de Segurança de Dados da Indústria de Pagamento com Cartão (PCI DSS) quando lidamos com dados de cartão de crédito.',
          },
          {
            body: 'Mantemos proteções físicas, eletrônicas e procedimentais relativas à coleta, armazenamento e fornecimento de informações pessoais de clientes. Nossos procedimentos de segurança implicam que podemos ocasionalmente solicitar comprovação da identidade antes de divulgarmos informações pessoais a você.',
          },
          {
            body: [
              'Nossos dispositivos contam com recursos de segurança de proteção contra acesso não autorizado e perda de dados. Você pode controlar esses recursos e configurá-los de acordo com suas necessidades. ',
              { text: 'Clique aqui', href: '/content-and-devices' },
              '.',
            ],
          },
          {
            body: [
              'É importante que você se proteja contra acessos não autorizados à sua senha e aos seus computadores, dispositivos e aplicativos. Recomendamos usar uma senha única para sua conta Amazon que não seja utilizada em outras contas online. Certifique-se de encerrar a sessão sempre que terminar de usar um computador compartilhado. ',
              { text: 'Clique aqui', href: '/security' },
              '.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'publicidade',
    title: 'E a publicidade?',
    blocks: [
      {
        kind: 'list',
        items: [
          {
            lead: 'Anúncios de terceiros e links para outros web sites:',
            body: 'Os Serviços da Amazon podem incluir anúncios de terceiros e links para outros web sites e aplicativos. Terceiros-parceiros anunciantes podem coletar informações sobre você quando você interage com o conteúdo, publicidade e serviços oferecidos por eles. Para mais informações sobre anúncios de terceiros na Amazon, incluindo anúncios baseados em interesse, leia nossa Notificação de Anúncios Baseados em Interesse. Para ajustar suas preferências de anúncios, acesse a página Preferências de Anúncios.',
          },
          {
            lead: 'Uso de serviços de publicidade de terceiros:',
            body: 'Fornecemos às empresas de publicidade informações que lhes permitem veicular anúncios da Amazon mais úteis e relevantes e medir sua eficácia. Nunca compartilhamos seu nome ou outras informações que o identifiquem diretamente quando fazemos isso. Em vez disso, usamos um identificador publicitário como um cookie, um identificador de dispositivo ou um código derivado da aplicação de criptografia irreversível a outras informações, como um endereço de e-mail. Por exemplo, se você já baixou um de nossos aplicativos, compartilharemos seu identificador de publicidade e dados sobre esse evento para que você não seja veiculado um anúncio para baixar o aplicativo novamente. Embora não compartilhemos suas ações específicas de consumo, como compras, visualizações de produtos ou pesquisas com empresas de publicidade, podemos compartilhar um identificador publicitário e uma estimativa do valor dos anúncios que elas exibem em nosso nome para que possam apresentar anúncios mais eficazes da Amazon para você. Algumas empresas de publicidade também usam essas informações para veicular anúncios relevantes de outros anunciantes. Você pode saber mais sobre como cancelar a publicidade baseada em interesses acessando a página Preferências de Anúncios.',
          },
        ],
      },
    ],
  },
  {
    id: 'acesso',
    title: 'Quais informações posso acessar?',
    blocks: [
      {
        kind: 'text',
        body: [
          'Você pode acessar suas informações, incluindo seu nome, endereço, opções de pagamento, informações do perfil, assinatura Prime, configurações e histórico de compras na seção "',
          { text: 'Sua conta', href: '/account' },
          '" do web site. ',
          { text: 'Clique aqui', href: '#exemplos-acesso' },
          ' para uma lista de exemplos que você pode acessar.',
        ],
      },
    ],
  },
  {
    id: 'opcoes',
    title: 'Que opções eu tenho?',
    blocks: [
      {
        kind: 'text',
        body: [
          'Caso você tenha alguma dúvida ou objeção sobre a coleta e o tratamento de suas informações pessoais, entre em contato com o nosso ',
          { text: 'Serviço de Atendimento ao Cliente', href: '/help' },
          '. Muitos dos nossos Serviços da Amazon também incluem configurações que oferecem a você opções sobre como suas informações estão sendo usadas.',
        ],
      },
      {
        kind: 'list',
        items: [
          {
            body: 'Conforme descrito acima, você pode optar por não fornecer certas informações, mas, neste caso, não conseguirá se beneficiar de muitos dos Serviços da Amazon.',
          },
          {
            body: [
              'Você poderá inserir ou atualizar informações em páginas como aquelas contidas na seção ',
              { text: 'Quais informações posso acessar?', href: '#acesso' },
              ' Quando você atualiza informações, geralmente guardamos uma cópia da versão anterior em nossos registros, conforme permitido pela legislação aplicável.',
            ],
          },
          {
            body: 'Caso você não queira receber nossos e-mails ou outras comunicações, ajuste suas Preferências de Comunicação do Cliente. Caso você não queira receber notificações em seu aplicativo, ajuste as configurações de notificação em seu aplicativo ou dispositivo.',
          },
          {
            body: 'Caso você não queira ver anúncios baseados em interesse, ajuste suas Preferências de Anúncios.',
          },
          {
            body: 'O recurso Ajuda da maioria dos navegadores e dispositivos mostrará como você pode impedir o seu navegador ou dispositivo de aceitar novos cookies ou outros identificadores, como fazer com que o navegador envie notificações quando você recebe novos cookies ou como bloquear os cookies. Os cookies e outros identificadores permitem que você se beneficie de alguns Serviços da Amazon essenciais, então recomendamos que você os deixe ativos. Por exemplo, se você bloquear ou recusar nossos cookies, você não conseguirá adicionar itens ao seu Carrinho de compras, finalizar a compra/fechar pedidos ou usar Serviços da Amazon que exijam que você faça login. Para mais informações sobre cookies e outros identificadores, consulte a nossa Notificação sobre Cookies.',
          },
          {
            body: 'Caso você queira navegar por nossos web sites sem vincular seu histórico de navegação com a sua conta, você poderá fazê-lo se desconectando de sua conta e bloqueando os cookies em seu navegador.',
          },
          {
            body: 'Quando você concorda que tratemos suas informações pessoais para uma finalidade específica, você poderá revogar o seu consentimento a qualquer momento, e nós interromperemos o tratamento de seus dados para essa finalidade.',
          },
          {
            body: [
              'Você também poderá optar pelo não tratamento de alguns tipos de dados atualizando suas configurações no web site (por exemplo, na página "',
              { text: 'Dispositivos e Conteúdo', href: '/content-and-devices' },
              '"), dispositivo ou aplicativo da Amazon. A maioria de dispositivos que não são da Amazon oferece aos usuários a possibilidade de alterar as permissões do dispositivo (por exemplo, desabilitar/acessar serviços de localização, contatos). Na maioria dos dispositivos, esses controles estão no menu de configurações do dispositivo. Caso você tenha dúvidas sobre como alterar a permissão do seu dispositivo fabricado por terceiros, recomendamos que você entre em contato com sua operadora ou com o fabricante de seu dispositivo, uma vez que dispositivos diferentes podem ter diferentes configurações de permissão.',
            ],
          },
          {
            body: 'Se você é um vendedor, você pode inserir ou atualizar certas informações na Seller Central, atualizar as informações de sua conta acessando suas Informações da Conta do Vendedor e ajustar os e-mails ou outras comunicações que você recebe de nós ao atualizar suas Preferências de Notificação.',
          },
        ],
      },
      {
        kind: 'text',
        body: [
          'Além disso, observando-se a lei aplicável, você tem o direito de pedir acesso, corrigir e excluir seus dados pessoais e pedir a portabilidade de dados. Você também pode contestar nosso tratamento de seus dados pessoais ou pedir que restrinjamos o tratamento de seus dados pessoais em alguns casos. Caso você queira fazer uma dessas coisas, por favor entre em contato com o ',
          { text: 'Serviço de Atendimento ao Cliente', href: '/help' },
          '. Dependendo das suas escolhas sobre os seus dados, alguns serviços podem ficar limitados ou indisponíveis.',
        ],
      },
    ],
  },
  {
    id: 'criancas',
    title: 'Crianças podem usar os Serviços da Amazon?',
    blocks: [
      {
        kind: 'text',
        body: 'A Amazon não vende produtos para serem comprados por crianças. Vendemos produtos de crianças que devem ser comprados por adultos. Caso você seja menor de 18 anos, você poderá usar os Serviços da Amazon somente com o acompanhamento de seus pais ou responsáveis legais.',
      },
    ],
  },
  {
    id: 'retencao',
    title: 'Por quanto tempo mantemos suas informações pessoais?',
    blocks: [
      {
        kind: 'text',
        body: 'Mantemos suas informações pessoais para que você possa continuar usando os Serviços da Amazon pelo tempo necessário para atender às finalidades descritas nesta Notificação de Privacidade, conforme possa ser exigido por lei como, por exemplo, para fins fiscais e contábeis ou conforme de outro modo informado a você. Por exemplo, mantemos seu histórico de transações a fim de que você possa consultar suas compras anteriores (e repetir os pedidos, se desejar) e os endereços para os quais seus pedidos foram enviados, e para melhorarmos a relevância de produtos e conteúdos que recomendamos.',
      },
    ],
  },
  {
    id: 'contatos',
    title: 'Contatos, Notificações e Revisões',
    blocks: [
      {
        kind: 'text',
        body: 'Caso você tenha alguma dúvida sobre privacidade na Amazon ou queira falar com um dos nossos controladores de dados, entre em contato conosco descrevendo sua dúvida que tentaremos saná-la. O encarregado de proteção de dados dos controladores de dados referidos acima pode ser contatado pelo e-mail dpo-amazon-brasil@amazon.com. Você também pode fazer uma reclamação para a Autoridade Nacional de Proteção de Dados brasileira por meio dos seus canais oficiais.',
      },
      {
        kind: 'text',
        body: 'Nossos negócios mudam constantemente e nossa Notificação de Privacidade também mudará. Você deve consultar nossos web sites frequentemente para consultar as alterações recentes. A menos que previsto de outro modo, nossa Notificação de Privacidade atual se aplica a todas as informações que temos sobre você e sua conta. Nós honramos as promessas que fazemos, e nunca mudaremos de forma substancial nossas políticas e práticas de modo que elas protejam menos as informações dos clientes coletadas no passado sem o consentimento dos clientes afetados.',
      },
    ],
  },
  {
    id: 'praticas',
    title: 'Práticas e informações relacionadas',
    blocks: [
      {
        kind: 'list',
        items: [
          { body: [{ text: 'Condições de Uso', href: '/conditions-of-use' }] },
          { body: [{ text: 'Ajuda', href: '/help' }] },
          { body: [{ text: 'Compras mais recentes', href: '/orders' }] },
          { body: [{ text: 'Seu Perfil e Diretrizes da Comunidade', href: '/account' }] },
        ],
      },
    ],
  },
  {
    id: 'exemplos',
    title: 'Exemplos de informações coletadas',
    blocks: [
      {
        kind: 'subheading',
        id: 'exemplos-fornecidas',
        title: 'Informações que você nos fornece quando usa os Serviços da Amazon',
      },
      { kind: 'text', body: 'Você nos fornece informações quando:' },
      {
        kind: 'list',
        items: [
          { body: 'procura ou compra de produtos ou serviços em nossas lojas;' },
          {
            body: 'adiciona ou remove um item do seu carrinho, faz um pedido ou usa Serviços da Amazon;',
          },
          {
            body: 'faz download, assiste vídeo, visualiza ou usa conteúdo em um dispositivo, ou através de um serviço ou aplicativo em um dispositivo;',
          },
          {
            body: 'fornece informações em Sua conta (e você pode ter mais de uma, caso tenha usado mais de um endereço de e-mail ou celular ao comprar com a gente) ou em Seu perfil;',
          },
          { body: 'conversa ou interage de outra forma com o nosso serviço de voz da Alexa;' },
          { body: 'faz o upload dos seus contatos;' },
          {
            body: 'arruma suas configurações, fornece permissões de acesso a dados ou interage com um dispositivo ou serviço da Amazon;',
          },
          {
            body: 'fornece informações em sua Conta de Vendedor, conta no Kindle Direct Publishing (KDP), conta de Desenvolvedor ou qualquer outra conta que disponibilizamos e que lhe permita desenvolver ou oferecer software, bens ou serviços a clientes da Amazon;',
          },
          { body: 'oferece seus produtos ou serviços no ou por meio dos Serviços da Amazon;' },
          { body: 'comunica-se conosco por telefone, e-mail ou de outro modo;' },
          {
            body: 'preenche um questionário, pedido de suporte ou formulário para participação em concursos;',
          },
          {
            body: 'faz upload ou transmissão de imagens, vídeos ou outros arquivos para o Prime Photos, Amazon Drive ou outros Serviços da Amazon;',
          },
          { body: 'usa nossos serviços tais como o Prime Video;' },
          {
            body: 'organiza Playlists, Watchlists, Listas de desejo ou outras listas de presentes;',
          },
          {
            body: 'participa de funcionalidades de comunidade, cria e avalia Avaliações de Clientes;',
          },
          { body: 'fornece e avalia Avaliações de Clientes;' },
          { body: 'especifica um Lembrete de Ocasião Especial; ou' },
          {
            body: 'utiliza Alerta de Disponibilidade de Produto, como, por exemplo, Notificações de Produto Disponível.',
          },
        ],
      },
      {
        kind: 'text',
        body: 'Como resultado dessas ações, você pode nos fornecer informações como: informações identificáveis tais como seu nome; endereço e número de telefone; informações de pagamento; sua idade; suas informações de localização; seu endereço de IP; endereços e números de telefone de pessoas listados em seus Endereços; endereços de e-mail de seus amigos e outras pessoas; conteúdo de avaliações e e-mails enviados a nós; descrição pessoal e foto em Seu perfil; gravação de voz quando você fala com a Alexa; imagens e vídeos coletados ou armazenados em conexão com Serviços da Amazon, informações e documentos sobre identidade e idoneidade; informações societárias e financeiras; informações de histórico de crédito; números referentes a tributação e cadastros governamentais e configurações e arquivos de registro/log em dispositivos, incluindo credenciais de Wi-Fi, caso você opte por sincronizá-los automaticamente com seus outros dispositivos da Amazon.',
      },
      { kind: 'subheading', id: 'exemplos-automaticas', title: 'Informações automáticas' },
      { kind: 'text', body: 'Exemplos de informações que coletamos e analisamos incluem:' },
      {
        kind: 'list',
        items: [
          {
            body: 'o endereço do protocolo de internet (IP) usado para conectar o seu computador à internet;',
          },
          { body: 'login, endereço de e-mail, e senha;' },
          { body: 'a localização de seu dispositivo ou computador;' },
          {
            body: 'informações de interação com o conteúdo como, por exemplo, downloads de conteúdo, streams, dados de reprodução, incluindo duração e número de streams e downloads simultâneos, e dados de rede para qualidade de streaming e download, incluindo informações sobre seu provedor de serviço de internet;',
          },
          {
            body: 'métricas de dispositivos como quando o dispositivo está em uso, uso de aplicativos, dados de conectividade e quaisquer erros ou eventos de falha;',
          },
          {
            body: 'métricas de Serviços da Amazon (por exemplo, ocorrências de erros técnicos, suas interações com recursos e conteúdos de serviços, suas preferências de configuração e informações de backup, localização de um dispositivo com aplicativo aberto, informações sobre imagens e arquivos carregados, tais como nome do arquivo, datas, horários e localização de suas imagens);',
          },
          { body: 'configurações de versões e fusos horários;' },
          {
            body: 'histórico de uso de conteúdo e de compras, que algumas vezes agregamos a informações similares de outros clientes para criar recursos como Mais vendidos;',
          },
          {
            body: 'o clickstream (fluxo de cliques) completo de URLs (Uniform Resource Locators) para, através e a partir do nosso web site incluindo data e horário; produtos e conteúdos visualizados ou buscados por você; tempos de resposta de páginas, erros de download, tempo de visita em certas páginas e informações de interação com a página (como rolagens, cliques e movimentos do mouse); e',
          },
          {
            body: 'números de telefone usados para ligar para o número do nosso Serviço de Atendimento ao Cliente.',
          },
        ],
      },
      {
        kind: 'text',
        body: 'Também podemos usar identificadores de dispositivos, cookies e outras tecnologias em dispositivos, aplicativos e em nossas páginas da web para coletar informações de navegação, uso ou outras informações técnicas.',
      },
      { kind: 'subheading', id: 'exemplos-outras-fontes', title: 'Informações de outras fontes' },
      { kind: 'text', body: 'Exemplos de informações que recebemos de outras fontes incluem:' },
      {
        kind: 'list',
        items: [
          {
            body: 'informações atualizadas de entrega e endereço de nossas transportadoras ou terceiros, as quais usamos para corrigir nossos registros e entregar sua próxima compra e novas comunicações com mais facilidade;',
          },
          {
            body: 'informações de conta, informações de compra ou resgate e informações de visualização de página de alguns comerciantes com quem operamos negócios em conjunto ou para quem fornecemos serviços técnicos, de logística, publicidade ou outros serviços;',
          },
          {
            body: 'informações sobre suas interações com produtos e serviços oferecidos por nossas afiliadas;',
          },
          {
            body: 'resultados de buscas e links, incluindo listagens pagas (como Links Patrocinados, por exemplo);',
          },
          {
            body: 'informações sobre dispositivos conectados à internet e serviços conectados à Alexa; e',
          },
          {
            body: 'informações de histórico de crédito de bureaus de crédito, as quais usamos para prevenir e detectar fraudes e oferecer serviços de crédito ou financeiros para alguns clientes.',
          },
        ],
      },
      { kind: 'subheading', id: 'exemplos-acesso', title: 'Informações que você pode acessar' },
      {
        kind: 'text',
        body: 'Exemplos de informações que você pode acessar por meio de Serviços da Amazon incluem:',
      },
      {
        kind: 'list',
        items: [
          { body: 'status de pedidos recentes (incluindo assinaturas);' },
          { body: 'seu histórico completo de pedidos;' },
          {
            body: 'informações pessoais identificáveis (incluindo nome, e-mail, senha, lista de endereços);',
          },
          {
            body: 'configurações de pagamento (incluindo informações de cartão para pagamento, códigos promocionais e saldo de vale-presente e Configurações de 1 Clique);',
          },
          {
            body: 'configurações de notificação por e-mail (incluindo Alertas de Disponibilidade de Produto, Entregas, Lembretes de Ocasiões Especiais e newsletters);',
          },
          {
            body: 'recomendações e produtos visualizados recentemente que são a base de recomendações (incluindo Recomendados para Você e Melhore Suas Recomendações);',
          },
          {
            body: 'listas de compras e listas de presentes (incluindo Listas de Desejos e Listas de Bebê e Casamento);',
          },
          {
            body: 'seu conteúdo, dispositivos, serviços e configurações relacionadas, comunicações e preferências de publicidade personalizadas;',
          },
          { body: 'conteúdo que você viu recentemente;' },
          { body: 'gravações de voz associadas à sua conta;' },
          {
            body: 'seu Perfil (incluindo suas Avaliações de produto, Recomendações, Lembretes e perfil pessoal);',
          },
          {
            body: 'se você é um vendedor, você pode acessar sua conta e outras informações, e ajustar suas preferências de comunicação atualizando sua conta na Seller Central;',
          },
          {
            body: 'se você é um autor, você pode acessar sua conta e outras informações, e atualizar suas contas no web site do Kindle Direct Publishing (KDP);',
          },
          {
            body: 'se você é um desenvolvedor que participa do nosso Programa de Serviços de Desenvolvedor, você pode acessar sua conta e outras informações, e ajustar suas preferências de comunicação atualizando sua conta no Portal de Serviços do Desenvolvedor.',
          },
        ],
      },
    ],
  },
];

export const PRIVACY_NOTICE: LegalDocument = {
  href: '/privacy',
  title: 'Notificação de Privacidade da Amazon',
  summary: 'Como a Amazon coleta, trata e compartilha suas informações pessoais.',
  updatedAt: 'Última atualização: 25 de setembro de 2025',
  crumbs: ['Segurança e privacidade', 'Políticas legais'],
  intro: [
    'Para ver um resumo da Notificação de Privacidade anterior, clique aqui.',
    'Sabemos que você se preocupa com a forma como suas informações são usadas e compartilhadas e agradecemos sua confiança de que cuidaremos delas com cuidado e sensatez. Esta Notificação de Privacidade descreve como coletamos e tratamos suas informações pessoais obtidas em web sites, dispositivos, produtos, serviços, lojas e aplicativos da Amazon que fazem referência a esta Notificação de Privacidade (em conjunto, os "Serviços da Amazon").',
  ],
  sections: SECTIONS,
};
