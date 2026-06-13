# TICKET-021: Trip Planner — A→B Routing ("Ruta" mode)

**Status:** Open
**Priority:** Low
**Area:** Frontend + Backend

## Context

The redesign reserves a **second tab in the search pill** — "Stanica" (stop) / "Ruta" (route) —
for an A→B trip planner. See `design-research-and-current-audit.md`, Part 3 → "How every roadmap
feature lands" ("Trip planner (A→B)"), and ticket **014**, which was explicitly built to leave
room in the pill for this second mode. The roadmap (`future-roadmap.md`, 1.4) flags this as the
**biggest user value for non-regulars** and the **hardest to build** ("Very high" effort).

The user picks an origin and a destination; the app returns one or more ranked itineraries
("take line 12 from Bagljaš, get off at Trg slobode") with walking to/from stops and total time —
the two-taps-to-a-ranked-route pattern from the Citymapper research in Part 1.

Depends on: **014** (search pill + autocomplete to enter A and B), **018** (`day_type` — so
departure times used in planning match the correct day), the bottom sheet (**009**) to render
results.

## What's missing

- A **"Ruta"** tab in the search pill alongside the existing "Stanica" mode (014), with two
  inputs: **Odakle** (from) and **Dokle** (to), each using the existing stop autocomplete; "use my
  location" as a from-shortcut; a swap (⇅) control
- A routing engine that, given origin/destination coordinates or stops, produces itineraries:
  walk → board line at stop X → ride to stop Y → walk, including transfers where needed
- Ranked results in the sheet (fastest first): per leg show line colour/number, board/alight
  stops, departure time, and total trip duration
- Selecting an itinerary highlights its legs on the map (reuse line route geometry + stop markers)
- Empty / no-route-found state, and a same-stop / no-service guard

## Acceptance criteria

1. The search pill has a working "Stanica" / "Ruta" toggle; "Ruta" reveals From/To inputs
2. From/To accept stops via autocomplete (014) and "my location" resolves as the origin
3. Submitting returns at least the direct-line itineraries between A and B (single line, no
   transfer) ranked by total time, using real departure times for the current day
4. Selecting a result draws its legs on the map and shows board/alight stops and total duration
5. Clear states for "no route found", same origin/destination, and outside service hours
6. Bilingual + dark/light; keyboard-accessible inputs

## Notes

- **Scope the algorithm deliberately — this is the hard part.** A full multi-transfer planner
  (RAPTOR / time-expanded graph) is a large undertaking. Recommend phasing:
  **Phase 1 (this ticket):** direct routes only — find lines whose ordered stops contain both A
  and B in the right sequence, compute ride time from the schedule, add walking to the nearest
  stop of each. This covers most trips in a small city and is achievable on the existing data.
  **Phase 2 (follow-up ticket):** one-transfer and multi-leg routing — split out separately.
- **Backend vs. frontend:** direct-route planning can run client-side over data already in the
  store (lines, stops with `stop_number` order, departures). A graph-based multi-transfer planner
  is better as a backend endpoint (e.g. `GET /trip?from=&to=&time=`) — note the boundary in the PR
  and don't over-build the backend for Phase 1.
- Walking distance/time can reuse the existing **Haversine** helper (`utils/helpers.js`) for a
  straight-line estimate; true pedestrian routing is out of scope.
- Depends on accurate stop ordering and route geometry — both are flagged as "kind of messy" in
  the roadmap; the **field survey** tooling (024) is what ultimately makes this trustworthy.
- Out of scope: real-time delays/vehicle positions (no GTFS-RT feed available).
