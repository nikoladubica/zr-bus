# TICKET-011: Favourite Stops — Store & Persistence Layer

**Status:** Open
**Priority:** Medium
**Area:** Frontend

## Context

Regular commuters ride the same stops every day. The audit and roadmap both call out
**favourite stops** as a core missing feature. This ticket builds the data/persistence layer
only; the UI that consumes it lives in 012 (Favourites section + Next Bus star) and 013 (Stop
Detail star).

Independent ticket — can be built in parallel with 008–010.

## What's missing

- `favourites` state in the Zustand store: an array of favourite stop location IDs
- Actions: `addFavourite(locationId)`, `removeFavourite(locationId)`, `toggleFavourite(locationId)`,
  and a selector/helper `isFavourite(locationId)`
- Persistence to `localStorage` (read on init, write on every change), mirroring the existing
  pattern used by `ScriptContext` / `ThemeContext`
- Resilient to malformed/empty localStorage (fall back to `[]`)

## Acceptance criteria

1. Store exposes `favourites` plus add/remove/toggle/isFavourite
2. Favourites survive a page reload (localStorage round-trip)
3. Toggling a favourite updates state immediately and persists
4. No duplicate IDs; removing a non-existent ID is a no-op
5. Corrupt or absent localStorage value degrades gracefully to an empty list

## Notes

- Store the minimal identifier (location ID) — resolve to full stop objects at render time from
  existing `linesLocations` / lines data, so favourites stay valid as data updates.
- This is the localStorage-only short-term approach noted in the roadmap; a backend
  `favourite_stops` table is out of scope here.
- Keep it in `createLineSlice.js` or a new small slice — match the project's single-store
  convention.
