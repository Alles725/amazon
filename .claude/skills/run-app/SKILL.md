---
name: run-app
description: Sobe a aplicação completa localmente fora de Kubernetes (PostgreSQL via Docker + API + storefront), do jeito que este projeto é realmente executado no dia a dia. Verifica pré-requisitos, aplica migrations, builda os packages compartilhados e valida os endpoints. Use quando o usuário pedir "rodar a aplicação", "subir o projeto", "iniciar o dev", "testar localmente".
allowed-tools: Read, Grep, Glob, Bash, PowerShell
---

# run-app — rodar a aplicação localmente

Este é o único modo de execução que este projeto realmente pratica: **fora de
Kubernetes**, seção "Running outside Kubernetes" do
[README.md](../../../README.md). Não há CD nem prática de deploy neste
repositório — o ambiente real é o próprio código em `main` rodando localmente.
Kubernetes/kind existe apenas como infraestrutura documentada (job `manifests`
do CI), não como algo que a equipe efetivamente sobe.

## 0. Pré-requisitos

| Ferramenta | Versão exigida |
|---|---|
| Node.js | 20.11+ |
| pnpm | 9 (`packageManager: pnpm@9.15.9` no `package.json` raiz) |
| Docker | qualquer versão recente, só para o container do Postgres |

```bash
node --version
pnpm --version
docker --version
```

Se alguma faltar, pare e informe — não simule sucesso. Em Windows, se o Docker
Desktop estiver instalado mas o comando `docker` não responder, ele
provavelmente só não foi aberto ainda (abrir manualmente uma vez, aceitar os
termos, esperar o ícone da baleia indicar "running").

## 1. `.env`

```bash
cp .env.example .env
```

Nunca commitar `.env` (já está no `.gitignore`). Se o usuário já tiver um
`.env`, não sobrescreva sem perguntar.

## 2. PostgreSQL via Docker

```bash
docker run -d --name mvp-pg -p 5432:5432 \
  -e POSTGRES_USER=amazon_mvp -e POSTGRES_PASSWORD=local-dev-password \
  -e POSTGRES_DB=amazon_mvp postgres:16-alpine
```

Se o container `mvp-pg` já existir (parado de uma sessão anterior), só religue:

```bash
docker start mvp-pg
```

**Armadilha real, já vista em Docker Desktop no Windows/WSL2:** o
encaminhamento de porta pode corromper o handshake de autenticação do Postgres
especificamente na porta `5432` (sintoma: `psql`/Prisma dizem "autenticação
falhou" mesmo com a senha certa, mas conectar direto pelo IP do container
funciona). Se isso acontecer:

```bash
docker rm -f mvp-pg
docker run -d --name mvp-pg -p 5433:5432 \
  -e POSTGRES_USER=amazon_mvp -e POSTGRES_PASSWORD=local-dev-password \
  -e POSTGRES_DB=amazon_mvp postgres:16-alpine
```

E ajuste a porta em `DATABASE_URL` no `.env` (`localhost:5433` em vez de
`:5432`). É um problema de rede do Docker Desktop, não do projeto — não tente
"corrigir" trocando o método de autenticação do Postgres.

## 3. Instalar, gerar Prisma, buildar packages compartilhados

```bash
pnpm install
pnpm --filter @amazon-mvp/database generate
```

A migration inicial (`database/prisma/migrations/20260101000000_init`) foi
escrita à mão — confira que ela bate com o schema antes de aplicar (aponte
`--shadow-database-url` para um banco **descartável**, nunca para o
`amazon_mvp` de uso, ou o diff aplica e deixa tabelas sem
`_prisma_migrations`, quebrando o próximo `migrate:deploy` com `P3005`):

```bash
pnpm --filter @amazon-mvp/database drift:check
```

Se acusar diferença, pare e avise — não prossiga empilhando migration nova
sobre uma base divergente (skill `db-migration`).

```bash
pnpm --filter @amazon-mvp/api-contract build
pnpm --filter @amazon-mvp/config-schema build
pnpm --filter @amazon-mvp/database build
```

## 4. Migrations e seed

```bash
pnpm --filter @amazon-mvp/database migrate:deploy
pnpm --filter @amazon-mvp/database seed
```

`migrate:deploy` só aplica migrations comprometidas (nunca gera nem reseta).
`seed` popula categorias e produtos (`database/seeds/seed.ts`).

## 5. Subir API e storefront

```bash
pnpm --filter @amazon-mvp/api dev          # :3001
pnpm --filter @amazon-mvp/storefront dev   # :3000, faz proxy de /api para :3001
```

Rode cada um em background e capture o log (ex.: `> /tmp/api-dev.log 2>&1 &`),
para poder inspecionar erros de compilação sem bloquear o terminal.

**Armadilha real em Git Bash/MSYS no Windows:** se você passar variáveis de
ambiente como `API_PUBLIC_BASE_PATH=/api/v1` ou `FEATURES_FILE=../../../config/features.yaml`
na linha de comando (ou via `source .env`), o MSYS reescreve automaticamente
qualquer valor parecido com um path Unix absoluto para um caminho do Windows
(ex.: `/api/v1` vira `C:/Program Files/Git/api/v1`), quebrando a validação de
config do storefront com um erro enganoso tipo `must start with "/"`. Corrija
exportando isto antes de rodar qualquer comando node/pnpm pelo Git Bash:

```bash
export MSYS_NO_PATHCONV=1
```

## 6. Validar que subiu de verdade

```bash
curl -s http://localhost:3001/health
curl -s http://localhost:3001/ready          # deve reportar database: ok
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```

Fluxo de autenticação ponta a ponta (cobre registro, sessão, logout):

```bash
JAR=/tmp/cookies.txt
curl -s -c $JAR -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"teste@example.com","password":"correct horse battery staple","displayName":"Teste"}'
curl -s -b $JAR http://localhost:3001/api/v1/auth/me
curl -s -b $JAR -X POST http://localhost:3001/api/v1/auth/logout
```

Endpoints e comportamento esperado documentados no
[README.md](../../../README.md) ("Endpoints") e exercitados por
[scripts/smoke-test.mjs](../../../scripts/smoke-test.mjs) (esse script foi
escrito para rodar contra um deploy em cluster via Ingress — localmente sem
Kubernetes, valide os endpoints direto como acima, não rode o script sem
adaptar `BASE_URL` e sem Ingress).

## 7. Encerrar

```bash
# achar e matar os processos nas portas 3000/3001 (Windows: Get-NetTCPConnection + Stop-Process)
docker stop mvp-pg   # mantém os dados; docker rm mvp-pg para descartar de vez
```

## 8. Relatório

Informe: o que subiu e em qual porta, resultado dos checks de saúde/auth, e
qualquer contorno aplicado (porta alternativa do Postgres, `MSYS_NO_PATHCONV`).
Se algo real quebrar que não seja um dos dois problemas de ambiente já
conhecidos acima, trate como um bug genuíno do projeto — investigue a causa
raiz antes de propor correção, e nunca reporte "funcionando" sem ter validado.
