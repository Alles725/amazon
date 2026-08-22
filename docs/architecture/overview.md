# Architecture overview

```
                         Browser
                            |
                            v
                   Kubernetes Ingress (nginx)
                    /                    \
             path: /                  path: /api
                  v                        v
        Next.js Storefront            NestJS API
        (Deployment, :3000)        (Deployment, :3001)
                                          |
              +---------+---------+-------+-------+---------+
              |         |         |               |         |
            Auth      Users    Catalog          Cart     Orders
              |         |     (boundary)     (boundary) (boundary)
              +---------+---------+-------+-------+---------+
                                          |
                                   PrismaService
                                          |
                                    PostgreSQL
                                (StatefulSet + PVC)
                                          ^
                                          |
                                 db-migrate (Job)
```

Traffic is same-origin by design: the Ingress routes `/api` to the API and
everything else to the storefront, so the session cookie needs no CORS handling
and no cross-site cookie relaxation.

## Module boundaries

Modules communicate only through injection tokens backed by interfaces:

| Token | Interface | Owns |
| --- | --- | --- |
| `USERS_API` | `UsersApi` | `users` |
| `SESSIONS_API` | `SessionsApi` | `sessions` |
| `CATALOG_API` | `CatalogApi` | `products`, `categories`, `product_categories`, `inventory` |
| `CART_API` | `CartApi` | `carts`, `cart_items` |
| `ORDERS_API` | `OrdersApi` | `orders`, `order_items` |

`PrismaService` is the only holder of a database connection. A module's
repository may only touch the tables that module owns. Extracting a module into a
service later means providing a different implementation of its interface.

## Authentication flow

```
register/login  ->  Argon2id verify  ->  issue 256-bit opaque token
                                              |
                             store SHA-256(token) in sessions
                                              |
                       Set-Cookie: HttpOnly; SameSite=Lax; Secure*
                                              |
  every request  ->  SessionGuard (global)  ->  lookup by hash  ->  req.auth
                                              |
                     logout  ->  revoked_at set  ->  cookie cleared
```

`Secure` is off only in the `local` overlay, where kind serves plain HTTP.
The guard is registered as `APP_GUARD`, so routes are protected unless they opt
out with `@Public()` — forgetting a decorator leaves a route closed, not open.

## Configuration precedence

```
config/default.yaml  ->  config/<environment>.yaml  ->  env vars (incl. Secrets)
```

Validated by Zod at startup. Invalid configuration throws before the process
serves traffic. Env bindings are an explicit path -> variable map, never derived
by name mangling.

## Feature flags

`config/features.yaml` is read once per process by `FeatureRegistry`. Pages call
`FeatureRoute`, components call `FeatureGate`; nothing else reads the file. A
route bound to an undeclared feature fails validation rather than silently
behaving as disabled. The same file is mounted into the storefront pod through a
Kustomize `configMapGenerator`, so cluster and repository cannot disagree.
