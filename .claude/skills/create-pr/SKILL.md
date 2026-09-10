---
name: create-pr
description: Prepara uma Pull Request neste repositório — confere branch e diff, roda as validações, checa os artefatos obrigatórios (migration, openapi, docs/ai), e propõe mensagem de commit, título e descrição. Executa commit, push e abertura da PR só depois de uma única confirmação explícita ("abrir PR?"). Use quando o usuário pedir "abrir PR", "preparar PR", "criar pull request".
allowed-tools: Read, Grep, Glob, Bash, PowerShell
---

# create-pr — preparação de Pull Request

## Regra de segurança (inegociável)

Nesta skill você **nunca** executa por conta própria:

- `git commit`
- `git push`
- `gh pr create` (ou qualquer criação de PR)

Os três juntos exigem **uma única confirmação explícita** do usuário, feita com
a pergunta "abrir PR?" (ou equivalente claro) depois que a mensagem de commit e
o título/descrição da PR já estiverem prontos e mostrados. Não pergunte três
vezes nem quebre em confirmações separadas para commit, push e PR — uma vez
aprovado, rode os três em sequência (seção 8). Sem resposta clara, pare e
entregue os comandos prontos para o usuário rodar manualmente.

## 1. Estado atual do repositório

```bash
git status --short
git branch --show-current
git log --oneline -10
git diff --stat
git diff main...HEAD --stat
```

Não trate o que encontrar como erro, mas também não assuma nada de sessões
anteriores: não há git hooks instalados (só os `.sample`), e não há template de
PR nem `CODEOWNERS` em `.github/` — lá só existe `workflows/ci.yaml`. Confira
sempre ao vivo (`git log`, `git branch -a`) — não hardcode "só existe a branch
main e um commit" nem qualquer outro estado específico: este repositório já
teve múltiplas PRs merged e o histórico cresce a cada uma.

**Consequência importante: este repositório não tem convenção estabelecida de
nome de branch, de mensagem de commit ou de descrição de PR.** Não afirme que
tem. Proponha, explique de onde veio a proposta, e deixe o usuário decidir.

Antes de ir para a seção 2, rode:

```bash
git fetch origin main --quiet
git log origin/main..HEAD --oneline
```

Se a branch atual não for `main` mas o `git log origin/main..HEAD` vier vazio
(ou só com commits de um trabalho anterior e não-relacionado), trate isso como
o mesmo sinal de alerta que uma branch já mesclada: não é uma feature branch
aberta para esta tarefa, é uma branch "reciclada" ou obsoleta. Vá para a
seção 2 antes de qualquer outro passo.

## 2. Branch (regra obrigatória)

**Esta skill sempre cria uma branch nova a partir de `main` para o trabalho
que ela vai commitar — nunca reaproveita a branch que já estiver com checkout
feito**, seja ela `main`, uma branch de feature de outra tarefa, ou uma branch
já mesclada em uma PR anterior. Não é opcional, não depende de o diff parecer
pequeno, e não depende de a branch atual "parecer" já ser uma branch nova —
verifique sempre com `git fetch origin main` antes de decidir.

```bash
git fetch origin main --quiet
git checkout -b <nome-da-branch> origin/main
```

Isso vale mesmo se já existirem mudanças não commitadas no working tree: o
`git checkout -b ... origin/main` preserva modificações não commitadas ao
trocar de base, então rode esse comando mesmo em cima de um diff em andamento
— não é preciso descartar nada primeiro. Se o checkout falhar por conflito
real (arquivo modificado que também diverge entre a branch atual e
`origin/main`), pare e mostre o conflito ao usuário em vez de forçar.

Criar a branch é uma ação segura (não reescreve nada, não precisa da mesma
confirmação exigida para commit/push/PR) — crie direto, sem pedir confirmação
de nome ao usuário.

Nome da branch: use o padrão `<tipo>/<descricao-curta-em-kebab-case>`, onde
`<tipo>` reflete a natureza da mudança — `feat`, `fix`, `refactor`, `docs`,
`test`, `chore`, `perf`, `style`, `build`, `ci` (os mesmos tipos de Conventional
Commits usados na seção 5). A descrição vem da tarefa em si (o que o diff faz),
não de um ID de backlog — por exemplo `feat/migrations-prisma` ou
`fix/validacao-login`. Ao relatar o progresso, informe o nome escolhido e o
critério usado, mas sem esperar aprovação para segui-lo.

**A PR final sempre aponta para `main` como base** (`--base main` no `gh pr
create`, seção 8). `main` nunca é o head de uma PR criada por esta skill, e
nunca é commitada diretamente por esta skill.

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

Use Conventional Commits (`<tipo>: <resumo>`, mesmos tipos da seção 2) — não
pergunte ao usuário se ele prefere esse padrão, apenas escreva a mensagem já
nesse formato.

Formato:

```
<tipo>: <resumo imperativo em uma linha, ~72 caracteres>

<o quê e por quê, não o como>
- ponto relevante
- artefato obrigatório incluído (migration / openapi.json / features.yaml)

Refs: <ID do backlog, se houver>
```

Mostre a mensagem já pronta. Não peça confirmação aqui — a confirmação única
("abrir PR?") só acontece depois da seção 6, quando commit, push e PR já estão
prontos para rodar em sequência (seção 8).

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

## 8. Commit, push e abertura da PR

Antes de montar o comando final, descubra quem marcar como reviewer:

```bash
gh api user -q '.login'
gh api repos/<owner>/<repo>/collaborators -q '.[].login'
```

Reviewers = todos os collaborators **menos** o login autenticado (quem está
abrindo a PR). Não peça confirmação para essa lista — é derivada direto da API,
não uma escolha subjetiva. Se a chamada falhar (sem permissão, `gh` não
autenticado) ou não sobrar ninguém, siga sem `--reviewer` e avise no relatório
final que ninguém foi marcado, em vez de travar o fluxo.

Com a mensagem de commit (seção 5), o título/descrição da PR (seção 6) e a
lista de reviewers já prontos, faça **uma única pergunta**: "abrir PR?" (ou
equivalente claro). Só depois de uma resposta afirmativa clara rode os
comandos em sequência — não pergunte de novo entre um e outro:

```bash
git commit -m "<mensagem da seção 5>"
git push -u origin <branch>
gh pr create --base main --head <branch> --title "<título>" --body-file <arquivo> \
  --reviewer <login1>,<login2>
```

Antes de chegar nesse ponto, confira com `gh --version` se o `gh` está
disponível — não hardcode se está instalado ou não, isso já mudou de uma
sessão para outra. Se não estiver, **não tente instalar**: entregue os
comandos prontos para o usuário rodar manualmente, sem executar nada.

`gh pr create` só funciona com uma conta que tenha permissão de escrita no
repositório (`gh api repos/<owner>/<repo> -q '.permissions'` mostra o nível
atual). Ações que exigem admin (renomear/trocar a branch padrão, mudar
proteção de branch) não são cobertas por esta skill — se surgirem, pare e peça
para o usuário resolver na conta com permissão adequada.

Se qualquer um dos três comandos falhar no meio da sequência, pare, mostre o
erro e não tente os passos seguintes automaticamente.

Encerre relatando o que foi feito, o que ficou pendente e o link/comando final.
