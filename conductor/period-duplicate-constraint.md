# Spec: Duplicate Period Constraints and A11y Error Validation

## Objective

Prevent duplicate periods from being registered for the same subject/year/semester combination, ensuring fail-safe transactional data integrity at the database layer (SQLite unique indexes) while providing proactive validation checks and accessible, localized error-reporting at the application layer.

## Key Files & Context

- **Database Schema**: `src/lib/server/schema.ts`
- **Period Repository**: `src/lib/server/repositories/period.repository.ts`
- **Period Page**: `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/+page.svelte`
- **Period Modal**: `src/lib/components/modals/PeriodModal.svelte`
- **Translations**:
  - `src/lib/i18n/es/periods.json`
  - `src/lib/i18n/en/periods.json`

## Architectural Design

### 1. Database-Level Unique Constraint

To protect the data layer against concurrent insertion anomalies or external scripting errors, we will define a partial SQLite unique index. This index is scoped to exclude soft-deleted periods, allowing users to re-create a previously deleted period for the same year/semester:

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_periods_subject_year_semester_active
ON periods(subject_id, year, semester)
WHERE deletedAt IS NULL;
```

### 2. Repository Layer Pre-checks

The `PeriodRepositoryImpl` will proactively verify uniqueness during `create` and `update` queries. This intercepts errors before SQLite attempts a write transaction, throwing clean domain-specific errors.

- **On Create**:

  ```typescript
  const checkStmt = db.prepare(
    "SELECT id FROM periods WHERE subject_id = ? AND year = ? AND semester = ? AND deletedAt IS NULL",
  );
  if (checkStmt.get(subject_id, year, semester)) {
    throw new Error("Period already exists for this subject");
  }
  ```

- **On Update**:
  ```typescript
  const checkStmt = db.prepare(
    "SELECT id FROM periods WHERE subject_id = (SELECT subject_id FROM periods WHERE id = ?) AND year = ? AND semester = ? AND id != ? AND deletedAt IS NULL",
  );
  if (checkStmt.get(id, year, semester, id)) {
    throw new Error("Period already exists for this subject");
  }
  ```

### 3. Application Layer & UI Error Interception

The `PeriodModal` will capture backend errors, map them to i18n localization codes, and display them within the modal dialog.

- **Localizations**:
  - `periods.error_already_exists` in ES: `"Ya existe un período registrado para esta materia en el año y cuatrimestre seleccionados."`
  - `periods.error_already_exists` in EN: `"A period is already registered for this subject in the chosen year and semester."`

- **A11y Highlights**:
  - Error messages will be rendered using `<ErrorSpan>` utilizing standard CSS attributes.
  - Upon receiving a server conflict error, programmatic focus will instantly shift to the `<ErrorSpan>` container (`role="alert"` / `aria-live="assertive"`), ensuring assistive screen readers announce the duplicate warning immediately.

## Verification & Testing

- **Integration Tests**:
  - Add unit tests in `src/lib/server/repositories/period.repository.test.ts` (or create if missing) asserting that trying to insert or update duplicate periods throws the "Period already exists" error.
- **Manual Verification**:
  - Re-run `pnpm test run` to guarantee that all 93 tests remain fully functional.
  - Execute `pnpm build` to confirm compilation success.
