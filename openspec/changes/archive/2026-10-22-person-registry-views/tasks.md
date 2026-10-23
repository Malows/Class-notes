# Tasks

## 1. Repositorio y servicio de personas

- [x] 1.1 Add `list(query, limit, offset)` to `person.repository.ts` returning registry rows with `enrollment_count`, last cursada and a total, using `LEFT JOIN` + `COUNT(e.id)` as in design D2; verify with a test that a person with no enrollment appears with count `0`, a person with two enrollments counts exactly `2`, and deleted persons and deleted enrollments are excluded.
- [x] 1.2 Verify ordering and filtering in the same test file: rows ordered by `name, id`, and `list("ING-0", ...)` matching both by name fragment and by legajo fragment.
- [x] 1.3 Add `findWithEnrollments(id)` returning the person plus their cursadas with `subject_name`, `subject_slug`, `period_year`, `period_semester`, `commission_name`, `commission_slug` and `faculty_slug`; verify with a test that an enrollment with `commission_id = NULL` is returned with null commission fields and that an unknown or deleted id returns `null`.
- [x] 1.4 Verify cursada ordering is most recent first in that test, and expose `list` and `findWithEnrollments` through `person.service.ts`.

## 2. Endpoints

- [x] 2.1 Change `GET /api/v1/persons` to return `{ data: { items, total, limit, offset } }`, defaulting `limit` to 50 and clamping it to 200; verify with route tests that a request without `q` lists the registry and that `limit=999` comes back clamped.
- [x] 2.2 Add `GET /api/v1/persons/[id]` returning `{ data: { person, enrollments } }`; verify with route tests that an invalid id gives 400, an unknown id gives 404 and a known id returns the person with their cursadas.

## 3. Tipos y servicio de cliente

- [x] 3.1 Add `PersonRow`, `PersonDetail` and `EnrollmentCursada` to the shared types and `list`/`getById` to `src/lib/client/services/person.service.ts`; verify with a service test that `list` builds `/persons?q=...&limit=...&offset=...` and `getById` hits `/persons/:id`.

## 4. Vistas

- [x] 4.1 Build `/persons`: search box, registry table (name, legajo, cursada count, last cursada), a "cargar más" action that appends the next page, an empty state for a query that matches nobody, and a visible "sin cursadas" label for `enrollment_count: 0`; add the `persons.json` namespace in EN and ES and verify with a page render test that a zero-enrollment person is rendered with that label.
- [x] 4.2 Build `/persons/[id]`: header with name and legajo plus the cursada list (subject, period, commission or "sin comisión") linking to the commission overview via slugs; verify with a page render test that an unassigned cursada shows "sin comisión" and that a missing person shows the not-found state.
- [x] 4.3 Verify `pnpm validate:i18n` passes after adding both namespaces.

## 5. Navegación e integración

- [x] 5.1 Add the "Alumnos" link to `SidebarStaticLinks.svelte` after `Periodos`; verify the existing sidebar test is updated and passes with the new item.
- [x] 5.2 Run `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`, fixing every failure.
- [x] 5.3 Smoke test against a fresh database: open `/persons`, search an existing name, confirm a person with no enrollment is listed with "sin cursadas", open their detail and confirm an unassigned cursada renders "sin comisión".
