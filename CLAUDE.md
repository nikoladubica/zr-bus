# ZR-Bus — CLAUDE.md

## Project Overview

Public transit app for Zrenjanin, Serbia. Shows bus routes on an interactive map, lets users find their nearest stop, and will eventually display departure schedules. Bilingual (Latin + Cyrillic Serbian).

## Architecture

Monorepo with two packages:

| Layer | Tech | Port |
|---|---|---|
| Backend | NestJS 10 + TypeORM + MariaDB | 3000 |
| Frontend | React 19 + Vite + Zustand + Leaflet | 5173 |

```
zr-bus/
├── backend/        NestJS REST API
│   └── src/
│       ├── database/           TypeORM data source + custom DB module
│       ├── lines/              Bus lines (number, color, direction)
│       ├── lines-locations/    Junction: which stops belong to which line
│       ├── lines-locations-departures/  Departure schedules (incomplete)
│       ├── lines-routes/       GIS polyline routes (ST_AsGeoJSON)
│       └── locations/          Bus stops (lat/lng, names)
└── frontend/       React SPA
    └── src/
        ├── assets/             Icons, images
        ├── components/
        │   ├── Elements/       Header, Footer, Map, MapLineSwitcher
        │   ├── Pages/          Home, About
        │   └── UI/             Button, Card (reusable)
        ├── context/            ThemeContext, ScriptContext (stubs)
        ├── store/client/       Zustand store (createLineSlice)
        └── utils/              api.js (endpoints), enums.js (tiles, defaults), helpers.js (Haversine)
```

## Dev Commands

```bash
npm run dev          # backend + frontend concurrently
npm run backend      # NestJS only (watch mode)
npm run frontend     # Vite only
```

## Database

MariaDB, credentials in `backend/.env`:
- `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=zr_bus`

Tables: `lines`, `locations`, `lines_locations`, `lines_locations_departures`, `lines_routes`

Routes are stored as MySQL geometry `LineString` (SRID 4326); queries use `ST_AsGeoJSON` to return GeoJSON.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | /lines | All bus lines |
| GET | /locations | All stops |
| GET | /lines-locations | All line–stop mappings |
| GET | /lines-locations/:lineId | Stops for a specific line |
| GET | /lines-routes | All route geometries |
| GET | /lines-routes/:lineId | Route geometry for a specific line |
| GET | /lines-locations-departures | All departures (relations incomplete) |

## Frontend State (Zustand)

Single slice `createLineSlice` in `store/client/useStore.js`:

- `activeLine` — currently selected line id
- `line` — active line object
- `data` — all fetched route data
- `linesLocations` — stops for active line
- `currentLocation` — `{ lat, lng }` from geolocation
- `mapCenter` / `mapZoom` — controls `MapChangeView`

Key actions: `fetchLines()`, `fetchLinesLocations(lineId)`, `filterLineById(id)`, `getCurrentLocationWithRecenter()`

## Map

React-Leaflet 5. Multiple tile options in `utils/enums.js` (Grayscale, Light, OSM, Google). Default center: `45.38°N, 20.39°E` (Zrenjanin). Bidirectional routes: solid polyline for direction A, dashed for direction B.

## Known Incomplete Areas

- `context/ThemeContext.js` — stub, theme switching not wired up
- `context/ScriptContext.js` — stub, Latin/Cyrillic switcher not wired up
- `Footer.jsx` — component exists but commented out in `App.jsx`
- Departure schedules — entity and endpoint exist but UI not built
- Debug `console.log` in `Map.jsx` around line 45–48

## Deployment — Required Environment Variables

Before building or deploying, copy each package's `.env.example` to `.env` and fill in real values. **Never commit `.env` files.**

**`backend/.env`** — `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_DATABASE`, `NODE_ENV=production`, `ALLOWED_ORIGIN` (frontend origin, e.g. `https://zrbus.ddns.net`), `PORT` (optional, defaults to 3000).

**`frontend/.env`** — `VITE_API_URL` (backend origin, e.g. `https://api.zrbus.ddns.net`). Set at Vite build time; drives both the API base URL and the PWA service-worker cache pattern.

## Coding Conventions

- Backend: TypeScript, NestJS decorators, repository pattern
- Frontend: JavaScript JSX (not TypeScript), functional components, Zustand for all shared state
- Styling: Tailwind CSS 4, glassmorphic design, oklch gradients, dark theme
- No comments unless the WHY is non-obvious
