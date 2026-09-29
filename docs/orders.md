# Seus pedidos (Devoluções e Pedidos)

A página `/orders` — destino de “Devoluções e Pedidos” no header — lista apenas os
pedidos persistidos do usuário logado, lidos de `GET /api/v1/orders`. Nada na
interface é mock: sem pedidos, a página mostra o estado vazio. `/orders/:id` exibe
os detalhes (endereço, pagamento simulado, resumo de valores e itens).

## Fonte única de pedidos

`apps/storefront/src/features/orders/orders-server.ts` é o único leitor da API de
pedidos no storefront. Ele alimenta:

- **Seus pedidos** (`/orders`) e **Detalhes do pedido** (`/orders/:id`);
- **Atendimento ao Cliente** (`/help`): produtos recentes;
- **Home**: card “Seus pedidos”, só para usuário logado com pedidos (ocupa a
  primeira posição das coleções).

As regras ficam em `order-presentation.ts` (funções puras, testadas): anos do
filtro derivados das datas dos pedidos (fuso America/Sao_Paulo, só anos com pedido,
do mais recente ao mais antigo), períodos “últimos 30 dias” e “nos últimos 3 meses”,
busca por nome do produto ou número do pedido (com ou sem hífens, sem acento),
contador “1 pedido feito em” / “N pedidos feitos em”, status de entrega e prazo de
devolução (um mês após a entrega).

## Dados de entrega

A migration `20260929000000_order_delivery` adiciona `orders.delivered_at` e
`orders.delivery_note`, ambos opcionais. Pedidos do checkout ficam com os dois nulos
(“Pedido recebido”); não existe automação de status nem integração com transportadora.

## Pedido de exemplo

`config/demo-orders.json` descreve o pedido de exemplo (produto `p6` do catálogo,
feito em 10/08/2026 e entregue em 17/08/2026). Para gravá-lo no banco para uma conta
**já existente**:

```bash
DEMO_ORDER_EMAIL=voce@exemplo.com pnpm --filter @amazon-mvp/database seed:demo-orders
```

Com `DATABASE_URL` carregado. O seed copia nome, SKU e preço atuais do produto como o
checkout faz, ignora números de pedido já existentes (pode rodar de novo) e nunca cria
usuários. Remover ou alterar o pedido no banco reflete em todas as páginas acima.

## Validação

- `pnpm --filter @amazon-mvp/storefront test` (`test/orders.spec.ts`, `test/help.spec.ts`).
- `pnpm --filter @amazon-mvp/api test:integration` em banco descartável.
- Navegador: contador, filtro por ano e período, busca, abas, detalhes, reuso em
  `/help` e na Home, redirecionamento sem login e 320–1920 px sem overflow.
