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

**[HOME-001] Hardcoded mobile MapLineSwitcher offset in Home.jsx**
- File: `frontend/src/components/Pages/Home.jsx`
- The mobile overlay for `<MapLineSwitcher />` uses `top-[88px]` — a hardcoded offset that assumes a fixed header height. Will break if the header height changes.
- Interim state; will be resolved when TICKET-016 (header/settings redesign) replaces the Header overlay.

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
