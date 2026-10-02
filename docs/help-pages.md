# Páginas de ajuda e pagamento do rodapé

As colunas “Pagamento” e “Deixe-nos ajudar você” do rodapé levam a sete páginas
reais, no visual das páginas de ajuda da Amazon.com.br (header, barra teal
“amazon customer service”, trilha de navegação, artigo, barra lateral de tópicos e
rodapé):

| Rota | Flag | Conteúdo |
| --- | --- | --- |
| `/payment-methods` | `paymentMethods` | Cartão fictício e Pix simulado, parcelamento, transações dos pedidos |
| `/points` | `points` | Compre com Pontos em termos gerais; indisponível nesta loja |
| `/credit-card` | `creditCard` | Cartão com a marca da loja em termos gerais; sem solicitação |
| `/shipping` | `shipping` | Frete R$ 0,00, endereço congelado no pedido, status de entrega |
| `/returns` | `returns` | Processo de devolução, prazo exibido em Seus pedidos; sem fluxo online |
| `/content-and-devices` | `contentAndDevices` | Área de conteúdo e dispositivos em termos gerais; indisponível |
| `/recalls` | `recalls` | Estado vazio honesto + orientações gerais de segurança |

## Arquitetura

`apps/storefront/src/features/customer-pages/`:

- `customer-page-content.ts` — conteúdo tipado das sete páginas (seções com blocos
  `text`, `list`, `steps`, `facts`, `methods`, `installments`, `links`, `faq`,
  `empty` e `slot`) e `customerPageMetadata` (“Título | Amazon.com.br”).
- `customer-article.tsx` / `customer-blocks.tsx` — corpo compartilhado, renderizado
  no servidor. O FAQ usa `<details>` nativo (teclado sem JavaScript).
- `customer-page.tsx` — página completa (AmazonHeader, CustomerServiceBar de /help,
  artigo, AmazonFooter) e importação de `customer-pages.css` (estilos próprios,
  fora de `globals.css`).
- `payment-transactions.tsx` — slot de `/payment-methods`: para o usuário logado,
  os 5 pedidos mais recentes com forma de pagamento e total, lidos por
  `features/orders/orders-server.ts` (mesma fonte de Seus pedidos).

Cada `app/<rota>/page.tsx` só envolve o layout em `FeatureRoute` com a própria flag.

## Regras de conteúdo

Tudo o que é dito sobre esta loja reflete o código: `PlaceOrderDto` aceita apenas
`SIMULATED_CARD`/`SIMULATED_PIX`; o quote grava frete zero; o endereço é copiado
para o pedido; os status vêm de `order-presentation.ts`; o prazo de devolução é um
mês após `delivered_at`; o exemplo de parcelamento usa `installmentPlan` da página
de produto. Não há fluxo de devolução, cancelamento, pontos, cartão ou registro de
dispositivos, e as páginas dizem isso. O texto sobre Pix não cita percentual de
desconto: diz apenas que um desconto, quando houver, aparece no resumo do pedido.
Não há números, parceiros, tarifas, telefones, CNPJ nem links externos inventados
(`test/customer-pages.spec.ts` verifica padrões e se todo link interno existe).

## Validação

- `pnpm --filter @amazon-mvp/storefront test` (`test/customer-pages.spec.ts`,
  `test/features.spec.ts`).
- Navegador: as sete páginas em 390 e 1440 px, sem overflow horizontal nem erros de
  console; links do rodapé, “Ver opções de pagamento” da página de produto e
  “Seus pagamentos” de Sua conta.

## Páginas legais (`/privacy` e `/conditions-of-use`)

| Rota | Flag | Conteúdo |
| --- | --- | --- |
| `/privacy` | `privacyNotice` | Notificação de Privacidade da Amazon |
| `/conditions-of-use` | `conditionsOfUse` | Condições de Uso |

Artigos legais transcritos da amazon.com.br em `features/legal/`: cada documento é
um `LegalDocument` tipado (`legal-types.ts`) em `*-content.ts`, renderizado por
`LegalArticle` no layout dos artigos de ajuda da amazon.com.br: título “Ajuda e
Serviço de atendimento ao cliente”, barra lateral “Políticas legais”
(`legal-nav.ts`, página atual em negrito; itens sem página aqui ficam como texto)
e coluna com busca “Encontrar mais soluções” (mesma biblioteca de `/help`),
trilha, título, sumário com âncoras e seções. `LegalPageLayout` envolve com
header, rodapé e `legal.css`. São o destino de “Condições de Uso” e
“Notificação de Privacidade” no rodapé, no login e no cadastro. Links só para
rotas existentes ou âncoras da página; URLs e páginas da Amazon que não existem
aqui ficam como texto (`test/legal-pages.spec.ts`).

## Problemas na conta e de login (`/account-issues`)

| Rota | Flag | Conteúdo |
| --- | --- | --- |
| `/account-issues` | `accountIssues` | Problemas na conta e de login |

Destino de “Precisa de ajuda?” no login (`features/account-issues/`). Caixa
numerada “1 Em que podemos ajudar?” com o seletor “Selecione um problema”; cada
uma das cinco opções mostra a caixa “2 Você sabia?” com a resposta transcrita da
amazon.com.br (`account-issues-content.ts`). Só “Criar conta” vira link
(`/register`); redefinição de senha e recuperação da verificação em duas etapas
não existem aqui e ficam como texto (`test/account-issues.spec.ts`).
