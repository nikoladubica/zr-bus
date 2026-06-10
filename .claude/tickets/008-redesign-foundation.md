# TICKET-008: Redesign Foundation — App Shell & Full-Bleed Map

**Status:** Open
**Priority:** High
**Area:** Frontend

## Context

Per `.claude/reports/design-research-and-current-audit.md`, the app is currently built like a
"website that contains a map" — a vertically scrolling stack of glassmorphic cards with the map
boxed in a 480px container. The redesign makes the **map the hero**: a full-bleed base layer
with UI floating on top, mobile-first and desktop-capable.

This ticket is the structural foundation the rest of the redesign (009–017) builds on. It does
**not** yet add the bottom sheet (009) or new content — it converts the shell.

## What's missing

- App shell where the map fills the entire viewport as the base layer
- The page no longer scrolls; overlay UI sits on top of the map
- Responsive frame: on mobile the overlay is full-width; on desktop it reserves a left column
  (~380px) for the future side panel (009) with the map filling the rest
- Design tokens: define the app accent colour, surface opacities, and spacing scale as
  reusable Tailwind utilities / CSS variables (more opaque surfaces for text legibility, keep
  glass only for floating controls)
- Remove the marketing `h1` headline and the bottom info-hint card from `Home.jsx` (they belong
  to landing-page thinking, not a utility app)

## Acceptance criteria

1. Map renders full-bleed (100% width/height of the viewport) on mobile and desktop
2. No page-level scroll; the app occupies exactly the viewport
3. Desktop reserves a left column for the side panel; mobile is full-width with overlay UI
4. Existing features still work: line route rendering, stops, current location, theme, script
5. Theme (dark/light) and script (Latin/Cyrillic) continue to function
6. Loading and error states (TICKET-007) still display correctly over the new shell

## Notes

- `Map.jsx` currently wraps the `MapContainer` in a `Card` with `h-120` — this boxing is
  removed here.
- Keep `MapChangeView`, the tile-layer theme switching, and existing markers intact.
- The floating search pill, settings button, and "Locate me" FAB are introduced in later
  tickets (014, 016) — for now the existing Header controls can remain temporarily or be moved
  into a minimal top overlay; flag the interim choice in the PR.
- Do not change any backend or store data-fetching logic.
