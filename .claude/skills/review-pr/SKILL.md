---
name: review-pr
description: Revisão técnica somente-leitura das alterações atuais antes de abrir uma Pull Request — bugs, segurança, arquitetura modular, testes, performance e as regras não-negociáveis deste repositório. Use quando o usuário pedir "revisar", "review", "olha meu diff", ou antes de criar uma PR.
allowed-tools: Read, Grep, Glob, Bash(git *)
---

# review-pr — revisão técnica do diff

Revisão **somente leitura**. Não edite arquivos, não rode testes, não commite.
Se algo precisar ser corrigido, aponte o local e o que fazer — a correção é uma
ação separada, pedida pelo usuário.

## 1. Delimitar o escopo

```bash
git status --short
git branch --show-current
git diff main...HEAD --stat     # se estiver numa branch
git diff --stat                 # alterações não commitadas
git diff main...HEAD            # o conteúdo
```

O repositório tem hoje apenas `main` e um commit. Se não houver base de
comparação, revise o working tree (`git diff` + `git diff --cached` + untracked
relevantes) e diga qual escopo você usou.

Leia os arquivos alterados por inteiro, não só o hunk — as regras abaixo
dependem do contexto do módulo.

## 2. Regras não-negociáveis do projeto

Fonte: [docs/ai/project-context.md](../../../docs/ai/project-context.md) e a
seção "Working agreements" do [README.md](../../../README.md). Violação aqui é
sempre **blocker**.

1. **Fronteira de módulos.** Um módulo nunca acessa tabelas ou repositórios de
   outro. Chamadas cruzadas passam por interface de aplicação: `USERS_API`,
   `SESSIONS_API`, `CATALOG_API`, `CART_API`, `ORDERS_API`.
   → Procure em `apps/api/src/modules/*` por uso de `PrismaService` sobre
   tabelas de outro módulo. Dono de cada tabela em
   [docs/architecture/overview.md](../../../docs/architecture/overview.md).
2. **Storefront nunca importa de `apps/api`.** Só `@amazon-mvp/api-contract` e o
   documento OpenAPI. → `grep -rn "apps/api" apps/storefront/src`.
3. **Dinheiro é inteiro em unidade menor.** Nenhum `float`/`number` decimal,
   nenhum `parseFloat`, nenhuma multiplicação por `100` improvisada.
4. **`order_items` faz snapshot** dos dados do produto e não tem FK para
   `products` — pedidos históricos não podem mudar.
5. **Config validada no startup** (Zod, `packages/config-schema`). Config nova
   precisa entrar no schema, senão falha só em runtime.
6. **Nenhum segredo no repositório.** As únicas credenciais permitidas estão no
   overlay `local`. Qualquer chave/senha/token em outro lugar é blocker.
7. **Feature nova entra com `enabled: false`** em
   [config/features.yaml](../../../config/features.yaml), e é ligada por config.
8. **Mudança de schema exige migration**; mudança de contrato exige
   `docs/openapi.json` regenerado **no mesmo commit**.

Regra adicional imposta por teste: nada fora de `apps/storefront/src/config` lê
`features.yaml`.

## 3. Eixos de revisão

### Bugs e correção
- Caminhos de erro e valores nulos; `async` sem `await`; promises não tratadas.
- Toda resposta de erro deve manter o formato único
  `{ error: { code, message, requestId } }` — veja `apps/api/src/common/`
  (`api-error.ts`, `http-exception.filter.ts`).
- `requestId` vem do middleware de request-id; não invente outro canal.

### Segurança
- **Autenticação:** senhas com Argon2id (`password.service.ts`); sessões são
  tokens opacos de 256 bits, e o banco guarda apenas o **SHA-256** do token
  (`session-token.ts`, `session.service.ts`). Nada de token em claro persistido
  ou logado.
- **Paridade de erro:** login com senha errada e e-mail inexistente devem
  responder igual (há teste cobrindo isso). Qualquer diferenciação vira
  enumeração de usuários.
- **Cookie:** `HttpOnly`, `SameSite=Lax`, `Secure` — `Secure` só é `false` no
  overlay `local`.
- **Guard global:** `SessionGuard` é registrado como `APP_GUARD`; rotas são
  protegidas por padrão e abrem com `@Public()`. Revise **todo** `@Public()`
  novo — é aí que se abre um buraco.
- Validação de entrada via `class-validator` nos DTOs; sem validação, marque.
- Segredo, credencial ou URL interna em log, código ou manifesto → blocker.
- Dados sensíveis em log estruturado (`structured-logger.ts`): e-mail, senha,
  token de sessão não devem aparecer.

### Arquitetura
- O módulo novo respeita a fronteira (item 2 acima)?
- Dependência aponta para interface (`*_API`) ou para classe concreta?
- `PrismaService` continua sendo o único detentor de conexão com o banco?
- Tipo compartilhado entre front e back foi para `packages/api-contract`?

### Testes
- `apps/api`: unitários em `src/**/*.spec.ts` (Jest); integração em
  `apps/api/test/*.e2e-spec.ts` (Jest, precisa de PostgreSQL).
- `apps/storefront` e `packages/config-schema`: Vitest.
- Lembre: os unitários da API são transpile-only (`isolatedModules`) — erro de
  tipo só aparece no `typecheck`. Teste verde não é evidência de tipagem sã.
- Comportamento novo sem teste no runner correspondente → aponte.

### Performance
- Query em loop (N+1) sobre `PrismaService`; falta de `select`/`include` que
  puxa tabela inteira.
- Falta de índice para um novo padrão de busca em `database/prisma/schema.prisma`.
- No storefront (App Router): trabalho pesado em client component que deveria
  ser server component; `server-only` onde couber.

### Infraestrutura (se o diff tocar `infrastructure/`)
- `namespace:` precisa estar declarado **em todo overlay** que gera recursos —
  sem isso, Secret gerado fica sem namespace e os consumidores apontam para o
  nome não-hasheado (defeito real já corrigido uma vez; ver
  [ADR 0006](../../../docs/adr/0006-kustomize.md)).
- Overlay novo/alterado ainda renderiza? (`kustomize build --load-restrictor LoadRestrictionsNone`)
- Nenhum segredo em `development`/`production` — eles vêm de fora do repositório.

## 4. Formato do resultado

Agrupe por severidade, mais grave primeiro:

- **Blocker** — quebra o CI, viola regra não-negociável, ou é falha de segurança.
- **Importante** — bug provável, dívida arquitetural, teste faltando.
- **Sugestão** — legibilidade, simplificação.

Para cada achado: `arquivo:linha`, o que está errado, por que importa e a
correção proposta. Sem achado inventado para preencher lista — se o diff está
bom, diga que está bom.

Termine com: o que ainda falta rodar (aponte a skill `check`) e se o diff está
pronto para PR.
