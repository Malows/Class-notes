# Duplicate Period Constraint & A11y Error Validation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Prevent duplicate academic periods for the same subject/year/semester combination using a dual SQLite index unique constraint and pre-emptive repository queries, mapping conflicts to HTTP 409 and displaying accessible warnings with programmatic focus in PeriodModal.

**Architecture:** Add a partial unique index in `schema.ts`. Implement pre-insertion count checks in `period.repository.ts`. Catch errors in POST/PUT api endpoints to return 409 status codes. Refactor `PeriodModal.svelte` to catch saving exceptions, map to translated warnings, and focus the error alert.

**Tech Stack:** SQLite, better-sqlite3, Svelte 5 (Runes), sveltekit-i18n, TypeScript, Vitest.

## Global Constraints

- Never stage or commit your changes, unless you are explicitly instructed to commit.
- Use explicit and strongly typed code (no `any`).
- Add comments only for "why" something is complex, never "what" is being done.

---

### Task 1: Add SQLite Compound Unique Index

**Files:**
- Modify: `src/lib/server/schema.ts`

**Interfaces:**
- Produces: SQLite active unique index constraints

- [ ] **Step 1: Inspect `schema.ts`**
  - Verify where table schemas and indices are initialized.

- [ ] **Step 2: Append Unique Index definition**
  - Append the active unique index creation statement on `periods(subject_id, year, semester) WHERE deletedAt IS NULL` inside the existing db initializer block in `src/lib/server/schema.ts`.

```typescript
    CREATE UNIQUE INDEX IF NOT EXISTS idx_periods_subject_year_semester_active 
    ON periods(subject_id, year, semester) 
    WHERE deletedAt IS NULL;
```

---

### Task 2: Implement Uniqueness Pre-checks in Repository

**Files:**
- Modify: `src/lib/server/repositories/period.repository.ts`

**Interfaces:**
- Produces: Throwing of "Period already exists for this subject" `Error` during duplicate insertions/updates

- [ ] **Step 1: Update `create` method in `PeriodRepositoryImpl`**
  - Query if an active period with the same subject, year, and semester exists. If yes, throw a custom `Error("Period already exists for this subject")`.

```typescript
  create(subject_id: number, year: number, semester: number): Period {
    const checkStmt = db.prepare(
      "SELECT id FROM periods WHERE subject_id = ? AND year = ? AND semester = ? AND deletedAt IS NULL"
    );
    if (checkStmt.get(subject_id, year, semester)) {
      throw new Error("Period already exists for this subject");
    }

    const stmt = db.prepare(
      "INSERT INTO periods (subject_id, year, semester) VALUES (?, ?, ?) RETURNING id, subject_id, year, semester",
    );
    const newPeriod = stmt.get(subject_id, year, semester) as Period;
    // Fetch subject_name for the returned object
    const subjectStmt = db.prepare("SELECT name FROM subjects WHERE id = ?");
    newPeriod.subject_name = (subjectStmt.get(subject_id) as any).name;
    return newPeriod;
  }
```

- [ ] **Step 2: Update `update` method in `PeriodRepositoryImpl`**
  - Query if *another* active period under the same subject possesses the target year and semester, excluding the current ID. If yes, throw `Error("Period already exists for this subject")`.

```typescript
  update(id: number, year: number, semester: number): Period {
    const checkStmt = db.prepare(
      "SELECT id FROM periods WHERE subject_id = (SELECT subject_id FROM periods WHERE id = ?) AND year = ? AND semester = ? AND id != ? AND deletedAt IS NULL"
    );
    if (checkStmt.get(id, year, semester, id)) {
      throw new Error("Period already exists for this subject");
    }

    const stmt = db.prepare(
      "UPDATE periods SET year = ?, semester = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND deletedAt IS NULL RETURNING id, subject_id, year, semester",
    );
    const updatedPeriod = stmt.get(year, semester, id) as Period;
    if (updatedPeriod) {
      const subjectStmt = db.prepare("SELECT name FROM subjects WHERE id = ?");
      updatedPeriod.subject_name = (subjectStmt.get(updatedPeriod.subject_id) as any).name;
    }
    return updatedPeriod;
  }
```

---

### Task 3: Map Database Conflict Errors to HTTP 409

**Files:**
- Modify: `src/routes/api/v1/periods/+server.ts`
- Modify: `src/routes/api/v1/periods/[id]/+server.ts`

**Interfaces:**
- Consumes: Thrown errors from periodRepository
- Produces: HTTP 409 Conflict JSON response

- [ ] **Step 1: Update POST handler in `periods/+server.ts`**
  - Add catch-mapping to detect the custom error and respond with status code `409` and a JSON error message.

```typescript
  } catch (error: any) {
    if (error.message === "Period already exists for this subject") {
      return json({ error: error.message }, { status: 409 });
    }
    return json({ error: error.message }, { status: 500 });
  }
```

- [ ] **Step 2: Update PUT handler in `periods/[id]/+server.ts`**
  - Apply the identical catch-mapping block inside the PUT update router endpoint.

```typescript
  } catch (error: any) {
    if (error.message === "Period already exists for this subject") {
      return json({ error: error.message }, { status: 409 });
    }
    return json({ error: error.message }, { status: 500 });
  }
```

---

### Task 4: Add Error Translation Keys

**Files:**
- Modify: `src/lib/i18n/es/periods.json`
- Modify: `src/lib/i18n/en/periods.json`

**Interfaces:**
- Produces: `periods.error_already_exists` translation string lookup

- [ ] **Step 1: Update Spanish keys**
  - Add `"error_already_exists": "Ya existe un período registrado para esta materia en el año y cuatrimestre seleccionados."` to `src/lib/i18n/es/periods.json`.

- [ ] **Step 2: Update English keys**
  - Add `"error_already_exists": "A period is already registered for this subject in the chosen year and semester."` to `src/lib/i18n/en/periods.json`.

---

### Task 5: Handle Async Server Errors and Focus programmatic alert in PeriodModal

**Files:**
- Modify: `src/lib/components/modals/PeriodModal.svelte`
- Modify: `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/+page.svelte`

**Interfaces:**
- Consumes: Server-side rejection codes
- Produces: High-contrast modal warning alert with proper keyboard focus shift

- [ ] **Step 1: Refactor `handleSave` in `+page.svelte`**
  - Return the promises of `periodsStore.updateItem` and `periodsStore.create` and do not call `alert()` or close the modal directly on catch inside `handleSave` so the modal can handle loading/errors internally.

```typescript
  async function handleSave(year: number, semester: number, id?: number) {
    if (id) {
      await periodsStore.updateItem(id, year, semester);
    } else {
      await periodsStore.create(subjectID, year, semester);
    }
    modal.close();
  }
```

- [ ] **Step 2: Update `PeriodModal.svelte` with serverError and ErrorSpan**
  - Add a reactive `serverError = $state<string | null>(null)` reset upon open.
  - Implement async try-catch inside `handleSaveClick`. Map `"Period already exists"` to `"periods.error_already_exists"`.
  - Display `<ErrorSpan message={serverError} id="error-period-server" testId="period-server-error" />` and focus it programmatically on catch.

```typescript
  let serverError = $state<string | null>(null);

  $effect(() => {
    if (isOpen) {
      year = mode === "edit" && period ? period.year : new Date().getFullYear();
      semester = mode === "edit" && period ? period.semester : 1;
      validator.clear();
      serverError = null;
    }
  });

  async function handleSaveClick() {
    serverError = null;
    const isValid = validator.validate({
      subject_id: period?.subject_id || 1,
      year: Number(year),
      semester: Number(semester),
    });
    if (isValid) {
      try {
        await onSave(Number(year), Number(semester), period?.id);
      } catch (e: any) {
        if (e.message.includes("already exists")) {
          serverError = "periods.error_already_exists";
        } else {
          serverError = e.message;
        }
        setTimeout(() => {
          document.getElementById("error-period-server")?.focus();
        }, 0);
      }
    }
  }
```

---

### Task 6: Reset Database and Add Integration Unit Tests

**Files:**
- Create: `src/lib/server/repositories/period.repository.test.ts`

**Interfaces:**
- Produces: Server-side validation integration test runs

- [ ] **Step 1: Write integration tests inside `period.repository.test.ts`**
  - Assert that double insertions and updating to an existing active period throws the proper validation exception.

- [ ] **Step 2: Reset DB files, run Tests, and Build**
  - Delete `class-notes.db*` files.
  - Execute `pnpm test run` and verify all 95+ tests pass cleanly.
  - Execute `pnpm build` to verify SvelteKit compilation integrity.
