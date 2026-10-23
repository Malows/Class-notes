# Proposal

## Why

The person registry introduced by `student-enrollment-model` has no navigable surface. A person is only reachable through a commission roster or the search box inside the enrollment modal, so a person with no commission — or one whose enrollment was removed — exists in the database but is invisible in the UI, even though the spec promises they "remain resolvable in the person registry". The registry is also the only place where a person's history across subjects and periods can be seen, and today it cannot be seen at all.

## What Changes

- Add a read-only registry list at `/persons`: searchable by name or legajo, listing every active person with their legajo and how many active enrollments they have, including people with zero enrollments.
- Add a read-only person detail at `/persons/[id]`: name, legajo, and the person's enrollments as cursadas (subject, period, commission or "sin comisión").
- Add `GET /api/v1/persons` list behaviour to the existing search endpoint: no query lists the active registry (paginated), a query filters it, and each row carries its enrollment count computed in the same query.
- Add `GET /api/v1/persons/[id]` returning the person plus their enrollments.
- Add an "Alumnos" entry to the sidebar's static quick access.
- Deliberately **not** adding a global enrollments page: an enrollment has no meaning outside a cursada, and the information it would show already lives in the commission roster, the per-cursada pending section, and the new person detail.

## Capabilities

### New Capabilities

None. The registry and its browsing behaviour belong to the existing `student-enrollment` capability.

### Modified Capabilities

- `student-enrollment`: adds requirements for browsing the registry (list, search, pagination, zero-enrollment persons visible) and for the read-only person detail view showing their cursadas.

## Impact

- **Server**: `person.repository.ts` gains a paginated list with enrollment counts and `findWithEnrollments`; `person.service.ts` exposes them; `GET /api/v1/persons` returns the list shape instead of only search results.
- **API**: `GET /api/v1/persons?q=&limit=&offset=` and `GET /api/v1/persons/[id]` (new).
- **Client**: new routes `src/routes/persons/+page.svelte` and `src/routes/persons/[id]/+page.svelte`; `person.service.ts` gains `list` and `getById`; `SidebarStaticLinks.svelte` gains the "Alumnos" link.
- **i18n**: new `persons.json` namespace in EN and ES (list, search, empty state, cursada labels, "sin comisión"); `pnpm validate:i18n` must keep passing.
- **Tests**: person repository tests for counts, ordering, pagination and zero-enrollment persons; route tests for the list and detail endpoints (400 on invalid id, 404 on missing person); page render tests with mocked `apiFetch`.
- **Not in scope**: editing a person from these views (edit stays in the enrollment modal of a commission), a global enrollments page, deleting persons, and any attendance surface.
- **Scale note**: the list is paginated because a teacher's registry can reach hundreds of rows; the UI reads the first page and loads more on demand.
