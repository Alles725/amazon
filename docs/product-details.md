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
| Imagem principal de cards, preço anterior, nota/quantidade de avaliações | `config/demo-products.json` (o mesmo usado pela Home e pelo seed) |
| "Da marca" | `config/demo-brands.json`; só aparece para marcas cadastradas |
| Avaliações individuais e mídia de clientes | `features/product/reviews/product-reviews.ts` ← `config/demo-reviews.json` |
| "Você comprou este produto…" | Pedidos reais do usuário (`fetchOrders()`, mesma fonte de "Seus pedidos") |
| "Enviar para …" | Primeiro endereço salvo do usuário (`GET /addresses`, mesma ordem do checkout) |
| Relacionados | Produtos ativos da mesma categoria, ampliando um nível do breadcrumb por vez |
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

- **Prime**: não existe assinatura no projeto. O alerta "Sua assinatura Prime está pausada"
  é apenas visual e aparece só para usuários logados; o quadro "prime" do buy box também.
- **Pix 5% off à vista**: não é exibido. O checkout não tem motor de promoções
  (`discountMinor = 0`), então anunciar um valor diferente do cobrado seria falso.
  Parcelas "sem juros" são exibidas porque não alteram o total.
- **Data de entrega**: não há estimativa de prazo; mostramos só "Entrega GRÁTIS" (o checkout
  não cobra frete).
- **Avaliações**: não há backend. Os textos do 8BitDo são de demonstração, com autores
  fictícios, compartilhados entre as variações. Demais produtos mostram só a nota agregada
  que já existia na Home, sem avaliações escritas. "Útil" apenas agradece localmente;
  "Escreva uma avaliação"/"Incluir avaliação" levam a `/products/<slug>/review`, atrás da
  flag `productReviews` (Coming Soon). Nenhuma foto/vídeo de cliente foi copiada; a seção
  "Fotos e vídeos de clientes" só aparece quando houver mídia.
- **Breadcrumb e marca**: não existe página de listagem por categoria ou marca (a rota
  `/products` ainda é placeholder), então os níveis são texto; `ProductBreadcrumb` aceita
  `hrefFor` para quando existir. "Marca" leva à seção "Da marca" quando há conteúdo.

## Dados e seed

Migration `20260930000000_category_hierarchy` adiciona `categories.parent_id` (FK para a
própria tabela, `ON DELETE SET NULL`, indexada). A API passa a devolver `categoryPath` e o
filtro `?category=` inclui a subárvore inteira.

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
  flag desligada e metadata.
- `test/login-redirect.spec.ts`: `next` seguro.
- API (integração, banco descartável): breadcrumb pela categoria mais profunda, listagem por
  subárvore, taxonomia do seed e conversão protegida do p6.
