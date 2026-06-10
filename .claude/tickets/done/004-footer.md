# TICKET-004: Footer Component

**Status:** Open  
**Priority:** Low  
**Area:** Frontend

## Context

`frontend/src/components/Elements/Footer/` directory exists with a `Footer.jsx` file, but it is commented out in `App.jsx`. The About page (`/o-nama`) also appears to have placeholder content.

## What's missing

- Uncomment the `<Footer />` import and render in `App.jsx`
- Define what content the Footer should show: copyright, links to About, possibly the language/theme toggles if not placed in the Header
- Style it to match the glassmorphic design system

## Acceptance criteria

1. Footer is visible at the bottom of the layout on all pages
2. Includes at minimum: project name/copyright and a link to the About page
3. Styled consistently with the existing UI (glassmorphic, dark theme compatible)
4. Does not overlap the map on mobile (check on small viewport)

## Notes

- The map takes up the full viewport on Home — the Footer may need to be outside the map container or absolutely positioned at the bottom
