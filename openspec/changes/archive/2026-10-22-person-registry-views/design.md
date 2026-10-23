# Design

## Context

See `proposal.md` — Why. Constraints that shape the approach:

- `student-enrollment` is now a main capability with the person registry, enrollments and cursadas. This change adds only browsing behaviour on top; no schema change and no migration.
- `personRepository.search(q)` returns `[]` for an empty query, so there is no "list" path today; `GET /api/v1/persons` only wraps search.
- The registry rows carry `id`, `name`, `legajo` (`Person`); cursadas live in `enrollments` (`person_id`, `subject_period_id`, `commission_id`), and `subject_periods` joins to `subjects` and `periods`.
- Navigation in this app is slug-based (`faculty_slug`, `subject_slug`, `period_year`, `period_semester`, `commission_slug`); numeric ids stay in the API. The detail view must produce links that respect that convention.
- Soft delete on `persons` and `enrollments` means every read filters `deletedAt` on both.
- There is no pagination precedent in the codebase; the closest thing is unbounded lists (commissions, students). The registry is the first list that can plausibly grow past a screenful.

## Goals / Non-Goals

**Goals:**

- One registry endpoint whose empty-query case is the list and whose query case is the filter.
- Enrollment counts and the cursada detail computed in SQL, never in N+1 loops.
- A person with zero enrollments is a first-class row, not an edge case to hide.
- Detail links resolve to existing routes without client-side lookups.

**Non-Goals:**

- No mutation endpoints, no inline edit, no delete from these views.
- No global enrollments page.
- No cursor-based pagination, no sorting options, no filtering by cursada.
- No redesign of the sidebar beyond one new static link.

## Decisions

### D1. One endpoint: `GET /api/v1/persons?q=&limit=&offset=`

Search is a filter on the list, not a different resource. A separate `/persons/search` would duplicate the query builder and the soft-delete rules, and the UI would still need both. The response keeps the existing envelope and adds a total count so the UI can show "mostrando 50 de 213".

```
GET /persons?limit=50&offset=0
  -> { data: { items: PersonRow[], total: number, limit, offset } }

PersonRow = {
  id, name, legajo,
  enrollment_count: number,   // active enrollments only
  last_subject_name: string | null,   // most recent cursada, for the list at a glance
  last_period_year: number | null,
  last_period_semester: number | null
}
```

`last_*` comes from the most recent active enrollment by `(period.year, period.semester)`; when it is `null` the row renders as "sin cursadas" — the explicit orphan state the spec requires.

### D2. Enrollment counts and last cursada in one query

```sql
SELECT p.id, p.name, p.legajo,
       COUNT(e.id) AS enrollment_count,
       sp_last.subject_name, ...
FROM persons p
LEFT JOIN enrollments e  ON e.person_id = p.id AND e.deletedAt IS NULL
LEFT JOIN ...            -- last cursada via correlated subquery on MAX(year, semester)
WHERE p.deletedAt IS NULL AND (:q IS NULL OR p.name LIKE :q OR p.legajo LIKE :q)
GROUP BY p.id
ORDER BY p.name, p.id
LIMIT :limit OFFSET :offset
```

`LEFT JOIN` — not `INNER JOIN` — is what keeps zero-enrollment persons in the result. A `COUNT(e.id)` (not `COUNT(*)`) is what makes that zero instead of one. The last-cursada columns come from a correlated subquery ordered by `(year DESC, semester DESC, subject_periods.id DESC)` with `LIMIT 1`, because a grouped join cannot pick "the latest" reliably.

### D3. Detail returns the person plus their cursadas, with slugs for linking

```
GET /persons/:id
  -> { data: {
        person: { id, name, legajo },
        enrollments: EnrollmentCursada[]
      } }

EnrollmentCursada = {
  id, subject_period_id, commission_id,
  subject_name, subject_slug,
  period_year, period_semester,
  commission_name, commission_slug | null,
  faculty_slug, faculty_name
}
```

Carrying the slugs (including `faculty_slug`) is deliberate: the app's navigation URLs never contain numeric ids, so the detail view needs them to link to a commission without a second round trip. `commission_id`/`commission_slug` are nullable — the "sin comisión" state is data, not a rendering trick.

Ordering: most recent first (`period_year DESC, period_semester DESC, subject_name`), which reads as a history.

### D4. Read-only, enforced by surface rather than by permissions

The views expose no create/edit/delete affordances. The existing `PUT /persons/:id` stays where it is and is only reachable from the enrollment modal of a commission. No new mutation route is added, so "read-only" is a property of the surface, not of a flag.

### D5. Pagination: limit/offset with "cargar más"

`limit` defaults to 50 and is clamped to 200; `offset` defaults to 0. The UI renders the first page and appends the next on demand — no infinite scroll (harder to test, harder to keyboard-navigate) and no page numbers (the registry has no meaningful page identity).

Stable ordering is `name, id`. Without the `id` tiebreaker, offset pagination can duplicate or skip rows when several persons share a name — the very duplication the registry exists to reveal.

### D6. New i18n namespace `persons.json`

The registry is not the roster. `enrollments.json` describes the commission flow ("inscribir", "sin comisión" in the context of a cursada); `persons.json` describes browsing the registry ("registro", "cursadas", "sin cursadas"). Sharing one namespace would couple two different vocabularies. Keys are added in EN and ES together, since `pnpm build` runs `validate:i18n`.

### D7. Sidebar entry in `SidebarStaticLinks.svelte`

`Alumnos` sits after `Periodos`, closing the global trio (Facultades, Periodos, Alumnos). No contextual sidebar section is added: the registry is not part of the faculty → subject → period hierarchy.

## Risks / Trade-offs

- **Offset pagination over shifting data** → a person created while paging can shift rows. Mitigated by stable ordering and by the registry being a browsing tool, not a report; acceptable at teacher scale.
- **Zero rendered as "no data"** → `{#if enrollment_count}` would hide the orphan rows this change exists to reveal. Mitigation: the page render test asserts a person with `enrollment_count: 0` still appears with the "sin cursadas" label.
- **Count inflation from joined rows** → grouping by `p.id` while counting `e.id` keeps the count correct even with several enrollments; a test covers a person with 2 enrollments.
- **Accent ordering** (`Á` after `Z` in SQLite's binary collation) → matches the existing roster ordering, so the app stays internally consistent; documented rather than fixed.
- **Detail with many cursadas** → a person with a long history returns every active enrollment unpaginated. Bounded in practice by the number of periods a teacher manages; if it ever grows, the same limit/offset pattern applies.
- **Two sources of truth for "sin comisión"** → the label appears in the commission page's pending section and in the person detail. Both read the same `commission_id IS NULL` condition, so they cannot disagree.

## Migration Plan

No schema change and no data migration: additive endpoints, one new static link, one new namespace. Ships in a single commit series gated by `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`.

## Open Questions

- Whether the registry later needs person-level contact data (email) or a merge-duplicates action — both additive and out of scope here.
