# TICKET-026: Intercity Routes — Novi Sad / Beograd / Kikinda ↔ Zrenjanin

**Status:** Open
**Priority:** High
**Area:** Backend + Frontend (+ SEO)

## Context

Google Search Console shows our current top rising query is **`autobus novi sad zrenjanin`** — a
high-intent intercity search the app does not serve today. ZR-Bus is currently a **city** transit app
scoped entirely to Zrenjanin (default map center `45.38°N, 20.39°E`, "nearest stop" Haversine, NetBus
city lines). To capture this demand we want to expand to cover the three obvious intercity corridors:

- **Novi Sad ↔ Zrenjanin** (the trending query)
- **Beograd ↔ Zrenjanin**
- **Kikinda ↔ Zrenjanin**

This is primarily an **SEO + content** play (per-corridor landing pages that rank for
`autobus <grad> zrenjanin` / `<град> зрењанин аутобус`), built on real schedule data. It is the regional
companion to the SEO work in **[TICKET-025]** and reuses that ticket's prerender + per-route head
infrastructure.

The challenge is that the current schema and several frontend behaviours **assume everything is in
Zrenjanin**. Intercity stops are 40–90 km away and span multiple cities and multiple operators (city
lines are NetBus; intercity corridors are run by carriers such as Gea Tours, Severtrans, Lasta, etc.).
We must extend the model to carry city/operator/category **without breaking** the existing city app.

## Approach (decision)

**Reuse the existing `lines` / `locations` / `lines_locations` / `lines_routes` /
`lines_locations_departures` tables** rather than introducing a parallel intercity schema. An intercity
line is still "a line with ordered stops, a route geometry, and departures" — the only new concepts are
**category** (city vs intercity), **operator**, and **which city a stop is in**. Add columns; don't fork
the model.

## What needs to change

### 1. Backend — schema additions

**Files:** `backend/src/lines/lines.entity.ts`, `backend/src/locations/locations.entity.ts`,
`backend/src/lines-locations-departures/lines-locations-departures.entity.ts`, plus a SQL migration
(follow the convention established by TICKET-018 — a plain SQL migration file; do **not** rely on
`synchronize` in production).

- `lines.category ENUM('city','intercity') NOT NULL DEFAULT 'city'` — backfill all existing rows to
  `'city'`. This is the single switch that keeps the city app's behaviour unchanged.
- `lines.operator VARCHAR(255) NULL` — e.g. `NetBus`, `Gea Tours`, `Severtrans`, `Lasta`. Backfill
  existing city lines to `NetBus`.
- `locations.city VARCHAR(255) NOT NULL DEFAULT 'Zrenjanin'` — tag every stop with its locality so the
  Zrenjanin-only assumptions (nearest-stop, map center) can be scoped. Backfill existing stops to
  `'Zrenjanin'`.
- `lines_locations_departures.price DECIMAL(6,2) NULL` — intercity tickets have a fare; city does not.
  Optional to populate, but the column should exist so the UI can show it when present.
- Reuse the existing `day_type` ENUM from TICKET-018 for intercity timetables (workday / saturday /
  sunday / everyday) — no change needed there.

### 2. Backend — API

**Files:** `backend/src/lines/lines.controller.ts` + `lines.service.ts` (mirror in the routes/locations
services as needed).

- `GET /lines` must return the new `category` and `operator` fields.
- Support filtering: `GET /lines?category=city` and `GET /lines?category=intercity`. **Default behaviour
  of `GET /lines` (no param) must remain "city lines only"** so the existing frontend keeps working
  untouched until it opts in — OR return all and have the frontend filter; pick one and state it in the
  PR, but the city map must NOT start showing intercity lines by accident.
- Add an intercity-oriented lookup so a corridor page can be served by origin/destination, e.g.
  `GET /lines/intercity?from=novi-sad&to=zrenjanin` returning the matching line(s) with operator,
  stops, and departures. Slugs derived from `locations.city` (Latin, lowercased, hyphenated).
- `GET /locations` should include `city` so the frontend can group/scope stops.

### 3. Frontend — keep the city app scoped to Zrenjanin

**Files:** `frontend/src/store/client/useStore.js`, `frontend/src/utils/helpers.js`,
`frontend/src/components/Elements/Map.jsx`, `frontend/src/components/Elements/MapLineSwitcher.jsx`.

These are the places that silently assume Zrenjanin and **will break** if intercity data flows in
unfiltered:

- **Nearest-stop (`helpers.js` Haversine + `getCurrentLocationWithRecenter`)** must only consider
  Zrenjanin city stops, otherwise a stop in Beograd could be returned as "nearest" or skew results.
  Scope it to `category === 'city'` / `city === 'Zrenjanin'`.
- **Line switcher** must separate **City lines** from **Intercity** (e.g. a tab/group), so the city map
  isn't polluted by three long regional polylines.
- **Map view** for an intercity line spans two cities — use **fit-bounds to the route geometry**
  instead of the fixed Zrenjanin center/zoom when an intercity line is active.

### 4. Frontend — intercity corridor pages (the SEO payload)

**Files:** new page component(s) under `frontend/src/components/Pages/`, routes in
`frontend/src/App.jsx`, head management via the mechanism added in TICKET-025.

- Add public routes, one per corridor, with **keyword-as-URL** slugs:
  - `/autobus/novi-sad-zrenjanin`
  - `/autobus/beograd-zrenjanin`
  - `/autobus/kikinda-zrenjanin`
  - (and reverse direction or a combined bidirectional page — see Notes)
- Each page renders, in **prerendered/indexable HTML** (not client-only): corridor title, operator(s),
  the departure timetable (both directions, grouped by `day_type`), price if present, route on the map
  (fit-bounds), and intermediate stops.
- Per-route metadata following the TICKET-025 table pattern. Target phrases must appear in the
  `<title>` and meta description, Latin + Cyrillic:

| Route | `<title>` | Meta description (must contain target phrase) | Structured data |
|---|---|---|---|
| `/autobus/novi-sad-zrenjanin` | `Autobus Novi Sad — Zrenjanin: red vožnje i cene \| ZR Bus` | "Red vožnje autobusa Novi Sad – Zrenjanin: polasci, prevoznik i cena karte." | `BusTrip`/`Schedule` + `BreadcrumbList` |
| `/autobus/beograd-zrenjanin` | `Autobus Beograd — Zrenjanin: red vožnje i cene \| ZR Bus` | "Red vožnje autobusa Beograd – Zrenjanin: polasci, prevoznik i cena karte." | `BusTrip`/`Schedule` + `BreadcrumbList` |
| `/autobus/kikinda-zrenjanin` | `Autobus Kikinda — Zrenjanin: red vožnje i cene \| ZR Bus` | "Red vožnje autobusa Kikinda – Zrenjanin: polasci, prevoznik i cena karte." | `BusTrip`/`Schedule` + `BreadcrumbList` |

- Add these corridor URLs to the **sitemap generator** and the prerender list from TICKET-025.

## Acceptance criteria

1. `lines` has `category` ('city'|'intercity') and `operator`; `locations` has `city`;
   `lines_locations_departures` has `price`. All existing rows backfilled (`city`, `'Zrenjanin'`;
   `operator`, `NetBus`) with no NULLs in NOT NULL columns. Migration file committed.
2. `GET /lines` returns `category` + `operator`; `?category=` filtering works; the **default** response
   does not surface intercity lines into the existing city map.
3. The Novi Sad ↔ Zrenjanin corridor is seeded end-to-end (line + stops in both cities + route geometry +
   real departures) and is reachable via `GET /lines/intercity?from=novi-sad&to=zrenjanin`.
4. Nearest-stop and the city map are **unchanged** for city usage — verified that an intercity stop is
   never returned as the user's nearest stop, and the city line switcher still lists only NetBus city
   lines (intercity grouped separately).
5. `/autobus/novi-sad-zrenjanin` (and the two siblings) prerender to static HTML containing a real,
   indexable timetable + operator + price text, each with a unique `<title>`/description from the table
   above, and validate in the Google Rich Results Test.
6. The three corridor URLs appear in `sitemap.xml` with `<lastmod>`.

## Notes

- **Data sourcing is the real cost, not the code.** Schedules/operators/prices for Novi Sad, Beograd, and
  Kikinda corridors must be gathered (operator sites, AS Zrenjanin / AS Novi Sad / BAS Beograd station
  timetables) and entered — likely via the future admin CRUD (TICKET-023). This ticket builds the
  capability and seeds **at least the Novi Sad corridor**; the other two can follow once data is in hand.
  Keep `price`/timetables clearly marked with a "last verified" notion in the future if data drifts.
- **Direction handling:** decide between (a) two `lines` rows per corridor (NS→ZR and ZR→NS), consistent
  with the existing A/B `direction` model, or (b) one bidirectional corridor page showing both columns.
  Option (b) is better for SEO (one strong page per corridor) — recommend a single page that queries both
  directions. State the choice in the PR.
- **Don't hardcode the production domain** in canonical/OG/sitemap URLs — reuse the env-derived base URL
  from TICKET-025.
- Reuse `ScriptContext` for Latin/Cyrillic; corridor names and SERP queries exist in both scripts
  (`novi sad zrenjanin` / `нови сад зрењанин`).
- **Out of scope:** live/real-time intercity tracking, ticket purchasing/booking, and operator API
  integrations. This is static schedule data + landing pages only.
- Depends on / pairs with: **TICKET-025** (prerender + per-route head + sitemap infra), **TICKET-018**
  (`day_type`), and benefits from **TICKET-023** (admin CRUD for data entry).
