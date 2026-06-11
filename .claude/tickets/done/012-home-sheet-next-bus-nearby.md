# TICKET-012: Home Sheet — Next Bus, Favourites & Nearby Stops

**Status:** Open
**Priority:** High
**Area:** Frontend

## Context

This is the payoff of the redesign: the **zero-tap answer**. When the app opens and location
resolves, the bottom sheet's Peek state shows the next bus for the closest (or favourite) stop,
with a live countdown. See `design-research-and-current-audit.md`, Part 3 → "Default content".

Depends on: **009** (bottom sheet), **011** (favourites store). Benefits from **013**'s shared
countdown helper — coordinate so the helper is shared, not duplicated.

## What's missing

- **Peek content — "Sledeći autobus":** closest stop (or a chosen favourite) name + distance,
  the next departure per nearest line shown large with a **live countdown** ("▶ 4 min"), and the
  following times smaller beside it
- **"Omiljene" section** (Half/Full): the user's favourite stops, each with its next departure
  and countdown (consumes 011)
- **"Stanice u blizini" section** (Half/Full): nearby stops sorted by distance, each showing the
  lines that serve it and the soonest departure
- A shared **live-countdown helper** (`utils/`) that turns an `HH:mm` departure string + current
  time into a "X min" / "sad" label, reused across Peek, Favourites, Nearby, and Stop Detail
- A favourite star (★) on the Next Bus card to favourite the closest stop in one tap

## Acceptance criteria

1. On load, after geolocation resolves, the Peek sheet shows the closest stop and its next
   departure with a countdown — no taps required
2. If the user has favourites, the closest favourite can drive the Next Bus card (define and
   document the rule: closest stop by default, favourite if within range / explicitly chosen)
3. "Omiljene" lists favourite stops with next departures; empty state handled gracefully
4. "Stanice u blizini" lists nearby stops by distance with per-line soonest departures
5. Countdown values are correct relative to the device clock and update over time
6. Bilingual + dark/light throughout; handles "no upcoming departures today" gracefully

## Notes

- Closest-stop math already exists (`getClosestStation`, Haversine in `helpers.js`) — reuse it.
- **Backend dependency:** trustworthy next-departure math is limited by the missing `day_type`
  schema (roadmap `schema-day-type`). Until it lands, compute against the full departure list
  and note the limitation; the UI should not break.
- Keep the countdown helper pure and unit-test-friendly.
