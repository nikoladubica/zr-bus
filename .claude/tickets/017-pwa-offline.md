# TICKET-017: PWA — Installable & Offline Caching

**Status:** Open
**Priority:** Low
**Area:** Frontend

## Context

The app is mobile-first and used on the move, often with poor connectivity. The roadmap calls
for PWA support so users can install it to the home screen and have routes/schedules available
offline. This is the final piece of the redesign arc.

Depends on: the redesign shell (008) being in place so the installed app looks right.

## What's missing

- PWA manifest (name, icons, theme colour, display: standalone, start URL) — reuse the existing
  `zrbus_logo` assets for icons
- A service worker that caches the app shell and the static route/stop/schedule data so the map
  and timetables work offline (or degrade gracefully)
- "Add to home screen" installability on mobile
- Sensible cache strategy: app shell cache-first; data stale-while-revalidate so users see the
  last-known schedule offline and fresh data when online

## Acceptance criteria

1. App is installable (passes basic PWA installability: manifest + service worker + HTTPS)
2. Installs to the home screen with correct name, icon, and standalone display
3. With the network off after a first successful load, the map shell and last-known
   routes/schedules still render
4. When back online, cached data refreshes without a manual reload
5. No regression to normal online behaviour

## Notes

- Vite has first-class PWA support via `vite-plugin-pwa` — preferred over hand-rolling a service
  worker; flag the dep in the PR.
- **Push notifications** ("Podseti me" / "your bus leaves in 5 min") are a separate, larger
  effort (roadmap) and are **out of scope** here — this ticket is installability + offline only.
- Be careful caching map tiles (third-party Stadia/Carto) — respect their usage terms; caching
  app data and shell is the priority, not bulk tile caching.
