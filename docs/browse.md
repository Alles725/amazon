# Listagem, busca, categorias e marcas (BROWSE-001)

`/products` é **um único template** para a listagem de todos os produtos, os resultados da
busca do cabeçalho, as páginas de categoria e as páginas de marca. Está atrás da flag
`catalog` (`config/features.yaml`, ligada). Tudo vem do catálogo real via API; nada é
inventado (sem contagens, notas ou produtos fictícios).

## Esquema de URL

A URL é a única fonte de verdade (`features/browse/browse-params.ts`):

```
/products?q=fone&category=eletronicos&brand=vortex&price=5000-10000&inStock=1&sort=price-asc&page=2
```

| Parâmetro | Significado |
|---|---|
| `q` | Texto da busca (até 100 caracteres) |
| `category` | Slug da categoria; inclui a subárvore inteira |
| `brand` | Chave da marca (`brandKey`: "Letra Viva" → `letra-viva`) |
| `price` | Faixa em centavos, `min-max` (max exclusivo) ou `min-` (sem teto) |
| `inStock` | `1` = só itens com estoque livre |
| `sort` | `relevance` (padrão), `price-asc`, `price-desc`, `newest` |
| `page` | Página (48 itens por página) |

- **Categoria** = `/products?category=<slug>` (breadcrumb do produto, "Departamento", tiles
  "Compre por categoria" da Home, seletor de departamento do cabeçalho).
- **Marca** = `/products?brand=<chave>` ("Marca: X" e "Ver todos os produtos da marca" na
  página de produto).
- Qualquer mudança de filtro volta para a página 1. Valores desconhecidos de `sort`/`price`
  são ignorados; `page` malformada mostra "Página inválida".

## API

`GET /api/v1/catalog/products` ganhou (tudo opcional, combinado com AND):

- `q` — busca **sem diferenciar maiúsculas nem acentos**. A consulta é normalizada no
  Node (NFD, sem diacríticos, minúsculas) e cada palavra precisa aparecer no **nome**, na
  **descrição** ou no **nome de uma categoria** do produto, comparando com
  `translate(lower(coluna), acentuados, sem acento) LIKE '%palavra%'`. Curingas `%`/`_`
  são escapados. Plural simples: "fones" busca "fone". Palavras de 1 letra são ignoradas
  quando há outras. Máximo de 8 palavras.
- `sort` — `relevance`: nome começando pela frase (+5), palavra no nome (+3), em categoria
  (+2), na descrição (+1); sem `q` é alfabética (o padrão antigo). `price-asc`/`price-desc`
  por `price_minor`; `newest` por `created_at`. Sempre com desempate por nome e id, então a
  paginação é estável.
- `minPriceMinor` (inclusivo) e `maxPriceMinor` (exclusivo), inteiros em centavos.
- `inStock=true|false` — `quantity - reserved > 0`, a mesma regra de `inStock` do item.

Novos endpoints públicos (`CatalogBrowseController`, via `CATALOG_API`):

- `GET /api/v1/catalog/categories` — taxonomia plana `{ slug, name, parentSlug }`.
- `GET /api/v1/catalog/facets?q&category&slugs` — contagens sobre o **escopo** da busca:
  `total`, `inStock`, `priceBuckets` (limites em `CATALOG_PRICE_BOUNDS_MINOR`), contagem por
  categoria **incluindo ancestrais** e os `slugs` dos produtos encontrados (até 1000,
  `slugsTruncated`). Refinamentos (preço, estoque) não alteram as contagens, então escolher
  uma faixa não esconde as outras.

Tipos novos no bloco "Catalog browse & search" de `packages/api-contract`. Sem migration:
filtragem, ranking e paginação são uma consulta SQL (`whereSql`/`orderSql` em
`catalog.service.ts`); os registros da página são carregados pelo Prisma e reordenados.

**Índices.** Com ~150 produtos a busca faz *seq scan* em milissegundos. Se o catálogo
crescer, o próximo passo é `pg_trgm` + índice GIN na mesma expressão
`translate(lower(name), …)` (exige migration e a extensão), ou `tsvector` com `unaccent`.

## Marca (dado de apresentação)

A marca não existe no banco: vem de `config/demo-product-content.json`
(`product-content.ts`). O storefront resolve no servidor `brand=<chave>` → nome
(`brandByKey`) → slugs (`brandSlugs`) e consulta a API com `?slugs=` (até 48). O filtro
"Marcas" é calculado a partir dos `slugs` do endpoint de facetas (`brandOfSlug`); com uma
marca escolhida é feita uma segunda consulta de facetas sem ela, para que as outras marcas
continuem selecionáveis. Não foi criada tabela de marcas.

## Página

- Barra de resultados: "1-48 de 150 resultados para “fone”" e "Classificar por"
  (navega ao escolher; sem JavaScript é um formulário GET com botão "Aplicar").
- Coluna de filtros: Departamento (caminho até a categoria atual + subcategorias com
  resultados), Marcas (8 primeiras + "Ver mais"), Preço (só faixas com produtos),
  Disponibilidade (só quando há itens com e sem estoque). Em telas < 768px a coluna fica
  atrás do botão "Filtros".
- Cards: `ProductCard` com imagem, nome, nota (quando existe no fixture), preço, "Entrega
  GRÁTIS" e estoque (`availability`: "Indisponível no momento" / "Apenas N em estoque").
- Paginação "‹ Anterior 1 2 3 4 Próximo ›" com janela e reticências.
- Estados: carregando (`Suspense` com chave por URL → esqueleto), erro da API ("Não foi
  possível carregar os produtos" + "Tentar novamente"), sem resultados ("Nenhum resultado
  para “x”" + remover filtros), página inválida/inexistente, categoria ou marca inexistente.
- Metadata: título pela busca/marca/categoria; combinações filtradas levam `noindex`.
- O cabeçalho lista as categorias raiz reais no seletor de departamento (`name="category"`),
  mantém a busca e o departamento atuais preenchidos e continua funcionando (só "Todos")
  se a API cair. `/products` entrou em `BARE_ROUTES` (layout sem a faixa do esqueleto).

## Testes

- API unitário: `catalog-search.spec.ts` (normalização, tokens, escape de LIKE).
- API integração: `test/catalog-browse.e2e-spec.ts` (busca sem acento/caixa em nome,
  descrição e categoria, relevância, ordenações, paginação estável, faixas de preço, estoque,
  categoria + slugs, curingas, facetas com ancestrais e escopo por slugs, taxonomia,
  validação 400).
- Storefront: `test/browse.spec.ts` (URL e view model), `test/browse-page.spec.ts` (página
  com API falsa: resultados, facetas, ordenação, categoria, marca, paginação, vazio, erro,
  página inválida, metadata), `test/header.spec.ts` (departamentos reais) e
  `test/product-page.spec.ts` (breadcrumb e marca com links).
