# Avaliações de clientes (REVIEWS-001)

Módulo `reviews` da API (`apps/api/src/modules/reviews`, token `REVIEWS_API`) e a
integração no storefront. Substitui a leitura de `config/demo-reviews.json` e das notas de
`config/demo-products.json` pelo storefront.

## Tabelas (migration `20261001000000_reviews`)

| Tabela | Conteúdo |
|---|---|
| `reviews` | Uma avaliação por cliente por produto (`UNIQUE(product_id, user_id)`): nota 1–5, título, texto, `verified_purchase`, `helpful_count` (desnormalizado), `source` (`CUSTOMER` \| `DEMO`), `fixture_key` (idempotência do seed) |
| `review_helpful_votes` | Um voto "Útil" por cliente por avaliação (PK `review_id, user_id`) |
| `review_rating_baselines` | Nota agregada das listagens demo (quantidade, soma das estrelas, distribuição em %), sem textos por trás |

Produtos e usuários são referenciados **só por id**, sem FK para tabelas de outros módulos
(como `order_items`). `CHECK`s no SQL garantem nota 1–5, contador ≥ 0 e que avaliação de
cliente sempre tenha `user_id` (o Prisma não modela CHECK, então não há drift).

## Fronteiras de módulo

- **Existência do produto**: `CATALOG_API.findByIds` (inclui inativos: dá para avaliar um
  produto que saiu de linha).
- **Nome público**: `USERS_API.findById` → "Primeiro nome + inicial do sobrenome"
  (`Camila L.`), gravado na avaliação e atualizado a cada edição. E-mail nunca aparece.
- **"Compra verificada"**: novo método `ORDERS_API.hasPurchased(userId, productId)` — pedido
  não cancelado contendo o produto. O módulo `reviews` nunca lê `orders`/`order_items`. O selo
  é calculado ao criar **e ao editar** a avaliação (quem comprou depois de avaliar ganha o
  selo ao salvar de novo); a página de escrita avisa quando a avaliação receberá o selo.
- **Agregados**: um endpoint próprio de reviews, não um campo do DTO do catálogo. Pôr a nota
  no `CATALOG_API` criaria o ciclo Catalog → Reviews → Orders → Catalog; o storefront compõe
  catálogo + resumo, como já faz com conteúdo de apresentação.

## Endpoints (`/api/v1/reviews`)

| Método | Rota | Acesso | Uso |
|---|---|---|---|
| GET | `/reviews?productIds=&sort=helpful\|recent&stars=1..5&page=&pageSize=` | público | Lista paginada (máx. 20 por página, 24 produtos) |
| GET | `/reviews/summary?productIds=` | público | Média, total e distribuição 5→1 somados sobre os produtos (família de variações) |
| GET | `/reviews/summaries?productIds=` | público | Média e total por produto (cards; até 48) |
| GET | `/reviews/viewer?productIds=` | sessão | Avaliações próprias e votos "Útil" do cliente nesses produtos |
| GET | `/reviews/mine?productId=` | sessão | Avaliação própria (ou `null`) + se ela seria "Compra verificada" |
| PUT | `/reviews/mine` | sessão | Cria ou atualiza a avaliação própria (`{ productId, rating, title, body }`) |
| PUT | `/reviews/:reviewId/helpful` | sessão | Voto "Útil" idempotente; `403 REVIEW_SELF_VOTE` na própria avaliação |

Validação (`REVIEW_LIMITS` em `@amazon-mvp/api-contract`, usada pela API e pelo formulário):
título 3–120 e texto 10–5000 caracteres após `trim`, nota inteira 1–5, campos extras
rejeitados. Erros seguem `{ error: { code, message, requestId } }`.

## Como o resumo é calculado

`summarize` (`review-rules.ts`, função pura com testes): soma as listagens demo e as
avaliações escritas. Variações da mesma listagem demo (`listing_key` = grupo de variação)
guardam o mesmo agregado e contam **uma vez** quando a família inteira é resumida. A
distribuição só é devolvida quando todas as partes a conhecem — nunca é estimada a partir
da média. Produto sem nada: `{ average: null, count: 0 }` → UI "Ainda não há avaliações".

## Dados demo (`seed:demo`, idempotente)

- 146 agregados de `config/demo-products.json` (+ distribuição de
  `config/demo-product-content.json`) em `review_rating_baselines`.
- 4 textos do 8BitDo (`config/demo-reviews.json`, agora um por variação com `productSlug`)
  como `source = DEMO`, sem conta, `verified_purchase = false` (não há pedido por trás) e
  com o contador "Útil" do fixture.
- Linhas existentes nunca são sobrescritas; o seed base (`seed`) também chama
  `seedDemoReviews`. Consequência consciente: o 8BitDo mostra 5.508 (listagem) + 4 textos.

## Storefront

- `features/product/reviews/product-reviews.ts` continua sendo a única fonte do formato
  `ProductReviews`, agora lendo a API. Variações compartilham o mesmo conjunto de
  avaliações e a mesma nota (a página passa os ids da família); cada avaliação mostra a
  variação avaliada (ex.: "Cor: Verde").
- Nota sob o título, "Detalhes do produto", cards da Home, relacionados e do carrinho vêm da
  API (`withRatings` / `attachRatings`). Se a API de reviews falhar, nada é exibido no lugar
  (e a seção diz que não foi possível carregar).
- Página do produto: histograma com links de filtro por estrela, "Mais úteis"/"Mais
  recentes", paginação (8 por página) — tudo via query string (`reviewSort`, `reviewStars`,
  `reviewPage`), sem JavaScript. Aviso após publicar/editar (`?review=published|updated`).
- "Útil": voto persistido com UI otimista (contador atualiza na hora, substituído pelo valor
  do servidor ou revertido em caso de erro); visitante vai para o login; autor não vê o botão.
- `/products/<slug>/review`: estrelas como grupo de rádios nativo (setas/Home/End e leitores
  de tela), título, texto com contador, miniatura do produto; visitante →
  `/login?next=/products/<slug>/review`; edição preenche a avaliação existente.
- **Mídia de clientes**: não há armazenamento de arquivos no projeto, então não existe
  upload e a seção de fotos/vídeos fica oculta (`media` é sempre vazio).

## Testes

- API unitário: `review-rules.spec.ts` (resumo, dedupe por listagem, distribuição
  desconhecida, nome público).
- API integração: `test/reviews.e2e-spec.ts` (leitura pública/escrita com sessão, validação,
  upsert único, selo só após pedido não cancelado, votos únicos e bloqueio do próprio,
  ordenação/filtro/paginação, resumo exato e dedupe de família).
- Storefront: `product-reviews.spec.ts`, `reviews-ui.spec.ts`, `write-review-page.spec.ts`
  e `product-page.spec.ts` (página com API falsa).
