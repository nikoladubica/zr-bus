# 032 — Automated Tests: Setup & First Tests (Learning Guide)

## Goal

Set up a testing environment for the frontend and write your first tests — starting from the easiest possible things and building up. By the end you will have a working test suite and a mental model for how testing works in a React + Vite project.

---

## Why test?

You write tests so that when you change code later — refactor a helper, rewrite a component, add a feature — you know immediately if something broke, without manually clicking through the whole app. The faster the feedback loop, the less fear you have when changing things.

---

## What stack to use

For a Vite + React project, the standard setup is:

| Tool | Role |
|---|---|
| **Vitest** | Test runner. Like Jest but built for Vite — uses the same config, same import resolution, same env. |
| **@testing-library/react** | Renders React components in tests and gives you tools to interact with them the way a real user would. |
| **@testing-library/user-event** | Simulates real user actions (typing, clicking) more accurately than `.click()`. |
| **@testing-library/jest-dom** | Adds useful matchers like `.toBeInTheDocument()`, `.toHaveTextContent()`, etc. |
| **jsdom** | A fake browser environment that runs inside Node so your components can render without a real browser. |

---

## Step 1 — Install dependencies

Inside the `frontend/` directory:

```bash
cd frontend
npm install --save-dev vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

---

## Step 2 — Configure Vitest

Open `frontend/vite.config.js` and add a `test` block. It sits alongside your existing `plugins` and `server` config — Vitest reads it from the same file.

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',          // fake browser (DOM, window, localStorage)
    globals: true,                 // no need to import describe/it/expect in every file
    setupFiles: './src/test/setup.js',  // runs before every test file
  },
})
```

**What `environment: 'jsdom'` does:** your tests run in Node, but `jsdom` simulates a browser. That means `document`, `window`, `localStorage`, and `navigator` all exist — your components can render as if they were in Chrome.

**What `globals: true` does:** you can write `describe(...)`, `it(...)`, `expect(...)` without importing them. Same as Jest. If you ever want auto-complete in your editor, add `"types": ["vitest/globals"]` to `tsconfig.json` or `jsconfig.json`.

---

## Step 3 — Create the setup file

Create `frontend/src/test/setup.js`:

```js
import '@testing-library/jest-dom'
```

This one line makes matchers like `.toBeInTheDocument()` available in every test. Without it, those matchers don't exist and you'd get "is not a function" errors.

---

## Step 4 — Add a test script

In `frontend/package.json`, add to the `scripts` section:

```json
"test": "vitest",
"test:run": "vitest run",
"test:coverage": "vitest run --coverage"
```

- `npm test` — runs in watch mode (re-runs on file save, great during development)
- `npm run test:run` — runs once and exits (good for CI)
- `npm run test:coverage` — generates a coverage report

---

## Step 5 — Write your first tests (pure utility functions)

**Always start with pure functions.** A pure function takes inputs and returns an output with no side effects — no API calls, no DOM, no state. They are trivial to test and a great way to learn the syntax.

`helpers.js` is full of them. Create `frontend/src/utils/helpers.test.js`:

```js
import { describe, it, expect } from 'vitest'
import {
    getDistance,
    normalizeForSearch,
    todayDayType,
    findDirectRoutes,
    getClosestStop,
    getNearbyStops,
} from './helpers'

// ─── getDistance ────────────────────────────────────────────────────────────

describe('getDistance', () => {
    it('returns 0 when origin and destination are the same point', () => {
        const point = [45.38, 20.39]
        expect(getDistance(point, point)).toBe(0)
    })

    it('returns a positive number of metres between two different points', () => {
        const zrenjanin = [45.38, 20.39]
        const noviSad   = [45.25, 19.83]
        const dist = getDistance(zrenjanin, noviSad)
        expect(dist).toBeGreaterThan(0)
        // Novi Sad is roughly 45 km from Zrenjanin
        expect(dist).toBeGreaterThan(40_000)
        expect(dist).toBeLessThan(60_000)
    })
})

// ─── normalizeForSearch ──────────────────────────────────────────────────────

describe('normalizeForSearch', () => {
    it('lowercases latin text', () => {
        expect(normalizeForSearch('Centar')).toBe('centar')
    })

    it('transliterates Cyrillic to Latin', () => {
        // "Centar" in Cyrillic
        expect(normalizeForSearch('Центар')).toBe('centar')
    })

    it('strips diacritics after transliteration', () => {
        expect(normalizeForSearch('Žitište')).toBe('zitiste')
    })

    it('returns empty string for falsy input', () => {
        expect(normalizeForSearch(null)).toBe('')
        expect(normalizeForSearch('')).toBe('')
        expect(normalizeForSearch(undefined)).toBe('')
    })
})

// ─── todayDayType ───────────────────────────────────────────────────────────

describe('todayDayType', () => {
    // We can't easily control what day it is, but we can assert
    // the return value is one of the three valid options.
    it('returns workday, saturday, or sunday', () => {
        const result = todayDayType()
        expect(['workday', 'saturday', 'sunday']).toContain(result)
    })

    // To test a specific day, we mock the Date constructor:
    it('returns saturday on a Saturday', () => {
        const RealDate = Date
        // vi.setSystemTime is the Vitest way to control time
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-06-27')) // a Saturday
        expect(todayDayType()).toBe('saturday')
        vi.useRealTimers()
    })

    it('returns sunday on a Sunday', () => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2026-06-28')) // a Sunday
        expect(todayDayType()).toBe('sunday')
        vi.useRealTimers()
    })
})

// ─── findDirectRoutes ────────────────────────────────────────────────────────

describe('findDirectRoutes', () => {
    // Build a minimal fake allLinesLocations array for these tests.
    // Each entry needs: locations.id, lines.id, stop_number.
    const allLL = [
        { lines: { id: 1 }, locations: { id: 10 }, stop_number: 1 },
        { lines: { id: 1 }, locations: { id: 20 }, stop_number: 3 },
        { lines: { id: 1 }, locations: { id: 30 }, stop_number: 5 },
        { lines: { id: 2 }, locations: { id: 10 }, stop_number: 2 },
        { lines: { id: 2 }, locations: { id: 20 }, stop_number: 1 }, // reversed order on line 2
    ]

    it('finds a direct route when from comes before to on the same line', () => {
        const routes = findDirectRoutes(10, 20, allLL)
        expect(routes).toHaveLength(1)
        expect(routes[0].fromEntry.lines.id).toBe(1)
    })

    it('does not find a route when from comes after to (wrong direction)', () => {
        // On line 2, stop 20 is at position 1 and stop 10 is at position 2
        // so going 20 → 10 IS valid on line 2, but 10 → 20 is NOT
        const routes = findDirectRoutes(20, 10, allLL)
        // line 1: stop 10 is at pos 1, stop 20 is at pos 3 → valid (20→10 is wrong dir on line1)
        // we're asking 20→10: on line1 stop20 pos3 > stop10 pos1, so no match for 20→10
        expect(routes).toHaveLength(0)
    })

    it('returns empty array when from and to are on different lines only', () => {
        const routes = findDirectRoutes(10, 99, allLL)
        expect(routes).toHaveLength(0)
    })
})

// ─── getClosestStop ──────────────────────────────────────────────────────────

describe('getClosestStop', () => {
    const allLL = [
        { locations: { id: 1, lat: 45.380, lng: 20.390 } },
        { locations: { id: 2, lat: 45.385, lng: 20.395 } },
        { locations: { id: 3, lat: 45.400, lng: 20.410 } },
    ]

    it('returns null when currentLocation is missing', () => {
        expect(getClosestStop(allLL, null)).toBeNull()
        expect(getClosestStop(allLL, {})).toBeNull()
        expect(getClosestStop(allLL, { lat: null, lng: null })).toBeNull()
    })

    it('returns null for empty input', () => {
        expect(getClosestStop([], { lat: 45.38, lng: 20.39 })).toBeNull()
    })

    it('returns the nearest stop', () => {
        // Standing almost exactly at stop 1
        const me = { lat: 45.380, lng: 20.390 }
        const result = getClosestStop(allLL, me)
        expect(result.locationId).toBe(1)
    })

    it('includes a distance in metres', () => {
        const me = { lat: 45.380, lng: 20.390 }
        const result = getClosestStop(allLL, me)
        expect(typeof result.distance).toBe('number')
        expect(result.distance).toBeGreaterThanOrEqual(0)
    })
})
```

Run with:

```bash
npm run test:run
```

You should see green checkmarks for every `it(...)` block.

---

## Step 6 — Understand the test anatomy

Every test follows the same pattern:

```
describe('what thing am I testing', () => {
    it('what should happen in this specific case', () => {
        // 1. ARRANGE — set up the data
        const input = 'Центар'

        // 2. ACT — call the function
        const result = normalizeForSearch(input)

        // 3. ASSERT — check the result
        expect(result).toBe('centar')
    })
})
```

This is called **AAA (Arrange–Act–Assert)**. Every test you ever write follows this shape.

**Common matchers:**

| Matcher | Use for |
|---|---|
| `.toBe(value)` | Primitive equality (`===`) |
| `.toEqual(value)` | Deep equality (objects, arrays) |
| `.toBeNull()` | Strict null check |
| `.toBeUndefined()` | Strict undefined check |
| `.toBeTruthy()` / `.toBeFalsy()` | Loosely truthy/falsy |
| `.toContain(item)` | Array contains item, or string contains substring |
| `.toHaveLength(n)` | Array or string length |
| `.toBeGreaterThan(n)` | Number comparison |
| `.toThrow()` | Function throws an error |
| `.toBeInTheDocument()` | DOM node exists (from jest-dom) |
| `.toHaveTextContent(str)` | DOM node contains text (from jest-dom) |

---

## Step 7 — Test the Zustand store (intermediate)

The Zustand store has pure logic too — actions like `addFavourite`, `removeFavourite`, `toggleFavourite`, and `addRecentSearch` don't fetch anything. They just update state.

Create `frontend/src/store/client/createLineSlice.test.js`:

```js
import { describe, it, expect, beforeEach } from 'vitest'
import { create } from 'zustand'
import createLineSlice from './createLineSlice'

// Create a fresh store before each test so tests don't bleed into each other.
let useStore
beforeEach(() => {
    useStore = create(createLineSlice)
})

describe('favourites', () => {
    it('starts with no favourites', () => {
        expect(useStore.getState().favourites).toEqual([])
    })

    it('addFavourite adds a locationId', () => {
        useStore.getState().addFavourite(42)
        expect(useStore.getState().favourites).toContain(42)
    })

    it('addFavourite does not add duplicates', () => {
        useStore.getState().addFavourite(42)
        useStore.getState().addFavourite(42)
        expect(useStore.getState().favourites).toHaveLength(1)
    })

    it('removeFavourite removes the locationId', () => {
        useStore.getState().addFavourite(42)
        useStore.getState().removeFavourite(42)
        expect(useStore.getState().favourites).not.toContain(42)
    })

    it('isFavourite returns true after adding', () => {
        useStore.getState().addFavourite(99)
        expect(useStore.getState().isFavourite(99)).toBe(true)
    })

    it('isFavourite returns false for unknown id', () => {
        expect(useStore.getState().isFavourite(999)).toBe(false)
    })

    it('toggleFavourite adds when not present', () => {
        useStore.getState().toggleFavourite(5)
        expect(useStore.getState().isFavourite(5)).toBe(true)
    })

    it('toggleFavourite removes when already present', () => {
        useStore.getState().addFavourite(5)
        useStore.getState().toggleFavourite(5)
        expect(useStore.getState().isFavourite(5)).toBe(false)
    })
})

describe('recent searches', () => {
    it('addRecentSearch prepends to the list', () => {
        useStore.getState().addRecentSearch({ type: 'stop', id: 1 })
        useStore.getState().addRecentSearch({ type: 'stop', id: 2 })
        expect(useStore.getState().recentSearches[0]).toEqual({ type: 'stop', id: 2 })
    })

    it('addRecentSearch deduplicates by type+id', () => {
        useStore.getState().addRecentSearch({ type: 'stop', id: 1 })
        useStore.getState().addRecentSearch({ type: 'stop', id: 1 })
        expect(useStore.getState().recentSearches).toHaveLength(1)
    })

    it('addRecentSearch keeps only the last 5 entries', () => {
        for (let i = 0; i < 7; i++) {
            useStore.getState().addRecentSearch({ type: 'stop', id: i })
        }
        expect(useStore.getState().recentSearches).toHaveLength(5)
    })
})

describe('search state', () => {
    it('openSearch sets isSearchOpen to true', () => {
        useStore.getState().openSearch()
        expect(useStore.getState().isSearchOpen).toBe(true)
    })

    it('closeSearch resets query and closes', () => {
        useStore.getState().openSearch()
        useStore.getState().setSearchQuery('test')
        useStore.getState().closeSearch()
        expect(useStore.getState().isSearchOpen).toBe(false)
        expect(useStore.getState().searchQuery).toBe('')
    })
})
```

---

## Step 8 — Test a React component (advanced)

Component tests render a real (but isolated) component and assert what the user would see or interact with. You always test **behaviour**, not implementation details.

The simplest component in the project is `Button`. Create `frontend/src/components/UI/Button.test.jsx`:

```jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import Button from './Button'
```

> **Before writing the test**, open `Button.jsx` and read it. Look at:
> - What props does it accept? (`onClick`, `children`, `disabled`, `className`?)
> - Does it render as a `<button>` tag?
>
> Then write tests for that real behaviour. Example structure:

```jsx
describe('Button', () => {
    it('renders its children as text', () => {
        render(<Button>Klikni me</Button>)
        expect(screen.getByText('Klikni me')).toBeInTheDocument()
    })

    it('calls onClick when clicked', async () => {
        const user = userEvent.setup()
        const handleClick = vi.fn()   // vi.fn() creates a fake function that records calls

        render(<Button onClick={handleClick}>Klikni</Button>)
        await user.click(screen.getByText('Klikni'))

        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('does not call onClick when disabled', async () => {
        const user = userEvent.setup()
        const handleClick = vi.fn()

        render(<Button onClick={handleClick} disabled>Klikni</Button>)
        await user.click(screen.getByText('Klikni'))

        expect(handleClick).not.toHaveBeenCalled()
    })
})
```

**Key concepts here:**

- `render(<Component />)` — mounts the component into the fake DOM
- `screen.getByText('...')` — finds an element by its visible text (the way a user would find it)
- `vi.fn()` — a mock function; records how many times it was called and with what arguments
- `await user.click(...)` — simulates a real click (always `await` user-event actions)
- `expect(fn).toHaveBeenCalledTimes(1)` — asserts the mock was called exactly once

---

## Step 9 — What NOT to test (for now)

Skip these until you are comfortable with the basics:

- **Components that use Leaflet/map** — the map library does not work in jsdom; you'd need to mock the whole library
- **Async store actions (`fetchLines`, `fetchLinesLocations`)** — these do real `fetch()` calls; testing them needs you to mock `fetch` globally, which is a step further
- **`localStorage` persistence** — jsdom has `localStorage` but `createLineSlice` initialises it at module load time, which makes isolation tricky; skip for now

---

## Step 10 — Coverage report

After your tests pass, run:

```bash
npm run test:coverage
```

This outputs a table showing what percentage of each file is covered by tests. You will see something like:

```
 % Stmts | % Branch | % Funcs | % Lines | File
---------|----------|---------|---------|-------------------
   100   |   95.0   |  100    |  100    | helpers.js
    12   |    8.0   |   14    |   12    | createLineSlice.js
```

**Don't chase 100% coverage.** Cover the logic that has real failure modes. Coverage is a tool for finding gaps, not a goal in itself.

---

## File structure after completing this ticket

```
frontend/
├── vite.config.js                         ← add test block
├── src/
│   ├── test/
│   │   └── setup.js                       ← new
│   ├── utils/
│   │   └── helpers.test.js                ← new
│   ├── store/client/
│   │   └── createLineSlice.test.js        ← new
│   └── components/UI/
│       └── Button.test.jsx                ← new
```

---

## Checklist

- [ ] Install vitest, @testing-library/react, @testing-library/user-event, @testing-library/jest-dom, jsdom
- [ ] Add `test` block to `vite.config.js`
- [ ] Create `src/test/setup.js`
- [ ] Add `test`, `test:run`, `test:coverage` scripts to `package.json`
- [ ] Write and pass `helpers.test.js` (all utility functions)
- [ ] Write and pass `createLineSlice.test.js` (favourites + search state)
- [ ] Open `Button.jsx`, read it, then write `Button.test.jsx`
- [ ] Run `npm run test:coverage` and read the output
