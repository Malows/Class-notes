## 1. Database & Backend Repositories

- [x] 1.1 Add `createdAt`, `updatedAt`, and `deletedAt` to all tables (migration)
- [x] 1.2 Remove `external_id` from `students` table
- [x] 1.3 Update `FacultyRepository` with `update` and `delete` methods, and filter `getAll`
- [x] 1.4 Update `SubjectRepository` with `update` and `delete` methods, and filter `getAll`
- [x] 1.5 Update `PeriodRepository` with `update` and `delete` methods, and filter `getAll`
- [x] 1.6 Update `CommissionRepository` with `update` and `delete` methods, and filter `getAll`
- [x] 1.7 Update `StudentRepository` with `update` method and filter `getAll`
- [x] 1.8 Update `AssignmentRepository` with `update` and `delete` methods, and filter `getAll`

## 2. API Endpoints

- [x] 2.1 Standardize `PUT` and `DELETE` for `/faculties`
- [x] 2.2 Standardize `PUT` and `DELETE` for `/subjects`
- [x] 2.3 Standardize `PUT` and `DELETE` for `/periods`
- [x] 2.4 Standardize `PUT` and `DELETE` for `/commissions`
- [x] 2.5 Standardize `PUT` and `DELETE` for `/students`
- [x] 2.6 Standardize `PUT` and `DELETE` for `/assignments`

## 3. Frontend Stores & Components

- [x] 3.1 Update all Svelte stores (`faculties`, `subjects`, `periods`, `commissions`, `students`, `assignments`) with `update` and `delete` actions
- [x] 3.2 Create generic `EditModal` and `DeleteConfirm` components (or patterns)
- [x] 3.3 Add Edit/Delete UI to `FacultyTable.svelte`
- [x] 3.4 Add Edit/Delete UI to `SubjectTable.svelte` and fix broken link
- [x] 3.5 Add Edit/Delete UI to `PeriodTable.svelte`
- [x] 3.6 Add Edit/Delete UI to `CommissionTable.svelte`
- [x] 3.7 Add Edit UI to `StudentTable.svelte`

## 4. Final Polish

- [x] 4.1 Verify cascading delete logic for Periods -> Commissions -> Students
- [x] 4.2 Verify cascading delete logic for Assignments -> Deliveries
- [x] 4.3 Add "Back" links to nested pages for better navigation flow
