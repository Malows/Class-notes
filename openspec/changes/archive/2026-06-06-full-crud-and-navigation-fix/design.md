## Context

The current SvelteKit application lacks basic data management features (Update/Delete) and has a broken navigation structure. The system uses SQLite with `better-sqlite3`. Backend repositories are class-based or object-based and lack CRUD methods beyond `getAll` and `create`.

## Goals / Non-Goals

**Goals:**

- Provide full CRUD for all entities (Faculty, Subject, Period, Commission, Student, Assignment).
- Implement Soft Delete via `deletedAt` column.
- Implement Audit timestamps (`createdAt`, `updatedAt`).
- Standardize RESTful API endpoints for all entities.
- Fix navigation and unreachable paths.

**Non-Goals:**

- User authentication or authorization.
- Advanced search or filtering (outside of basic Soft Delete filtering).

## Decisions

### 1. Database Schema Update

- **Decision**: Add `createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`, `updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP`, and `deletedAt DATETIME` to all tables.
- **Rationale**: Enables audit tracking and soft-deletion without losing data history.
- **Alternatives**: Table history/audit tables (too complex for this local app).

### 2. Cascading Soft Delete

- **Decision**: When an entity is soft-deleted, its descendants will also be considered deleted in queries. Permanent deletion (Hard Delete) will use SQL `ON DELETE CASCADE`.
- **Rationale**: Maintains referential integrity while allowing data recovery via soft-delete.

### 3. UI Patterns for CRUD

- **Decision**: Use **Modals** for Edit forms and **Confirmation Dialogs** for Delete actions.
- **Rationale**: Modals are cleaner in _PaperCSS_ and avoid context-switching for the user.
- **Alternatives**: Inline editing (harder to manage state and validation).

### 4. Navigation Refactor

- **Decision**: Fix the broken link in `SubjectTable.svelte` from `/subjects/[id]` to `/subjects/[id]/periods`.
- **Rationale**: Directly addresses the "unreachable" periods/commissions issue.

## Risks / Trade-offs

- **Schema Migration Risk**: Adding columns to existing SQLite tables. → **Mitigation**: Use simple `ALTER TABLE` scripts or recreate tables if needed, ensuring data preservation.
- **Soft Delete Complexity**: Every query needs to check `deletedAt IS NULL`. → **Mitigation**: Update all Repository `getAll` and `getById` methods to include this filter by default.
