# TICKET-010: Line Switcher Redesign — Colour Chips & Human Destinations

**Status:** Open
**Priority:** Medium
**Area:** Frontend

## Context

The current `MapLineSwitcherItem.jsx` is a custom pill that expands to reveal direction "A" / "B"
with rotating arrows. The audit (`design-research-and-current-audit.md`, Part 2) found this is a
control users must *learn*, and that exposing raw "A"/"B" instead of human destinations is
unintuitive.

Depends on: **008** (app shell). Independent of the bottom sheet.

## What's missing

- Replace the expanding A/B pill with a **horizontal, scrollable row of colour-coded line
  chips** (one chip per line number, using `hex_color`)
- Direction is no longer shown as "A"/"B". Instead, when a line is selected, the direction is
  presented as a **human destination** — e.g. "→ Centar" / "→ Bagljaš" — derived from the
  line's `lat_name` / `cyr_name` (bilingual via `ScriptContext`)
- A clear way to flip direction for bidirectional lines (e.g. a segmented toggle or a
  swap/⇄ control labelled with the destination, not a letter)
- Active line chip is visually distinct (border/elevation), accessible tap targets

## Acceptance criteria

1. All lines appear as colour chips in a horizontally scrollable row
2. Selecting a chip filters the map to that line (same behaviour as today's `filterLineById`)
3. For bidirectional lines, the user can switch direction and sees a **destination name**, not
   "A"/"B"
4. Bilingual: destination labels follow the active script (Latin/Cyrillic)
5. Active state is obvious; works in dark and light themes
6. Horizontal overflow scrolls smoothly on touch and with a trackpad/mouse on desktop

## Notes

- The store currently keys bidirectional lines as two entries sharing `line_id` per pair with
  `direction` "A"/"B" (`createLineSlice.js`). Map "A"/"B" to the two destination names rather
  than inventing new data.
- Keep the colour dot/swatch — it is the app's strongest existing visual system.
- This replaces `MapLineSwitcher.jsx` + `MapLineSwitcherItem.jsx`; remove the dead
  rotating-arrow logic.
