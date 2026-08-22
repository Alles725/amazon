# 0005 — YAML feature flags with a central registry

Status: provisional (2026-01)

## Context
Work should merge continuously even when a feature is incomplete, and routes
must exist before they do anything useful.

## Decision
A single `config/features.yaml` declares features and binds routes to them with a
`disabledBehavior` of `coming-soon` or `not-found`. A `FeatureRegistry` validated
by Zod is the only thing that reads it; pages use `FeatureRoute` and components
use `FeatureGate`. Invalid configuration throws at startup.

## Benefits
- Unfinished work ships disabled instead of living on a long-lived branch.
- Enabling a feature is a config change, not a deployment of new code.
- A route bound to a misspelled feature fails validation instead of silently
  behaving as if the feature were off.
- The same YAML file feeds the storefront ConfigMap, so cluster and repo agree.

## Trade-offs
- Flags accumulate and need deliberate removal once a feature is permanent.
- Flag combinations multiply the states that need testing.

## Revisit when
Flags need per-user targeting or gradual rollout, at which point a flag service
replaces the YAML file behind the same registry interface.
