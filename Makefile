SHELL := /bin/bash
.DEFAULT_GOAL := help

CLUSTER      ?= amazon-mvp
NAMESPACE    ?= amazon-mvp
OVERLAY      ?= local
TAG          ?= local
KUSTOMIZE    ?= kustomize
# The base ConfigMap generator reads config/features.yaml, which sits above the
# kustomization root, so the default load restrictor has to be relaxed.
KBUILD       := $(KUSTOMIZE) build --load-restrictor LoadRestrictionsNone infrastructure/kubernetes/overlays/$(OVERLAY)

.PHONY: help bootstrap lint typecheck test test-integration build openapi \
        cluster cluster-delete images deploy migrate seed status logs smoke clean

help: ## Show this help
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

bootstrap: ## Install dependencies and generate the Prisma client
	pnpm install
	pnpm --filter @amazon-mvp/database generate
	pnpm --filter @amazon-mvp/api-contract build
	pnpm --filter @amazon-mvp/config-schema build
	pnpm --filter @amazon-mvp/database build

lint: ## Lint every workspace package
	pnpm -r --if-present lint

typecheck: ## Type-check every workspace package
	pnpm -r --if-present typecheck

test: ## Run unit tests (no database required)
	pnpm -r --if-present test

test-integration: ## Run API integration tests (requires DATABASE_URL + migrations)
	pnpm --filter @amazon-mvp/api test:integration

build: ## Build every workspace package
	pnpm -r --if-present build

openapi: ## Regenerate docs/openapi.json from the running Nest metadata
	pnpm --filter @amazon-mvp/api openapi

cluster: ## Create the local kind cluster and install ingress-nginx
	kind create cluster --config infrastructure/kind/cluster.yaml || true
	kubectl --context kind-$(CLUSTER) apply -f \
	  https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.2/deploy/static/provider/kind/deploy.yaml
	kubectl --context kind-$(CLUSTER) wait --namespace ingress-nginx \
	  --for=condition=ready pod --selector=app.kubernetes.io/component=controller --timeout=180s

cluster-delete: ## Delete the local kind cluster
	kind delete cluster --name $(CLUSTER)

images: ## Build both images and load them into kind
	docker build -f apps/api/Dockerfile -t amazon-mvp/api:$(TAG) .
	docker build -f apps/storefront/Dockerfile -t amazon-mvp/storefront:$(TAG) .
	kind load docker-image amazon-mvp/api:$(TAG) --name $(CLUSTER)
	kind load docker-image amazon-mvp/storefront:$(TAG) --name $(CLUSTER)

deploy: ## Render and apply the overlay (OVERLAY=local|development|production)
	$(KBUILD) | kubectl apply -f -
	kubectl -n $(NAMESPACE) rollout status statefulset/postgresql --timeout=180s
	kubectl -n $(NAMESPACE) rollout status deployment/api --timeout=180s
	kubectl -n $(NAMESPACE) rollout status deployment/storefront --timeout=180s

migrate: ## Run the database migration Job to completion
	kubectl -n $(NAMESPACE) delete job db-migrate --ignore-not-found
	$(KBUILD) | kubectl apply -f - --prune=false -l app.kubernetes.io/part-of=amazon-mvp 2>/dev/null || \
	  $(KBUILD) | kubectl apply -f -
	kubectl -n $(NAMESPACE) wait --for=condition=complete job/db-migrate --timeout=180s
	kubectl -n $(NAMESPACE) logs job/db-migrate

seed: ## Seed categories and products into the cluster database
	kubectl -n $(NAMESPACE) run seed-$$RANDOM --rm -i --restart=Never \
	  --image=amazon-mvp/api:$(TAG) --image-pull-policy=IfNotPresent \
	  --env="DATABASE_URL=$$(kubectl -n $(NAMESPACE) get secret -l app.kubernetes.io/part-of=amazon-mvp \
	    -o jsonpath='{.items[?(@.data.DATABASE_URL)].data.DATABASE_URL}' | base64 -d)" \
	  --command -- node_modules/.bin/tsx /repo/database/seeds/seed.ts

status: ## Show workload status
	kubectl -n $(NAMESPACE) get pods,svc,ingress,job

logs: ## Tail API logs
	kubectl -n $(NAMESPACE) logs -l app.kubernetes.io/name=api --tail=100 -f

smoke: ## Run the end-to-end smoke test against the Ingress
	BASE_URL=$${BASE_URL:-http://localhost:8080} node scripts/smoke-test.mjs

manifests: ## Render the overlay without applying it
	$(KBUILD)

clean: ## Remove build output and dependencies
	rm -rf node_modules apps/*/node_modules packages/*/node_modules database/node_modules
	rm -rf apps/*/dist apps/storefront/.next packages/*/dist database/dist
