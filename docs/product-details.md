# Página individual de produto

`/products/[productId]` é **um único template** para todo o catálogo. Aceita UUID ou slug
(`/products/p6`, `/products/<uuid>`) e consulta `GET /api/v1/catalog/products/:productId`
sem cache. Não existe página, `if` ou rota específica por produto: o 8BitDo Ultimate 2C
(p6) é apenas o produto de referência visual (docs/reference/Product e as capturas da tarefa).

## De onde vem cada informação

| Parte da página | Fonte |
|---|---|
| Nome, preço, estoque, ativo, descrição, categorias | Banco, via API do catálogo (autoritativo) |
| Breadcrumb | `categoryPath` da API: cadeia raiz → folha da categoria mais específica (`categories.parent_id`) |
| Marca, galeria, atributos ("Plataforma"), "Sobre este item", detalhes, ranking, selos, parcelas, variações, envio/vendedor/devolução | `config/demo-product-content.json` (servidor apenas), casado por **slug + SKU** |
| Imagem principal de cards, preço anterior | `config/demo-products.json` (o mesmo usado pela Home e pelo seed) |
| Nota média, quantidade e distribuição de avaliações (página e cards) | API de reviews (`GET /reviews/summary`, `/reviews/summaries`) — ver [reviews](reviews.md) |
| "Da marca" | `config/demo-brands.json`; só aparece para marcas cadastradas |
| Avaliações individuais, votos "Útil" e "Compra verificada" | `features/product/reviews/product-reviews.ts` ← API de reviews (`GET /reviews`) |
| "Você comprou este produto…" | Pedidos reais do usuário (`fetchOrders()`, mesma fonte de "Seus pedidos") |
| "Enviar para …" | Primeiro endereço salvo do usuário (`GET /addresses`, mesma ordem do checkout) |
| Relacionados | `relatedProducts` + `rankRelated` (ver "Produtos relacionados" abaixo) |
| Preço no Pix | Taxa de `GET /orders/pricing` (config da API) + `percentDiscountMinor` do api-contract |
| Cards da Home | Curadoria (quais produtos, em que vitrine) do fixture; nome, preço e estoque do registro do catálogo (`features/home/home-catalog.ts`) |

Conteúdo de apresentação **nunca** sobrescreve identidade, preço, estoque, descrição ou
categorias do banco. Um produto sem entrada nos arquivos de apresentação continua abrindo
normalmente, só sem as seções que dependem desses dados (nada é inventado nem herdado de
outro produto — nem imagem).

## Variações

Como na Amazon (ASINs filhos), cada variação é **um registro próprio do catálogo** (p6
Hortelã, p21 Pêssego, p22 Roxa, p23 Verde), agrupado por `variant.group`. Escolher uma cor
navega para a URL daquele registro, então imagem, preço, estoque, título, metadata e a
linha do carrinho trocam juntos. A matriz (`variantDimensions`) mantém as outras opções
selecionadas quando possível. Variações indisponíveis aparecem tracejadas. A Home mostra
um card por família (`variantOf` fica fora das vitrines).

## Produtos relacionados

`features/product/product-server.ts` (`relatedProducts`) busca candidatos por categoria e
`features/product/related-products.ts` (`rankRelated`, função pura) os ordena:

1. **Distância de categoria**: primeiro todas as categorias do próprio produto (um teclado
   gamer está em "Teclados" e em "Periféricos Gamer"), depois os ancestrais do breadcrumb, um
   nível por vez. Cada nível é uma requisição `?category=` limitada (24 itens, filtrada no
   banco) e a busca só sobe enquanto o carrossel não tem 12 cards — nunca sai do departamento.
2. **Categorias em comum**: quem aparece em mais categorias do produto vem antes (outro headset
   antes de um teclado gamer).
3. **Disponibilidade**: esgotados vão para o fim.
4. **Afinidade**: mesma marca (+4), atributos iguais como a cor (+1 cada, até 3) e preço
   parecido (até +3; 4x mais caro/barato já não conta).
5. **Famílias**: a própria família nunca aparece (ela está nas amostras de cor); cada outra
   família aparece uma vez — o membro que combina (ex.: a variação preta para um tênis preto)
   ou, sem preferência, a cabeça da família, como na Home.

## Carrinho e checkout (fluxos existentes)

- **Adicionar ao carrinho**: `useCart().add(uuid, quantidade)` — o mesmo CartProvider do resto
  do site. Quantidade limitada por estoque disponível e pelo que já está no carrinho.
- **Comprar agora**: garante que o carrinho tenha a quantidade escolhida (adiciona, ou só
  completa uma linha existente, nunca reduz) e abre o `/checkout` existente. Como o checkout
  do projeto é baseado no carrinho, outros itens já no carrinho aparecem junto — diferença
  consciente em relação ao "comprar só este item" da Amazon.
- Visitante: os botões levam a `/login?next=/products/<slug>`; o login agora respeita
  `next` com caminhos do próprio site (nunca `//host` ou URLs completas).
- Fora de estoque / inativo: "Fora de estoque" / "Indisponível no momento", sem botões.

## O que é demonstrativo (e o que não é mostrado)

- **Prime**: não existe assinatura no projeto; o quadro "prime" do buy box é só visual. O
  alerta "Sua assinatura Prime está pausada" aparece para usuários logados **sem cartão
  salvo válido** (nenhum de `GET /payment-cards` fora do vencimento, `isCardExpired`; se a
  API falhar, o alerta aparece). "Atualizar meio de pagamento" abre um diálogo com os
  cartões salvos (os vencidos podem ser removidos, `DELETE /payment-cards/:id`) e o mesmo
  formulário "Adicionar cartão" do checkout (`POST /payment-cards`); salvo um cartão válido,
  o alerta some. O × dispensa o alerta gravando o cookie `az_prime_notice_dismissed` com o
  id do usuário (1 ano), lido no servidor — outra conta no mesmo navegador continua vendo.
- **Pix à vista (PIX-001)**: "R$ X no Pix (5% de desconto)" abaixo do preço e "ou R$ X no
  Pix" no buy box (este só com estoque). O checkout aplica esse desconto de fato: a taxa vem
  de `GET /api/v1/orders/pricing` (configuração `checkout.pixDiscountPercent` da API) e o
  valor usa a mesma função de arredondamento da cotação (`percentDiscountMinor`, para
  baixo), então o preço anunciado por unidade é o cobrado. Sem checkout habilitado, sem
  resposta da API ou com taxa 0, nada é anunciado. Ver docs/checkout.md.
  Parcelas "sem juros" são exibidas porque não alteram o total.
- **Data de entrega**: não há estimativa de prazo; mostramos só "Entrega GRÁTIS" (o checkout
  não cobra frete).
- **Avaliações**: vêm do módulo `reviews` da API (REVIEWS-001, detalhes em
  [reviews](reviews.md)). As notas agregadas das listagens demo e os 4 textos do 8BitDo
  foram movidos para o banco pelo `seed:demo`, marcados como demonstração (autores
  fictícios, nunca "Compra verificada"). Produtos sem avaliações mostram "Ainda não há
  avaliações" e o botão "Escreva uma avaliação" — nenhum número é inventado.
  `/products/<slug>/review` (flag `productReviews` ligada) cria ou edita a avaliação do
  cliente; "Útil" grava um voto por cliente. Não há armazenamento de arquivos: a seção
  "Fotos e vídeos de clientes" continua oculta enquanto não houver mídia real.
- **Breadcrumb e marca**: com a flag `catalog` ligada, cada nível do breadcrumb abre a
  listagem da categoria (`/products?category=<slug>`), "Marca: X" e "Da marca" abrem a
  listagem da marca (`/products?brand=<chave>`) — ver [browse.md](browse.md). Com a flag
  desligada os níveis voltam a ser texto e "Marca" leva à seção "Da marca".

## Dados e seed

Migration `20260930000000_category_hierarchy` adiciona `categories.parent_id` (FK para a
própria tabela, `ON DELETE SET NULL`, indexada). A API passa a devolver `categoryPath` e o
filtro `?category=` inclui a subárvore inteira.

### Catálogo demo (150 produtos)

`config/demo-products.json` + `config/demo-product-content.json` descrevem p1–p146 (p1–p23
originais, p24–p146 da expansão), e o `seed.ts` base adiciona 4 produtos legados. São 24
famílias de cor novas (além do 8BitDo), 86 categorias demo e mais de 30 marcas. Imagens dos
novos produtos ficam em `apps/storefront/public/images/products/catalog/` (uma por produto
ou por cor; origem em `SOURCES.md`). A Home resolve todas as vitrines numa única consulta
`GET /catalog/products?slugs=...` (até 48 slugs por requisição) em vez de uma por card.

`pnpm --filter @amazon-mvp/database seed:demo` (idempotente):

- cria a taxonomia de `config/demo-categories.json` e liga cada produto demo à sua categoria;
- preenche `description` apenas quando está vazia;
- insere p21–p23 (estoque demonstrativo de 10, como os demais);
- converte p6 no 8BitDo **somente se** ainda tiver exatamente os valores antigos do fixture
  ("Controle Sem Fio para Console, Preto", R$ 329,00). Qualquer edição feita no banco é
  preservada.

Pedidos antigos guardam o snapshot do nome da época (regra do projeto): um pedido de p6 feito
antes da conversão continua com o nome antigo em "Seus pedidos", mas o banner da página de
produto o reconhece pelo ID.

## Metadata, 404 e desempenho

- `generateMetadata`: `<nome> | Amazon.com.br`, descrição do banco (ou primeiro item de
  "Sobre este item", ou o nome) e Open Graph com a primeira imagem do próprio produto.
- Produto inexistente: página "Produto não encontrado" com `noindex`. O status HTTP é 200 porque
  o `app/loading.tsx` global faz streaming antes do `notFound()` (comportamento documentado do
  Next 14); remover o loading global afetaria todas as páginas.
- Imagens locais via `next/image` (redimensionadas; `priority` só na principal). Conteúdo pesado
  (galerias, especificações, reviews) é importado apenas no servidor; componentes cliente:
  galeria, buy box, feedback de review e carrossel de mídia.

## Testes

- `test/product-rules.spec.ts`: matriz de variações, última compra (inclusive variação irmã,
  ignora cancelados), datas em horário de Brasília, parcelas e desconto.
- `test/product-content.spec.ts`: fixtures só referenciam produtos/categorias/imagens reais,
  conteúdo do 8BitDo não vaza para outros produtos, SKU divergente não herda nada, reviews
  compartilhadas por família, Home com um card por família.
- `test/product.spec.ts`: galeria (clique, hover, "N+", visualizador com teclado, placeholder)
  e buy box (quantidade, comprar agora → checkout, top-up de linha, falha não navega,
  visitante → login, fora de estoque, inativo, pouco estoque, flags).
- `test/product-page.spec.ts`: página inteira renderizada com API falsa — referência, banner
  de compra real, ausência de compras inventadas, produto simples, produto sem conteúdo, 404,
  flag desligada, metadata e preço Pix (taxa da API, arredondamento, ausência sem taxa/checkout).
- `test/login-redirect.spec.ts`: `next` seguro.
- API (integração, banco descartável): breadcrumb pela categoria mais profunda, listagem por
  subárvore, taxonomia do seed e conversão protegida do p6.
