# Checkout acadêmico

`/checkout` usa a sessão atual e o CartProvider já existente. O acesso sem login
redireciona para `/login?next=checkout`; o login retorna ao checkout. Carrinho vazio
não oferece confirmação. A apresentação segue docs/reference/Checkout, com header
simplificado, endereço/pagamento/produtos à esquerda e resumo à direita.

## Dados e limites

- Endereços pertencem ao usuário e são gerenciados pelo módulo Users, por meio de
  USER_ADDRESSES_API. Podem ser cadastrados, selecionados e editados no checkout.
- Order/OrderItem já existiam. A migration 20260926000000_checkout acrescenta
  addresses, totais separados, endereço congelado, forma de pagamento simulada e
  sourceCartId único. Pedidos antigos continuam válidos, com metadados opcionais.
- Pagamento aceita somente SIMULATED_CARD ou SIMULATED_PIX. O cartão pode ser o Visa
  4242 fictício (padrão) ou um cartão salvo pelo usuário, com parcelamento sem juros
  (abaixo). Nunca se envia nem se armazena número completo, CVV ou credenciais.
- Frete é zero nesta simulação, sem cálculo de prazo. O único desconto é o do Pix
  (abaixo); não existe motor de promoções. O total usa preços atuais do catálogo, em
  centavos inteiros. Não se usa o preço anterior promocional da apresentação como
  desconto real.

## Desconto Pix (PIX-001)

"5% de desconto à vista no Pix", calculado somente pela API.

- **Configuração**: `checkout.pixDiscountPercent` em `apps/api/config/default.yaml`
  (padrão 5), sobrescrito por `PIX_DISCOUNT_PERCENT`. Validado pelo Zod em
  `packages/config-schema` no startup: inteiro de 0 a 100 (0 desliga o desconto); valor
  inválido impede a API de subir.
- **Regra de arredondamento** (`percentDiscountMinor` em `@amazon-mvp/api-contract`):
  `descontoMinor = floor(subtotalMinor × taxa / 100)`, só com inteiros. Arredonda para
  baixo: o cliente nunca recebe mais que a taxa anunciada, e o preço Pix anunciado por
  unidade nunca é menor do que o cobrado. Exemplos a 5%: 1 → 0, 19 → 0, 20 → 1,
  3.702 → 185, 99.999 → 4.999 centavos. Aplica-se ao subtotal dos itens (não por linha);
  `total = subtotal + frete − desconto`.
- **Cotação**: `GET /orders/quote?paymentMethod=SIMULATED_PIX|SIMULATED_CARD` (omitido =
  cartão, sem desconto) devolve subtotal, desconto, total, `paymentMethod` e
  `discountPercent`. A `revision` passa a incluir a forma de pagamento e a taxa, além das
  linhas e preços.
- **Confirmação**: o POST recalcula tudo dentro da transação, a partir dos preços
  bloqueados e da taxa do servidor, e grava `subtotalMinor`, `discountMinor` e
  `totalMinor` no pedido. Campos monetários enviados pelo cliente são rejeitados (400).
  Uma revisão feita para outra forma de pagamento (cotou cartão, confirmou Pix, ou
  vice-versa) ou com outra taxa é tratada como cotação desatualizada (409), sem baixar
  estoque. A repetição com o mesmo `sourceCartId` devolve o pedido original com o
  desconto já gravado, mesmo que o reenvio traga outra forma de pagamento.
- **Taxa pública**: `GET /orders/pricing` (sem sessão) devolve `{ pixDiscountPercent }`.
  É a única fonte da taxa para o storefront, que nunca importa `apps/api` nem lê a
  configuração da API: a página de produto mostra "R$ X no Pix (5% de desconto)", o
  carrinho "ou R$ Y no Pix" e o checkout o aviso ao lado da opção Pix, todos com a mesma
  função de arredondamento. Se a API não responder, nada é anunciado.
- **Storefront**: ao escolher Pix ou cartão, o checkout pede nova cotação à API e só
  libera "Confirmar pedido" quando a cotação corresponde à forma selecionada. O resumo
  mostra "Desconto Pix (5%)" e o novo total; cartão não mostra desconto. A confirmação e
  os detalhes do pedido mostram a linha "Desconto Pix" quando `discountMinor > 0` (a taxa
  não é gravada no pedido, por isso o percentual não aparece ali).
- Status inicial PENDING. Não há gateway, cobrança, logística nem transição automática
  para PAID. `/orders` continua sendo a página ainda não implementada; a confirmação
  real fica em `/checkout/success/:orderId` e pode ser recarregada.

## Cartões salvos e parcelamento (CARD-001)

- **Adicionar cartão**: no checkout, "+ Adicionar cartão de crédito" abre um formulário
  com número, nome impresso e validade (mês/ano). O número é validado só no navegador
  (bandeira por prefixo — Visa, Mastercard, Elo, American Express, Hipercard — e Luhn) e
  **não sai dele**: o `POST /payment-cards` recebe apenas `brand`, `last4`,
  `holderName`, `expMonth` e `expYear`. Não há campo de CVV. O DTO rejeita (400)
  campos extras como `number` ou `cvv`, cartão vencido ou bandeira desconhecida.
- **Dados**: tabela `payment_cards` (migration `20261001000300_payment_cards`),
  pertencente ao módulo Users e exposta pelo contrato `USER_PAYMENT_CARDS_API`. Até
  `MAX_SAVED_CARDS` (10) por usuário, sob lock consultivo por conta (409 acima disso).
  Cartões vencidos aparecem desabilitados no checkout.
- **Parcelamento**: sem juros, de 1x até `checkout.maxInstallments` (padrão 10,
  `MAX_INSTALLMENTS`), enquanto cada parcela for ≥ `checkout.minInstallmentMinor`
  (padrão 500 = R$ 5,00, `MIN_INSTALLMENT_MINOR`). A regra é `installmentOptions` em
  `@amazon-mvp/api-contract`: parcela = `floor(total / n)` e a 1ª absorve o resto, de
  modo que a soma é exatamente o total. A cotação de cartão devolve
  `installmentOptions`; a de Pix devolve `[]`. Como não há juros, o plano não altera o
  total e não entra na `revision`.
- **Confirmação**: `PlaceOrderRequest` ganhou `cardId?` (omitido = Visa 4242 fictício)
  e `installments?` (omitido = 1). O POST valida o cartão do próprio usuário (404 se de
  outro), vencimento e se o número de parcelas existe para o total recalculado na
  transação (400 `PAYMENT_INVALID`); Pix com `cardId` ou `installments` também é 400.
  O pedido grava `payment_card` (`{ brand, last4 }`) e `installments`; excluir o
  cartão depois não altera o pedido. Pix e pedidos antigos ficam com ambos nulos.
- **Exibição**: confirmação, detalhes do pedido e "Meios de pagamento" usam
  `paymentLabel`: "Cartão fictício · Mastercard final 5100 · 3x sem juros". Pedidos
  anteriores ao CARD-001 continuam "Cartão fictício · Visa final 4242".

| Endpoint | Função |
| --- | --- |
| GET/POST `/api/v1/payment-cards` | Listar/salvar cartões simulados próprios |
| DELETE `/api/v1/payment-cards/:cardId` | Remover cartão próprio; devolve os restantes |

## Contrato e consistência

Endpoints:

| Endpoint | Função |
| --- | --- |
| GET/POST `/api/v1/addresses` | Listar/cadastrar endereços próprios |
| PUT `/api/v1/addresses/:addressId` | Editar endereço próprio |
| GET `/api/v1/orders/pricing` | Taxa do desconto Pix (público, sem sessão) |
| GET `/api/v1/orders/quote` | Recalcular carrinho, frete, desconto, total e revisão para `paymentMethod` |
| POST `/api/v1/orders` | Confirmar cartId, revision, addressId e paymentMethod |
| GET `/api/v1/orders` | Últimos 50 pedidos do usuário |
| GET `/api/v1/orders/:orderId` | Pedido e itens congelados, somente do proprietário |

Com exceção de `/orders/pricing`, todos exigem a sessão existente.

O servidor valida dados e propriedade; não aceita usuário, preço, desconto ou total
enviados pelo cliente. Uma revisão do carrinho detecta alterações de quantidades,
preços, forma de pagamento ou taxa Pix entre a revisão e a confirmação, exigindo nova
revisão antes de comprar.

A transação compartilha o bloqueio por usuário das mutações do carrinho. O catálogo
bloqueia produtos em ordem estável e desconta estoque com verificação atômica.
Orders grava os snapshots e chama Cart para converter o carrinho e remover suas
linhas, tudo na mesma transação. Uma falha desfaz todas essas alterações. Os
módulos acessam somente suas próprias tabelas através dos respectivos contratos.

sourceCartId impede pedidos duplicados. Uma repetição do POST retorna o pedido
anterior e não consome o próximo carrinho. Se a resposta se perder, a interface
mantém o mesmo pedido de confirmação para a tentativa seguinte e bloqueia edição
até esclarecer o resultado. Depois do sucesso, atualiza o provider/contador sem
chamar um DELETE separado, e abre a confirmação persistida.

## Execução local

Aplicar migrations e gerar Prisma antes de iniciar API/storefront. cart,
productDetails e checkout estão ativados em config/features.yaml (FLAGS-001); ao
trocar de arquivo de flags, reiniciar o storefront porque as flags são lidas uma vez.

## Validação

`apps/api/test/checkout.e2e-spec.ts` usa PostgreSQL e cobre sessão, endereço de
outro usuário, dados obrigatórios, carrinho vazio, snapshots, revisão desatualizada,
concorrência, repetição, estoque e rollback de falha injetada; e, para o Pix, taxa
pública, cotação cartão × Pix, arredondamento (1, 19, 20, 99.999 centavos), desconto
gravado e mantido em repetições, totais forjados e revisão de outra forma de
pagamento. A suíte deve rodar em banco descartável.
`apps/api/src/modules/orders/checkout-quote.spec.ts` testa a regra de arredondamento e
a revisão; `packages/config-schema` testa padrão e limites da taxa.
`apps/storefront/test/checkout.spec.ts` cobre validação, mutações existentes,
sincronização do resumo, troca cartão ↔ Pix com nova cotação, sucesso, expiração de
sessão e repetição da mesma confirmação após perda de resposta;
`test/pix-price.spec.ts` e `test/product-page.spec.ts` cobrem o preço Pix anunciado.
