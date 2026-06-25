# TICKET-027: Admin Dashboard — Retro Windows Redesign

**Status:** Open
**Priority:** Medium
**Area:** Frontend only

## Context

The current admin panel (`/admin`) uses the same dark glassmorphic design as the public app — dark gradient background, frosted-glass cards, `rounded-xl` corners, and `white/10` borders. This aesthetic makes sense for the end-user map experience but is awkward for a data-entry tool used by operators who are likely familiar with classic desktop software (Windows 95/98/XP era programs, Access, old scheduling tools).

The goal is to restyle the admin panel to feel like a **classic Windows desktop application** — raised borders, system grays, beveled buttons, a title bar, and tab strips that look like real OS tabs. No visual ambiguity about what is a button vs a field; every control is immediately obvious to someone who has used Windows XP. The public app is untouched.

## Visual Reference — Windows XP / Win98 aesthetic

Key characteristics to implement:

| Element | Classic Windows look |
|---|---|
| Page background | `#c0c0c0` (Win95/98 silver) or `#ece9d8` (XP Luna warm gray) |
| Window chrome | Title bar with gradient (`#0055ea → #2585f4` for XP; flat `#000080` for 98) + white title text |
| Panel/card borders | 2px inset/outset 3D border: light edge top-left, dark edge bottom-right |
| Buttons | Raised 3D bevel — `outset` border, gray background, hover → `inset` pressed look |
| Tabs | Classic tab strip — active tab slightly elevated and white, inactive tabs recessed gray |
| Inputs | White background, `1px inset` border (sunken look), black text, no border-radius |
| Tables | White background, `1px solid #808080` grid lines, alternating row tint (`#f0f0f0`) |
| Modals/dialogs | Window with title bar (close `✕` button top-right), gray body, raised OK/Cancel buttons |
| Scrollbars | Styled as classic arrow-button scrollbars where CSS allows |
| Status/info text | Small `Tahoma, 'MS Sans Serif', sans-serif` font, 11–12px |

## What needs to change

### File: `frontend/src/components/Pages/Admin.jsx`

This is the only file that needs editing. Replace the Tailwind glassmorphic class constants and shell with a retro equivalents. Key changes:

**1. CSS class constants** (lines 20–26 — the `glassCard`, `inputCls`, `labelCls`, `btnBase`, `btnPrimary`, `btnDanger`, `btnSuccess` variables)

Replace with retro equivalents, e.g.:
- `winCard` — white background, `2px solid` outset 3D border
- `winInput` — white bg, `inset` border, square corners, black text, 12px Tahoma
- `winLabel` — black text, 11px, bold
- `winBtn` — gray bg, outset border, hover changes to inset (pressed), square corners
- `winBtnDanger` — same shape, red-tinted background
- `winBtnSuccess` — same shape, green-tinted background

**2. Root `AdminInner` shell** (lines 733–776)

- Change outer `div` from dark gradient to silver/gray background
- Add a **title bar** strip at the top: dark blue gradient with "ZR-Bus Admin" in white Tahoma, and the Logout/Survey buttons styled as toolbar icon-buttons
- Style the tab strip as classic Windows tabs (active tab white + elevated, inactive gray + recessed), no `rounded-t` — square corners
- Replace `max-w-5xl mx-auto` centered layout with a full-width desktop-application feel

**3. `Modal` component** (lines 30–40)

Replace the frosted overlay + rounded card with a classic dialog window:
- No `backdrop-blur`; keep the dim overlay
- Dialog box: white body, raised border, title bar (dark blue, white text, `✕` close button)
- No `rounded` corners

**4. Table rows / list items** inside each tab

- White `<table>` with visible grid lines instead of the glass card wrappers
- Alternating row background (`#f0f0f0` / white)
- Standard black text

### File: `frontend/src/index.css` (optional)

If the 3D bevel / retro scrollbar effects can't be expressed cleanly in Tailwind utility classes, add a small `/* admin retro */` section with helper classes (`.win-btn`, `.win-panel`, `.win-dialog`, etc.) used only in `Admin.jsx`. Keep this section clearly delimited so it doesn't bleed into the public app styles.

## Acceptance criteria

1. `/admin` page background is silver/gray, not dark; the dark-gradient glassmorphic design is gone.
2. Buttons look raised (3D outset bevel) and visually "press in" (inset) on click/hover.
3. The tab strip matches classic Windows: active tab is white and visually elevated; inactive tabs are gray/recessed; no rounded corners.
4. Input fields are white-background, square-cornered, sunken-border — no frosted glass.
5. Data tables have visible grid lines and alternating row tinting.
6. Modals look like classic Windows dialog boxes — title bar + raised border, no blur or rounded card.
7. The public app (`/`, `/timetable`, `/autobus/*`) is visually unchanged.
8. All four tabs (Linije, Stanice, Dodela stanica, Polasci) remain fully functional — no regressions in CRUD operations or the stop-placement map modal.

## Notes

- **Typography:** `font-family: Tahoma, 'MS Sans Serif', 'Segoe UI', sans-serif` on the admin shell. The public app's font is untouched.
- **Colors:** Win95/98 palette: `#c0c0c0` (button face), `#ffffff` (button highlight), `#808080` (button shadow), `#000080` (title bar), `#0000ff` → `#1084d0` (XP title bar gradient). Pick one era and stay consistent — XP (warm grays + blue gradient title bar) reads more clearly on modern displays than flat Win95 silver.
- **No external libraries.** Pure CSS via Tailwind utilities or a small custom CSS block — no `98.css`, `XP.css`, or other retro UI libraries. Keep the bundle lean.
- **Mobile:** The admin panel is desktop-only by convention (no mobile breakpoints today). The retro design can be fixed-width or responsive — keeping it desktop-first is fine.
- **Login page** (`/prijava`) is out of scope for this ticket — style it separately if desired.
