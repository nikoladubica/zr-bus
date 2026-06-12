# TICKET-018: Departures `day_type` Schema — Workday / Saturday / Sunday

**Status:** Open
**Priority:** High
**Area:** Backend (+ minor Frontend follow-on)

## Context

The redesign tickets (012 Next Bus, 013 Stop Detail tabs, 015 Timetable tabs) all depend on
being able to distinguish **workday / Saturday / Sunday** schedules. Today the
`lines_locations_departures` table has no notion of day type, so departures are one
undifferentiated list and a real "next bus" cannot be computed reliably.

This was first flagged as **[DATA-001]** in `.claude/testing/known-issues.md`:
- The entity declares `@Column({ type: 'timestamp' })` (`departure: Date`) but the DB actually
  stores/returns a **time-only** string like `"08:28:00"` — there is no date component, so day
  grouping is impossible without a dedicated field.

This ticket is the backend foundation the day-type-aware redesign features sit on. It is the
roadmap item referred to as `schema-day-type`.

## What's missing

- A `day_type` column on `lines_locations_departures`:
  `ENUM('workday', 'saturday', 'sunday')`, NOT NULL, default `'workday'`
- The entity updated to reflect both the new column **and** the true type of `departure`
  (it is a time, not a timestamp) — align the entity with reality to stop the
  timestamp/time-string mismatch
- Endpoints return `day_type` per departure so the frontend can group/tab by it
- A migration (or documented schema change consistent with how this project manages MariaDB)
- Seeded/backfilled `day_type` for existing rows (default all existing to `'workday'` unless
  better data is available)

## Acceptance criteria

1. `lines_locations_departures` has a `day_type ENUM('workday','saturday','sunday')` column,
   NOT NULL, default `'workday'`
2. The TypeORM entity exposes `day_type` and no longer mis-declares `departure` as a `timestamp`
   when the stored value is a time-only string
3. `GET /lines-locations-departures` and `GET /lines-locations-departures/:lineLocationId`
   include `day_type` in each returned departure
4. Existing rows are backfilled (default `'workday'`) so no row has a null day type
5. No regression to the existing departures endpoints or to TICKET-001's departure UI

## Notes

- Confirm how schema changes are applied in this repo (TypeORM `synchronize` vs. SQL migration)
  and follow the existing convention; if there is none, add a plain SQL migration file and note
  it in the PR.
- Keep `departure` as a time value (`TIME` / `HH:mm:ss` string). The frontend already slices
  `"08:28:00"` → `"08:28"`; don't break that contract.
- **Frontend follow-on (small):** once `day_type` ships, enable the day-type tabs in tickets
  013 and 015 (they are built to degrade to a single list until then) — this can be a quick
  follow-up rather than part of this backend ticket.
- Out of scope: actually authoring correct Saturday/Sunday timetables — that's data entry /
  the future admin tooling. This ticket only makes the schema and API capable of carrying it.
