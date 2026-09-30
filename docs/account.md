# Account area ("Sua conta")

The account hub (`/account`) links to the destinations below. Every page requires a
session (guests are sent to `/login?next=<page>`), renders the Amazon account-page
frame (`features/account/account-shell.tsx`: header, "Sua conta › X" breadcrumb,
title, footer) and is gated by its own flag in `config/features.yaml`.
Styles live in `features/account/account.css` (scoped to `.az-acct*` / `.az-add-to-list*`).

| Route | Flag | Kind |
| --- | --- | --- |
| `/addresses` | `addresses` | Real — addresses API (Users module) |
| `/security` | `security`, `account` | Real — account API (Auth module) |
| `/lists` | `lists` | Real — lists API (Lists module) |
| `/prime`, `/gift-cards`, `/refunds`, `/messages`, `/subscriptions`, `/subscribe-and-save` | own flags | Informational — truthful empty states |
| `/payment-methods` | `paymentMethods` | Not part of this slice |

## Seus endereços
- `GET/POST /api/v1/addresses`, `PUT /addresses/:id` (existing) plus
  `DELETE /addresses/:id` and `POST /addresses/:id/default`; both return the full list.
- `addresses.is_default` (migration `20261001000101_address_default`). The first
  address saved becomes the default; deleting the default promotes the oldest
  remaining one. Existing accounts get their oldest address marked default, which is
  what checkout already preselected. At most one default per user is enforced under
  a per-user advisory lock (Prisma cannot express a partial unique index).
- Lists come back default first, so checkout (`data[0]`) and the product page
  ("Enviar para …") keep using the default without changes.
- The page reuses checkout's `AddressForm`; validation lives in one place.

## Acesso e segurança
- `PATCH /api/v1/account/profile` `{ displayName }` — same 2–80 rule as registration.
- `POST /api/v1/account/password` `{ currentPassword, newPassword }` — current
  password verified with Argon2id (`PasswordService`), new one 12–128 chars and
  different from the current one. On success every OTHER session of the user is
  revoked through `SESSIONS_API.revokeOthersForUser`; the current session stays.
- `POST /api/v1/account/email` `{ email, currentPassword }` — requires the current
  password, normalizes the address, rejects taken e-mails (friendly check + unique
  index, `AUTH_EMAIL_ALREADY_REGISTERED`, same as registration) and also revokes the
  other sessions. No verification e-mail is sent (notifications are out of scope).
- A wrong current password answers `403` with the login error body
  (`AUTH_INVALID_CREDENTIALS`, "Invalid credentials"): 403 because the session is valid.
- Passwords are never logged; logs carry only user ids and outcomes.

## Suas listas
- Lists module (`apps/api/src/modules/lists`, token `LISTS_API`) owns `lists` and
  `list_items` (migration `20261001000100_lists`). Product data is read through
  `CATALOG_API.findByIds`; `list_items.product_id` has no foreign key into the
  catalog, and items whose product no longer exists are omitted from responses.
- `GET /lists` creates the default "Lista de desejos" on first use (exactly once,
  under a per-user advisory lock). `POST /lists`, `GET/PATCH/DELETE /lists/:id`,
  `POST /lists/:id/items` (idempotent), `DELETE /lists/:id/items/:productId`.
- Limits: 20 lists per user, 100 items per list (`LIST_LIMIT_EXCEEDED`, 409); the
  default list cannot be deleted (`LIST_DEFAULT_PROTECTED`, 409). Another user's
  list is always a 404.
- The list page shows live name, price, stock and "Adicionar ao carrinho" through
  `CartProvider`. The product page buy box has "Adicionar à lista" (default list;
  the arrow picks another list); guests get a link to login.

## Informational pages
Prime, Vales-presente, Reembolsos Boleto/Pix, Suas mensagens, Inscrições e
assinaturas and Programe e Poupe follow the real page's sections but show only
truthful empty states ("Você não é membro Prime", "Você não tem vales-presente", …)
plus a note that the feature does not exist in this academic store. They have no
forms, balances or codes, because no backend or ledger exists for them.
