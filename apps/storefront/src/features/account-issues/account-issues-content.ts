/**
 * Answers of the "Problemas na conta e de login" page (/account-issues), the
 * target of "Precisa de ajuda?" on /login. Same link rule as features/legal:
 * only routes that exist in this storefront become links; references to Amazon
 * flows we do not have (password reset, two-step recovery) stay as plain text.
 */

/** Plain text, or text mixed with links to internal routes. */
export type IssueText = string | Array<string | { text: string; href: string }>;

export type IssueBlock =
  | { kind: 'text'; body: IssueText }
  /** Numbered steps. */
  | { kind: 'steps'; items: IssueText[] };

export interface AccountIssue {
  id: string;
  /** Option label in "Selecione um problema". */
  label: string;
  blocks: IssueBlock[];
}

const PHONE = '0800 037 0715';
const SUPPORT_HOURS =
  'O nosso atendimento funciona todos os dias, das 9h às 23:00h, horário de Brasília.';

export const ACCOUNT_ISSUES: AccountIssue[] = [
  {
    id: 'forgot-password',
    label: 'Esqueci a minha senha',
    blocks: [
      { kind: 'text', body: 'Já tentou Redefinir sua senha?' },
      {
        kind: 'text',
        body: 'Caso já tenha tentado redefinir sua senha mas não tenha recebido um email da Amazon, verifique sua caixa de Spam ou email indesejado.',
      },
      {
        kind: 'text',
        body: 'Se você não tiver acesso ao seu email, tente redefini-lo com seu provedor de email.',
      },
      {
        kind: 'text',
        body: 'Se você atualizou sua senha recentemente, sua senha antiga pode estar salva no seu navegador, tente remover e reescrever sua nova senha.',
      },
    ],
  },
  {
    id: 'password-not-working',
    label: 'Minha senha não está funcionando',
    blocks: [
      {
        kind: 'text',
        body: 'Às vezes, para aumentar a segurança, temos que autorizar o acesso à sua conta por e-mail. Confira sua caixa de entrada para ver se você recebeu um e-mail da Amazon com mais detalhes.',
      },
      {
        kind: 'text',
        body: 'Se você alterou a senha recentemente e está tendo problemas, é possível que o navegador tenha uma senha antiga salva. Limpe todas as senhas salvas e insira a nova senha mais uma vez.',
      },
      {
        kind: 'text',
        body: 'Se você ainda não tentou redefinir a senha, acesse a página de redefinição de senha',
      },
      {
        kind: 'text',
        body: `Caso não tenha recebido um e-mail nosso e ainda esteja com problemas para fazer login, ligue para: ${PHONE}. ${SUPPORT_HOURS}`,
      },
    ],
  },
  {
    id: 'no-account',
    label: 'Não tenho conta na Amazon, mas preciso de ajuda',
    blocks: [
      {
        kind: 'text',
        body: [
          'Você pode criar uma conta da Amazon rapidamente na ',
          { text: 'Criar conta', href: '/register' },
          '.',
        ],
      },
      {
        kind: 'text',
        body: `Se precisar de mais ajuda, ligue gratuitamente para o número ${PHONE} ou, se estiver fora do Brasil, ligue para +55 11 3958 5225 (custos da ligação podem ser aplicados). ${SUPPORT_HOURS}`,
      },
    ],
  },
  {
    id: 'cannot-create-account',
    label: 'Não consigo criar uma conta',
    blocks: [
      { kind: 'text', body: 'Lamentamos que tenha tido problemas ao criar uma conta da Amazon.' },
      {
        kind: 'text',
        body: [
          'Você já tentou utilizar a página ',
          { text: 'Criar conta', href: '/register' },
          '?',
        ],
      },
      {
        kind: 'text',
        body: `Se precisar de mais ajuda, ligue gratuitamente para o número ${PHONE}. ${SUPPORT_HOURS}`,
      },
    ],
  },
  {
    id: 'two-step-verification',
    label: 'Não consigo passar pelo processo de verificação em duas etapas',
    blocks: [
      {
        kind: 'text',
        body: 'Para recuperar o acesso à sua conta, você precisará verificar sua identidade fornecendo uma cópia digitalizada ou uma foto de um documento de identidade emitido pelo governo. Para proteger sua conta, não podemos fazer alterações nas configurações da verificação em duas etapas até que sua identidade seja verificada com sucesso. Se você conseguir entrar em sua conta, terá acesso para fazer alterações nela.',
      },
      {
        kind: 'text',
        body: 'Antes de começar a recuperação da conta, tente entrar com um método de backup registrado ou usando um dispositivo confiável.',
      },
      { kind: 'text', body: 'Se você ainda não conseguir fazer login, para recuperar sua conta:' },
      {
        kind: 'steps',
        items: [
          'Vá para Recuperação da conta com verificação em duas etapas.',
          'Siga as instruções na tela para fazer o upload do seu documento de identidade.',
        ],
      },
      {
        kind: 'text',
        body: 'Certifique-se de que seu nome e endereço e a autoridade emissora (por exemplo, estado ou país) estejam visíveis.',
      },
      {
        kind: 'text',
        body: 'Cubra, oculte ou remova informações confidenciais, como números de contas ou números de identificação.',
      },
      {
        kind: 'text',
        body: 'O processo de verificação pode levar de 1 a 2 dias para ser concluído. Enviaremos um e-mail para você assim que desativarmos a verificação em duas etapas e, em seguida, você poderá entrar na sua conta com sua senha. Ainda podemos exigir medidas de segurança adicionais durante o login para proteger sua conta, como fornecer um código único enviado para seu e-mail ou seu número de telefone principal adicionado à sua conta Amazon.',
      },
    ],
  },
];
