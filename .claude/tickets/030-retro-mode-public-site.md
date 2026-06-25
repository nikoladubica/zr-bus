# TICKET-030: Retro Mode — public site Windows 98/XP style toggle

**Status:** Open
**Priority:** Medium
**Area:** Frontend only

## Goal

Add a "Retro" toggle in the settings popover (next to "Tamna tema" and "Latinica"). When enabled, the entire public-facing site transforms into a Windows 98/XP aesthetic matching the existing admin panel — `#c0c0c0` silver desktop, bevel borders, Tahoma font, the works. Toggling it off returns the site to the normal glassmorphic dark/light design. The preference is persisted in `localStorage`.

---

## 1. New `RetroContext.jsx`

Create `frontend/src/context/RetroContext.jsx`, modelled exactly on `ThemeContext.jsx`:

```jsx
import { createContext, useContext, useState, useEffect } from 'react';

const RetroContext = createContext(false);

export const RetroProvider = ({ children }) => {
    const [retro, setRetro] = useState(
        () => (typeof localStorage !== 'undefined' ? localStorage.getItem('retro') === 'true' : false),
    );

    useEffect(() => {
        document.documentElement.classList.toggle('retro', retro);
    }, [retro]);

    const toggleRetro = () =>
        setRetro((r) => {
            const next = !r;
            if (typeof localStorage !== 'undefined') localStorage.setItem('retro', String(next));
            return next;
        });

    return (
        <RetroContext.Provider value={{ retro, toggleRetro }}>
            {children}
        </RetroContext.Provider>
    );
};

export const useRetro = () => useContext(RetroContext);

export default RetroContext;
```

Key behaviour: toggling retro adds/removes the `.retro` class on `<html>`, just like `dark` does for dark mode.

---

## 2. Wire `RetroProvider` into `App.jsx`

Find where `ThemeProvider` and `ScriptProvider` wrap the app tree. Add `RetroProvider` as a sibling wrapper (order doesn't matter, put it inside `ThemeProvider`):

```jsx
import { RetroProvider } from './context/RetroContext.jsx';

// Inside the JSX tree:
<ThemeProvider>
  <RetroProvider>
    <ScriptProvider>
      ...
    </ScriptProvider>
  </RetroProvider>
</ThemeProvider>
```

---

## 3. Add "Retro" row to `SettingsPopover.jsx`

File: `frontend/src/components/Elements/Header/SettingsPopover.jsx`

Import `useRetro`:
```jsx
import { useRetro } from '../../../context/RetroContext.jsx';
```

Add to the top of the component:
```jsx
const { retro, toggleRetro } = useRetro();
```

After the script divider row, add a new divider + row:

```jsx
<div className="border-t dark:border-white/10 border-black/10" />

<div className="flex items-center justify-between px-3 py-2">
    <span className="text-sm dark:text-white text-gray-800">
        Retro
    </span>
    <button
        className="h-9 px-2.5 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white text-gray-800 text-sm font-medium"
        onClick={toggleRetro}
    >
        {retro ? '🖥' : 'XP'}
    </button>
</div>
```

When retro is active the button shows the monitor emoji; otherwise it shows the "XP" text label so it's clear what it activates.

---

## 4. CSS additions in `index.css`

Add a new section `/* === retro public site === */` **before** the `/* === admin retro === */` block. These are CSS overrides that fire when `.retro` is on `<html>`. They cover the things that can't be done with conditional Tailwind classes — mainly global defaults and scrollbars.

```css
/* === retro public site === */

/* Page background */
.retro {
    background-color: #008080; /* Win98 teal desktop */
}

/* Global font override */
.retro body {
    font-family: Tahoma, 'MS Sans Serif', sans-serif;
}

/* Retro card: win-panel bevel */
.retro-card {
    background: #d4d0c8;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
    border-radius: 0;
    padding: 8px;
    color: #000000;
}

/* Retro sidebar / bottom sheet panel */
.retro-panel {
    background: #d4d0c8;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
    border-radius: 0;
}

/* Retro header / titlebar strip */
.retro-titlebar {
    background: linear-gradient(to right, #0a246a, #3a6ea8);
    color: #ffffff;
    font-family: Tahoma, 'MS Sans Serif', sans-serif;
    font-size: 12px;
    font-weight: bold;
    padding: 3px 6px;
    border-radius: 0;
}

/* Retro bottom sheet drag handle */
.retro-handle {
    background: #d4d0c8;
    width: 48px;
    height: 8px;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
    border-radius: 0;
}

/* Scrollbar styling for retro panels (public site) */
.retro-panel::-webkit-scrollbar,
.retro-scroll::-webkit-scrollbar {
    width: 16px;
}
.retro-panel::-webkit-scrollbar-track,
.retro-scroll::-webkit-scrollbar-track {
    background-color: #c0c0c0;
    background-image: repeating-conic-gradient(#c0c0c0 0% 25%, #ffffff 0% 50%);
    background-size: 4px 4px;
}
.retro-panel::-webkit-scrollbar-thumb,
.retro-scroll::-webkit-scrollbar-thumb {
    background: #d4d0c8;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
    min-height: 20px;
}
.retro-panel::-webkit-scrollbar-button,
.retro-scroll::-webkit-scrollbar-button {
    display: block;
    background: #d4d0c8;
    border-top: 2px solid #ffffff;
    border-left: 2px solid #ffffff;
    border-right: 2px solid #808080;
    border-bottom: 2px solid #808080;
    height: 16px;
}
.retro-panel::-webkit-scrollbar-button:active,
.retro-scroll::-webkit-scrollbar-button:active {
    border-top: 2px solid #808080;
    border-left: 2px solid #808080;
    border-right: 2px solid #ffffff;
    border-bottom: 2px solid #ffffff;
}

/* === end retro public site === */
```

---

## 5. Component changes

### 5a. `Card.jsx`

File: `frontend/src/components/UI/Card.jsx`

```jsx
import { useRetro } from '../../context/RetroContext.jsx';

const Card = ({ className, children }) => {
    const { retro } = useRetro();

    if (retro) {
        return (
            <div className={`retro-card ${className || ''}`}>
                {children}
            </div>
        );
    }

    return (
        <div
            className={`backdrop-blur-xl dark:bg-white/10 bg-black/5 rounded-3xl dark:border-white/20 border-black/10 border p-4 md:p-6 shadow-2xl ${className || ''}`}
        >
            {children}
        </div>
    );
};

export default Card;
```

### 5b. `Header.jsx`

File: `frontend/src/components/Elements/Header/Header.jsx`

Import `useRetro`. Change the root `<div>` and the settings/locate buttons to use retro styles when active:

```jsx
import { useRetro } from '../../../context/RetroContext.jsx';
// ...
const { retro } = useRetro();
```

Root container — replace:
```jsx
<div className="flex items-center justify-between px-5 h-23">
```
With:
```jsx
<div className={retro
    ? 'retro-titlebar flex items-center justify-between px-2 py-1'
    : 'flex items-center justify-between px-5 h-23'
}>
```

Logo — when retro, show `logoBlack` regardless of dark/light theme (since the retro titlebar is dark blue):
```jsx
<img src={retro ? logoBlack : (theme === 'dark' ? logo : logoBlack)} alt="ZRBus logo" height={36} width={100} />
```
> Note: if the logo is too dark on the blue titlebar, invert it with `style={{ filter: 'invert(1) brightness(2)' }}` when retro.

Settings and locate buttons — when retro, apply `win-btn` instead of the rounded glassmorphic button:
```jsx
<button
    className={retro
        ? 'win-btn'
        : 'w-9 h-9 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white text-gray-800'
    }
    onClick={() => setSettingsOpen((o) => !o)}
>
    ⚙
</button>
```
Same treatment for the locate button.

### 5c. `SettingsPopover.jsx`

When retro is active the popover itself should look like a Windows dialog (already has retro context for its button, but the container div also needs styling):

```jsx
<div
    ref={ref}
    className={retro
        ? 'absolute right-0 top-full mt-2 z-50 min-w-[200px] win-dialog'
        : 'absolute right-0 top-full mt-2 z-50 min-w-[180px] backdrop-blur-xl dark:bg-white/10 bg-white/80 rounded-2xl dark:border-white/20 border-black/10 border shadow-2xl'
    }
>
```

Divider lines — when retro use a `#808080` 1px hr instead of the translucent border:
```jsx
<div className={retro ? 'border-t border-[#808080]' : 'border-t dark:border-white/10 border-black/10'} />
```

Row text — when retro use `text-xs font-bold text-black win-label` style:
```jsx
<span className={retro ? 'win-label' : 'text-sm dark:text-white text-gray-800'}>
    Tamna tema / Retro / Latinica labels...
</span>
```

Buttons in the popover — when retro use `win-btn`:
```jsx
<button
    className={retro ? 'win-btn' : 'h-9 px-2.5 flex items-center ...'}
    onClick={toggleTheme}
>
```

### 5d. `BottomSheet.jsx`

File: `frontend/src/components/UI/BottomSheet.jsx`

Import `useRetro`.

```jsx
import { useRetro } from '../../context/RetroContext.jsx';
// ...
const { retro } = useRetro();
```

The `sheetBg` variable changes:
```jsx
const sheetBg = retro
    ? 'retro-panel'
    : 'dark:bg-[#222222] bg-white/95 backdrop-blur-2xl';
```

Desktop sidebar — add `retro-scroll` for retro scrollbar:
```jsx
<aside className={`hidden md:flex flex-col w-[380px] shrink-0 h-full z-[500] relative ${sheetBg} ${retro ? '' : 'border-r dark:border-white/10 border-black/10'}`}>
    {header && (
        <div className={retro ? 'shrink-0 border-b border-[#808080]' : 'shrink-0 border-b dark:border-white/10 border-black/10'}>
            {header}
        </div>
    )}
    <div className={`flex-1 overflow-y-auto overscroll-contain ${retro ? 'retro-scroll' : ''}`}>
        {children}
    </div>
</aside>
```

Mobile bottom sheet outer wrapper — remove `rounded-t-3xl` when retro:
```jsx
className={`md:hidden fixed bottom-0 left-0 right-0 z-[600] ${retro ? '' : 'rounded-t-3xl'} ${sheetBg} ${retro ? 'border-t-2 border-t-[#808080]' : 'border-t dark:border-white/10 border-black/10'} shadow-2xl pointer-events-none`}
```

Drag handle pill — when retro, use the `.retro-handle` class:
```jsx
<div className={retro
    ? 'retro-handle mx-auto mt-3 mb-2'
    : 'w-10 h-1 rounded-full dark:bg-white/25 bg-black/20'
} />
```

Mobile scroll area — add `retro-scroll`:
```jsx
<div
    className={`pointer-events-auto overflow-y-auto overscroll-contain ${retro ? 'retro-scroll' : ''}`}
    ...
>
```

### 5e. `Home.jsx`

File: `frontend/src/components/Pages/Home.jsx`

Import `useRetro`:
```jsx
import { useRetro } from '../../context/RetroContext.jsx';
// ...
const { retro } = useRetro();
```

Main wrapper — replace the inline `style` background with a retro version:
```jsx
<div
    className={`flex h-screen w-screen overflow-hidden relative ${retro ? '' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}
    style={retro
        ? { background: '#008080' }  /* Win98 teal desktop */
        : {
            background: theme === 'dark'
                ? 'linear-gradient(135deg, oklch(27.8% 0.033 256.848) 0%, oklch(22% 0.04 260) 50%, oklch(18% 0.05 270) 100%)'
                : 'linear-gradient(135deg, oklch(96% 0.01 256) 0%, oklch(93% 0.015 260) 50%, oklch(90% 0.02 270) 100%)',
          }
    }
>
```

Mobile header wrapper (the `m-1 backdrop-blur-xl rounded-3xl border...` container) — when retro, strip the glass pill and let the `retro-titlebar` in `Header.jsx` do the styling:
```jsx
<div className={retro
    ? 'm-1'
    : 'm-1 backdrop-blur-xl dark:bg-white/10 bg-black/5 rounded-3xl dark:border-white/20 border-black/10 border shadow-2xl'
}>
    <Header />
</div>
```

The centered desktop watermark badge (`.hidden md:block` span) — when retro, hide it (the titlebar already identifies the app):
```jsx
{!retro && (
    <p className="absolute top-2 left-1/2 -translate-x-1/2 z-[900] pointer-events-none hidden md:block">
        ...
    </p>
)}
```

### 5f. `About.jsx`

File: `frontend/src/components/Pages/About.jsx`

Import and use `useRetro`. The page wrapper background:

```jsx
<div
    className={`h-screen w-screen overflow-y-auto flex flex-col gap-0 ${retro ? 'retro-scroll' : (theme === 'dark' ? 'text-white' : 'text-gray-900')}`}
    style={retro
        ? { background: '#c0c0c0' }
        : {
            background: theme === 'dark'
                ? 'linear-gradient(135deg, oklch(27.8% 0.033 256.848) 0%, ...)'
                : 'linear-gradient(135deg, oklch(96% 0.01 256) 0%, ...)',
          }
    }
>
```

The `<div className="p-4"><Header /></div>` wrapper — when retro no padding needed since the header titlebar is full-width:
```jsx
<div className={retro ? '' : 'p-4'}>
    <Header />
</div>
```

`Card` components — automatically pick up the retro style since `Card.jsx` now reads `useRetro()` (no changes needed in `About.jsx` for card content).

Text colours inside cards — the text currently uses `dark:text-white text-gray-900` and `dark:text-white/70 text-gray-600`. When retro these should be plain `#000000`. The cleanest approach: wrap the card body text in a `<span>` that applies `retro ? 'text-black' : 'dark:text-white text-gray-900'`, or add a global CSS rule:

```css
/* In index.css retro section */
.retro-card p,
.retro-card span,
.retro-card h2 {
    color: #000000;
    font-family: Tahoma, 'MS Sans Serif', sans-serif;
}
.retro-card h2 {
    font-size: 13px;
    font-weight: bold;
    margin-bottom: 6px;
}
.retro-card p {
    font-size: 11px;
}
```

Add these to the CSS block in step 4.

### 5g. `Timetable.jsx`

File: `frontend/src/components/Pages/Timetable.jsx`

Same background override pattern as `About.jsx`. Import `useRetro`, change the page wrapper `style`:

```jsx
style={retro
    ? { background: '#c0c0c0' }
    : { background: theme === 'dark' ? '...' : '...' }
}
```

Timetable has inner cards and lists — most will pick up retro card styling automatically. Any remaining `dark:bg-white/10` or `dark:border-white/10` inline classes inside Timetable need to be wrapped in `retro ? 'retro-card' : 'dark:...'` conditionals. Audit the full file for `dark:` classes on content divs.

### 5h. `InterCityRoute.jsx`

Same pattern — import `useRetro`, change page wrapper background to `#c0c0c0` when retro. Audit content divs for `dark:` classes that need retro equivalents.

---

## 6. Map tile consideration

When retro mode is active, switch the default map tile from Grayscale/Dark to **OSM** (the standard colorful tile) — it gives a more authentic "Encarta 98" feel alongside the silver UI.

In `Map.jsx` (or wherever `activeTile` is set), check `retro` from context and default to the OSM tile:
```jsx
const { retro } = useRetro();
// Pass retro down or read it in the tile URL resolver
const effectiveTile = retro ? TILE_PROVIDERS.osm : activeTile;
```

Check `frontend/src/utils/enums.js` for the tile enum key names.

---

## 7. `HomeSheetContent.jsx` — line switcher pills & section headers

The line switcher buttons (MapLineSwitcher) and the section headers ("Najbliža stanica", etc.) use glassmorphic `dark:bg-white/10` styling. When retro they should be `win-btn` and `win-label` respectively.

`HomeSheetContent.jsx` already imports `useScript` — add `useRetro` alongside it. Audit for any hardcoded `dark:bg-white/10`, `rounded-full`, `backdrop-blur` classes and wrap them in retro conditionals.

Specific targets:
- The intercity corridor link buttons (currently `rounded-xl dark:bg-white/10 ...`): when retro → `win-btn` with full width
- Section header `<h3>` or `<p>` labels: when retro → `win-label` class

---

## Acceptance criteria

1. "Retro" button appears in the settings popover below "Latinica / Ćirilica".
2. Clicking "Retro" toggles the whole public site to Windows 98/XP aesthetic; clicking again restores the original design.
3. Preference survives page reload (stored in `localStorage` under key `retro`).
4. Retro mode: page background is `#008080` on Home (teal desktop) and `#c0c0c0` on About / Timetable / InterCityRoute.
5. Retro mode: the sidebar/bottom sheet panel uses `retro-panel` (silver bevel, no blur).
6. Retro mode: `Card` components render as `retro-card` (silver, bevelled, Tahoma).
7. Retro mode: Header shows as a Windows XP titlebar (blue gradient, white Tahoma text, bevel buttons).
8. Retro mode: the settings popover itself looks like a `win-dialog`.
9. Retro mode: map switches to OSM tiles.
10. Retro mode: all action buttons (locate, settings gear) render as `win-btn`.
11. Non-retro mode: zero visual change — everything looks exactly as before.
12. Admin panel (`/admin`, `/admin/survey`, `/admin/survey/:id`) is **unaffected** — it is always retro and does not read `RetroContext`.
13. Dark/light theme toggle and Latin/Cyrillic script toggle continue to work independently of retro mode.
14. No `console.log` or dead code left in modified files.

---

## Notes

- Admin pages (`Admin.jsx`, `SurveyCapture.jsx`, `SurveyReview.jsx`) must NOT import or use `RetroContext` — they are always retro, unconditionally.
- The `.retro` class on `<html>` does not conflict with the `.dark` class — both can coexist.
- `win-*` CSS classes (admin) and `retro-*` CSS classes (public) are separate namespaces. Do not merge them even if visually similar — admin styles may diverge independently.
- `RetroContext` default value is `false` (retro off) to preserve the existing experience for new users.
- If adding `useRetro()` to `Card.jsx` causes a circular dependency (e.g. Card is used inside RetroProvider), resolve by passing `retro` as a prop instead — but this is unlikely since context is set up in `App.jsx` above all routes.
