# TICKET-003: Dark / Light Theme Switcher

**Status:** Open  
**Priority:** Low  
**Area:** Frontend

## Context

`frontend/src/context/ThemeContext.js` is an empty stub. The app currently hardcodes a dark theme (oklch gradients, dark Tailwind classes).

## What's missing

- `ThemeContext.js` — needs to provide `{ theme, toggleTheme }` where `theme` is `'dark' | 'light'`
- Tailwind classes across components need to respond to the active theme (use CSS variables or Tailwind's `dark:` variant)
- Map tile layer should switch automatically: dark → Grayscale/Dark tile, light → Light tile (options already defined in `utils/enums.js`)
- A toggle button in the Header

## Acceptance criteria

1. Implement `ThemeContext` with localStorage persistence
2. Dark mode is the default
3. Map tile layer switches with the theme
4. All major surfaces (Header, Card, MapLineSwitcher, popups) reflect the active theme
5. Toggle state survives page reload

## Notes

- The existing tile layer enum in `utils/enums.js` already has Grayscale and Light options — reuse them
- Tailwind CSS 4 supports `@custom-variant dark` for class-based dark mode
