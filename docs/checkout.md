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
- Pagamento aceita somente SIMULATED_CARD ou SIMULATED_PIX. A opção cartão mostra
  Visa 4242 fictício; não coleta nem armazena número de cartão, CVV ou credenciais.
- Frete é zero nesta simulação, sem cálculo de prazo. Não existe motor de descontos.
  O total usa preços atuais do catálogo, em centavos inteiros. Não se usa o preço
  anterior promocional da apresentação como desconto real.
- Status inicial PENDING. Não há gateway, cobrança, logística nem transição automática
  para PAID. `/orders` continua sendo a página ainda não implementada; a confirmação
  real fica em `/checkout/success/:orderId` e pode ser recarregada.

## Contrato e consistência

Todos os endpoints exigem a sessão existente:

| Endpoint | Função |
| --- | --- |
| GET/POST `/api/v1/addresses` | Listar/cadastrar endereços próprios |
| PUT `/api/v1/addresses/:addressId` | Editar endereço próprio |
| GET `/api/v1/orders/quote` | Recalcular carrinho, frete, total e revisão |
| POST `/api/v1/orders` | Confirmar cartId, revision, addressId e paymentMethod |
| GET `/api/v1/orders` | Últimos 50 pedidos do usuário |
| GET `/api/v1/orders/:orderId` | Pedido e itens congelados, somente do proprietário |

O servidor valida dados e propriedade; não aceita usuário, preço ou total enviados
pelo cliente. Uma revisão do carrinho detecta alterações de quantidades/preços
entre a revisão e a confirmação, exigindo nova revisão antes de comprar.

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
concorrência, repetição, estoque e rollback de falha injetada. A suíte deve rodar
em banco descartável. `apps/storefront/test/checkout.spec.ts` cobre validação,
mutações existentes, sincronização do resumo, sucesso, expiração de sessão e
repetição da mesma confirmação após perda de resposta.
