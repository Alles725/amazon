---
name: check
description: Valida se o repositório está pronto para commit/PR executando a mesma sequência do CI (install, prisma generate, build de packages compartilhados, lint, typecheck, testes, build, manifests). Use antes de commitar, antes de abrir PR, ou quando o usuário pedir "verificar", "validar", "rodar os checks", "está tudo passando?".
allowed-tools: Read, Grep, Glob, Bash, PowerShell
---

# check — validação pré-commit/PR

Reproduz localmente o job `verify` de [.github/workflows/ci.yaml](../../../.github/workflows/ci.yaml).
Objetivo: descobrir o que quebraria no CI **antes** de abrir a PR.

Esta skill **não corrige código**. Ela executa, coleta e reporta. Só corrija se o
usuário pedir explicitamente.

## 0. Preflight — verificar o toolchain

Este repositório exige Node ≥ 20.11 e pnpm 9 (`packageManager: pnpm@9.15.9`).

```bash
node --version
pnpm --version
```

Se `node`/`pnpm` não existirem no PATH, **pare e informe o usuário**. Nunca
reporte um check como "passou" sem tê-lo executado — diga claramente
"não executado: ferramenta ausente".

Notas de ambiente:
- O `Makefile` usa `SHELL := /bin/bash` e sintaxe GNU Make. Em Windows/PowerShell
  ele só roda via Git Bash + GNU Make instalados. Sem isso, use os equivalentes
  `pnpm` listados abaixo — são exatamente os mesmos comandos que os targets executam.
- Nunca invente um resultado a partir da leitura do código.

## 1. Sequência obrigatória (não precisa de banco)

Rode nesta ordem. A ordem importa: o cliente Prisma precisa existir antes de
qualquer typecheck/build da API, e os packages compartilhados precisam de `dist/`
antes dos consumidores.

| # | Etapa | Comando | Equivalente `make` |
|---|---|---|---|
| 1 | Install | `pnpm install --frozen-lockfile` | `make bootstrap` (faz 1–3) |
| 2 | Prisma client | `pnpm --filter @amazon-mvp/database generate` | idem |
| 3 | Packages compartilhados | `pnpm --filter @amazon-mvp/api-contract build && pnpm --filter @amazon-mvp/config-schema build && pnpm --filter @amazon-mvp/database build` | idem |
| 4 | Lint | `pnpm -r --if-present lint` | `make lint` |
| 5 | Typecheck | `pnpm -r --if-present typecheck` | `make typecheck` |
| 6 | Testes unitários | `pnpm -r --if-present test` | `make test` |
| 7 | Build | `pnpm -r --if-present build` | `make build` |

O que cada etapa realmente cobre:

- **Lint** — só `apps/api` (ESLint, `--max-warnings 0`) e `apps/storefront`
  (`next lint --max-warnings 0`). `database`, `api-contract` e `config-schema`
  **não têm** script `lint`; `--if-present` os pula silenciosamente. Não reporte
  isso como falha.
- **Testes unitários** — `apps/api` usa Jest (`--passWithNoTests`),
  `apps/storefront` e `packages/config-schema` usam `vitest run`.
- **Armadilha conhecida:** os testes unitários da API rodam em modo
  transpile-only (`isolatedModules`), então **erros de tipo na API não aparecem
  em `test`, apenas em `typecheck`**. Nunca conclua que a API está sã só porque
  os testes passaram (documentado em [docs/ai/current-state.md](../../../docs/ai/current-state.md)).

## 2. Etapas que dependem de PostgreSQL

**Peça confirmação antes de rodar qualquer uma destas** — elas escrevem em um
banco real.

Pré-requisito: `DATABASE_URL` apontando para um PostgreSQL alcançável
(ver [.env.example](../../../.env.example)). Se não houver banco, pule e reporte
explicitamente como "não executado".

```bash
# aplica as migrations comprometidas
pnpm --filter @amazon-mvp/database migrate:deploy

# migrations x schema.prisma divergem? (é o que o CI faz)
pnpm --filter @amazon-mvp/database exec prisma migrate diff \
  --from-migrations prisma/migrations \
  --to-schema-datamodel prisma/schema.prisma \
  --shadow-database-url "$DATABASE_URL" --exit-code

# suíte de integração da API (13 casos, apps/api/test/*.e2e-spec.ts)
pnpm --filter @amazon-mvp/api test:integration
```

Atenção ao shadow database: o script `drift:check` do package usa
`$SHADOW_DATABASE_URL`, enquanto o CI passa o próprio `$DATABASE_URL`. O banco
usado como shadow é reescrito pelo Prisma — **aponte para um banco descartável**,
nunca para um que contenha dados que importem.

## 3. Freshness do contrato OpenAPI

Regra do projeto: mudança de contrato da API exige `docs/openapi.json`
regenerado **no mesmo commit**. O CI verifica isso.

```bash
pnpm --filter @amazon-mvp/api openapi   # escreve docs/openapi.json
git diff --exit-code docs/openapi.json
```

Estado atual conhecido: **`docs/openapi.json` ainda não existe** no repositório
(o gerador precisa que a API suba, o que exige o cliente Prisma). Se o arquivo
continuar ausente, reporte como pendência aberta — não é uma falha introduzida
pela alteração atual. Para o fluxo completo, use a skill `openapi-sync`.

## 4. Manifests Kubernetes

Espelha o job `manifests` do CI. Requer `kustomize`.

```bash
for overlay in local development production; do
  kustomize build --load-restrictor LoadRestrictionsNone \
    "infrastructure/kubernetes/overlays/$overlay" > /dev/null
done
```

O `--load-restrictor LoadRestrictionsNone` é obrigatório: a base lê
`config/features.yaml`, que fica acima da raiz da kustomization
([ADR 0006](../../../docs/adr/0006-kustomize.md)).

Equivalente para um overlay só: `make manifests OVERLAY=<local|development|production>`.

## 5. Imagens (opcional, lento)

Só rode se o usuário pedir ou se o diff tocar Dockerfiles, `pnpm-lock.yaml` ou
dependências:

```bash
docker build -f apps/api/Dockerfile -t amazon-mvp/api:ci .
docker build -f apps/storefront/Dockerfile -t amazon-mvp/storefront:ci .
```

## 6. Relatório

Termine sempre com uma tabela do estado real:

| Etapa | Resultado | Detalhe |
|---|---|---|
| lint | ✅ / ❌ / ⏭️ não executado | pacote + primeira falha |

Regras do relatório:
- `⏭️` para tudo que não rodou, com o motivo (ferramenta ausente, sem banco, pulado pelo usuário).
- Para cada falha, cite `arquivo:linha` e a mensagem original — não parafraseie.
- Separe **falhas introduzidas pelo diff atual** de **pendências pré-existentes**
  já documentadas em [docs/ai/current-state.md](../../../docs/ai/current-state.md)
  (migration nunca aplicada, `docs/openapi.json` inexistente, nada deployado).
- Conclua com uma frase direta: pronto para PR, ou o que falta.
