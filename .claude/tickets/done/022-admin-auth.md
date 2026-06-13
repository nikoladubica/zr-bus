# TICKET-022: Admin Authentication — Users, JWT, Route Guards

**Status:** Open
**Priority:** Medium
**Area:** Backend + Frontend

## Context

The roadmap reserves a separate **`/admin`** area that reuses the design system but sits outside
the public shell — see `design-research-and-current-audit.md`, Part 3 → "How every roadmap feature
lands" ("Admin / field survey"), and `future-roadmap.md` Part 2. Before any admin CRUD (023) or
field survey (024) can exist, there must be authentication: the data-editing surfaces must be
protected.

There is **no auth layer in the backend today** — no `users` table, no JWT, no guards. This ticket
is that foundation. It is the roadmap item `admin-auth`.

Depends on: nothing (foundation). Blocks: **023** (admin CRUD), **024** (field survey).

## What's missing

- A `users` table: `id`, `username` (or email), `password_hash`, `role ENUM('admin','viewer')`,
  timestamps
- A TypeORM `User` entity + module following the existing repository pattern (mirror the
  `lines` / `locations` modules)
- Password hashing (bcrypt/argon2) — never store plaintext
- JWT auth: `POST /auth/login` issues a token; an auth guard validates it on protected routes; a
  role guard restricts admin-only actions
- A way to create the first admin (seed script or documented one-off) — the app has no signup
- Frontend: a `/login` page (reusing the `Card`/`Button` library) and a **route guard** that
  redirects unauthenticated users away from `/admin/*` to `/login`
- Token storage on the client and attaching it to API requests (extend `utils/api.js`)

## Acceptance criteria

1. `users` table + `User` entity exist with `role` and a hashed password column (no plaintext)
2. `POST /auth/login` returns a valid JWT for correct credentials and 401 for bad ones
3. A guard protects designated routes; requests without a valid token get 401, wrong-role get 403
4. There is a documented, repeatable way to create the initial admin user
5. `/login` page authenticates and stores the token; `/admin/*` routes redirect to `/login` when
   unauthenticated and render when authenticated
6. The token is attached to authenticated API calls; logout clears it
7. No change to the existing public endpoints' behaviour (they remain open)

## Notes

- Use `@nestjs/jwt` + `@nestjs/passport` (passport-jwt) — the standard NestJS path; flag the new
  deps in the PR.
- Keep the JWT secret in `backend/.env` (`JWT_SECRET`) and add it to `backend/.env.example`
  (per ticket 019's env conventions). Never commit a real secret.
- The public API stays public; only the new admin/write endpoints introduced in 023/024 sit
  behind the guard. Be explicit in the PR about which routes are protected.
- Keep it simple: a single admin role is enough to start; `viewer` is reserved for later. No
  password-reset email flow, no OAuth — out of scope.
- The `/admin` area reuses the design system but is **not** part of the public bottom-sheet shell
  (008) — it's a separate desktop-oriented layout.
