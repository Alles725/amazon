# 0002 — TypeScript, NestJS and Next.js

Status: provisional (2026-01)

## Context
A small team needs to move quickly across backend and frontend without context
switching between languages.

## Decision
TypeScript end to end. NestJS for the API, Next.js (App Router) for the
storefront. Shared types live in `packages/api-contract`.

## Benefits
- One language, one toolchain, shared contract types.
- Nest supplies modules, DI, guards, validation and OpenAPI generation, which is
  most of what the module boundaries need.
- Next supplies routing, server components and per-request runtime configuration.

## Trade-offs
- More boilerplate than Express, and more framework surface than Vite.
- Decorator metadata makes some tooling (test runners in particular) fussier.

## Revisit when
The API becomes latency-critical enough to justify a different runtime, or the
storefront no longer needs server rendering.
