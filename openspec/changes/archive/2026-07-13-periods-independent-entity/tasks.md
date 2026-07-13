## 1. Data Model & Persistence

- [x] 1.1 Update the database schema so `periods` no longer require `subject_id` as a direct ownership field.
- [x] 1.2 Create the explicit subject-period relationship table (for example `subject_periods`) with the necessary foreign keys and indexes.
- [x] 1.3 Update seed data and any initialization fixtures to create periods and their subject-period links explicitly.

## 2. Domain Types & Repository Layer

- [x] 2.1 Update the domain types so `Period` no longer carries a required `subject_id`.
- [x] 2.2 Introduce a relationship type for the subject-period association.
- [x] 2.3 Refactor repositories to support general period listing and subject-specific period lookup through the relationship layer.

## 3. API & Service Layer

- [x] 3.1 Update the period API so it can serve periods independently of the current subject route.
- [x] 3.2 Update the period service layer to support both global period access and subject-filtered access.
- [x] 3.3 Adjust any API payloads so client code can distinguish between general periods and subject-linked periods.

## 4. Stores, Routes & Navigation

- [x] 4.1 Introduce a direct periods entry point in the sidebar/static navigation.
- [x] 4.2 Refactor the store layer so periods can be loaded independently of a subject context.
- [x] 4.3 Update relevant routes so periods can be managed from a general periods view while preserving subject-scoped flows.

## 5. UI & Tests

- [x] 5.1 Update any period-related UI components that assume periods always belong to the current subject.
- [x] 5.2 Adjust or add tests covering data model changes, repository behavior, and route/navigation behavior.
- [x] 5.3 Verify that commissions and assignments still work correctly through the new relationship-based flow.
