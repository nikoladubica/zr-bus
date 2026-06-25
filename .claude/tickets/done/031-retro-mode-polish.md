# TICKET-031: Retro Mode — polish pass (SearchView, StopDetailView, TripPlannerView, MapLineSwitcher)

**Status:** Open
**Priority:** Medium
**Area:** Frontend only
**Depends on:** TICKET-030 (RetroContext, `win-*` and `retro-*` CSS already in place)

## Problem

TICKET-030 applied retro styling to the main shell (background, sidebar panel, header, cards, BottomSheet) but four inner components are still completely unaware of `retro` mode — they use glassmorphic `dark:bg-white/*`, `rounded-xl`, `backdrop-blur` styles regardless of the toggle:

| Component | What the user sees in retro mode |
|---|---|
| `SearchView.jsx` | Glass tab strip, glass input field, glass result rows |
| `StopDetailView.jsx` | Glass header bar, glass departure card, glass time chips, glass reminder button |
| `TripPlannerView.jsx` | Glass From/To input panel, glass dropdown, glass search button, glass result cards |
| `MapLineSwitcher.jsx` | Glass line pills, glass direction buttons, glass section header text |

---

## 1. Shared pattern (read this before touching each file)

Every component should:
1. `import { useRetro } from '../../context/RetroContext.jsx';` (adjust path depth as needed)
2. `const { retro } = useRetro();` at top of component
3. Each `className` that has a glass variant gets a retro conditional:
   - **Card / panel div** → `retro ? 'retro-card' : 'rounded-xl dark:bg-white/5 ...'`
   - **Row / list item button** → `retro ? 'win-btn w-full text-left' : 'rounded-xl dark:bg-white/5 ...'`
   - **Input field** → `retro ? 'win-input' : 'bg-transparent dark:text-white ...'`
   - **Section header `<p>`** → `retro ? 'win-label' : 'text-xs font-medium uppercase ...'`
   - **Tab toggle button** → `retro ? 'win-btn flex-1 rounded-none!' : '... rounded-*'`
   - **Divider `<div>`** → `retro ? 'border-t border-[#808080]' : 'border-t dark:border-white/10 ...'`
   - **`<span>` text inside glass rows** → `retro ? '' : 'dark:text-white text-gray-900'` (`.retro-card` CSS handles colour)
   - **Icon / secondary text spans** → `retro ? 'text-[#444]' : 'dark:text-white/40 text-gray-400'`
   - **"Cancel" / "Close" inline text buttons** → `retro ? 'win-btn' : 'text-sm dark:text-white/50 ...'`

Line number bubbles (`w-5 h-5 rounded-full … text-white` with `backgroundColor: line.hex_color`) are fine as-is — keep the coloured dot, it's useful information in retro mode too.

---

## 2. `SearchView.jsx`

File: `frontend/src/components/Elements/SearchView.jsx`

Import `useRetro`. Add `const { retro } = useRetro();` after the existing `useScript` hook call.

### 2a. Tab strip (line 116–129)

Outer wrapper `<div>`:
```jsx
<div className={`flex shrink-0 p-2 px-3 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/10 border-black/10'}`}>
```

"Stanica" tab button:
```jsx
className={retro
    ? `win-btn flex-1 rounded-none! ${searchMode === 'stanica' ? 'pressed' : ''}`
    : `flex-1 py-2 text-xs font-medium dark:text-white text-gray-900 border-r dark:border-white/10 border-black/10 rounded-none! rounded-l-2xl!`
}
```

"Ruta" tab button:
```jsx
className={retro
    ? `win-btn flex-1 rounded-none! ${searchMode === 'ruta' ? 'pressed' : ''}`
    : `flex-1 py-2 text-xs font-medium dark:text-white/40 text-gray-400 dark:hover:text-white/60 hover:text-gray-600 transition-colors rounded-none! rounded-r-2xl!`
}
```

### 2b. Search input row (line 130–160)

Outer wrapper `<div>`:
```jsx
<div className={`flex items-center gap-2 px-3 pt-2 pb-2 shrink-0 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/10 border-black/10'}`}>
```

Search icon `<span>`:
```jsx
<span className={retro ? 'text-base' : 'text-base dark:text-white/40 text-gray-400 shrink-0'}>⌕</span>
```

`<input>` field:
```jsx
className={retro
    ? 'win-input flex-1 border-none! shadow-none! outline-none!'
    : 'flex-1 bg-transparent text-sm dark:text-white text-gray-900 placeholder:dark:text-white/30 placeholder:text-gray-400 outline-none'
}
```
> Note: `win-input` has its own border. Inside a surrounding bordered container this may look doubled. Prefer `background: #fff; border: none; font-family: Tahoma; font-size: 11px; flex: 1; outline: none;` as inline style if `win-input` causes visual clutter — or apply `win-input` and override the border with `style={{ border: 'none' }}`. Test visually.

Clear `×` button:
```jsx
className={retro
    ? 'win-btn w-5 h-5 flex items-center justify-center p-0 shrink-0'
    : 'w-5 h-5 flex items-center justify-center rounded-full dark:bg-white/20 bg-black/10 dark:text-white/60 text-gray-500 text-xs shrink-0'
}
```

"Otkaži" button:
```jsx
className={retro
    ? 'win-btn shrink-0 ml-1'
    : 'text-sm dark:text-white/50 text-gray-500 dark:hover:text-white/80 hover:text-gray-800 transition-colors shrink-0 pl-1'
}
```

### 2c. Section header `<p>` labels ("Stanice", "Linije", "Nedavno", "Omiljene")

All follow the same pattern:
```jsx
<p className={retro
    ? 'win-label'
    : 'text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400'
}>
```

### 2d. Result row buttons (stop rows, line rows, recent rows, favourite rows)

All `className` that currently start with `flex items-center ... rounded-xl dark:bg-white/5 bg-black/5 ...`:
```jsx
className={retro
    ? 'win-btn w-full flex items-center justify-between gap-3 text-left'
    : 'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border text-left w-full dark:hover:bg-white/10 hover:bg-black/8 transition-colors'
}
```

Text `<span>` inside result rows:
```jsx
<span className={retro ? 'text-sm truncate flex-1' : 'text-sm dark:text-white text-gray-900 truncate flex-1'}>
```

"No results" empty state `<p>`:
```jsx
<p className={retro ? 'text-sm' : 'text-sm dark:text-white/40 text-gray-400'}>
```

Empty-list placeholder `<p>`:
```jsx
<p className={retro ? 'text-sm text-center py-6' : 'text-sm dark:text-white/30 text-gray-400 text-center py-6'}>
```

---

## 3. `StopDetailView.jsx`

File: `frontend/src/components/Elements/StopDetailView.jsx`

Import `useRetro` (path: `../../context/RetroContext.jsx`). Add `const { retro } = useRetro();`.

### 3a. Header bar (line 99–117)

Outer `<div>`:
```jsx
<div className={`flex items-center gap-2 p-2 px-4 shrink-0 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/10 border-black/10'}`}>
```

Back `←` button:
```jsx
className={retro
    ? 'win-btn w-8 h-8 flex items-center justify-center shrink-0'
    : 'w-8 h-8 flex items-center justify-center rounded-xl dark:hover:bg-white/10 hover:bg-black/5 transition-colors dark:text-white/60 text-gray-500 shrink-0'
}
```

Stop name `<p>`:
```jsx
<p className={`font-semibold text-sm flex-1 truncate ${retro ? '' : 'dark:text-white text-gray-900'}`}>
```

### 3b. Day-type tab buttons (line 128–144)

Tab container `<div>`:
```jsx
<div className={`flex shrink-0 ${retro ? 'px-2 pt-2 gap-0.5' : 'px-4 pt-3 gap-1'}`}>
```

Each tab button:
```jsx
className={retro
    ? `win-btn ${activeTab === tab ? 'pressed' : ''}`
    : `px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
        activeTab === tab
            ? 'dark:bg-white/15 bg-black/10 dark:text-white text-gray-900'
            : 'dark:text-white/40 text-gray-400 dark:hover:bg-white/5 hover:bg-black/5'
    }`
}
```

### 3c. "Next departure" highlight card (line 200–244)

Outer `<div>`:
```jsx
className={retro
    ? 'retro-card flex items-baseline gap-2 flex-wrap'
    : 'rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border px-3 py-2.5 flex items-baseline gap-2 flex-wrap'
}
```

Bold countdown `<span>`:
```jsx
<span className={`font-bold ${retro ? '' : 'dark:text-white text-gray-900'}`}>
```

Following times `<span>`:
```jsx
<span className={retro ? 'text-xs' : 'text-xs dark:text-white/30 text-gray-400'}>
```

Reminder button (inside the IIFE at line 217):
```jsx
className={retro
    ? `win-btn ml-auto text-xs ${scheduled ? 'win-btn-success' : ''}`
    : `ml-auto text-xs px-2 py-1 rounded-lg border transition-colors ${
        scheduled
            ? 'dark:bg-white/10 bg-black/8 dark:border-white/20 border-black/15 dark:text-white/80 text-gray-700'
            : 'dark:border-white/10 border-black/10 dark:text-white/40 text-gray-400 dark:hover:bg-white/5 hover:bg-black/5'
    }`
}
```

"No departures" card:
```jsx
className={retro
    ? 'retro-card text-xs'
    : 'rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border px-3 py-2 text-xs dark:text-white/30 text-gray-400'
}
```

### 3d. Time chips (line 258–270)

Each `<span>` time chip:
```jsx
className={retro
    ? `win-btn text-xs ${isNext ? 'pressed' : ''} ${idx < past.length ? 'opacity-40' : ''}`
    : `text-xs px-2 py-1 rounded-lg border ${
        isNext
            ? 'dark:bg-white/20 bg-black/10 dark:border-white/20 border-black/15 font-semibold dark:text-white text-gray-900'
            : idx < past.length
            ? 'dark:bg-white/3 bg-black/3 dark:border-white/5 border-black/5 dark:text-white/20 text-gray-300'
            : 'dark:bg-white/8 bg-black/5 dark:border-white/10 border-black/10 dark:text-white/70 text-gray-600'
    }`
}
```

### 3e. Line name and direction `<span>` (line 193, 195)

```jsx
<span className={retro ? 'text-xs' : 'text-xs dark:text-white/60 text-gray-500'}>
```

### 3f. "Ceo red vožnje" `<NavLink>` (line 275–282)

```jsx
className={retro
    ? 'win-btn text-xs self-start text-left mt-1'
    : 'text-xs dark:text-white/40 text-gray-400 dark:hover:text-white/70 hover:text-gray-700 transition-colors self-start text-left'
}
```

---

## 4. `TripPlannerView.jsx`

File: `frontend/src/components/Elements/TripPlannerView.jsx`

Import `useRetro`. Add `const { retro } = useRetro();`.

### 4a. Tab strip (line 111–130)

Same pattern as `SearchView` tab strip.

"Stanica" tab:
```jsx
className={retro
    ? 'win-btn flex-1 rounded-none!'
    : 'flex-1 py-2 text-xs font-medium dark:text-white/40 text-gray-400 ... border-r ...'
}
```

"Ruta" tab (active):
```jsx
className={retro
    ? 'win-btn flex-1 rounded-none! pressed'
    : 'flex-1 py-2 text-xs font-medium dark:text-white text-gray-900 rounded-none!'
}
```

"Otkaži" close button:
```jsx
className={retro
    ? 'win-btn rounded-none!'
    : 'px-4 text-sm dark:text-white/50 text-gray-500 ...'
}
```

### 4b. From / To input panel (line 135–202)

Outer `<div>`:
```jsx
className={retro
    ? 'retro-card overflow-hidden'
    : 'rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border overflow-hidden'
}
```

From row divider:
```jsx
<div className={`flex items-center gap-2 px-3 py-2.5 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/5 border-black/5'}`}>
```

Icon `<span>` in from/to rows:
```jsx
<span className={retro ? 'text-xs shrink-0' : 'text-xs dark:text-white/40 text-gray-400 shrink-0'}>
```

`<input>` fields (from and to):
```jsx
className={retro
    ? 'flex-1 bg-white text-[11px] font-[Tahoma] outline-none border-none min-w-0 px-1'
    : 'flex-1 bg-transparent text-sm dark:text-white text-gray-900 placeholder:dark:text-white/30 placeholder:text-gray-400 outline-none min-w-0'
}
```

Clear `×` buttons:
```jsx
className={retro
    ? 'win-btn w-4 h-4 flex items-center justify-center p-0 shrink-0 text-xs'
    : 'w-4 h-4 flex items-center justify-center rounded-full dark:bg-white/20 bg-black/10 ...'
}
```

GPS pin button:
```jsx
className={retro
    ? 'win-btn shrink-0'
    : 'text-xs dark:text-white/40 text-gray-400 shrink-0 ...'
}
```

Swap `⇅` button and its wrapper:
```jsx
<div className={`flex items-center justify-center py-0.5 ${retro ? 'border-b border-[#808080]' : 'border-b dark:border-white/5 border-black/5'}`}>
    <button
        onClick={handleSwap}
        className={retro
            ? 'win-btn w-6 h-6 flex items-center justify-center p-0'
            : 'w-6 h-6 flex items-center justify-center rounded-full dark:hover:bg-white/10 ...'
        }
    >
        ⇅
    </button>
</div>
```

### 4c. Autocomplete dropdown (line 205–230)

Outer `<div>`:
```jsx
className={retro
    ? 'retro-card flex flex-col gap-0 overflow-hidden'
    : 'flex flex-col gap-1 rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border overflow-hidden'
}
```

Each dropdown `<button>`:
```jsx
className={retro
    ? `win-btn w-full flex items-center justify-between gap-3 text-left rounded-none! ${retro ? 'border-b border-[#808080] last:border-b-0' : ''}`
    : 'flex items-center justify-between gap-3 px-3 py-2.5 text-left w-full dark:hover:bg-white/10 hover:bg-black/8 transition-colors border-b last:border-b-0 dark:border-white/5 border-black/5'
}
```

### 4d. Search / Plan button (line 233–245)

```jsx
className={retro
    ? `win-btn w-full py-2 ${!canSearch ? 'opacity-50 cursor-not-allowed' : ''}`
    : `w-full py-3 rounded-xl text-sm font-medium transition-colors ${
        canSearch
            ? 'dark:bg-white/10 bg-black/10 dark:text-white text-gray-900 ...'
            : 'dark:bg-white/5 bg-black/5 dark:text-white/30 text-gray-400 cursor-not-allowed'
    }`
}
```

### 4e. Error / loading text `<p>` elements (lines 259–265, 249–253)

```jsx
<p className={retro ? 'text-sm text-center py-6' : 'text-sm dark:text-white/50 text-gray-500 text-center ...'}>
```

### 4f. Result cards (line 275–329)

Each result card `<div>`:
```jsx
className={retro
    ? 'retro-card flex flex-col gap-2'
    : 'rounded-xl dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border p-3 flex flex-col gap-2'
}
```

Section header `<p>` "Rezultati":
```jsx
<p className={retro ? 'win-label' : 'text-xs font-medium uppercase tracking-wide dark:text-white/40 text-gray-400'}>
```

Line name `<span>`:
```jsx
<span className={retro ? 'text-sm font-medium truncate flex-1' : 'text-sm font-medium dark:text-white text-gray-900 truncate flex-1'}>
```

Board/alight names row:
```jsx
<div className={retro ? 'flex items-center gap-1.5 text-xs' : 'flex items-center gap-1.5 text-xs dark:text-white/60 text-gray-600'}>
```

Times `<span>`:
```jsx
<span className={retro ? 'text-sm font-bold' : 'text-sm font-bold dark:text-white text-gray-900'}>
```

Arrow / travel time `<span>` in times row:
```jsx
<span className={retro ? 'text-xs' : 'text-xs dark:text-white/40 text-gray-400'}>
```

Walk note `<p>`:
```jsx
<p className={retro ? 'text-xs' : 'text-xs dark:text-white/40 text-gray-400'}>
```

"Prikaži na mapi" button:
```jsx
className={retro
    ? 'win-btn mt-0.5 w-full'
    : 'mt-0.5 w-full py-1.5 rounded-lg text-xs font-medium dark:bg-white/8 bg-black/8 ...'
}
```

---

## 5. `MapLineSwitcher.jsx`

File: `frontend/src/components/Elements/Map/MapLineSwitcher.jsx`

Import `useRetro` (path: `../../../context/RetroContext.jsx`). Add `const { retro } = useRetro();`.

### 5a. Section header

Currently:
```jsx
<p className="text-xs font-medium text-left uppercase tracking-wide dark:text-white/40 text-gray-400">
```

Replace with:
```jsx
<p className={retro ? 'win-label text-left' : 'text-xs font-medium text-left uppercase tracking-wide dark:text-white/40 text-gray-400'}>
```

The inner `<span>` for the active line name:
```jsx
<span className={retro ? '' : 'dark:text-white text-black'}>
```

### 5b. Line colour chips (the scrollable pill row)

Currently active chip uses `backgroundColor: line.hex_color` — keep that.

Currently inactive chip:
```jsx
className={`... dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border dark:text-white text-gray-800 ...`}
```

Change to:
```jsx
className={`flex items-center gap-1.5 px-3 py-2 shrink-0 transition-all select-none ${
    retro
        ? isActive
            ? 'win-btn pressed text-white'
            : 'win-btn'
        : isActive
            ? 'text-white shadow-sm rounded-full'
            : 'dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 border dark:text-white text-gray-800 dark:hover:bg-white/10 hover:bg-black/10 rounded-full'
}`}
```
> Active chip: `win-btn pressed` gives a "pressed" 3D bevel which works perfectly for selected state. Keep `style={isActive ? { backgroundColor: line.hex_color } : {}}`.

### 5c. Direction toggle buttons

Same pattern — currently `rounded-full text-xs font-medium`:
```jsx
className={`flex items-center gap-1 shrink-0 select-none ${
    retro
        ? `win-btn text-xs ${isDirActive ? 'pressed' : ''}`
        : `px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
            isDirActive
                ? 'text-white border-transparent'
                : 'dark:bg-white/5 bg-black/5 dark:border-white/10 border-black/10 dark:text-white/60 text-gray-500 ...'
        }`
}`}
```

---

## Acceptance criteria

1. In retro mode, the search panel (SearchView) renders with `win-btn` rows, a `win-input`-style text field, `win-label` section headers, and `win-btn` tab buttons.
2. In retro mode, the stop detail sidebar (StopDetailView) renders with `win-btn` back button, `win-btn` day-type tabs (active tab `pressed`), `retro-card` departure highlight, `win-btn` time chips (current departure `pressed`, past chips dimmed), `win-btn` reminder button (`win-btn-success` when active), and `win-btn` timetable link.
3. In retro mode, the trip planner (TripPlannerView) renders with `win-btn` tabs, a `retro-card` From/To panel with `win-input`-style inline fields, `win-btn` swap button, `win-btn` search button, `retro-card` autocomplete dropdown rows, and `retro-card` result cards.
4. In retro mode, MapLineSwitcher renders with `win-label` header, `win-btn` line chips (active chip is `pressed` + coloured background), and `win-btn` direction chips (`pressed` for active direction).
5. Non-retro mode is visually unchanged across all four components.
6. No new `console.log`, commented-out code, or dead imports.

## Notes

- The line number bubbles (`w-5 h-5 rounded-full` with `backgroundColor: line.hex_color`) should be kept as-is in retro mode — the colour dot is informational and looks fine in a Windows context.
- `win-btn.pressed` in CSS inverts the bevel (top/left become dark, right/bottom become light), giving a depressed effect. Use it for: active line chip, active direction chip, active day-type tab, current-departure time chip, active reminder button.
- For the `<input>` fields inside `TripPlannerView` and `SearchView`: the simplest retro approach is `className="flex-1 border-none outline-none"` with `style={{ fontFamily: 'Tahoma, sans-serif', fontSize: 11, background: 'transparent', color: '#000' }}` when retro — this avoids the double-border issue that `win-input` creates inside a `retro-card` wrapper.
- `StopDetailView` has no section header `<p>` — the line number bubble + direction label acts as its own header. No `win-label` needed there.
