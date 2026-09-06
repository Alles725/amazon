---
name: deploy
description: Procedimento real de deploy deste repositório — Kustomize + kind via Makefile, overlays local/development/production. Descobre pré-requisitos, renderiza manifests e valida o resultado. Nunca aplica nada em cluster sem confirmação explícita. Use quando o usuário pedir "deploy", "subir a aplicação", "aplicar no cluster", "publicar".
allowed-tools: Read, Grep, Glob, Bash, PowerShell
---

# deploy — procedimento de deploy

## Fatos verificados sobre o deploy deste projeto

Antes de qualquer coisa, o que é verdade hoje (não extrapole além disto):

- **Não existe CD.** [.github/workflows/ci.yaml](../../../.github/workflows/ci.yaml)
  tem três jobs — `verify`, `manifests`, `images` — e **nenhum deles faz deploy**.
  O CI constrói imagens com a tag `ci` e as descarta.
- **O deploy é manual**, feito pelos targets do [Makefile](../../../Makefile),
  que canalizam `kustomize build` para `kubectl apply`.
- **Ambientes = overlays Kustomize:** `local`, `development`, `production`, em
  `infrastructure/kubernetes/overlays/`.
- **Nada nunca foi deployado em lugar nenhum** — está escrito em
  [docs/ai/current-state.md](../../../docs/ai/current-state.md) ("Deployment
  state: Nothing has been deployed anywhere"). Trate o primeiro deploy como um
  primeiro deploy, não como rotina.
- **Não há rollback definido no repositório.** Não invente um. Se o usuário
  perguntar, diga que não existe procedimento documentado e proponha combinar um.

## Regra de segurança

Peça confirmação explícita antes de **qualquer** comando que escreva em cluster
ou banco: `make deploy`, `make migrate`, `make seed`, `make cluster`,
`make cluster-delete`, ou qualquer `kubectl apply/delete`.

Para `OVERLAY=development` ou `OVERLAY=production`, a confirmação precisa ser
explícita quanto ao ambiente ("sim, aplicar em produção"). Um "pode seguir"
genérico não basta.

**Armadilha crítica:** os targets `deploy`, `migrate`, `seed`, `status` e `logs`
usam o **contexto kubectl corrente** — não passam `--context`. Só o target
`cluster` fixa `kind-$(CLUSTER)`. Antes de aplicar qualquer coisa, sempre:

```bash
kubectl config current-context
kubectl config get-contexts
```

Mostre o contexto ao usuário e confirme que é o pretendido. Rodar
`make deploy OVERLAY=production` com o contexto errado aplica produção no
cluster errado.

## 1. Preflight — ferramentas

| Ferramenta | Versão exigida ([README](../../../README.md)) |
|---|---|
| Node.js | 20.11+ |
| pnpm | 9 |
| Docker | 24+ |
| kind | 0.23+ |
| kubectl | 1.29+ |
| kustomize | 5.4+ |

```bash
node --version; pnpm --version; docker --version; kind --version; kubectl version --client; kustomize version
```

Neste ambiente Windows **nenhuma dessas ferramentas está instalada** (só `git`).
Se faltarem, pare: liste o que falta e não simule o deploy. O `Makefile` também
exige GNU Make + `/bin/bash` (usa `$$RANDOM`, `base64 -d`, pipes); em Windows,
rode via Git Bash com make instalado, ou execute manualmente os comandos
equivalentes descritos abaixo.

## 2. Ambiente `local` (kind) — o único procedimento completo e documentado

Sequência oficial, do [README](../../../README.md) e de
[docs/ai/agent-handoff.md](../../../docs/ai/agent-handoff.md):

```bash
pnpm install
pnpm --filter @amazon-mvp/database generate     # cliente Prisma, antes de qualquer build
pnpm --filter @amazon-mvp/database drift:check  # a migration inicial foi escrita à mão

make bootstrap     # install + prisma generate + build dos packages compartilhados
make test          # unitários, sem banco

make cluster       # cria o cluster kind + instala ingress-nginx (espera o controller)
make images        # docker build das duas imagens + kind load
make deploy        # kustomize build | kubectl apply, e aguarda os rollouts
make migrate       # Job db-migrate (prisma migrate deploy) até completar
make seed          # categorias e produtos
make smoke         # checagem ponta a ponta pelo Ingress
```

Resultado esperado: storefront em <http://localhost:8080>, API em
<http://localhost:8080/api/v1>, docs em <http://localhost:8080/api/docs>
(ligado em `local` e `development`, desligado em `production`). O mapeamento de
portas vem de [infrastructure/kind/cluster.yaml](../../../infrastructure/kind/cluster.yaml)
(80→8080, 443→8443).

Variáveis do Makefile: `CLUSTER` (`amazon-mvp`), `NAMESPACE` (`amazon-mvp`),
`OVERLAY` (`local`), `TAG` (`local`).

**Faça `make manifests OVERLAY=<env>` antes de `make deploy`** e mostre ao
usuário o que será aplicado. `manifests` só renderiza, não aplica — é sempre seguro.

Pontos delicados já documentados:
- `make migrate` **deleta o Job `db-migrate`** antes de reaplicar (Jobs são
  imutáveis). Isso é esperado.
- `make seed` é o target menos testado do repositório — ele faz `kubectl run`
  com uma imagem efêmera e lê o `DATABASE_URL` de um Secret com `base64 -d`.
- A migration inicial `20260101000000_init` foi **escrita à mão e nunca
  aplicada**. `drift:check` antes de migrar não é opcional (skill `db-migration`).

## 3. Ambientes `development` e `production`

O que existe de fato:

| | `development` | `production` |
|---|---|---|
| Overlay | `overlays/development` | `overlays/production` |
| `APP_ENV` | development | production |
| `LOG_LEVEL` | debug | info |
| Réplicas (api / storefront) | 2 / 1 (base) | 3 / 3 |
| `OPENAPI_ENABLED` | herdado da base | `false` |
| `SESSION_SECURE_COOKIE` | `true` | `true` |
| Tag das imagens | `development` | `production` |
| Secrets | **não** gerados aqui | **não** gerados aqui |

Os overlays declaram, em comentário, que `postgres-secret` e `api-secret` são
criados fora de banda (sealed-secrets / external-secrets / `kubectl create
secret`) justamente para que nenhuma credencial seja commitada.

**Lacunas reais — não preencha com suposição:**

1. **Não há registry nem push de imagem em lugar nenhum do repositório.**
   `make images` só faz `docker build` + `kind load` (kind). Os overlays
   `development`/`production` referenciam `amazon-mvp/api:development` e
   `amazon-mvp/storefront:production`, mas **nada neste repositório publica
   essas tags**. Como as imagens chegam ao cluster desses ambientes não está
   definido.
2. **Não há cluster, contexto kubectl, provedor de nuvem ou host de Ingress
   documentado** para esses ambientes. Não existe Terraform nem qualquer IaC
   além dos manifests Kustomize.
3. **Não há mecanismo documentado de criação dos Secrets** — só a indicação de
   que vêm de fora.
4. **Não há procedimento de rollback.**

Portanto, para `development`/`production`: renderize os manifests, apresente as
lacunas ao usuário e **pergunte** qual cluster/contexto, de onde vêm as imagens e
como os Secrets são providos. Só siga com o que ele responder — e registre a
resposta como decisão dele, não como fato do repositório. Se ele quiser
documentar isso, o lugar é `docs/` + um ADR.

## 4. Verificação pós-deploy

```bash
make status                                  # kubectl get pods,svc,ingress,job
make logs                                    # tail dos logs da API
BASE_URL=http://localhost:8080 make smoke    # ou node scripts/smoke-test.mjs
```

O smoke test ([scripts/smoke-test.mjs](../../../scripts/smoke-test.mjs)) é
dependency-free e roda contra qualquer `BASE_URL`. Ele cobre: storefront pelo
Ingress, `/health` e `/ready` (com checagem de banco), registro → requisição
autenticada → logout → login, rejeição de acesso anônimo com `requestId` no erro,
e o comportamento das feature flags (`/products` mostra Coming Soon, `/checkout`
retorna 404). Sai com código ≠ 0 se qualquer checagem falhar.

Endpoints de saúde: `GET /health` e `GET /ready`.

## 5. Feature flags depois do deploy

Ligar/desligar feature é edição de [config/features.yaml](../../../config/features.yaml)
seguida de `make deploy` — o arquivo entra no cluster por um `configMapGenerator`
do Kustomize, então repositório e cluster não podem divergir. Não existe toggle
em runtime.

## 6. Relatório final

Informe: overlay aplicado, contexto kubectl usado, tag das imagens, o que rodou,
o que falhou, e o resultado do smoke test. Se alguma etapa foi pulada por falta
de ferramenta ou de confirmação, diga qual e por quê.
