# TICKET-025: SEO Ranking + Fix "No-IP" Site Name in Google

**Status:** Open
**Priority:** High
**Area:** Frontend + Backend

## Context

We want ZR-Bus to rank near the top of Google for these high-intent local queries (Latin + Cyrillic
variants of each apply):

- `autobuske linije zrenjanin`
- `red voznje zrenjanin`
- `netbus linije`
- `gradski prevoz zrenjanin`
- `gradski linije zrenjanin`
- `bus zrenjanin`
- `autobus zrenjanin`

There are two separate problems blocking this.

### Problem 1 — Google shows "No-IP" as the site name

In the SERP, the bold site-name line above our title reads **"No-IP"** instead of **"ZR Bus"**:

```
No-IP
https://zrbus.ddns.net › Translate this page
ZR Bus: Gradske autobuske linije u Zrenjaninu
```

This is **not** a server/nginx/SSL problem — `.claude/nginx-seo.conf` (HTTPS redirect, Let's Encrypt,
security headers, gzip, SPA fallback) is correct. **Do not change anything on the Hetzner server for
this.** Google generates the SERP site name from signals in this priority order:

1. `WebSite` JSON-LD structured data on the home page *(most important)*
2. `og:site_name`
3. `<title>`
4. headings / visible page text

We currently have `og:site_name: ZR Bus` but **no `WebSite` JSON-LD at all** — the strongest signal is
missing. When signals are weak, Google falls back to the **registered domain's** brand. Because
`zrbus.ddns.net` is a free subdomain of `ddns.net`, which is **owned by No-IP**, Google attributes the
subdomain to the No-IP brand.

Decision for this ticket: **stay on `ddns.net`** and apply the structured-data mitigation + force a
recrawl. The durable fix (own domain) is documented in Notes as a future step — Google resolves site
identity at the registered-domain level, so the mitigation may not fully win on a `*.ddns.net` host.

### Problem 2 — Pure client-side SPA, identical meta on every route

The frontend is a client-rendered React SPA. Crawlers initially get an empty `<div id="root">`, the
homepage's only `<h1>` is `sr-only` over a Leaflet map (no indexable text), and **every route serves the
same hardcoded `<title>`/description/OG tags** from `index.html` (no head-management library, no SSR, no
prerender). This severely limits what can rank, especially per-line "red vožnje" pages.

Decision: add **build-time prerendering** + per-route metadata — best SEO ROI without an SSR rewrite.

Intended outcome: "ZR Bus" branding in Google, crawlable per-route HTML with keyword-targeted
titles/descriptions/structured data, and content pages that actually target the query set above.

## What needs to change

### 1. Frontend — `WebSite` + `Organization` JSON-LD (fixes "No-IP")

**File:** `frontend/index.html` (static `<head>`, so crawlers see it without running JS)

Add a `WebSite` block and an `Organization` block:

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "ZR Bus",
  "alternateName": "ЗР Бус",
  "url": "https://zrbus.ddns.net/"
}
</script>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "ZR Bus",
  "url": "https://zrbus.ddns.net/",
  "logo": "https://zrbus.ddns.net/android-chrome-512x512.png",
  "areaServed": { "@type": "City", "name": "Zrenjanin" },
  "description": "Gradski prevoz Zrenjanin — interaktivna mapa linija, stanica i redova vožnje."
}
</script>
```

### 2. Frontend — visible brand + Twitter tags

**Files:** `frontend/index.html`, `frontend/src/components/Pages/Home.jsx`

- Add **Twitter Card** meta to `index.html` (`twitter:card=summary_large_image`, `twitter:title`,
  `twitter:description`, `twitter:image`) mirroring the existing OG tags.
- Make the brand string **"ZR Bus"** visible in real on-page text on the homepage (the only `<h1>` is
  currently `sr-only`). A visible brand/heading element corroborates the site-name signal.

### 3. Frontend — build-time prerendering

**Files:** `frontend/package.json`, `frontend/vite.config.js`, `frontend/src/App.jsx`

- Add prerendering to the build (recommended `vite-react-ssg`, which supports `react-router` v7 + React
  19; a `react-snap`-style post-build crawl is an acceptable alternative).
- Prerender the **public** routes only: `/`, `/o-nama`, `/red-voznje`, and **one page per line**
  `/red-voznje/:lineId` (enumerate line IDs from `GET /lines` at build time).
- Exclude `/prijava` and `/admin*` from prerender **and** mark them `noindex`.
- Keep the deploy unchanged: GitHub Actions still runs `npm run build` and rsyncs `frontend/dist`.
  Confirm prerendered HTML lands at `dist/<route>/index.html` and that nginx `try_files` still serves the
  SPA fallback for dynamic/non-prerendered paths.

### 4. Frontend — per-route head management + page metadata

**Files:** `frontend/src/components/Pages/{Home,About,Timetable}.jsx`

Add a per-route head manager (React 19 native `<title>`/`<meta>` hoisting, or `react-helmet-async`) so
each prerendered page emits its own `<title>`, description, canonical, OG/Twitter, and route-specific
JSON-LD. Target the keyword set per page:

| Route | `<title>` | Meta description (must contain target phrase) | Structured data |
|---|---|---|---|
| `/` | `ZR Bus — Gradski prevoz Zrenjanin: linije, stanice, red vožnje` | "Gradski prevoz u Zrenjaninu: interaktivna mapa autobuskih linija, najbliža stanica i red vožnje." | `WebSite` + `Organization` + `FAQPage` |
| `/red-voznje` | `Red vožnje Zrenjanin — sve autobuske linije \| ZR Bus` | "Red vožnje za sve gradske autobuske linije u Zrenjaninu (NetBus)." | `ItemList` of lines |
| `/red-voznje/:lineId` | `Linija {N} {naziv} — red vožnje i stanice \| ZR Bus` | "Red vožnje za liniju {N} u Zrenjaninu — stanice, polasci i smerovi A/B." | `BreadcrumbList` + schedule (`Table`/`Schedule`) |
| `/o-nama` | `O nama — ZR Bus, gradski prevoz Zrenjanin (NetBus)` | "O projektu ZR Bus — gradski autobuski prevoz u Zrenjaninu, prevoznik NetBus." | `Organization` |

- Add an **`FAQPage`** JSON-LD block (homepage or About) answering: "Koje su gradske autobuske linije u
  Zrenjaninu?", "Gde je najbliža stanica?", "Ko je prevoznik (NetBus)?" — captures long-tail and the
  `netbus linije` query.
- Ensure the per-line pages render **real indexable text** in the prerendered HTML: line number/name,
  list of stop names, direction A/B, and departure times. This is what actually ranks for
  `red voznje zrenjanin` and per-line searches. Data already loads from the API — just make sure it is
  present in the prerendered output, not only after client hydration.
- Reuse the existing `ScriptContext` stub for any Latin/Cyrillic distinction.

### 5. Sitemap — include every public line page

**Files:** `frontend/public/sitemap.xml` → build-time generator (small Node script in the build), **or** a
backend `GET /sitemap.xml` endpoint proxied by nginx.

- Generate URLs for `/`, `/o-nama`, `/red-voznje`, and every `/red-voznje/:lineId` from `GET /lines`.
- Include `<lastmod>`. Keep `robots.txt` as-is (already allows all and references the sitemap).

## Acceptance criteria

1. `frontend/index.html` contains valid `WebSite` (name "ZR Bus") and `Organization` JSON-LD, plus
   Twitter Card tags; "ZR Bus" appears as visible on-page text on the homepage.
2. `npm run build` produces prerendered HTML at `dist/index.html`, `dist/o-nama/index.html`,
   `dist/red-voznje/index.html`, and `dist/red-voznje/<id>/index.html` for every line.
3. Each prerendered page has a **unique** `<title>` + meta description matching the table above, and the
   per-line pages contain real stop/departure text in the static HTML (verify with the page's JS disabled).
4. Route-specific JSON-LD (`ItemList`, `BreadcrumbList`, `FAQPage`, schedule) is present and validates in
   the Google Rich Results Test / schema.org validator with no errors.
5. `sitemap.xml` lists every public line page with `<lastmod>`; `/prijava` and `/admin*` are `noindex` and
   excluded from prerender + sitemap.
6. Deploy is unchanged (`npm run build` + rsync `dist`); nginx still serves the SPA fallback for dynamic
   paths. Lighthouse mobile SEO score ≥ 95.

## Notes

### Owner post-deploy checklist (manual — not code)

- **Google Search Console:** confirm property verification, submit `sitemap.xml`, run **URL Inspection →
  Request Indexing** on `/` and one line page to force a recrawl. The SERP site name can take a few days
  to a few weeks to flip from "No-IP" to "ZR Bus".
- **Google Business Profile:** create/claim a profile for the transit service (NetBus) if eligible — this
  is the strongest local-pack signal for "…zrenjanin" queries.
- **Local citations/backlinks:** city portal, the NetBus operator page, local directories, OpenStreetMap.
  `netbus` is the operator brand worth targeting for `netbus linije`.
- **Core Web Vitals:** verify the Leaflet map doesn't hurt LCP/CLS on mobile; lazy-load the map below the
  fold of indexable text.

### Durable fix for "No-IP" (future, out of scope here)

Because `ddns.net` is No-IP's registered domain, the only guaranteed fix is moving to our **own domain**
(e.g. `zrbus.rs`): add an A record → Hetzner IP, reissue the Let's Encrypt cert for the new host, update
`ALLOWED_ORIGIN` (backend `.env`), `VITE_API_URL` (frontend build), the canonical/OG/sitemap URLs, and
301-redirect the old `zrbus.ddns.net` host. Keep this as a separate follow-up ticket.

### Implementation cautions

- Don't hardcode the production domain in code — keep canonical/OG base URLs derivable from an env var so
  the future domain migration is a config change, not a code change.
- Prerendering must not break the PWA service worker (`src/sw.js`) or the existing `vite-plugin-pwa`
  precache — verify both still work after the build change.
