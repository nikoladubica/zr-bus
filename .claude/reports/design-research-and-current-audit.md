# ZR-Bus — Design Research & Current UX Audit

*Generated: 2026-06-10*

> **Scope of this report:** Part 1 is research into comparable transit apps and the
> UX patterns they share. Part 2 is an honest audit of ZR-Bus's current design against
> those patterns. Part 3 is the redesign proposal: **mobile-first, desktop-capable**, with
> the bottom-sheet flow spec'd in detail and all roadmap features accounted for in the
> information architecture.

---

## Part 1 — Research: How the Best Transit Apps Are Designed

### The apps worth learning from

| App | Why it's relevant to ZR-Bus | Signature strength |
|---|---|---|
| **Transit** (4.7★, 200+ cities) | Closest to your use case — "what's my next bus, right now" | Real-time departures front-and-center, "GO" mode nudges when to leave |
| **Citymapper** | The benchmark for *clean, intuitive* transit UX | Two taps to a ranked route; map + bottom sheet home screen |
| **Moovit** | Crowd-sourced data in cities operators ignore | Works where official data is poor — directly relevant to your data problem |
| **Google Maps Transit** | The baseline everyone compares against | Universal, but generic — not optimised for a single city's regulars |
| **BusyBus / "Catch the Bus" case studies** | Small single-city bus apps, same scale as ZR-Bus | Show how a focused app beats Google Maps for daily commuters |

### The patterns they all converge on

Across every source, the same handful of patterns show up. These are effectively the
"table stakes" of a modern transit app:

**1. The map is the hero — with a bottom sheet over it.**
Citymapper's home screen *is* a map showing your location, with a draggable panel on top.
Swipe the panel down → full map. Swipe up → list of nearby stops and departures. The map
is never boxed inside a card; it fills the screen. This is the single most important pattern
ZR-Bus is missing.

**2. The answer comes before the interaction.**
> "Bus apps solve two needs: what is the next arriving bus, and how much time do I have to
> get to the stop."

The best apps answer this *on open*, with zero taps. The closest stop and its next
departures are shown immediately after location resolves. You don't hunt for it.

**3. "Nearby" is a first-class screen.**
Transit and Citymapper both have a "Near" / "Nearby" view: a scrollable list of the stops
around you, each showing the next departure per line. It's the default landing surface for
regular commuters.

**4. The next departure is visually distinguished.**
Times are never an undifferentiated list. The *next* bus is large and highlighted, often with
a live countdown ("4 min"), and following departures are smaller below it.

**5. Saved / favourite stops.**
Bookmarking your home and work stops is universal. Regulars don't want to search every day.

**6. Search with autocomplete.**
People who know their stop or line name type it rather than panning a map.

**7. City-inspired, restrained branding.**
> "Tailor the color palette to reflect local character." 

Good transit apps use *one* clear accent and let the line colours do the talking — they
don't compete with the data.

**8. Minimal chrome.**
Filters and toggles are tucked away (a filter sheet, a settings screen), not crowding the
main view. The map and the times get the space.

**Sources:**
- [Transit / Citymapper / Moovit comparison — Expeditiondash](https://expeditiondash.com/2025/10/24/best-public-transport-apps/)
- [Best free transit apps — Popular Science](https://www.popsci.com/diy/best-free-public-transit-apps/)
- [Mobile UX best practices for transit apps — AltexSoft](https://www.altexsoft.com/blog/best-mobile-user-experience-design-practices-for-public-transportation-apps/)
- [Transportation app UI/UX best practices — Fuselab Creative](https://fuselabcreative.com/transportation-app-ui-ux-design-best-practices/)
- [Bus tracking app UI guide — BusWhere](https://www.buswhere.com/bus-tracking-app-ui/)
- [Catch the Bus — UI/UX case study (Medium)](https://medium.com/@sarasmart0626/catch-the-bus-mobile-app-ui-ux-case-study-165b1e2e54c)
- [Improving Citymapper's home screen (Medium)](https://medium.com/@shawnzvinis/how-i-would-improve-citymappers-home-screen-6259861d200d)

---

## Part 2 — Audit: Where ZR-Bus Stands Today

### What the app currently does (as built)

The app is a single scrolling page of stacked glassmorphic cards:

```
┌─ Header card ─────────────────────────────┐
│  Logo        [☀] [Lat]  [Lociraj me]      │
└───────────────────────────────────────────┘
   h1: "Najbrži način da nađeš autobus..."   ← marketing headline
   Line switcher: [12] [14▸A▸B] [18] ...     ← custom expanding pills
   h2: "[Linija 12] Bagljaš – Centar"
┌─ Map card (480px tall, boxed) ────────────┐
│   Leaflet map with route + stops          │
│   ┌ stop info panel (absolute, bottom-L) ┐│
│   │ Stop name / departure time chips     ││
│   └──────────────────────────────────────┘│
└───────────────────────────────────────────┘
┌─ Info hint card ──────────────────────────┐
│  ⓘ Klikni na stanicu... • Odaberi liniju  │
└───────────────────────────────────────────┘
┌─ Footer card ─────────────────────────────┐
└───────────────────────────────────────────┘
```

### Honest assessment — why it doesn't feel intuitive

**1. It buries the core answer.** Your own goal is "when is my next bus." Today that takes:
open app → understand the line switcher → pick a line → find your stop on the map → click it
→ read a wall of equally-sized time chips → mentally figure out which one is next. That's
6+ steps and a calculation, to answer the one question the app exists for. Best-in-class apps
answer it in zero taps.

**2. The map is a passenger, not the driver.** It's locked inside a 480px card in the middle
of a scrolling page. Every comparable app makes the map the full-screen hero with content
floating over it. The current layout reads like a *landing page about a transit app* rather
than the transit app itself — the marketing `h1` ("Najbrži način da nađeš autobus...") sits in
prime real estate above the map.

**3. The line switcher is clever but unintuitive.** The custom pill that expands to reveal
direction A / B with rotating arrows (`MapLineSwitcherItem.jsx`) is a novel interaction users
have to *learn*. Direction is exposed as raw "A"/"B" labels rather than human destinations
("→ Centar" / "→ Bagljaš"). Selecting a line is the primary action, yet it's the least
conventional control in the app.

**4. Departures have no hierarchy.** The stop panel shows times as identical chips with no
"next bus", no countdown, no grouping. (The day-type data gap noted in the roadmap is the root
cause — without workday/weekend separation the list can't be trustworthy anyway.)

**5. The stop panel is desktop-shaped.** It's a small absolutely-positioned box in the
bottom-left corner of the map card — not a mobile bottom sheet. On a phone, where this app will
mostly be used, that's the wrong pattern.

**6. Header is getting crowded.** Theme toggle + script toggle + "Lociraj me" are three
controls competing in a small bar. The two display toggles (theme, script) are settings, not
primary actions, and don't belong next to the main CTA.

**7. Missing the regular-commuter essentials.** No favourites, no search, no "nearby stops"
list. The app assumes every visit starts from scratch with the map — but your real users
(including you) ride the *same* stops every day.

**8. Visual identity is generic glassmorphism.** The frosted-card-on-gradient look is
pleasant but says nothing about Zrenjanin or buses, and the translucent cards reduce contrast
on the data (times, names) that should be the most legible thing on screen.

### What's actually good and worth keeping

- **Line colours** are already a strong, usable visual system — lean into them harder.
- **Bilingual + theme support** is real, working infrastructure most apps at this stage lack.
- **Closest-stop detection** (Haversine) already exists in the store — the data for a
  zero-tap "next bus" experience is half-built.
- The **component library** (`Card`, `Button`) and Zustand store are clean foundations to
  rebuild the UI on without backend changes.

---

## Summary

The current design is built like a **website that contains a map**. Every comparable transit
app is built like a **map that contains an answer**. The gap isn't styling — it's information
architecture and interaction flow: the map should be the hero, the next bus should appear
without being asked for, and the daily essentials (favourites, nearby, search) are missing.

The good news: the data layer and component foundations are solid enough that this is a
**front-end-only redesign**, not a rebuild.

---

## Part 3 — Redesign Proposal

### Design principles

1. **Mobile-first, desktop-capable.** The phone is the primary device. Desktop is supported
   by promoting the bottom sheet to a fixed side panel — same content, different container.
2. **Map is the hero.** Full-bleed map as the base layer on every screen. No more boxed map.
3. **Answer before interaction.** The next bus for the closest (or favourite) stop is visible
   the moment the map resolves location — zero taps.
4. **Line colours carry the identity.** One restrained app accent; the line palette does the
   talking. Data surfaces become more opaque/solid for legibility (less heavy glass over text).
5. **Settings are settings.** Theme and script toggles leave the main bar and live in a
   settings sheet.

---

### The core layout

#### Mobile (default)

```
┌───────────────────────────────┐
│  ⌕ Pretraži stanicu / liniju  │  ← floating search pill (top)
│                          [⚙]  │  ← settings button
│                               │
│                               │
│         FULL-BLEED MAP        │  ← base layer, fills screen
│         routes + stops        │
│                               │
│                        ┌────┐ │
│                        │ ◎  │ │  ← "Locate me" FAB (above sheet)
│                        └────┘ │
│ ╭───────────────────────────╮ │
│ │           ▔▔▔             │ │  ← grab handle
│ │  Sledeći autobus          │ │  ← BOTTOM SHEET (peek state)
│ │  Bagljaš  •  Linija 12    │ │
│ │  ▶ 4 min   pa 19, 34, 51  │ │
│ ╰───────────────────────────╯ │
└───────────────────────────────┘
```

#### Desktop

```
┌──────────────┬──────────────────────────────┐
│  ⌕ Pretraži  │                              │
│              │                              │
│  SIDE PANEL  │        FULL-BLEED MAP        │
│  (sheet      │        routes + stops        │
│   content,   │                              │
│   persistent │                       ┌────┐ │
│   ~380px)    │                       │ ◎  │ │
│              │                       └────┘ │
└──────────────┴──────────────────────────────┘
```

The sheet content and the sidebar content are the **same component** rendered into a different
container. One source of truth, two presentations.

---

### The bottom sheet — detailed spec

The sheet is the heart of the redesign. It is a **draggable, snap-point panel** on mobile and
a **fixed sidebar** on desktop.

#### Snap points (mobile)

| State | Height | Trigger | Shows |
|---|---|---|---|
| **Peek** | ~18% | default on load | "Next bus" answer card for closest/favourite stop |
| **Half** | ~55% | drag up once, or tap search | Favourites → Nearby stops list → search field |
| **Full** | ~92% | drag up again, or focus search | Full search results / scrollable nearby list / stop detail |

Dragging is gesture-driven (grab handle at top); each release snaps to the nearest point.
Tapping a stop on the map snaps the sheet to **Half** and swaps its content to **Stop Detail**.

#### Sheet content by context

**A. Default content (no stop selected)** — stacked, scrollable:

```
▔▔▔  (handle)
┌─ NEXT BUS ──────────────────────────────┐
│  Bagljaš (najbliža stanica · 120 m)  ★  │
│  ● 12  → Centar                          │
│  ▶ 4 min        pa 19 · 34 · 51          │  ← next = large, rest small
└──────────────────────────────────────────┘
┌─ OMILJENE ──────────────────────────────┐   ← favourites (if any)
│  ● 14  Trg slobode      → 7 min          │
│  ● 18  Železnička       → 12 min         │
└──────────────────────────────────────────┘
┌─ STANICE U BLIZINI ─────────────────────┐   ← nearby list
│  Bulevar (210 m)     ● 12 ● 14   3 min   │
│  Gimnazija (340 m)   ● 18        9 min   │
│  ...                                      │
└──────────────────────────────────────────┘
```

**B. Stop detail (a stop is tapped)** — replaces default content:

```
▔▔▔  (handle)
┌──────────────────────────────────────────┐
│  ‹ Nazad            Bagljaš           ★   │  ← back + favourite star
│  ─────────────────────────────────────── │
│  [ Radni dan ] [ Subota ] [ Nedelja ]    │  ← day-type tabs (needs day_type)
│  ─────────────────────────────────────── │
│  ● 12  → Centar                           │
│     ▶ 4 min                               │  ← NEXT departure, highlighted
│     19 · 34 · 51 · 08 · 23 …              │  ← following times
│  ─────────────────────────────────────── │
│  ● 14  → Trg slobode                      │
│     ▶ 11 min                              │
│     26 · 41 · 56 …                        │
│  ─────────────────────────────────────── │
│  Ceo red vožnje za liniju 12  ›           │  ← link to timetable page
└──────────────────────────────────────────┘
```

This single view delivers four roadmap features at once: **multi-line stop view**,
**next-departure highlight**, **live countdown**, and **day-type grouping**.

---

### Component-level changes

| Area | Today | Redesign |
|---|---|---|
| **App shell** | Scrolling stack of cards, `p-8` | Full-bleed map + overlay UI; no page scroll |
| **Map** | Boxed in 480px card | Base layer, full viewport |
| **Line switcher** | Custom expanding A/B pills | Horizontal scrollable colour chips; direction shown as **human destinations** ("→ Centar"), not "A"/"B" |
| **Stop info** | Absolute box, bottom-left | Bottom-sheet "Stop Detail" state |
| **Header** | Logo + theme + script + locate | Floating search pill + settings button; "Locate me" becomes a map FAB |
| **Settings** | Two toggles in header | Dedicated settings sheet (theme, script/language) |
| **Departures** | Equal chips | Next highlighted + countdown + day-type tabs |
| **Surfaces** | Heavy translucent glass | More opaque sheet for text legibility; keep glass for floating controls |

---

### How every roadmap feature lands in this design

| Roadmap feature | Where it lives in the new UI |
|---|---|
| **Next bus (closest/favourite)** | Sheet **Peek** state — the zero-tap answer |
| **Highlight next departure** | Stop Detail — `▶` highlight + countdown |
| **Favourite station** | Star (★) in Next Bus card & Stop Detail; "Omiljene" section in sheet |
| **Nearby stops** | "Stanice u blizini" section in sheet |
| **Search / autocomplete** | Floating search pill → expands sheet to Full with results |
| **Timetable page** | New `/red-voznje` route; reached from Stop Detail "Ceo red vožnje ›" |
| **Live countdown** | Shared helper, used in Peek, Favourites, Nearby, Stop Detail |
| **Multi-line stop view** | Stop Detail lists every line at that stop |
| **Day-type schedules** | Tabs in Stop Detail & Timetable (needs backend `day_type`) |
| **Push notifications** | "Podseti me" action per departure (PWA, later phase) |
| **Trip planner (A→B)** | Reserved: second tab in the search pill ("Stanica" / "Ruta") |
| **Offline / PWA** | Installable; service worker caches routes + schedules |
| **Admin / field survey** | Separate `/admin` area; reuses the design system, not part of the public shell |

---

### Backend dependency to flag

Day-type tabs (Stop Detail + Timetable) and trustworthy "next bus" math need the
**`day_type ENUM` schema change** from the roadmap (`schema-day-type`). The redesign tickets
below are **front-end only**; where a feature needs day-type data, the ticket notes it and the
UI degrades gracefully to a single undifferentiated list until the schema lands.

---

### Suggested build order (front-end tickets)

The tickets created from this report (008–017) are ordered so each builds on the last:

1. **008** Redesign foundation — app shell, full-bleed map, responsive frame, design tokens
2. **009** Bottom sheet component — snap points (mobile) + sidebar (desktop)
3. **010** Line switcher redesign — colour chips + human destinations
4. **011** Favourites store — localStorage persistence layer
5. **012** Home sheet — Next Bus + Nearby + Favourites (consumes 009 + 011)
6. **013** Stop detail view — multi-line, next-highlight, countdown, day-type tabs
7. **014** Search & autocomplete — stops + lines
8. **015** Timetable page — `/red-voznje`
9. **016** Settings sheet — relocate theme + script toggles
10. **017** PWA — installable + offline caching

---

*End of report. Front-end redesign tickets 008–017 created in `.claude/tickets/`.*

---

*Next: Manual entry:*

## Part 4 - Real-time vehicle positions

Research how to approach the local company to make this function possible.
