# TICKET-001: Departure Schedules UI

**Status:** Open  
**Priority:** High  
**Area:** Frontend + Backend

## Context

The database table `lines_locations_departures` and the backend endpoint `GET /lines-locations-departures` exist but are incomplete. The frontend has no UI for displaying when the next bus departs from a stop.

## What's broken / missing

- `LinesLocationsDeparturesService.findAll()` has its `relations` options commented out (backend/src/lines-locations-departures/lines-locations-departures.service.ts lines 17–18), so related data is not loaded
- No frontend component or store action fetches or displays departures
- No API utility entry for the departures endpoint in `frontend/src/utils/api.js`

## Acceptance criteria

1. Fix the backend service to load `linesLocations` relation so departures return with stop context
2. Add `LINES_LOCATIONS_DEPARTURES` to `utils/api.js`
3. Add Zustand action `fetchDepartures(lineLocationId)` to the store
4. Show upcoming departures when a user taps/clicks a bus stop marker on the map (popup or slide-up panel)
5. Display times in HH:mm format; group by workday / Saturday / Sunday if the data supports it

## Notes

- Departure entity field: `departure` (timestamp), FK `lines_locations_id`
- Consider showing only future departures relative to current time (client-side filter)
