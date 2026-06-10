# TICKET-015: Timetable Page (`/red-voznje`)

**Status:** Open
**Priority:** Medium
**Area:** Frontend

## Context

Users want to research full schedules — every stop on a line with its departure times — in a
table they can scan or screenshot. The roadmap and audit both call for a dedicated timetable
page, reached from Stop Detail's "Ceo red vožnje ›" link and from navigation.

Depends on: **008** (shell/design system). Linked from **013**.

## What's missing

- New route `/red-voznje` with a line selector at the top (reuse the colour-chip switcher from
  010 where practical)
- For the selected line: stops in order (`stop_number`) with their departure times, rendered as
  a responsive, scannable table
- **Day-type tabs** (Radni dan / Subota / Nedelja), bilingual
- A print/screenshot-friendly layout (clean contrast, no floating chrome over the table)
- Reachable from the Stop Detail "Ceo red vožnje za liniju N ›" link, pre-selecting that line

## Acceptance criteria

1. `/red-voznje` renders and is navigable from Stop Detail (pre-selecting the line) and from
   app navigation
2. Selecting a line shows its stops in order with departure times in a readable table
3. Day-type tabs switch the schedule shown
4. Layout is responsive: usable on a phone and on desktop; legible enough to screenshot
5. Bilingual stop/line names + dark/light support

## Notes

- **Backend dependency:** day-type tabs need the `day_type` schema (roadmap `schema-day-type`).
  Until it lands, show a single combined schedule and hide/disable the tabs — degrade
  gracefully.
- Data is available via existing endpoints (`lines-locations/:lineId`, departures) — no new
  backend needed for the single-schedule version.
- Consider a sticky header row / first column so stop names stay visible while scrolling times.
