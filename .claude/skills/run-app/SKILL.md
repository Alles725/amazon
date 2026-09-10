---
name: run-app
description: Sobe a aplicação completa localmente fora de Kubernetes (PostgreSQL via Docker + API + storefront), do jeito que este projeto é realmente executado no dia a dia. Abre o Docker Desktop se estiver fechado, sobe o container do Postgres, instala, aplica migrations e inicia os processos — só o necessário para subir tudo; validação profunda fica para a skill check. Use quando o usuário pedir "rodar a aplicação", "subir o projeto", "iniciar o dev", "testar localmente".
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

Se `node`/`pnpm` faltarem, pare e informe — não simule sucesso, essas dependem
de instalação manual do usuário.

Para o Docker, teste se o daemon está de pé (não só se o binário existe):

```bash
docker info
```

Se falhar (`docker --version` funciona mas `docker info` não responde — sinal
de que o Docker Desktop está instalado mas fechado), **abra você mesmo**:

```powershell
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

Depois faça polling de `docker info` a cada poucos segundos até responder
(esperar o daemon subir leva de alguns segundos a ~1–2 minutos, dependendo da
máquina) — não use um `sleep` fixo longo, cheque em loop. Se depois de uns 3
minutos o daemon ainda não responder, pare e informe o usuário (pode haver
diálogo de termos/licença esperando clique manual na primeira execução, ou o
Docker não estar instalado de fato). Só então prossiga para a seção 1.

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
pnpm --filter @amazon-mvp/api-contract build
pnpm --filter @amazon-mvp/config-schema build
pnpm --filter @amazon-mvp/database build
```

Checagem de drift entre migrations e `schema.prisma` **não é passo desta
skill** — quem valida isso é a skill `check` (seção 2) ou `db-migration`. Só
rode `drift:check` aqui se o `migrate:deploy` do passo 4 falhar de um jeito
que sugira divergência; não rode por padrão, é passo de validação, não de
subida.

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

## 6. Confirmar que subiu

O necessário para saber que os três serviços estão de pé — não é uma suíte de
teste:

```bash
curl -s http://localhost:3001/health
curl -s http://localhost:3001/ready          # deve reportar database: ok
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```

Isso já confirma API, banco e storefront respondendo. Fluxo de autenticação
ponta a ponta (registro/sessão/logout) **não é passo desta skill** — só rode
se o usuário pedir explicitamente para testar auth, usando os endpoints
documentados no [README.md](../../../README.md) ("Endpoints"). O
[scripts/smoke-test.mjs](../../../scripts/smoke-test.mjs) foi escrito para um
deploy em cluster via Ingress — não se aplica aqui sem adaptar `BASE_URL`.

## 7. Encerrar

```bash
# achar e matar os processos nas portas 3000/3001 (Windows: Get-NetTCPConnection + Stop-Process)
docker stop mvp-pg   # mantém os dados; docker rm mvp-pg para descartar de vez
```

Apague os arquivos de log capturados no passo 5 (`api-dev.log`,
`storefront-dev.log` ou nomes equivalentes) depois de encerrar os processos —
são temporários, só servem para inspecionar a sessão que acabou de rodar, e
não devem ficar soltos no repositório:

```bash
rm -f api-dev.log storefront-dev.log
```

Se o `rm` falhar com "device or resource busy", o processo que escrevia nele
ainda está de pé — confirme que matou o processo certo na porta 3000/3001
antes de tentar de novo. Isso vale mesmo quando o log foi capturado em
`/tmp/` (fora do repositório): não deixe lixo acumulando de sessão em sessão.

## 8. Relatório

Informe: o que subiu e em qual porta, resultado dos checks de saúde/auth, e
qualquer contorno aplicado (porta alternativa do Postgres, `MSYS_NO_PATHCONV`).
Se algo real quebrar que não seja um dos dois problemas de ambiente já
conhecidos acima, trate como um bug genuíno do projeto — investigue a causa
raiz antes de propor correção, e nunca reporte "funcionando" sem ter validado.
