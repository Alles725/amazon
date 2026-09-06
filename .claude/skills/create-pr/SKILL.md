---
name: create-pr
description: Prepara uma Pull Request neste repositório — confere branch e diff, roda as validações, checa os artefatos obrigatórios (migration, openapi, docs/ai), e propõe mensagem de commit, título e descrição. Nunca commita, faz push ou abre PR sem confirmação explícita. Use quando o usuário pedir "abrir PR", "preparar PR", "criar pull request".
allowed-tools: Read, Grep, Glob, Bash, PowerShell
---

# create-pr — preparação de Pull Request

## Regra de segurança (inegociável)

Nesta skill você **nunca** executa por conta própria:

- `git commit`
- `git push`
- `gh pr create` (ou qualquer criação de PR)

Cada um desses passos exige uma confirmação explícita do usuário, **imediatamente
antes** e para **aquele comando específico**. Aprovar o commit não aprova o push;
aprovar o push não aprova a abertura da PR. Sem resposta clara, pare e entregue
os comandos prontos para o usuário rodar.

## 1. Estado atual do repositório

```bash
git status --short
git branch --show-current
git log --oneline -10
git diff --stat
git diff main...HEAD --stat
```

Fatos que você vai encontrar (não os trate como erro):
- só existe a branch `main` e um único commit, `Initial commit: Amazon MVP skeleton`;
- não há git hooks instalados (só os `.sample`);
- não há template de PR nem `CODEOWNERS` em `.github/` — lá só existe `workflows/ci.yaml`.

**Consequência importante: este repositório não tem convenção estabelecida de
nome de branch, de mensagem de commit ou de descrição de PR.** Não afirme que
tem. Proponha, explique de onde veio a proposta, e deixe o usuário decidir.

Se `git branch --show-current` retornar `main`, trate isso como bloqueio
imediato — vá para a seção 2 antes de qualquer outro passo.

## 2. Branch (regra obrigatória)

**Nunca commite diretamente em `main`.** Se `git branch --show-current` disser
`main`, **pare antes do commit** e crie/troque para uma branch nova — não é
opcional e não depende de o diff parecer pequeno. `main` é sempre a base, nunca
o destino de um commit desta skill.

```bash
git checkout -b <nome-da-branch>
```

Criar a branch é uma ação segura (não reescreve nada, não precisa da mesma
confirmação exigida para commit/push/PR), mas confirme o **nome** com o usuário
antes de criar.

Base para a proposta de nome: o backlog usa IDs de história reais —
`BE-001`, `UI-004`, `PLAT-007`, `FIRSTRUN-001` (ver
[docs/ai/backlog.yaml](../../../docs/ai/backlog.yaml)). Se a alteração
corresponde a uma história, proponha algo como `BE-002-prisma-migrations` e
diga que é uma sugestão derivada dos IDs do backlog, não uma regra existente.

**A PR final sempre aponta para `main` como base** (`--base main` no `gh pr
create`, seção 8). `main` nunca é o head de uma PR criada por esta skill.

## 3. Validar antes de propor qualquer coisa

Rode a skill `check` (ou a mesma sequência do job `verify` do CI). Não proponha
mensagem de commit nem descrição de PR antes de saber o que passa e o que falha.

Se algo falhar, reporte e pergunte se o usuário quer corrigir antes de seguir.
Não esconda falha para "não travar o fluxo".

Depois, rode a skill `review-pr` sobre o diff e traga os achados.

## 4. Checklist de artefatos obrigatórios

Derivado das regras do projeto e do que o CI verifica. Confira cada item **contra
o diff real**:

| Se o diff tocou… | Então precisa ter, no mesmo commit |
|---|---|
| `database/prisma/schema.prisma` | uma migration em `database/prisma/migrations/` (skill `db-migration`) |
| contrato/rotas/DTOs da API | `docs/openapi.json` regenerado (skill `openapi-sync`) — o CI roda `git diff --exit-code docs/openapi.json` |
| tipos usados por front e back | atualização em `packages/api-contract` |
| uma feature nova | entrada em `config/features.yaml` com `enabled: false` |
| config nova | schema Zod em `packages/config-schema` |
| `infrastructure/` | os 3 overlays ainda renderizam (`kustomize build`) |

Documentação viva (convenção declarada nos próprios arquivos, em `docs/ai/`):
- [development-log.md](../../../docs/ai/development-log.md) — "Append one entry
  per completed story. Newest last." Uma entrada por história concluída.
- [current-state.md](../../../docs/ai/current-state.md) — só descreve o que foi
  **executado com sucesso**; algo escrito mas nunca rodado entra como parcial,
  com o motivo.
- [backlog.yaml](../../../docs/ai/backlog.yaml) — `done` significa implementado
  **e** executado ao menos uma vez.
- [agent-handoff.md](../../../docs/ai/agent-handoff.md) — objetivo atual e problemas abertos.

Se o usuário mudar uma decisão arquitetural, um ADR novo (ou supersedido) em
`docs/adr/` precisa acompanhar.

## 5. Mensagem de commit

Não há convenção formal. O único commit existente é
`Initial commit: Amazon MVP skeleton` — imperativo curto, sem prefixo tipo
Conventional Commits. Proponha no mesmo espírito e **pergunte** se o usuário
prefere Conventional Commits; se preferir, use e registre a escolha.

Formato sugerido (apresente como sugestão):

```
<resumo imperativo em uma linha, ~72 caracteres>

<o quê e por quê, não o como>
- ponto relevante
- artefato obrigatório incluído (migration / openapi.json / features.yaml)

Refs: <ID do backlog, se houver>
```

Mostre a mensagem, espere o OK, **só então** ofereça rodar o commit.

## 6. Título e descrição da PR

Não existe template no repositório. Proponha esta estrutura, deixando claro que
é uma proposta:

```markdown
## O que muda

## Por que

## Como validar
<comandos reais que você rodou, com o resultado>

## Checklist
- [ ] lint / typecheck / testes unitários passando
- [ ] migration incluída (se o schema mudou)
- [ ] docs/openapi.json regenerado (se o contrato mudou)
- [ ] feature nova entra com `enabled: false`
- [ ] nenhum segredo adicionado
- [ ] docs/ai atualizado

## Riscos e o que não foi validado
```

A última seção é a mais importante neste projeto: boa parte da stack nunca foi
executada (banco, imagens, cluster). Diga explicitamente o que ficou sem
verificação, no mesmo espírito de `current-state.md`.

## 7. O que o CI vai rodar na PR

[.github/workflows/ci.yaml](../../../.github/workflows/ci.yaml) dispara em
**toda** pull request, com 3 jobs paralelos:

- `verify` — install, prisma generate, build dos packages compartilhados, lint,
  typecheck, testes unitários, `migrate:deploy` contra um Postgres 16 de serviço,
  `prisma migrate diff` (drift), testes de integração, build, e freshness do
  `docs/openapi.json`.
- `manifests` — `kustomize build` nos overlays `local`, `development`, `production`.
- `images` — `docker build` da API e do storefront.

Não há check obrigatório configurado no repositório (isso é config do GitHub, não
do repo) — não afirme que existe.

## 8. Push e abertura da PR

Só depois de confirmação explícita e separada. Se `gh` não estiver instalado
(neste ambiente não está), **não tente instalar**: entregue os comandos para o
usuário executar.

```bash
git push -u origin <branch>
gh pr create --base main --head <branch> --title "<título>" --body-file <arquivo>
```

Encerre relatando o que foi feito, o que ficou pendente e o link/comando final.
