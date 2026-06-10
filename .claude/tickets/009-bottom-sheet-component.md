# TICKET-009: Bottom Sheet Component (Mobile) + Side Panel (Desktop)

**Status:** Open
**Priority:** High
**Area:** Frontend

## Context

The redesign's central interaction surface is a **draggable bottom sheet** on mobile that
becomes a **fixed side panel** on desktop (see `design-research-and-current-audit.md`, Part 3).
This ticket builds the reusable container only — the content that goes inside it comes from
tickets 012 (home) and 013 (stop detail).

Depends on: **008** (app shell).

## What's missing

- A `BottomSheet` component that, on mobile, is a gesture-draggable panel with three snap
  points:
  - **Peek** (~18% of viewport height) — default on load
  - **Half** (~55%)
  - **Full** (~92%)
- Snap behaviour: dragging the grab handle and releasing snaps to the nearest point
- On desktop (≥ the breakpoint reserved in 008), the same component renders as a **persistent
  left side panel** (~380px) — no dragging, always "open"
- A grab handle affordance at the top on mobile
- The component accepts arbitrary children (content is supplied by other tickets) and exposes a
  way to programmatically set the snap point (e.g. tapping a stop snaps to Half — used by 013)
- Sheet surface is more opaque than the current glass cards for text legibility; theme-aware
  (dark/light)

## Acceptance criteria

1. Mobile: sheet is draggable and snaps cleanly to Peek / Half / Full
2. Mobile: content inside the sheet scrolls when it exceeds the sheet height (at Full)
3. Desktop: sheet renders as a fixed left side panel with the same children
4. The current snap point is controllable from outside the component (for 013's "snap to Half
   on stop tap")
5. Works in both dark and light themes; respects safe areas on mobile
6. Does not block map interaction when in Peek state (map remains pannable above the sheet)

## Notes

- Prefer a small, well-maintained library (e.g. a React bottom-sheet package) over a custom
  gesture implementation, unless the team prefers zero new deps — flag the choice in the PR.
- The "Locate me" FAB (introduced around 008/016) must sit visually above the sheet's Peek
  state — coordinate z-index.
- This is a pure container/interaction ticket: ship it with placeholder children so it can be
  reviewed in isolation.
