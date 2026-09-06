# Skills do projeto

Skills do Claude Code para as tarefas recorrentes deste repositório. Todas foram
escritas a partir dos arquivos reais do projeto — `Makefile`, `package.json` de
cada workspace, `.github/workflows/ci.yaml`, `infrastructure/kubernetes/` e
`docs/ai/`. Nenhuma inventa comando, ambiente ou procedimento.

| Skill | Objetivo | Comandos principais | Altera arquivos | Confirmação |
|---|---|---|---|---|
| [check](check/SKILL.md) | Validar o repositório espelhando o job `verify` do CI | `pnpm -r --if-present lint/typecheck/test/build`, `drift:check`, `kustomize build` | não | só nas etapas que escrevem no banco |
| [review-pr](review-pr/SKILL.md) | Revisão técnica do diff contra as regras do projeto | `git diff`, leitura | não (somente leitura) | não |
| [create-pr](create-pr/SKILL.md) | Preparar commit, título e descrição de PR | `git status/diff/branch`, `gh pr create` | só o commit, após OK | sim — commit, push e PR são confirmados separadamente |
| [deploy](deploy/SKILL.md) | Procedimento real de deploy (Kustomize + kind, manual) | `make manifests/images/deploy/migrate/seed/smoke` | não | sim — sempre, e explicitamente para `development`/`production` |
| [db-migration](db-migration/SKILL.md) | Alterar o schema Prisma com migration e drift check | `drift:check`, `migrate:dev`, `migrate:deploy`, `make migrate` | sim (schema + migrations) | sim — qualquer escrita em banco |
| [openapi-sync](openapi-sync/SKILL.md) | Manter `docs/openapi.json` e `api-contract` alinhados | `pnpm --filter @amazon-mvp/api openapi` | sim (`docs/openapi.json`) | não |

## Fatos do repositório que atravessam todas elas

- **Package manager:** pnpm `9.15.9`, Node ≥ 20.11. Workspaces: `apps/*`,
  `packages/*`, `database`.
- **CI:** `.github/workflows/ci.yaml`, em `push: main` e em toda PR. Jobs:
  `verify`, `manifests`, `images`. **Nenhum job faz deploy.**
- **Deploy:** manual, pelos targets do `Makefile` (`kustomize build | kubectl apply`).
  Ambientes = overlays `local`, `development`, `production`. Nada nunca foi
  deployado (`docs/ai/current-state.md`).
- **Git:** apenas `main`, um commit, sem hooks, sem template de PR, sem
  `CODEOWNERS`. Não existe convenção estabelecida de branch ou de mensagem de
  commit — as skills propõem e perguntam, nunca afirmam.
- **Pendências conhecidas:** a migration inicial foi escrita à mão e nunca
  aplicada; `docs/openapi.json` não existe; testes unitários da API são
  transpile-only, então erro de tipo só aparece no `typecheck`.
- **Ambiente Windows:** o `Makefile` exige GNU Make + `/bin/bash`. Cada skill traz
  o equivalente `pnpm` dos targets que usa.
