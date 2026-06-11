# TICKET-013: Stop Detail View — Multi-Line, Next Highlight, Day-Type Tabs

**Status:** Open
**Priority:** High
**Area:** Frontend

## Context

Tapping a stop on the map should swap the bottom sheet to a **Stop Detail** view that answers
everything about that stop at once. This single view delivers four roadmap features:
multi-line stop listing, next-departure highlight, live countdown, and day-type grouping. See
`design-research-and-current-audit.md`, Part 3 → "Stop detail".

Depends on: **009** (bottom sheet, incl. programmatic snap), **011** (favourites). Shares the
countdown helper from **012**.

## What's missing

- Tapping a stop on the map selects it and snaps the sheet to **Half**, showing Stop Detail
- Stop Detail header: stop name (bilingual), a **back** affordance, and a **favourite star** (★)
  bound to the favourites store (011)
- **Day-type tabs:** Radni dan / Subota / Nedelja (bilingual)
- For **every line** serving the stop: colour dot, line number, human destination ("→ Centar"),
  the **next departure highlighted** with a live countdown, and following times below it
- A "Ceo red vožnje za liniju N ›" link that routes to the timetable page (015) for that line
- Replaces the current absolute bottom-left stop info panel in `Map.jsx`

## Acceptance criteria

1. Tapping a stop opens Stop Detail in the sheet (snaps to Half) and shows that stop's data
2. All lines at the stop are listed (multi-line view), each with its own next-departure highlight
3. The next departure is visually distinct from following times and shows a countdown
4. Favourite star reflects and toggles the favourites store; persists across reload
5. Day-type tabs switch the displayed schedule
6. "Ceo red vožnje ›" navigates to the timetable page for the correct line
7. Bilingual + dark/light; graceful empty state when a line has no more departures today

## Notes

- **Backend dependency:** day-type tabs require the `day_type ENUM` column (roadmap
  `schema-day-type`). Until it exists, render a single "Sve" list instead of tabs, or disable
  the inactive tabs — degrade gracefully, do not block this ticket on the backend.
- The departure column is a time-only string (`"08:28:00"`) — keep using the existing
  `slice(0,5)` for HH:mm and the shared countdown helper for "X min".
- Remove the old `selectedStop` absolute panel markup from `Map.jsx` as part of this change.
