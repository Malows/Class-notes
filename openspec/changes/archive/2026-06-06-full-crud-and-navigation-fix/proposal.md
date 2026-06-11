## Why

The application currently has critical gaps in its CRUD (Create, Read, Update, Delete) functionality for core resources (Faculties, Subjects, Periods, Commissions, Students, Assignments), making it impossible to edit or delete records. Furthermore, navigation is broken and overly linear, leaving deep sections of the app unreachable.

## What Changes

- **Database Schema**: Add `createdAt`, `updatedAt`, and `deletedAt` timestamps to all tables to support audit tracking and soft-delete.
- **Data Model**: Remove the unused `external_id` from the `students` table.
- **Backend Repositories**: Implement `update` and `delete` methods for all entities. Update `getAll` to filter out soft-deleted records.
- **API**: Standardize `PUT` and `DELETE` endpoints for all resources.
- **Frontend UI**:
  - Implement Modals for editing records using PaperCSS styles.
  - Add "Delete" buttons with confirmation across all list views.
  - Fix broken navigation links (e.g., in `SubjectTable.svelte`).
- **Data Integrity**: Ensure hard-deletes are performed in cascade where appropriate.

## Capabilities

### New Capabilities

- `soft-delete`: Implementation of soft-deletion logic across the system to prevent accidental data loss.
- `navigation-integrity`: Ensuring all sections of the application are reachable through consistent UI patterns.

### Modified Capabilities

- `academic-hierarchy`: Requirements change to include timestamps for audit and update/delete capabilities for all levels.
- `assignment-management`: Requirements change to include update/delete capabilities for assignments and deliveries.

## Impact

- **Database**: Structural changes to all tables (migration required).
- **Backend**: Update to all repository files and API route handlers.
- **Frontend**: Modification of most page components and lib components to support full CRUD operations.
- **Stores**: All Svelte stores updated with new CRUD actions.
