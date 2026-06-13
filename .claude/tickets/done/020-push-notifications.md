# TICKET-020: Push Notifications — "Podseti me" Departure Reminders

**Status:** Open
**Priority:** Low
**Area:** Frontend + Backend

## Context

The redesign report reserves a **"Podseti me"** (remind me) action per departure as a later-phase
PWA feature — see `design-research-and-current-audit.md`, Part 3 → "How every roadmap feature
lands" ("Push notifications"). The goal: a user viewing a stop taps "Podseti me" on a departure
and gets a notification a few minutes before the bus leaves, so they know when to head to the
stop — the "GO mode" nudge called out in the Part 1 research.

This is the **final, optional** layer of the PWA arc. It sits on top of the installable
service-worker app delivered in **017** and the Stop Detail departure rows from **013**.

Depends on: **017** (PWA / service worker registered), **013** (Stop Detail departure rows that
host the action), **018** (`day_type` — so the reminder targets the right schedule).

## What's missing

- A **"Podseti me"** affordance on each departure row in Stop Detail (013) and the Next Bus card
- Permission flow: request `Notification` permission only on first use of the action, never on load
- Scheduling a local reminder for `departure − lead time` (default ~5 min, ideally configurable)
- Delivery via the **service worker** so the reminder fires even when the tab is backgrounded /
  the PWA is closed (Notification Triggers where available, otherwise a registered fallback)
- A way to see and cancel pending reminders (e.g. the action toggles to "Otkaži podsetnik")
- Bilingual (Latin/Cyrillic) notification copy, e.g. "Autobus 12 → Centar polazi za 5 min"

## Acceptance criteria

1. Each departure exposes a "Podseti me" action that schedules a reminder ahead of departure
2. Notification permission is requested on first use only — not on app load; a denied permission
   degrades gracefully with a clear message, no crash
3. A scheduled reminder fires at roughly `departure − lead time` and shows the line, destination,
   and minutes remaining, in the active script
4. A user can cancel a pending reminder; cancelled reminders do not fire
5. Reminders survive a page reload (persisted, e.g. `localStorage` + re-registration on load)
6. No regression to normal online/offline behaviour from 017

## Notes

- **Decide the delivery mechanism explicitly in the PR.** True server-sent Web Push (VAPID keys +
  a `push_subscriptions` table + a backend cron that pushes at the right time) is the robust path
  but a real backend effort. A **client-side scheduled local notification** (service-worker timer
  / Notification Triggers API) is far simpler and likely enough for a single-city app where the
  schedule is known in advance — recommend starting here and noting the trade-off.
- If Web Push is chosen, the backend work (subscription storage, VAPID, scheduled sender) should
  be split into its own follow-up ticket — keep this ticket client-scheduled unless decided
  otherwise.
- iOS Safari only supports web notifications for **installed** PWAs (home-screen) and has limited
  background scheduling — document the platform limits; this is best-effort on iOS.
- Lead time should be sensible by default and ideally adjustable later in the settings sheet (016).
- Out of scope: real-time "bus is arriving" pushes based on live vehicle positions — that needs a
  GTFS-RT feed the operator does not provide (roadmap "Blocked by data").
