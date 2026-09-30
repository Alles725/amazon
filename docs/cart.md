# Carrinho persistente

A página `/cart` usa as tabelas existentes `carts` e `cart_items` e a sessão de
login já utilizada pelo site. Os itens nunca vêm do catálogo demonstrativo da
homepage nem são persistidos em localStorage. Não houve alteração de schema.

## Como experimentar localmente

A flag `cart` está `true` em `config/features.yaml` (FLAGS-001), junto com
`productDetails` e `checkout`; basta subir a aplicação com o `.env` padrão.

1. Abra `http://localhost:3000/cart` e entre em sua conta se necessário.
2. Em “Explore nossos produtos”, adicione produtos do banco.
3. Use os botões −/+ ou o seletor de quantidade. O subtotal e o contador refletem
   a resposta da API, somando unidades, não apenas produtos distintos.
4. Recarregue, navegue para a homepage e volte: o carrinho permanece na conta.
5. Use “Excluir” ou “Esvaziar carrinho”; remover o último item mostra o estado vazio.

O seed inclui os quatro produtos originais e as 20 demonstrações da homepage.
Estas usam seus próprios arquivos de imagem; os demais mostram “Imagem
indisponível” quando não há foto. Todos usam UUIDs persistidos no mesmo carrinho.
Para uma base anterior, execute `pnpm --filter @amazon-mvp/database seed:demo`
com DATABASE_URL carregado; o comando preserva os registros existentes.
A homepage mantém seus dados demonstrativos e links anteriores. Produtos reais
podem ser adicionados no próprio carrinho e na página individual, quando
`productDetails` estiver habilitada; veja [product-details.md](product-details.md).
A listagem geral ainda é um placeholder. Não existe histórico de navegação nem
recomendação pessoal.
Checkout permanece desativado; o resumo informa que ainda não é possível finalizar.

## API

| Método | Rota | Comportamento |
| --- | --- | --- |
| GET | /api/v1/catalog/products | Produtos ativos do banco; público, paginado |
| GET | /api/v1/cart | Carrinho da sessão atual, sem cache HTTP |
| POST | /api/v1/cart/items | Soma `quantity` ao `productId` informado |
| PATCH | /api/v1/cart/items/:productId | Define a quantidade |
| DELETE | /api/v1/cart/items/:productId | Remove um produto |
| DELETE | /api/v1/cart/items | Esvazia o carrinho |

Todas as operações de carrinho exigem autenticação. A identidade vem da sessão;
`userId`, preços e totais não são aceitos no corpo. Quantidades devem ser inteiros
entre 1 e 99 e respeitar o estoque disponível; limite de 100 produtos distintos.
Não há reserva de estoque: disponibilidade e preço podem mudar antes do checkout.
Preços e cálculos usam centavos inteiros; a divisão por 100 só formata a exibição.

O módulo de carrinho lê apenas suas próprias tabelas e consulta produtos pela
interface `CATALOG_API`. Um lock transacional por conta impede carrinhos ativos
duplicados e incrementos perdidos. Consultas ao catálogo ficam fora da transação
do carrinho para não consumir outra conexão enquanto o lock está retido. Se itens
novos entram durante a leitura do catálogo, a operação refaz a consulta antes de
validar moeda/quantidade. Não há alteração das tabelas de autenticação.

O provider do frontend recebe respostas autoritativas, ignora leituras antigas,
limpa o estado ao trocar de conta/expirar sessão e revalida ao focar a janela.
BroadcastChannel invalida outras abas; nenhuma informação de produto/sessão é
transmitida pelo canal. Erros de leitura têm estado próprio, distinto de vazio.

## Validação

- `pnpm --filter @amazon-mvp/storefront test`: testes persistentes do provider,
  incluindo corrida leitura/escrita, falhas, sessão e troca de conta.
- `pnpm --filter @amazon-mvp/api test:integration`: autenticação e carrinho real
  sobre PostgreSQL; testes de carrinho criam e removem seus próprios registros.
  Use um banco separado com as migrations aplicadas, nunca resete o banco de uso.
- `pnpm -r --if-present lint`, `typecheck`, `test` e `build`.
- `pnpm --filter @amazon-mvp/api openapi`: atualiza `docs/openapi.json`.
- Navegador: adicionar, abrir, alterar quantidade, excluir, esvaziar, recarregar,
  conferir contador na homepage, testar duas abas, sessão expirada e falhas da API.
- Responsividade verificada em 320, 390, 600, 768, 1024, 1440 e 1920 px.

## Checkout — 2026-09-26

O resumo do carrinho habilita seu link existente quando a flag checkout estiver
ativa. A finalização usa o mesmo carrinho persistido, converte-o e remove seus
itens apenas na transação bem-sucedida do pedido. O provider é atualizado depois
do sucesso. Regras de estoque, revisão e repetição: [checkout.md](checkout.md).
