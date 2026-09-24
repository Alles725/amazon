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
| [run-app](run-app/SKILL.md) | Subir a aplicação localmente fora de Kubernetes (o único jeito que este projeto realmente é executado) | `docker run postgres`, `pnpm --filter ... dev` | não | não |
| [db-migration](db-migration/SKILL.md) | Alterar o schema Prisma com migration e drift check | `drift:check`, `migrate:dev`, `migrate:deploy` | sim (schema + migrations) | sim — qualquer escrita em banco |
| [openapi-sync](openapi-sync/SKILL.md) | Manter `docs/openapi.json` e `api-contract` alinhados | `pnpm --filter @amazon-mvp/api openapi` | sim (`docs/openapi.json`) | não |

## Fatos do repositório que atravessam todas elas

- **Package manager:** pnpm `9.15.9`, Node ≥ 20.11. Workspaces: `apps/*`,
  `packages/*`, `database`.
- **CI:** `.github/workflows/ci.yaml`, em `push: main` e em toda PR. Jobs:
  `verify`, `manifests`, `images` — todos verificados passando de ponta a
  ponta pela primeira vez em 2026-09-06 (PR #1). **Nenhum job faz deploy.**
- **Não há prática de deploy neste projeto.** Kustomize/kind existem como
  infraestrutura documentada (o job `manifests` só renderiza os overlays), mas
  ninguém aplica isso em cluster nenhum — o único ambiente real é `main`. A
  aplicação roda localmente fora de Kubernetes (skill `run-app`).
- **Git:** apenas `main` na origem, sem hooks, sem template de PR, sem
  `CODEOWNERS`. Não existe convenção estabelecida de branch ou de mensagem de
  commit — as skills propõem e perguntam, nunca afirmam.
- **`docs/openapi.json` existe e é gerado por `nest build && node dist/openapi.js`**
  (não `tsx` direto na fonte — `tsx`/esbuild não emite os metadados de
  decorator que o `@nestjs/swagger` precisa, e quebra).
- **Ambiente Windows/Git Bash:** variáveis de ambiente parecidas com paths Unix
  (`/api/v1`, `../../../config/features.yaml`) são reescritas pelo MSYS a menos
  que `MSYS_NO_PATHCONV=1` esteja setado — ver skill `run-app`.
