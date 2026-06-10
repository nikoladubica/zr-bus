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

**[DATA-001] Departure `departure` column is TIME not TIMESTAMP**
- Backend entity declares `@Column({ type: 'timestamp' })` but the DB returns `"08:28:00"` (time-only string, no date).
- Day-type grouping (Radni dan / Subota / Nedjelja) is not possible without a separate `day_type` field or a date-aware timestamp.
- Frontend now correctly slices the string (`ts.slice(0, 5)`) to show HH:mm. Grouping was removed as there's no day data.
- If schedule grouping is needed in future, the entity/column type needs a `day_type` column (e.g. `ENUM('workday','saturday','sunday')`) or the column must store full datetime values.
- Not covered by any ticket yet.
