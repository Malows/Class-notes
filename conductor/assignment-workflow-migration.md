# Assignment Workflow Status, Auto-created Deliveries & Copy Option Plan

## Objective

Implement a robust workflow status tracking system for assignments (TPs) that automates student delivery record generation, enables status transition flows across assignments and deliveries, and displays the "Copiar TPs" utility when a period is empty.

## Key Files & Context

- **Types**: `src/lib/types/academic.ts`
- **Database Schema & Seeders**: `src/lib/server/schema.ts`, `src/lib/server/seed.ts`
- **Repositories**: `src/lib/server/repositories/assignment.repository.ts`, `src/lib/server/repositories/delivery.repository.ts`
- **API Routes**:
  - `src/routes/api/v1/assignments/+server.ts`
  - `src/routes/api/v1/assignments/[id]/+server.ts`
  - `src/routes/api/v1/assignments/[id]/status/+server.ts` (NEW)
  - `src/routes/api/v1/assignments/copy/+server.ts`
- **Services & Stores**:
  - `src/lib/services/assignment.service.ts`
  - `src/lib/stores/assignments.svelte.ts`
- **UI Components**:
  - `src/lib/components/modals/AssignmentModal.svelte`
  - `src/lib/components/grids/rows/AssignmentRow.svelte`
  - `src/lib/components/grids/tables/AssignmentTable.svelte`
  - `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/[period_id]/assignments/+page.svelte`
- **Translations**:
  - `src/lib/i18n/es/assignments.json`
  - `src/lib/i18n/en/assignments.json`

## Implementation Plan

### Phase 1: Database Seeding & Types

1. **Seed Update (`seed.ts`)**:
   - Update seeded assignments to include explicit `workflow_status` values (`WAITING_FOR_CORRECTION`, `WAITING_FOR_STUDENTS`, `NOT_DICTATED`) aligned with their corresponding deliveries' state.
2. **Enum Verification (`academic.ts`)**:
   - Verify `AssignmentWorkflowStatus` is defined correctly.

### Phase 2: Repository Operations

1. **UpdateStatus (`assignment.repository.ts`)**:
   - Implement `updateStatus(id: number, status: string): void`:
     - Update `assignments.workflow_status` for the given ID.
     - Update all corresponding `deliveries.workflow_status` values.
     - Wrap both queries in a SQLite transaction (`db.transaction`).
2. **Copy (`assignment.repository.ts`)**:
   - Complete `copy(sourcePeriodID: number, targetPeriodID: number): void`:
     - Query `title, subtitle, workflow_status` from the source period's assignments.
     - Insert each copied assignment into the target period.
     - Query all student IDs enrolled in the target period's commissions.
     - Generate and insert matching `deliveries` records for all target period students.
     - Wrap the entire operation in a single SQLite transaction.

### Phase 3: API Server Endpoints

1. **New Status Endpoint (`[id]/status/+server.ts`)**:
   - Create a PUT handler that accepts `{ status }` and calls `assignmentRepository.updateStatus(id, status)`.
2. **Update Individual PUT Endpoint (`[id]/+server.ts`)**:
   - Update PUT to extract and support updating optional `subtitle` fields in the database.

### Phase 4: Svelte Stores

1. **Store Refactoring (`assignments.svelte.ts`)**:
   - Update `create()` and `updateItem()` methods to accept optional `subtitle` and `workflow_status`.
   - Add `updateStatus(id: number, status: string)` to invoke the status API and update state reactively.
   - Add `copy(sourcePeriodId: number, targetPeriodId: number)` to call the copy endpoint and perform a list reload.

### Phase 5: UI & UX Refinement

1. **Modal Selector Correction (`AssignmentModal.svelte`)**:
   - Correct the first select option's value to `"NOT_DICTATED"` to prevent DB constraint exceptions.
2. **Row & Table Actions (`AssignmentRow.svelte`, `AssignmentTable.svelte`)**:
   - Restore the "Editar" and "Eliminar" action buttons to keep the existing component tests green.
   - Add the "Avanzar Estado" button (triggers a transition callback to the parent page).
   - Ensure the "Avanzar Estado" button is disabled if `assignment.workflow_status === "WAITING_FOR_CORRECTION"`.
3. **Assignments Admin Page (`+page.svelte`)**:
   - Pass save handlers supplying the new fields.
   - Implement the status advance confirmation modal using Svelte states and `DialogBase` displaying current and next statuses.
   - Implement "Copiar TPs de Período Anterior" button visible only when assignments are empty and a previous period exists. Show a detailed warning dialog reminding the teacher that this action generates student deliveries.

### Phase 6: Internationalization & Verification

1. **Translations (`assignments.json`)**:
   - Add missing labels, workflow options, confirmation modal messages, and copy warning texts in both English and Spanish.
2. **Reset and Test**:
   - Delete existing `class-notes.db` files to trigger a fresh database schema initialization and seed.
   - Run `pnpm test run` to assert 100% test success across the entire suite.
   - Run `pnpm build` to guarantee successful compilation.
