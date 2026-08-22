# 0001 — Modular monolith

Status: provisional (2026-01)

## Context
Three developers must deliver an e-commerce MVP quickly. Microservices would add
deployment, networking and data-consistency work before any product exists.

## Decision
One backend deployment and one database, internally split into modules (auth,
users, catalog, cart, orders). Modules communicate only through explicit
application interfaces (`*_API` tokens); no module touches another module's
repositories or tables.

## Benefits
- One deployment, one migration path, local transactions.
- Module boundaries still give each developer clear ownership.
- Extracting a module into a service later means replacing an interface
  implementation, not untangling shared table access.

## Trade-offs
- Nothing enforces the boundaries at runtime; only review and the interface
  convention do.
- Everything scales together.

## Revisit when
A domain needs independent scaling or deployment, or a team is repeatedly blocked
by another team's release cadence.
