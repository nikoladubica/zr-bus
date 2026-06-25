# TICKET-028: Admin — Stanice tab: filter by line + modal z-index fix

**Status:** Open
**Priority:** Medium
**Area:** Frontend only

## Context

Two bugs/improvements on the "Stanice" tab in the retro admin panel (`/admin`, tab index 1, `StopsTab` component in `frontend/src/components/Pages/Admin.jsx`).

---

## Issue 1 — Filter by line

The "Stanice" tab currently shows all stops from `GET /locations` (all ~100+ stops) with no way to narrow the list. Operators need to quickly find stops that belong to a specific line.

### What to add

Add a `<select>` dropdown above the table that lets the user pick a line. Selecting a line filters the table to show only the stops assigned to that line.

**Data sources:**
- `GET /lines` → `LINES_API` — list of all lines (id, number, lat_name, hex_color)
- `GET /lines-locations/:lineId` → `LINES_LOCATIONS_API/:lineId` — returns the stop assignments for a line; each item has a `location` (or `location_id`) property linking to the stop

**Implementation sketch:**
1. Fetch lines on mount (same pattern as `LinesTab` uses).
2. Add state: `const [filterLineId, setFilterLineId] = useState('');`
3. Render a `<select className="win-input" style={{ width: 'auto' }}>` before the table:
   - First option: `<option value="">— Sve stanice —</option>`
   - One option per line: `{number} – {lat_name}`
4. When `filterLineId` is non-empty, fetch `GET /lines-locations/:lineId` and derive the set of location IDs that belong to that line. Filter `stops` by that set before rendering the table.
5. Show a small count: `{filteredStops.length} / {stops.length} stanica` when a filter is active.

The filter is client-side after the lines-locations fetch — no new backend endpoints needed.

---

## Issue 2 — "Izmeni" modal appears behind the tab strip

When "Izmeni" is clicked on a stop, the `Modal` component renders but the tab strip (and possibly the `win-panel` content wrapper) appears on top of it due to stacking context.

**Root cause:** `StopsTab` renders inside `win-panel` which has `position: relative; z-index: 0` (set inline in `AdminInner`). The `Modal` is rendered as a child of `StopsTab` — it is inside that stacking context — so `position: fixed; z-index: 50` on the modal overlay is not enough to break out of the parent stacking context.

**Fix:** Use a React Portal to render the `Modal` outside the `win-panel` stacking context. Mount it into `document.body`.

In `Admin.jsx`:
```jsx
import { createPortal } from 'react-dom';

const Modal = ({ title, onClose, children }) =>
    createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="win-dialog flex flex-col w-full max-w-lg max-h-[90vh]">
                <div className="win-titlebar">
                    <span>{title}</span>
                    <button onClick={onClose} className="win-close-btn">✕</button>
                </div>
                <div className="overflow-y-auto p-4 flex flex-col gap-3">
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
```

This applies to **all four tabs** (the `Modal` component is shared), so the portal fix resolves any z-index stacking issue across Linije, Stanice, Dodela stanica, and Polasci.

---

## Acceptance criteria

1. A "Filter by line" dropdown appears above the Stanice table; default shows all stops.
2. Selecting a line immediately filters the table to stops assigned to that line.
3. The count label reflects the filtered count vs total.
4. Clicking "Izmeni" on any tab opens the modal cleanly on top of all other content — no tab strip or panel visible above it.
5. All existing CRUD operations remain functional.
