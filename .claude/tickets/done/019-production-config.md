# TICKET-019: Production Configuration

**Status:** Open
**Priority:** Medium
**Area:** Frontend + Backend

## Context

Several hardcoded values and dev-only defaults need to change before the app is deployed to a
real server. These were deferred during development but must be resolved before any public
launch. This ticket collects all of them in one place.

## What needs to change

### 1. Frontend — API base URL

**File:** `frontend/src/utils/api.js`

`API_URL` is hardcoded to `http://localhost:3000`. In production this must point to the real
backend domain.

**Fix:** Read the URL from a Vite env variable:

```js
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
```

Create `frontend/.env.example`:
```
VITE_API_URL=http://localhost:3000
```

The production deploy sets `VITE_API_URL=https://api.zrbus.ddns.net` (or whatever the real domain is)
at build time.

### 2. Frontend — PWA service worker API cache pattern

**File:** `frontend/vite.config.js`

The `workbox.runtimeCaching` regex is hardcoded to `http://localhost:3000/lines`. When
`VITE_API_URL` is updated (above), the SW pattern must match the real API origin too, otherwise
the stale-while-revalidate offline cache never fires in production.

**Fix:** Derive the regex from the same env variable at config time:

```js
// vite.config.js
const apiUrl = process.env.VITE_API_URL ?? 'http://localhost:3000';
const apiOrigin = new URL(apiUrl).origin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// in runtimeCaching:
urlPattern: new RegExp(`^${apiOrigin}/lines`),
```

### 3. Backend — CORS allowed origin

**File:** `backend/src/main.ts`

`ALLOWED_ORIGIN` env var is already read in production, but there is no `.env.example` or
documentation for the required variables.

**Fix:** Create `backend/.env.example`:
```
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=
DB_DATABASE=zr_bus
NODE_ENV=production
ALLOWED_ORIGIN=https://zrbus.ddns.net
```

No code change needed — the guard is already in place.

### 4. Backend — `DB_PASSWORD` in `.env` is a real credential

**File:** `backend/.env`

Ensure `backend/.env` is in `.gitignore` and never committed. Confirm a `.env.example` with
blank password is the only committed reference.

### 5. Backend — listen on configurable port

**File:** `backend/src/main.ts`

Port is hardcoded to `3000`. Reverse proxies (nginx/Caddy) typically forward to a dynamic port.

**Fix:**
```ts
await app.listen(process.env.PORT ?? 3000);
```

## Acceptance criteria

1. `VITE_API_URL` drives the frontend API base URL and the SW cache pattern — no `localhost`
   references survive in the production build
2. `backend/.env.example` exists with all required keys and blank/placeholder values
3. `backend/.env` is confirmed in `.gitignore`
4. Backend port is read from `process.env.PORT` with `3000` as fallback
5. A one-paragraph deployment note is added to the project README (or CLAUDE.md) listing the
   required env vars for each package

## Notes

- Do not hard-code any production domain — keep everything in env vars so staging and prod use
  different values without code changes.
- The `NODE_ENV` check for CORS is already done; just make sure `ALLOWED_ORIGIN` is documented.
