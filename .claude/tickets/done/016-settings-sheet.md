# TICKET-016: Settings Sheet — Relocate Theme & Script Toggles

**Status:** Open
**Priority:** Low
**Area:** Frontend

## Context

The audit notes the header is crowded: theme toggle + script toggle + "Locate me" compete in a
small bar, and the two display toggles are *settings*, not primary actions. The redesign moves
them into a dedicated settings surface reached from a settings button (⚙) in the shell.

Depends on: **008** (shell), **009** (sheet pattern, optional — settings can be its own small
sheet/menu).

## What's missing

- A settings button (⚙) in the redesigned shell (top overlay)
- A settings sheet/menu containing:
  - **Theme** toggle (dark/light) — moves out of the Header
  - **Script/Language** toggle (Latin/Cyrillic) — moves out of the Header
  - Room for future settings (units, notifications) without redesign
- Header/top overlay no longer carries the theme and script toggles directly

## Acceptance criteria

1. Theme and script toggles are accessible from the settings button, not the main bar
2. Both toggles retain current behaviour and persistence (ThemeContext / ScriptContext)
3. The main top overlay is visibly less cluttered (search pill + settings + map FAB only)
4. Settings surface works on mobile and desktop, dark and light
5. No regression in theme or script switching anywhere in the app

## Notes

- Pure relocation + container work — do not change the underlying context logic.
- "Locate me" becomes a map FAB (introduced around 008/012), not part of settings.
- Keep the settings surface lightweight (a small sheet or popover); it doesn't need the
  three-snap-point behaviour of the main bottom sheet.
