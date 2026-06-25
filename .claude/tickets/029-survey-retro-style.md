# TICKET-029: Terensko snimanje — Retro Windows style

**Status:** Open
**Priority:** Medium
**Area:** Frontend only

## Context

The "Terensko snimanje" (field survey) pages (`/admin/survey` and `/admin/survey/:id`) still use the original dark glassmorphic design — same `glassCard`, `inputCls`, `labelCls`, `btnBase` constants and dark gradient shells as the admin panel had before TICKET-027. Now that `/admin` looks like a Windows XP desktop app, the survey pages should match.

## Files to change

- `frontend/src/components/Pages/SurveyCapture.jsx` (312 lines)
- `frontend/src/components/Pages/SurveyReview.jsx` (271 lines)

The `win-*` CSS classes added to `frontend/src/index.css` in TICKET-027 are already available — no new CSS needed unless edge cases arise.

---

## SurveyCapture.jsx

### Current glassmorphic constants (lines 8–10)
```js
const glassCard = 'bg-white/5 border border-white/10 rounded-xl';
const inputCls  = 'w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/90 ...';
const labelCls  = 'block text-xs text-white/50 mb-1';
```

Replace with:
```js
const winInput = 'win-input';
const winLabel = 'win-label';
const winBtn   = 'win-btn';
```

### `StopModal` component (lines 12–~100)

Currently: `fixed inset-0 z-50` overlay + `glassCard` frosted card.

Replace with the same retro dialog pattern used in `Admin.jsx`:
- Use `createPortal(…, document.body)` to avoid stacking context issues
- Outer: `fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4`
- Inner: `win-dialog flex flex-col w-full max-w-md max-h-[90vh]`
- Title bar: `win-titlebar` with close button (`win-close-btn`)
- Body: `overflow-y-auto p-4 flex flex-col gap-3`
- All inputs: `win-input`; labels: `win-label`; buttons: `win-btn`

### `SurveyCapture` main component shell (lines ~108–312)

Currently renders a dark gradient page with glassmorphic cards.

Replace outer shell:
- Background: `#c0c0c0` full-width (`width: 100vw`, `minHeight: 100vh`)
- Title bar strip at top: `win-titlebar` with "Terensko snimanje" + a back button (navigate to `/admin`) styled as `win-btn`
- Content area: centered `maxWidth: 720`, `margin: '0 auto'`, `padding: 8px`
- Info cards / stat panels: `win-panel` with `padding: 8px`
- All buttons: `win-btn` / `win-btn-danger` / `win-btn-success` as appropriate
- Status text (GPS coords, distance, etc.): Tahoma 11px black

---

## SurveyReview.jsx

### Current glassmorphic constants (lines 9–12)
```js
const glassCard = 'bg-white/5 border border-white/10 rounded-xl';
const inputCls  = 'px-3 py-2 rounded-lg bg-white/5 ...';
const labelCls  = 'block text-xs text-white/50 mb-1';
const btnBase   = 'px-4 py-2 rounded-xl text-sm ...';
```

Replace with the same `winInput / winLabel / winBtn` constants.

### `SurveyReviewInner` shell

Replace outer page shell:
- Background: `#c0c0c0`, `width: 100vw`, `minHeight: 100vh`
- Title bar: `win-titlebar` with "Pregled snimanja" + back button to `/admin`
- Content area: `maxWidth: 720, margin: '0 auto', padding: 8px`
- The Leaflet map container (existing route + recorded track) stays — just ensure it renders inside a `win-panel` frame
- Tolerance slider, action buttons, session metadata: retro styled with `win-input`, `win-btn`, `win-panel`
- Stop list (candidate stops): `win-table` — same pattern used for data tables in Admin.jsx

---

## Acceptance criteria

1. `/admin/survey` and `/admin/survey/:id` share the same `#c0c0c0` silver background, XP title bar, and `win-*` components as `/admin`.
2. The `StopModal` in SurveyCapture renders as a classic Windows dialog (portal, title bar, no blur).
3. All inputs are `win-input` (sunken border, white bg, Tahoma).
4. All action buttons are `win-btn` (raised bevel, pressed on `:active`).
5. The map in SurveyReview is framed inside a `win-panel`.
6. All existing functionality is preserved: GPS tracking, stop marking, track submit, route/stop merge actions.
7. Public app pages are visually unchanged.

## Notes

- The `win-*` CSS classes are already in `index.css` from TICKET-027. Do not duplicate them.
- Use `createPortal` for `StopModal` (same approach as the `Modal` fix in TICKET-028).
- Keep the dark Stadia tile layer for the map — it works fine inside a light panel frame.
