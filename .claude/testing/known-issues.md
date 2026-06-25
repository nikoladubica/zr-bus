# Known Issues

Issues spotted during codebase analysis but not yet in scope of any ticket. Agents append here automatically when they find problems outside ticket scope.

---

## 2026-06-09 — Initial codebase analysis

### Frontend

**[MAP-001] ~~Debug console.log in Map.jsx~~** ✅ Fixed in TICKET-005

**[MAP-002] Footer commented out in App.jsx**
- File: `frontend/src/App.jsx`
- `<Footer />` import and render are commented out. Component exists but is not mounted.
- Covered by: TICKET-004

**[CTX-001] ThemeContext.js is an empty stub**
- File: `frontend/src/context/ThemeContext.js`
- File exists but contains no implementation. Dark/light theme switching is not wired up anywhere.
- Covered by: TICKET-003

**[CTX-002] ScriptContext.js is an empty stub**
- File: `frontend/src/context/ScriptContext.js`
- File exists but contains no implementation. Latin/Cyrillic script switching is not wired up anywhere.
- Covered by: TICKET-002

**[STORE-001] No error handling or loading state in Zustand store**
- File: `frontend/src/store/client/createLineSlice.js`
- `fetchLines()` and `fetchLinesLocations()` use bare `fetch()` with no try/catch. If the backend is unreachable, the map silently shows nothing. No `isLoading` flag either.
- Covered by: TICKET-007

**[STORE-002] getCurrentLocationWithRecenter race condition**
- File: `frontend/src/store/client/createLineSlice.js`
- `getCurrentLocationWithRecenter()` calls `getCurrentLocation()` (async geolocation) then immediately reads `currentLocation` from state. The geolocation callback has not resolved yet, so `mapCenter` is set to the old/null location rather than the new one.
- Not covered by any ticket yet.

### Backend

**[CORS-001] ~~CORS open to all origins~~** ✅ Fixed in TICKET-005 — now `'*'` only in development, `ALLOWED_ORIGIN` env var in production

**[SVC-001] ~~Commented-out dead code in LinesRoutesService~~** ✅ Fixed in TICKET-005

**[SVC-002] ~~LinesLocationsDepartures relations commented out~~** ✅ Fixed in TICKET-001

---

## 2026-06-09 — TICKET-001 implementation scan

**[MAP-003] ~~Departure popup doesn't open on mobile~~** ✅ Fixed — `click` now calls both `fetchDepartures` and `openPopup()`; hover removed.

**[PERF-001] ~~formatTime redefined on every render~~** ✅ Fixed — reduced to a one-liner slice, negligible cost.

---

## 2026-06-10 — TICKET-004 implementation scan

**[ABOUT-001] About page has placeholder content**
- File: `frontend/src/components/Pages/About.jsx`
- Contains `<p className="read-the-docs">About us...</p>` — Vite boilerplate class and no real content.
- Not covered by any ticket yet.

**[DATA-001] ~~Departure `departure` column is TIME not TIMESTAMP~~** ✅ Fixed in TICKET-018 — entity now uses `type: 'time'` / `string`, `day_type` ENUM column added, migration at `backend/migrations/001_add_day_type_to_departures.sql`

---

## 2026-06-10 — TICKET-008 implementation scan

**[ABOUT-001] (stale)** — The `read-the-docs` Vite placeholder originally logged in ABOUT-001 was resolved by TICKET-004. The entry is superseded.

**[ABOUT-002] TODO: data source credits in About.jsx**
- File: `frontend/src/components/Pages/About.jsx` line ~84
- `{/* TODO: add data source credits */}` inside the "Izvori podataka" card — no ticket covers this yet.
- Not covered by any ticket yet.

**[HOME-001] ~~Hardcoded mobile MapLineSwitcher offset in Home.jsx~~** ✅ Resolved in TICKET-016 — confirmed the `top-[88px]` offset was never present; `Home.jsx` uses a dynamic `headerRef`/`headerHeight` measurement throughout.

**[ASSET-001] `arrow-right-white.svg` is now an orphaned asset**
- File: `frontend/src/assets/icons/arrow/arrow-right-white.svg`
- Was only used in `MapLineSwitcherItem.jsx`, which was deleted in TICKET-010. The file can be removed.
- Not covered by any ticket yet.

**[ICON-001] Locate icon is white-only — invisible in light mode**
- File: `frontend/src/assets/icons/locate/locate-white.svg`
- The locate icon is a white SVG, making it invisible against the light theme header background.
- Not covered by any ticket yet.

---

## 2026-06-10 — TICKET-012 implementation scan

**[API-001] `GET /lines-locations` returns relation as `entry.lines` (plural), not `entry.line`**
- File: `backend/src/lines-locations/lines-locations.entity.ts` — `@ManyToOne` property is named `lines`
- Any frontend code accessing the joined line must use `entry.lines.number`, `entry.lines.hex_color`, etc. Fixed in `HomeSheetContent.jsx`; other consumers of `linesLocations` (Map.jsx) use the `line_id`-mapped `data` structure so they are unaffected.
- Resolved in TICKET-012.

---

## 2026-06-11 — TICKET-015 implementation scan

**[TIMETABLE-001] Timetable fetch has no try/catch — unhandled rejection on network error**
- File: `frontend/src/components/Pages/Timetable.jsx` — the `load()` async function inside `useEffect` checks `resp.ok` for HTTP errors but has no outer try/catch, so a network-level failure throws an unhandled promise rejection and leaves `isLoading` true forever.
- Not covered by any ticket yet (error-handling groundwork is TICKET-007).

---

## 2026-06-12 — TICKET-020 implementation scan

**[IMPORT-001] Unused `nextDepartureMinutes` import in StopDetailView.jsx**
- File: `frontend/src/components/Elements/StopDetailView.jsx` line 5
- `nextDepartureMinutes` is imported from `../../utils/countdown` but is never called anywhere in the component (countdown is computed inline as `nextDep.mins - currentMins`).
- Pre-existing; not introduced by TICKET-020. Not covered by any ticket yet.

---

## 2026-06-12 — TICKET-022 implementation scan

**[AUTH-001] `JwtModule.register` uses `as any` for `expiresIn`**
- File: `backend/src/auth/auth.module.ts` line 16
- `process.env.JWT_EXPIRES_IN` is `string | undefined` which doesn't satisfy `@types/jsonwebtoken`'s branded `StringValue` type. Cast to `as any` to unblock the build. No runtime impact — the value is always a valid duration string when set. A future upgrade of `@nestjs/jwt` may resolve the type-narrowing.
- Not covered by any ticket yet.

**[AUTH-002] JWT secret read from `process.env` at module registration time (not via `ConfigService`)**
- File: `backend/src/auth/auth.module.ts` and `backend/src/auth/jwt.strategy.ts`
- `process.env.JWT_SECRET` is read directly rather than through `@nestjs/config`'s `ConfigService`. This works because `ConfigModule.forRoot({ isGlobal: true })` populates `process.env`, but it bypasses type-safe config validation. Future hardening would use `JwtModule.registerAsync` with `ConfigService`.
- Not covered by any ticket yet.

---

## 2026-06-12 — TICKET-021 implementation scan

**[TRIP-001] "Moja lokacija" sets tripFrom before geolocation resolves**
- File: `frontend/src/components/Elements/TripPlannerView.jsx` — `handleMyLocation()`
- When `currentLocation.lat` is null, `getCurrentLocation()` is called (async geolocation) but `setTripFrom({ lat: null, lng: null })` runs immediately. If the user taps "Pretraži rutu" before location resolves, `getClosestStop` returns null → silent `no_route` error with no indication that location is still loading.
- Related to pre-existing [STORE-002] race condition. Not covered by any ticket yet.

---

## 2026-06-13 — TICKET-023 implementation scan

**[ADMIN-001] `handleDeleteAll` deletes ALL day types, confirm message implies day-type scope**
- File: `frontend/src/components/Pages/Admin.jsx` line ~596
- `DELETE /lines-locations-departures/by-lines-location/:id` removes all departures for the lines_location regardless of day_type. The confirm dialog says "Obriši SVE polaske za ovu stanicu ({day_label})?" which implies only the active day type is affected — misleading. The backend service has no day_type filter.
- Not covered by any ticket yet.

**[ADMIN-002] Local `departures` variable shadows outer state in `handleBulkImport`**
- File: `frontend/src/components/Pages/Admin.jsx` line ~566
- Inside `DeparturesTab`, `handleBulkImport` declares `const departures = bulkText.split(...)` which shadows the `departures` state variable in the same component. Works at runtime due to closure scoping, but fragile.
- Not covered by any ticket yet.

**[ADMIN-003] MapContainer center not reactive in stop placement modal**
- File: `frontend/src/components/Pages/Admin.jsx` — `StopsTab` modal
- `MapContainer center={markerPos ?? [position.lat, position.lng]}` is only applied on initial mount (Leaflet MapContainer is uncontrolled). If the modal is opened for a stop that already has coordinates, the map center is correct on first open, but re-opening the modal for a different stop won't re-center the map. A `MapChangeView`-style component (like the public map uses) would fix this.
- Not covered by any ticket yet.

**[ADMIN-004] CRUD service `update()` methods return null if entity not found**
- Files: `backend/src/lines/lines.service.ts`, `backend/src/locations/locations.service.ts`, `backend/src/lines-locations-departures/lines-locations-departures.service.ts`
- After `repository.update(id, dto)`, the service calls `findOneBy({ id })` which returns `null` if the entity was deleted between the update and select calls (or if the id was invalid). No `NotFoundException` is thrown. Not a runtime risk with normal usage but worth noting.
- Not covered by any ticket yet.

---

## 2026-06-13 — TICKET-024 implementation scan

**[SURVEY-001] `simplify_tolerance` interpolated directly into SQL (low-risk injection vector)**
- File: `backend/src/survey/survey.service.ts` line ~113
- `ST_Simplify(raw_track, ${simplifyTolerance})` interpolates the tolerance directly into raw SQL. TypeScript types it as `number | undefined`, but without runtime validation a crafted non-numeric string body would produce malformed SQL. Class-validator is not installed; add a manual `parseFloat` and `isNaN` guard before using.
- Not covered by any ticket yet.

**[SURVEY-002] `SurveyCapture` submit has no error handling**
- File: `frontend/src/components/Pages/SurveyCapture.jsx` — `handleSubmit()`
- If `authFetch` for the submit call fails (network error or non-2xx), the component still navigates to the review page, where `session.raw_track` will be null and the map will be empty with no explanation.
- Not covered by any ticket yet.

**[SURVEY-003] Session track fetched from `existingRoute` using single result assumption**
- File: `frontend/src/components/Pages/SurveyReview.jsx` — `existingRoutePositions` memo
- `GET /lines-routes/:lineId` may return an array (if the line has multiple route segments / directions), but the memo accesses `existingRoute?.route?.coordinates` as if it's a single object. If the API returns an array, `existingRoute.route` will be undefined and no existing route is shown.
- Not covered by any ticket yet.

---

## 2026-06-17 — TICKET-026 implementation scan

**[IC-001] `InterCityRoute` client-side fetch has no error handling**
- File: `frontend/src/components/Pages/InterCityRoute.jsx` — `useEffect` block
- `fetchCorridorData(API_URL, ...)` is called without a `.catch()`. A network-level failure throws an unhandled promise rejection and the page silently stays empty with no error state or user message.
- Related to pre-existing [TIMETABLE-001]. Not covered by any ticket yet.

**[IC-002] `InterCityRoute` crashes on unknown `corridor` prop**
- File: `frontend/src/components/Pages/InterCityRoute.jsx` — `const config = CORRIDORS[corridor]`
- If `corridor` is not in the `CORRIDORS` config map, `config` is `undefined` and `config.title` throws on first render. Routes in `App.jsx` are hardcoded so this won't happen in normal usage, but a typo in App.jsx has no graceful fallback.
- Not covered by any ticket yet.

---

## 2026-06-25 — TICKET-029 implementation scan

**[SURVEY-004] `SurveyCapture` initial data fetch has no error handling**
- File: `frontend/src/components/Pages/SurveyCapture.jsx` lines 128–129
- Bare `fetch()` calls for `/lines` and `/locations` with no try/catch and no `.catch()`. A network failure silently keeps both arrays empty — the line selector renders with no options.
- Related to pre-existing [STORE-001]. Not covered by any ticket yet.

**[SURVEY-005] `SurveyReview` load function has no try/catch — infinite loading state on error**
- File: `frontend/src/components/Pages/SurveyReview.jsx` — `load()` inside `useEffect`
- `authFetch` and `fetch` calls have no outer try/catch. A network-level failure leaves `loading` true forever and the user sees a blank `#c0c0c0` screen with no message.
- Related to pre-existing [TIMETABLE-001]. Not covered by any ticket yet.
