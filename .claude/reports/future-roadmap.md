# ZR-Bus — Future Roadmap

*Generated: 2026-06-10*

---

## What the App Has Today

- Interactive map with bus routes and stops (React-Leaflet)
- Line switcher, closest-stop detection (Haversine), current location
- Departure schedules per stop (click to view HH:mm times)
- Dark/light theme, Latin/Cyrillic script switcher
- About page with live line list
- Footer with navigation
- NestJS backend with MariaDB, GIS route geometry

---

## Part 1 — User-Facing Features

### 1.1 "Next Bus" — Closest or Favourite Station

**What the user wants:** Open the app and instantly see when the next bus is coming, without manually clicking around.

**How to build it:**
- After geolocation resolves, auto-select the closest stop and show a *Next Bus* panel: sorted upcoming departures for the current time of day.
- This requires knowing the current time and filtering departures where `HH:mm > now`. Currently the `departure` column stores time-only strings (`"08:28:00"`) — this is enough to do time comparison in JS.
- **Favourite station:** Let users star a stop. Store the favourite stop ID in `localStorage`. On load, if a favourite exists, show next buses for it instead of the closest stop. One tap to toggle the star on any stop popup.

**Data gap:** The departure table has no `day_type` column, so the app cannot distinguish workday vs. weekend schedules. This is the most important schema change needed before this feature is genuinely useful. Add `day_type ENUM('workday', 'saturday', 'sunday')` to `lines_locations_departures`.

**Tickets needed:**
- `schema-day-type` — add `day_type` to departures table + seed data
- `next-bus-panel` — auto-showing next departures for closest/favourite stop

---

### 1.2 "Next Bus" Highlight on Stop Click

**What the user wants:** Click a stop on the map → the popup shows not just all times but the *next* departure highlighted.

**How to build it:**
- Already mostly there: the stop popup shows all departure times. Add logic in `Map.jsx` to compare each time string against `new Date()` and apply a different style to the first future departure.
- No backend changes needed — pure frontend sort + highlight.

**Ticket needed:** `highlight-next-departure` — quick frontend-only ticket, ~1 hour of work.

---

### 1.3 Schedule / Timetable Page

**What the user wants:** A dedicated page (e.g. `/red-voznje`) showing a full timetable — each line's stops in order, with departure times, so users can research offline.

**How to build it:**
- New route `/red-voznje` with a line selector at the top.
- For the selected line, fetch all stops in order (`stop_number` from `lines_locations`) and all departures for each stop.
- Render as a responsive table: rows = stops, columns = departure times (or vice versa, depending on the data shape).
- The `day_type` gap applies here too — without it, all times are shown in one undifferentiated list. Worth implementing after the schema fix.
- A print-friendly CSS variant would be useful for the "take a screenshot" use case.

**Ticket needed:** `timetable-page` — medium effort, depends on `schema-day-type`.

---

### 1.4 Other Standard Transit App Features (Priority Order)

| Feature | Why | Effort |
|---|---|---|
| **Live countdown** ("Bus in 4 min") | Core value — needs current time vs. departure time math | Low (once day_type exists) |
| **Multi-line stop view** | Some stops serve multiple lines — show all of them in the popup | Medium |
| **Search / autocomplete stops** | Users who know their stop name shouldn't need to pan the map | Medium |
| **Push notifications** | "Your bus leaves in 5 minutes" — requires PWA + service worker | High |
| **Trip planner** (A→B routing) | Biggest user value for non-regulars, hardest to build | Very high |
| **Offline mode / PWA** | Cache routes+schedules, work without network | High |
| **Real-time vehicle positions** | Would need GTFS-RT feed from the operator — likely unavailable | Blocked by data |

---

## Part 2 — Administration Panel

### 2.1 Core Admin CRUD

A protected web interface (separate route, e.g. `/admin`, behind a login) for managing:

- **Lines** — create/edit/delete a line, set number, name (lat+cyr), color, direction
- **Stops** — create/edit/delete a stop, set lat/lng (ideally by clicking on a map), set names
- **Line–Stop assignments** — reorder stops on a line (drag-and-drop `stop_number`), add/remove stops
- **Departures** — bulk import times (paste a list), edit individual times, set `day_type`

**Tech approach:**
- Add a `users` table with `role` (`admin` | `viewer`), password hash, JWT auth
- NestJS guards on admin-only endpoints
- React admin pages behind a route guard (redirect to `/login` if not authenticated)
- Use the existing `Card`/`Button` component library for the UI

---

### 2.2 Field Survey Mode ("Ride the Bus")

**The idea:** You physically ride a bus, tap your phone at each stop, and the app records the GPS coordinate and assembles the real stop positions and route geometry.

This is the most valuable feature for data quality — bus company data is often incomplete or wrong, and riding the route is the ground truth.

**How to build it:**

#### Mobile survey screen (`/admin/survey`)
1. Select the line you're riding.
2. Tap **"Start survey"** — begins recording a GPS track (polling `navigator.geolocation.watchPosition` every few seconds into an array).
3. At each stop, tap **"Mark stop"** — records the current GPS coordinate, prompts for the stop name (or selects from existing stops nearby).
4. Tap **"End survey"** — sends the track + stop markers to the backend.

#### Backend processing
- Store the raw GPS track as a `LineString` geometry (same SRID 4326 format already used in `lines_routes`).
- Store each marked stop as a candidate `Location` — admin can then review and merge with existing stops or create new ones.
- Offer a "simplify track" step: use the Douglas-Peucker algorithm (available in PostGIS as `ST_Simplify`) to reduce GPS noise before storing the final route geometry.

#### Review UI
- After a survey, show the recorded track on the map alongside the existing route (if any) for visual comparison.
- Buttons: "Use this track as the route", "Merge stops", "Discard".

**Data model additions:**
```sql
survey_sessions   id, line_id, user_id, started_at, ended_at, raw_track (LineString)
survey_stops      id, session_id, marked_at, coords (Point), candidate_name_lat, candidate_name_cyr
```

**Effort:** Large feature — 2–3 weeks. But the return is high: the current route geometry is described in the codebase as "kind of messy", and this is the only reliable way to fix it without depending on the operator.

---

### 2.3 Bulk Import / GTFS

If the bus company ever provides GTFS data (standard transit feed format), a one-time import script would populate stops, routes, and schedules automatically. This should be kept in mind as a migration path — the database schema should stay GTFS-compatible (stop lat/lng, trip headsigns, stop sequences) so an import wouldn't require a full rebuild.

---

## Schema Changes Needed (Summary)

| Change | Required for |
|---|---|
| `day_type ENUM` on `lines_locations_departures` | Next bus, timetable, live countdown |
| `users` table with JWT auth | Admin panel |
| `favourite_stops` (localStorage is fine short-term) | Favourite station feature |
| `survey_sessions` + `survey_stops` | Field survey mode |

---

## Suggested Ticket Order

1. `schema-day-type` — unlocks the most user value
2. `highlight-next-departure` — quick win, no schema needed
3. `next-bus-panel` — depends on day_type
4. `timetable-page` — depends on day_type
5. `admin-auth` — foundation for admin work
6. `admin-crud` — depends on admin-auth
7. `field-survey` — depends on admin-auth, biggest effort
