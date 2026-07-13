# Proposal: Periods as an Independent Entity

## Objective

Make `Period` a first-class domain entity rather than a child of `Subject`, so the system can model academic periods independently and reuse them across subjects and navigation flows.

## Problem

Today, periods are tightly coupled to subjects in the data model, repository layer, routing, and sidebar navigation. The current structure assumes that every period belongs to a single subject and that the UI must enter periods through a subject context.

This creates friction for:

- representing shared or reusable academic periods,
- navigating to periods outside the current subject hierarchy,
- evolving the domain model without repeatedly coupling period logic to subject routes.

## Proposed Direction

Introduce a dedicated `periods` entity and an explicit relationship layer between subjects and periods.

### Core idea

- `Period` becomes an independent entity.
- `Subject` and `Period` are linked through a dedicated pivot table: `subject_periods`.
- `Commission` and `Assignment` remain attached to `Period`, not to the pivot table directly.

### Expected benefits

- clearer domain model,
- better reuse of periods across subjects,
- more flexible navigation and sidebar structure,
- less coupling between routes and academic entities.

## Scope

This change includes:

1. redefining the data model for periods and their relationship to subjects,
2. updating DB schema and seed data,
3. updating repositories, services, and API contracts,
4. revising the sidebar and navigation structure to expose periods independently,
5. updating relevant tests and type definitions.

## Non-goals

- redesigning the full academic domain beyond the period/subject relationship,
- changing unrelated UI flows not directly affected by period navigation,
- introducing a new complete permission model.
