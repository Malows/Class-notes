# Design: Periods as an Independent Entity

## Overview

This change moves `Period` from a subject-scoped concept to a first-class domain entity. The system will introduce an explicit relationship between `Subject` and `Period` through a pivot table, while keeping `Commission` and `Assignment` attached to the period context.

## Goals

- Make `Period` independent from `Subject` in the data model.
- Introduce a pivot relationship so a subject can be linked to one or more periods and vice versa.
- Keep commissions and assignments associated with the period context rather than with the subject directly.
- Preserve subject-scoped navigation while enabling a general periods view.

## Proposed Data Model

### Core entities

- `faculties`
- `subjects`
- `periods`
- `subject_periods` (new pivot table)
- `commissions`
- `assignments`
- `students`
- `deliveries`

### Relationship model

- `periods` becomes a standalone entity.
- `subject_periods` links a `subject` to a `period`.
- `commissions` and `assignments` are associated with `subject_periods` rather than with `periods` directly.

### Conceptual structure

```text
faculties
  └── subjects
        └── subject_periods ──┐
                                │
                                ▼
                             periods
                                │
                                ├── commissions
                                └── assignments
```

## Database Changes

1. Create a new `subject_periods` table with:
   - `id`
   - `subject_id`
   - `period_id`
   - timestamps / soft-delete support
2. Remove the direct `periods.subject_id` dependency from the period model.
3. Update `commissions` and `assignments` to reference the `subject_periods` relationship context rather than the subject directly.
4. Update seed data so periods and subject-period links are created explicitly.
5. Add the necessary indexes and constraints for the new relationship.

## Auto-creation Behaviour

When the server evaluates the current academic period for a subject and no matching `subject_periods` record exists for the current semester/year, the system should create the missing period and relationship automatically.

This behavior must be:

- idempotent,
- safe for repeated requests,
- deterministic for the current server date and academic semester rules.

## API and Service Changes

- `GET /api/v1/periods` should support both global period access and subject-context access.
- The period service/repository layer should resolve the active subject-period context through `subject_periods`.
- The current subject-scoped periods route should continue to work as a contextual view over the new relationship layer.

## UI and Navigation Changes

- Add a general periods entry point in navigation.
- Keep the existing subject-scoped periods route as a contextual view over the subject-period relationship.
- Ensure the periods page can show the data associated with the current subject-period context.

## Type Changes

- `Period` should no longer require `subject_id`.
- Introduce a new type for the relationship layer, such as `SubjectPeriod`.
- Update stores, services, components, and tests that assumed periods belonged directly to a subject.

## Risks and Tradeoffs

- This is a structural change touching schema, repositories, services, routes, and UI.
- The current UI is heavily anchored to the subject-based hierarchy and will need refactoring to support a general periods view.
- Migration from the current `periods.subject_id` model must be handled carefully to preserve existing period data.

## Suggested Implementation Order

1. Update the DB schema and seed data.
2. Update repository and service layer.
3. Update API endpoints.
4. Refactor stores and types.
5. Rework the sidebar/navigation and routes.
6. Update tests and validation flows.
