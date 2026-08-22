# 0006 — Kustomize for Kubernetes packaging

Status: provisional (2026-01)

## Context
Four workloads need to run across local, development and production with small
per-environment differences.

## Decision
Plain manifests in `base/` with `overlays/local|development|production`. No Helm.

## Benefits
- Manifests stay readable YAML rather than templated text.
- Overlays express only what differs.
- `kustomize build` renders the exact objects before anything is applied, which
  makes the manifests testable in CI.

## Trade-offs
- No packaging or distribution story, and no chart to hand to another team.
- Two sharp edges worth knowing:
  - `namespace:` must be repeated in every overlay that generates resources, or
    generated Secrets land namespace-less and the name-reference transformer will
    not rewrite consumers to their hashed names.
  - Reading `config/features.yaml` from above the kustomization root requires
    `--load-restrictor LoadRestrictionsNone`, so deployment pipes `kustomize
    build` into `kubectl apply` rather than using `kubectl apply -k`.

## Revisit when
The deployment needs to be distributed to third parties or grows enough
conditional logic that templating pays for itself.
