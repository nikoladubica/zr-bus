# TICKET-007: Error Handling and Loading States

**Status:** Open  
**Priority:** Medium  
**Area:** Frontend

## Context

The Zustand store (`createLineSlice`) fetches data via `fetch()` but has no error state and no loading indicators. If the backend is unreachable, the map just shows nothing silently.

## What's missing

- `isLoading` and `error` fields in the store slice
- Set `isLoading = true` before fetch calls, reset after
- Catch fetch errors and store them in `error`
- UI feedback: a spinner or skeleton while lines load, and an error message/toast if the API fails

## Acceptance criteria

1. `createLineSlice` has `isLoading: false` and `error: null` initial state
2. All async actions (`fetchLines`, `fetchLinesLocations`) update these flags correctly
3. The map shows a loading indicator while initial data is being fetched
4. If the API call fails, the user sees a human-readable message (not a blank screen)
5. Geolocation errors (permission denied, timeout) are caught and shown as a subtle notice

## Notes

- A simple overlay or toast is fine — no need for a full error boundary
- Geolocation error codes: 1 = permission denied, 2 = unavailable, 3 = timeout
