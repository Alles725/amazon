---
name: db-migration
description: Fluxo de alteração do schema Prisma neste repositório — criar a migration, verificar drift entre migrations e schema.prisma, aplicar localmente e no cluster via Job db-migrate. Use quando o usuário for alterar database/prisma/schema.prisma, criar tabela/coluna/índice, ou pedir "migration", "migrar o banco", "alterar o schema".
allowed-tools: Read, Grep, Glob, Bash, PowerShell
---

# db-migration — alterações de schema e migrations

Regra do projeto (não-negociável): **toda mudança de schema exige uma migration
no mesmo commit**. O CI falha sem isso.

## Aviso que precede tudo

A migration inicial `database/prisma/migrations/20260101000000_init/migration.sql`
foi **escrita à mão** — o `prisma migrate dev` nunca conseguiu rodar no ambiente
de autoria — e **nunca foi aplicada em nenhum banco**
([current-state.md](../../../docs/ai/current-state.md),
[development-log.md](../../../docs/ai/development-log.md)).

> Divergência entre esse SQL e `schema.prisma` é a causa mais provável de falha
> no primeiro run.

Portanto: **antes de qualquer coisa**, rode o drift check.

```bash
pnpm --filter @amazon-mvp/database drift:check
```

Se ele acusar divergência, resolva isso **antes** de criar uma migration nova —
empilhar mudança sobre uma base divergente piora o problema. Traga o resultado ao
usuário e decida com ele.

## Pré-requisitos

- Node 20.11+, pnpm 9.
- Um PostgreSQL alcançável em `DATABASE_URL` (ver [.env.example](../../../.env.example)).
  Fora do cluster, o README sugere:
  ```bash
  docker run -d --name mvp-pg -p 5432:5432 \
    -e POSTGRES_USER=amazon_mvp -e POSTGRES_PASSWORD=local-dev-password \
    -e POSTGRES_DB=amazon_mvp postgres:16-alpine
  ```
- Cliente Prisma gerado: `pnpm --filter @amazon-mvp/database generate`.

**Shadow database:** o script `drift:check` usa `$SHADOW_DATABASE_URL`; o CI
passa o próprio `$DATABASE_URL` como shadow. O Prisma **reescreve** o banco usado
como shadow — aponte sempre para um banco descartável. Nunca use um banco com
dados que importem, e nunca um banco de ambiente compartilhado.

## Scripts reais (`database/package.json`)

| Script | Comando | Quando |
|---|---|---|
| `generate` | `prisma generate` | depois de qualquer edição no schema |
| `migrate:dev` | `prisma migrate dev` | criar migration em desenvolvimento |
| `migrate:deploy` | `prisma migrate deploy` | aplicar migrations comprometidas |
| `migrate:status` | `prisma migrate status` | ver o que falta aplicar |
| `drift:check` | `prisma migrate diff --from-migrations … --exit-code` | validar migrations x schema |
| `seed` | `tsx seeds/seed.ts` | popular categorias e produtos |

## Fluxo

1. **Drift check** (acima). Estado limpo antes de começar.
2. **Editar** `database/prisma/schema.prisma`. Regras do projeto que incidem aqui:
   - dinheiro é **inteiro em unidade menor**, nunca ponto flutuante;
   - `order_items` guarda snapshot do produto e **não tem FK** para `products`;
   - cada tabela pertence a um módulo — a tabela nova precisa ter dono claro
     (mapa em [docs/architecture/overview.md](../../../docs/architecture/overview.md));
   - índice para todo novo padrão de busca.
3. **Gerar a migration** (escreve no banco — confirme com o usuário):
   ```bash
   pnpm --filter @amazon-mvp/database migrate:dev --name <nome_descritivo>
   ```
4. **Regenerar o cliente**: `pnpm --filter @amazon-mvp/database generate`.
5. **Confirmar que não há drift**: `drift:check` de novo — deve sair limpo.
6. **Rebuild + testes**:
   ```bash
   pnpm --filter @amazon-mvp/database build
   pnpm -r --if-present typecheck
   pnpm -r --if-present test
   pnpm --filter @amazon-mvp/api test:integration   # precisa do banco migrado
   ```
7. **Commitar** o `schema.prisma` **e** o diretório novo em
   `database/prisma/migrations/` juntos. Nunca separe.

## Aplicar no cluster

O Job `db-migrate` roda `node_modules/.bin/prisma migrate deploy` — nunca
`migrate dev`, nunca reset ([migration-job.yaml](../../../infrastructure/kubernetes/base/migration-job.yaml)).

```bash
make migrate    # deleta o Job (Jobs são imutáveis), reaplica, espera e mostra os logs
```

O Job lê `DATABASE_URL` do Secret `api-secret`. Ele usa a imagem
`amazon-mvp/api:<tag do overlay>` — ou seja, a **imagem precisa conter a migration
nova**: rode `make images` antes de `make migrate`. Confirmação explícita do
usuário é obrigatória antes de migrar qualquer ambiente (ver skill `deploy`).

## O que o CI verifica

Em `verify` ([ci.yaml](../../../.github/workflows/ci.yaml)), contra um Postgres
16 de serviço:

```bash
pnpm --filter @amazon-mvp/database migrate:deploy
pnpm --filter @amazon-mvp/database exec prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "$DATABASE_URL" --exit-code
pnpm --filter @amazon-mvp/api test:integration
```

O comentário no workflow diz o objetivo em uma linha: *"Catches a schema edited
without a matching migration."*

## Ao final

Se a alteração mudar o contrato da API (novo campo exposto, DTO alterado),
continue com a skill `openapi-sync` — o `docs/openapi.json` precisa entrar no
mesmo commit. E atualize `docs/ai/` conforme a skill `create-pr`.
