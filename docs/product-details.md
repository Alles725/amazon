# Página individual de produto

`/products/[productId]` usa um único template e aceita UUID ou slug de qualquer
registro do catálogo. A página consulta `GET /api/v1/catalog/products/:productId`
sem cache e envia o UUID retornado pela API ao carrinho existente. Não há lista
de quatro produtos autorizados, limites de paginação na consulta individual ou
persistência paralela de carrinho para mocks.

Produtos inexistentes retornam 404. Produtos inativos continuam acessíveis por
link direto (inclusive os já salvos no carrinho), com estoque disponível zero e
compra bloqueada. A listagem geral continua mostrando apenas os ativos.
O preço atual e o estoque vêm sempre do banco. UUIDs têm prioridade na resolução;
um slug com formato UUID também funciona quando não corresponde a um ID.

## Causa dos antigos links quebrados e correção

A homepage usava 20 registros locais p1–p20, enquanto o banco tinha apenas os quatro
produtos do seed original. Os links dos mocks não correspondiam a nenhum registro
consultável/comprável. A página já era genérica; faltava conectar os catálogos.

Os dados demonstrativos agora ficam em `config/demo-products.json`, compartilhado
pela homepage e pelo seed. O seed registra cada demonstração nas tabelas existentes:
UUID gerado pelo banco, slug igual ao identificador original (p1–p20), SKU explícito,
preço em centavos e estoque **demonstrativo** definido no arquivo (10 unidades por
produto atualmente). Não se atribui esse estoque a produtos reais sem inventário.

Para uma base existente, execute com DATABASE_URL carregado:

```sh
pnpm --filter @amazon-mvp/database seed:demo
```

Esse comando é idempotente e **não sobrescreve registros ou estoques existentes**.
Em uma instalação nova, o comando `seed` normal também inclui os demonstrativos.
Não há criação automática de produtos ao abrir páginas ou adicionar ao carrinho.
Para adicionar novas demonstrações, inclua os dados no arquivo e execute o seed;
produtos cadastrados diretamente no banco independem desse arquivo.

A apresentação reutiliza a imagem e o preço anterior das demonstrações apenas
quando SKU e slug correspondem, sem substituir identidade, nome, preço atual ou
estoque da API. O produto recebe a indicação “Produto de demonstração”. Os números
de avaliações do mock não são tratados como avaliações reais persistidas.

## Experimentar e fallbacks

Habilite `productDetails` e `cart` na configuração local apontada por FEATURES_FILE.
As flags compartilhadas continuam false; a cópia local já as habilita.

- Abra `/products/p1`, `/products/p12`, um UUID ou qualquer slug do catálogo.
- Produtos com foto usam a galeria; sem foto, aparece “Imagem indisponível”.
- Sem descrição: “Descrição não disponível.” Sem avaliações: “Sem avaliações”.
- Especificações mostram somente os campos disponíveis. Sem categorias, a seção
  de relacionados é omitida; sem desconto, somente o preço atual é mostrado.
- Sem inventário, sem saldo ou inativo: indisponível, sem adição ao carrinho.
- Autenticado e com estoque: escolha a quantidade e adicione. O contador, os itens,
  o subtotal e a persistência usam o fluxo existente, inclusive para demonstrações.

Header/navbar/footer e layout responsivo foram preservados. Checkout continua
indisponível, sem simular finalização de compra. A listagem `/products` não foi
implementada neste trabalho. Não há schema, migration, dependência ou alteração
da autenticação. A galeria suporta múltiplas imagens, mas cada demonstração atual
tem no máximo uma; a troca de miniaturas continua coberta por teste de componente.

## Validação

- Testes de apresentação: dados incompletos, imagem ausente, colisão de identidade,
  preço da API prioritário e ausência de desconto.
- Integração PostgreSQL: todos os 20 demonstrativos por slug/UUID e no carrinho,
  registros temporários independentes do fixture, inventário ausente, inativos,
  slug com formato UUID e seed repetido sem sobrescrever alterações.
- Navegador: 24 produtos permanentes mais três temporários (27 ao todo), os 20 links
  da homepage, 25 produtos disponíveis adicionados ao mesmo carrinho, subtotal
  exato, contador e reload. Fotos reais do projeto e placeholders conferidos;
  produtos completos/incompletos em quatro larguras sem overflow e sem novos erros.
- Contas e produtos temporários dos testes são removidos. Os 20 registros de
  demonstração permanecem no catálogo para os links da aplicação funcionarem.
