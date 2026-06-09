# TICKET-002: Latin / Cyrillic Language Switcher

**Status:** Open  
**Priority:** Medium  
**Area:** Frontend

## Context

All backend entities store both `lat_name` (Latin) and `cyr_name` (Cyrillic) fields for lines, stops, and routes. The file `frontend/src/context/ScriptContext.js` exists as an empty stub. No UI toggle is wired up.

## What's missing

- `ScriptContext.js` — needs to provide `{ script, toggleScript }` where `script` is `'latin' | 'cyrillic'`
- Components that display names (`MapLineSwitcherItem`, stop popups, Header, About page) need to consume the context and switch between `lat_name` and `cyr_name`
- A toggle button — likely in the Header alongside the existing Locate Me button

## Acceptance criteria

1. Implement `ScriptContext` with React context + localStorage persistence
2. Wrap `App` (or `main.jsx`) with the provider
3. All visible place/line names switch when toggled
4. Default to Latin script
5. Toggle state survives page reload

## Notes

- Do not add a second Zustand slice for this — React context is sufficient for a UI-only preference
- Button styling should match the existing glassmorphic `Button` component in `components/UI/`
