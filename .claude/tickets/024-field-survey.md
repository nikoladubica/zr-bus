# TICKET-024: Field Survey Mode — "Ride the Bus" GPS Capture

**Status:** Open
**Priority:** Low
**Area:** Backend + Frontend

## Context

The highest-leverage data-quality feature in the roadmap: an admin physically **rides a bus**,
taps the phone at each stop, and the app records the GPS track and real stop positions —
ground-truth data to fix route geometry and stop coordinates without depending on the operator.
See `future-roadmap.md` Part 2.2 and the report's "Admin / field survey" line in Part 3. The
current route geometry is described as "kind of messy"; riding the route is the only reliable fix,
and accurate geometry/stop order is also what makes the trip planner (021) trustworthy.

This is the roadmap item `field-survey` — the **largest** effort in the admin arc (estimated
2–3 weeks).

Depends on: **022** (admin auth — survey is an admin tool). Related: **023** (the candidate stops
this produces are reviewed/merged with the CRUD tooling).

## What's missing

### Mobile survey screen (`/admin/survey`)
- Select the line being ridden
- **"Start survey"** — begins recording a GPS track via `navigator.geolocation.watchPosition`
  (polling every few seconds into an array)
- **"Mark stop"** at each stop — records the current coordinate and prompts for the stop name
  (Latin + Cyrillic) or selects a nearby existing stop
- **"End survey"** — sends the track + stop markers to the backend
- A live on-screen indicator of points captured / stops marked; resilient to the screen sleeping

### Backend
- `survey_sessions` — `id`, `line_id`, `user_id`, `started_at`, `ended_at`, `raw_track`
  (`LineString`, SRID 4326 — same format as `lines_routes`)
- `survey_stops` — `id`, `session_id`, `marked_at`, `coords` (`Point`), `candidate_name_lat`,
  `candidate_name_cyr`
- Endpoints (admin-guarded) to create a session, append/submit the track + marked stops, and
  fetch a session for review
- Optional **"simplify track"** step using `ST_Simplify` (Douglas–Peucker) to reduce GPS noise
  before the geometry is adopted as a route

### Review UI
- After a survey, render the recorded track on the map alongside the existing route (if any) for
  visual comparison
- Actions: **"Use this track as the route"** (writes `lines_routes` geometry), **"Merge stops"**
  (reconcile candidates with existing `locations` via the CRUD tooling, 023), **"Discard"**

## Acceptance criteria

1. An authenticated admin can start a survey for a line, see live GPS capture, and mark stops
2. Marked stops capture coordinates + a bilingual candidate name (or link to an existing stop)
3. Ending the survey persists a `survey_session` with the raw track and its `survey_stops`
4. The recorded track stores as a valid `LineString` (SRID 4326), consistent with `lines_routes`
5. A review screen shows the recorded track over the existing route and offers
   Use-as-route / Merge-stops / Discard
6. "Use as route" updates the line's geometry; "Merge stops" reconciles candidates with existing
   stops; "Discard" removes the session
7. All survey endpoints are admin-guarded (022)

## Notes

- **Mobile GPS realities:** `watchPosition` drains battery and pauses when the screen locks —
  warn the user, keep the screen awake during a survey (Wake Lock API where available), and buffer
  points so a brief signal loss doesn't end the session. Consider letting an interrupted survey
  resume or submit what was captured.
- Keep geometry handling consistent with the existing GIS approach — store as MariaDB geometry,
  return via `ST_AsGeoJSON` like the current `lines-routes` queries.
- `ST_Simplify` tolerance should be tunable; over-simplifying loses real road shape. Make the
  simplify step a reviewable preview, not automatic-on-save.
- This is a large feature — consider landing it in stages (capture → persist → review/adopt) as
  separate PRs under this ticket if it grows too big for one.
- A future **GTFS import** path (roadmap 2.3) is an alternative data source if the operator ever
  publishes a feed — keep the schema GTFS-compatible, but that import is out of scope here.
