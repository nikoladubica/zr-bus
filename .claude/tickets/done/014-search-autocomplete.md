# TICKET-014: Stop & Line Search with Autocomplete

**Status:** Open
**Priority:** Medium
**Area:** Frontend

## Context

Users who already know their stop or line shouldn't have to pan the map. The audit lists search
with autocomplete as a standard transit-app pattern that's currently missing. The search entry
point is the **floating search pill** at the top of the redesigned shell.

Depends on: **008** (shell), **009** (sheet), **013** (selecting a result opens Stop Detail).

## What's missing

- A floating search pill at the top of the app ("Pretraži stanicu / liniju")
- Focusing it expands the sheet to **Full** and shows a search field with results
- Autocomplete over **stops** (by name, bilingual) and **lines** (by number/name)
- Selecting a **stop** result → centres the map on it and opens Stop Detail (013)
- Selecting a **line** result → filters the map to that line (same as the line switcher)
- Recent searches and/or quick access to favourites in the empty/initial search state

## Acceptance criteria

1. Search pill is reachable from the main screen on mobile and desktop
2. Typing filters stops and lines live (debounced), matching against both Latin and Cyrillic
   names regardless of active script
3. Selecting a stop result recentres the map and opens its Stop Detail
4. Selecting a line result filters the map to that line
5. Clear empty state (e.g. recent searches / favourites) and "no results" state
6. Bilingual + dark/light; keyboard-accessible (enter to select, escape to close)

## Notes

- Search over the data already in the store (lines + stops) — no new backend endpoint needed.
- Normalise diacritics/script for matching so "Bagljas", "Bagljaš", and "Багљаш" all match.
- Reserve space in the pill for a future second mode ("Stanica" / "Ruta") for the trip planner
  (roadmap) — out of scope here, but don't design the pill so it can't accommodate a toggle.
