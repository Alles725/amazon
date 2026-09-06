---
name: openapi-sync
description: Regenera e valida docs/openapi.json e mantém packages/api-contract alinhado com a API — a fronteira contratual entre backend e storefront, verificada pelo CI. Use quando o diff tocar controllers, DTOs ou rotas da API, quando o CI reclamar do OpenAPI, ou quando o usuário pedir "atualizar o contrato/openapi".
allowed-tools: Read, Grep, Glob, Bash, PowerShell
---

# openapi-sync — contrato da API

Regra do projeto: **mudança de contrato da API exige `docs/openapi.json`
regenerado no mesmo commit**
([README](../../../README.md), [project-context.md](../../../docs/ai/project-context.md)).
O CI verifica isso com `git diff --exit-code docs/openapi.json`.

O storefront **nunca** importa de `apps/api`; ele depende de
`@amazon-mvp/api-contract` e do documento OpenAPI. Esse é o único canal entre as
duas aplicações — por isso o contrato tem que estar sempre correto.

## Estado atual conhecido

**`docs/openapi.json` ainda não existe no repositório.** O gerador precisa que a
API suba, o que exige o cliente Prisma, que nunca pôde ser gerado no ambiente de
autoria (`PLAT-008`, `blocked`, em [backlog.yaml](../../../docs/ai/backlog.yaml)).
Gerar e commitar esse arquivo uma primeira vez é uma pendência aberta.

## Como gerar

```bash
pnpm --filter @amazon-mvp/database generate   # cliente Prisma, senão a API não sobe
pnpm --filter @amazon-mvp/api openapi         # === make openapi
git diff --exit-code docs/openapi.json        # o que o CI faz
```

O gerador é [apps/api/src/openapi.ts](../../../apps/api/src/openapi.ts): ele
instancia a app via `bootstrap.ts`, chama `buildOpenApiDocument` e escreve
`docs/openapi.json` (JSON com 2 espaços e newline final). Ou seja, **subir a
aplicação é pré-requisito** — config inválida ou cliente Prisma ausente fazem o
comando falhar antes de escrever qualquer coisa.

Se falhar, leia o stack trace: normalmente é (a) cliente Prisma não gerado,
(b) config obrigatória ausente — a validação Zod de `packages/config-schema`
falha rápido no startup, por design.

## Quando o contrato muda, verifique também

1. **`packages/api-contract`** — códigos de erro, tipos de DTO e constantes de
   rota vivem aqui ([src/index.ts](../../../packages/api-contract/src/index.ts)).
   Tipo novo consumido pelo storefront entra aqui, não em `apps/api`.
   ```bash
   pnpm --filter @amazon-mvp/api-contract build
   ```
2. **Formato de erro** — toda resposta de erro mantém a mesma forma:
   ```json
   { "error": { "code": "AUTH_INVALID_CREDENTIALS", "message": "Invalid credentials", "requestId": "…" } }
   ```
   Código de erro novo precisa estar em `api-contract`.
3. **Storefront** — nenhum import de `apps/api`:
   ```bash
   grep -rn "apps/api" apps/storefront/src
   ```
4. **`OPENAPI_ENABLED`** — a UI interativa (`/api/docs`) fica ligada em `local` e
   `development` e **desligada em `production`**
   (`overlays/production/production-patch.yaml`). Gerar o arquivo é independente
   disso; não mexa nesse flag para "resolver" o gerador.

## Commit

`docs/openapi.json` vai **no mesmo commit** que a mudança da API, junto com
qualquer alteração em `packages/api-contract`. Nunca em commit separado — o
comentário do próprio workflow explica por quê: *"The contract is the Dev1 -> Dev2
boundary: it must ship with the change."*
