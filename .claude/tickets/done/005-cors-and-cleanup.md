# TICKET-005: Backend Cleanup — CORS, Logging, Unused Code

**Status:** Open  
**Priority:** Medium  
**Area:** Backend + Frontend

## Issues

### 1. CORS policy too permissive
`backend/src/main.ts` enables CORS with `origin: '*'` and a comment "tighten later". For a production app this should be restricted to the known frontend origin.

**Fix:** Set `origin` to the production domain (or an env var `ALLOWED_ORIGIN`) and keep `'*'` only in development via `NODE_ENV` check.

### 2. Debug console.log in Map.jsx
`frontend/src/components/Elements/Map/Map.jsx` lines ~45–48 log the closest station to the browser console. This is leftover debug output.

**Fix:** Remove the `console.log` call.

### 3. Commented-out ORM methods in LinesRoutesService
`backend/src/lines-routes/lines-routes.service.ts` lines 13–32 contain the old TypeORM-based `findAll` / `findByLineId` implementations, replaced by the current raw query builder. They serve no purpose.

**Fix:** Delete the commented-out blocks.

### 4. Incomplete LinesLocationsDeparturesService
Relations are commented out. Either complete the implementation (see TICKET-001) or leave a clear TODO — don't leave dead commented code.

## Acceptance criteria

- CORS restricted by environment
- No debug `console.log` in production paths
- Dead commented code removed from service files
