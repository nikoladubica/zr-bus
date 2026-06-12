# TICKET-023: Admin Panel — Core CRUD (Lines, Stops, Assignments, Departures)

**Status:** Open
**Priority:** Medium
**Area:** Frontend + Backend

## Context

With auth in place (022), build the protected `/admin` interface for managing the app's core data
without touching the database by hand. See `future-roadmap.md` Part 2.1. This is the roadmap item
`admin-crud`. Today every line, stop, schedule, and route assignment is edited directly in
MariaDB — the admin panel replaces that with a UI.

The `/admin` area reuses the design system (`Card`/`Button`, theme) but is a separate
desktop-oriented layout, **not** part of the public bottom-sheet shell (008).

Depends on: **022** (auth + route guard + protected endpoints). Day-type editing builds on **018**.

## What's missing

- **Write endpoints** (POST/PATCH/DELETE) behind the admin guard for each entity, following the
  existing repository pattern and complementing today's read-only GET endpoints:
  - **Lines** — create/edit/delete: number, name (Latin + Cyrillic), colour, direction
  - **Stops (locations)** — create/edit/delete: lat/lng, names; ideally set position by clicking a
    map
  - **Line–stop assignments (`lines_locations`)** — add/remove stops on a line and **reorder**
    them (drag-and-drop `stop_number`)
  - **Departures** — edit individual times, **bulk-paste** a list of times, set `day_type` (018)
- **Admin React pages** under `/admin/*` behind the route guard (022), using the component library
- List + edit forms per entity with validation and confirm-on-delete
- Sensible feedback (success/error toasts, loading states) reusing patterns from ticket 007

## Acceptance criteria

1. Authenticated admins can create, edit, and delete **lines**, with bilingual names and colour
2. Admins can create/edit/delete **stops**, setting lat/lng (map-click placement preferred)
3. Admins can add/remove stops on a line and reorder them; the new `stop_number` order persists
   and is reflected in the public app
4. Admins can edit departures, including **bulk paste** of times and setting `day_type`
5. All write endpoints reject unauthenticated/insufficient-role requests (401/403 via 022 guards)
6. Destructive actions confirm before executing; validation errors are shown clearly
7. Changes made in admin are immediately visible in the public app after refresh
8. No regression to the public read-only API

## Notes

- Mirror the existing module structure (`lines`, `locations`, `lines-locations`,
  `lines-locations-departures`) — add the controller write-methods and service logic alongside the
  current read methods rather than new modules where possible.
- Reordering: persist `stop_number` as a contiguous sequence on save; decide whether reordering is
  a batch PATCH of affected rows and note it in the PR.
- Reuse the **Leaflet** map already in the app for stop placement — click to set lat/lng — so the
  admin doesn't type coordinates.
- Route geometry editing (drawing/replacing the `LineString`) is **out of scope** here — that is
  better captured by the field survey tooling (024), which produces real geometry from a ride.
- Bilingual fields are required everywhere a name exists (Latin + Cyrillic), consistent with the
  public app.
