# TICKET-006: About Page Content

**Status:** Open  
**Priority:** Low  
**Area:** Frontend

## Context

The route `/o-nama` (About) exists and renders, but appears to have placeholder content. This is the place to explain what ZR-Bus is, list bus lines, and provide contact or data-source information.

## Acceptance criteria

1. Page describes the project: what it is, what city it covers, and data sources
2. Lists available bus lines with their colors (can fetch from `/lines` or hardcode)
3. Credits any open data sources used for routes/stops
4. Mobile-friendly layout consistent with the rest of the app
5. Bilingual-ready: names should consume `ScriptContext` once TICKET-002 is done

## Notes

- Keep it simple — one scrollable column, no complex layout needed
- The `Card` UI component from `components/UI/` is suitable for content sections
