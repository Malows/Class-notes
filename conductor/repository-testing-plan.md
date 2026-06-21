# Layer 1: Database Repositories Testing Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Author and integrate a comprehensive integration test suite for all backend database repositories (`Faculty`, `Subject`, `Period`, `Student`, `Delivery`, and `Assignment` repositories), lifting Layer 1 coverage to 100%.

**Architecture:** Create separate `*.test.ts` files inside `src/lib/server/repositories/` using the actual connected SQLite instance under test environments, resetting the database schema and seeds before each test block, and systematically cleaning up created test entries in `afterEach`.

**Tech Stack:** SQLite, better-sqlite3, TypeScript, Vitest.

## Global Constraints

- Never stage or commit your changes, unless you are explicitly instructed to commit.
- Use explicit and strongly typed code (no `any`).
- Add comments only for "why" something is complex, never "what" is being done.

---

### Task 1: Faculty Repository Tests

**Files:**

- Create: `src/lib/server/repositories/faculty.repository.test.ts`

**Interfaces:**

- Consumes: `facultyRepository` methods (`getAll`, `create`, `update`, `delete`)

- [ ] **Step 1: Write Faculty Repository Test Suite**
  - Create the test suite asserting creation, retrieving, updating, and soft-deletion.

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { facultyRepository } from "./faculty.repository";
import db from "../db";

describe("facultyRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM faculties WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates and retrieves a faculty", () => {
    const faculty = facultyRepository.create("Test Faculty X");
    createdIds.push(faculty.id);

    expect(faculty.id).toBeGreaterThan(0);
    expect(faculty.name).toBe("Test Faculty X");

    const list = facultyRepository.getAll();
    const found = list.find((f) => f.id === faculty.id);
    expect(found).toBeTruthy();
    expect(found?.name).toBe("Test Faculty X");
  });

  it("updates a faculty name", () => {
    const faculty = facultyRepository.create("Old Name Faculty");
    createdIds.push(faculty.id);

    const updated = facultyRepository.update(faculty.id, "New Name Faculty");
    expect(updated.name).toBe("New Name Faculty");

    const list = facultyRepository.getAll();
    const found = list.find((f) => f.id === faculty.id);
    expect(found?.name).toBe("New Name Faculty");
  });

  it("soft-deletes a faculty", () => {
    const faculty = facultyRepository.create("Delete Target Faculty");
    createdIds.push(faculty.id);

    facultyRepository.delete(faculty.id);

    const list = facultyRepository.getAll();
    const found = list.find((f) => f.id === faculty.id);
    expect(found).toBeUndefined(); // Soft-deleted faculties are excluded from getAll
  });
});
```

- [ ] **Step 2: Run test suite**
  - Execute `pnpm test run src/lib/server/repositories/faculty.repository.test.ts` and verify it passes.

---

### Task 2: Subject Repository Tests

**Files:**

- Create: `src/lib/server/repositories/subject.repository.test.ts`

**Interfaces:**

- Consumes: `subjectRepository` methods (`getAll`, `create`, `update`, `delete`)

- [ ] **Step 1: Write Subject Repository Test Suite**
  - Create the test suite asserting subject registration under a faculty, dynamic mapping, and updates.

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { subjectRepository } from "./subject.repository";
import db from "../db";

describe("subjectRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM subjects WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates, retrieves, and updates a subject under a faculty", () => {
    // Uses faculty_id = 1 (seeded 'Facultad de Ingeniería')
    const subject = subjectRepository.create(1, "Discrete Mathematics");
    createdIds.push(subject.id);

    expect(subject.id).toBeGreaterThan(0);
    expect(subject.name).toBe("Discrete Mathematics");
    expect(subject.faculty_name).toBe("Facultad de Ingeniería");

    const list = subjectRepository.getAll(1);
    const found = list.find((s) => s.id === subject.id);
    expect(found).toBeTruthy();

    const updated = subjectRepository.update(subject.id, "Discrete Maths V2");
    expect(updated.name).toBe("Discrete Maths V2");
  });

  it("soft-deletes a subject", () => {
    const subject = subjectRepository.create(1, "Calculus 5");
    createdIds.push(subject.id);

    subjectRepository.delete(subject.id);

    const list = subjectRepository.getAll(1);
    const found = list.find((s) => s.id === subject.id);
    expect(found).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test suite**
  - Execute `pnpm test run src/lib/server/repositories/subject.repository.test.ts` and verify it passes.

---

### Task 3: Period Repository Coverage Expansion

**Files:**

- Modify: `src/lib/server/repositories/period.repository.test.ts`

**Interfaces:**

- Consumes: `periodRepository` methods (`getAll`, `delete`)

- [ ] **Step 1: Expand Period Repository Test Suite**
  - Add test cases to verify `getAll` querying and soft-deletion behavior, ensuring 100% lines are executed.

```typescript
it("retrieves all active periods for a subject and soft-deletes a period", () => {
  const first = periodRepository.create(1, 2035, 1);
  createdIds.push(first.id);

  const list = periodRepository.getAll(1);
  expect(list.length).toBeGreaterThan(0);
  expect(list.some((p) => p.id === first.id)).toBe(true);

  periodRepository.delete(first.id);
  const updatedList = periodRepository.getAll(1);
  expect(updatedList.some((p) => p.id === first.id)).toBe(false);
});
```

- [ ] **Step 2: Run test suite**
  - Execute `pnpm test run src/lib/server/repositories/period.repository.test.ts` and verify it passes.

---

### Task 4: Student Repository Tests

**Files:**

- Create: `src/lib/server/repositories/student.repository.test.ts`

**Interfaces:**

- Consumes: `studentRepository` methods (`getAllByCommission`, `create`, `createBulk`, `update`, `delete`)

- [ ] **Step 1: Write Student Repository Test Suite**
  - Assert singular student creation, bulk student import, update, and soft-delete queries.

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { studentRepository } from "./student.repository";
import db from "../db";

describe("studentRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM students WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates and retrieves a single student", () => {
    const student = studentRepository.create(1, "John Doe", "EXT-123");
    createdIds.push(student.id);

    expect(student.id).toBeGreaterThan(0);
    expect(student.name).toBe("John Doe");
    expect(student.external_id).toBe("EXT-123");

    const list = studentRepository.getAllByCommission(1);
    expect(list.some((s) => s.id === student.id)).toBe(true);
  });

  it("creates bulk students", () => {
    const initialCount = studentRepository.getAllByCommission(1).length;
    studentRepository.createBulk(1, ["Alice Smith", "Bob Jones"]);

    const updatedList = studentRepository.getAllByCommission(1);
    expect(updatedList.length).toBe(initialCount + 2);

    const created = updatedList.filter((s) => s.name === "Alice Smith" || s.name === "Bob Jones");
    for (const s of created) {
      createdIds.push(s.id);
    }
    expect(created).toHaveLength(2);
  });

  it("updates and soft-deletes a student", () => {
    const student = studentRepository.create(1, "Temporary Student");
    createdIds.push(student.id);

    const updated = studentRepository.update(student.id, "Updated Student Name", "EXT-999");
    expect(updated.name).toBe("Updated Student Name");
    expect(updated.external_id).toBe("EXT-999");

    studentRepository.delete(student.id);
    const list = studentRepository.getAllByCommission(1);
    expect(list.some((s) => s.id === student.id)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test suite**
  - Execute `pnpm test run src/lib/server/repositories/student.repository.test.ts` and verify it passes.

---

### Task 5: Delivery Repository Tests

**Files:**

- Create: `src/lib/server/repositories/delivery.repository.test.ts`

**Interfaces:**

- Consumes: `deliveryRepository` methods (`getOne`, `getAllByCommission`, `updateGrade`, `delete`)

- [ ] **Step 1: Write Delivery Repository Test Suite**
  - Assert delivery grade updates, status queries, and transactional behavior.

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { deliveryRepository } from "./delivery.repository";
import db from "../db";

describe("deliveryRepository Integration Tests", () => {
  const cleanupDeliveries: { assignmentId: number; studentId: number }[] = [];

  afterEach(() => {
    for (const d of cleanupDeliveries) {
      db.prepare("DELETE FROM deliveries WHERE assignment_id = ? AND student_id = ?").run(
        d.assignmentId,
        d.studentId,
      );
    }
    cleanupDeliveries.length = 0;
  });

  it("retrieves and updates student delivery records", () => {
    // Create mock delivery record directly to test queries
    db.prepare(
      "INSERT OR REPLACE INTO deliveries (assignment_id, student_id, workflow_status, grade, ai_level, comments) VALUES (1, 1, 'WAITING_FOR_CORRECTION', 0, 0, 'No comments')",
    ).run();
    cleanupDeliveries.push({ assignmentId: 1, studentId: 1 });

    const delivery = deliveryRepository.getOne(1, 1);
    expect(delivery).toBeTruthy();
    expect(delivery?.workflow_status).toBe("WAITING_FOR_CORRECTION");

    // Update grade & status
    const updated = deliveryRepository.updateGrade(1, 1, 8.5, 1, "Well done!");
    expect(updated.grade).toBe(8.5);
    expect(updated.ai_level).toBe(1);
    expect(updated.comments).toBe("Well done!");
    expect(updated.workflow_status).toBe("APPROVED");

    const list = deliveryRepository.getAllByCommission(1);
    expect(list.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test suite**
  - Execute `pnpm test run src/lib/server/repositories/delivery.repository.test.ts` and verify it passes.

---

### Task 6: Assignment Repository Tests

**Files:**

- Create: `src/lib/server/repositories/assignment.repository.test.ts`

**Interfaces:**

- Consumes: `assignmentRepository` methods (`getAll`, `create`, `update`, `updateStatus`, `copy`, `delete`)

- [ ] **Step 1: Write Assignment Repository Test Suite**
  - Assert creating, updating, advancing statuses cascading down to deliveries, and duplicating periods.

```typescript
import { describe, it, expect, afterEach } from "vitest";
import { assignmentRepository } from "./assignment.repository";
import db from "../db";

describe("assignmentRepository Integration Tests", () => {
  const createdIds: number[] = [];

  afterEach(() => {
    for (const id of createdIds) {
      db.prepare("DELETE FROM assignments WHERE id = ?").run(id);
    }
    createdIds.length = 0;
  });

  it("creates assignments and cascades auto-delivery generations", () => {
    // Create assignment under period 1
    const assignment = assignmentRepository.create(
      1,
      "Lab Exercise 10",
      "Advanced Vector Calculus",
      "NOT_DICTATED",
    );
    createdIds.push(assignment.id);

    expect(assignment.id).toBeGreaterThan(0);
    expect(assignment.title).toBe("Lab Exercise 10");
    expect(assignment.subtitle).toBe("Advanced Vector Calculus");
    expect(assignment.workflow_status).toBe("NOT_DICTATED");

    // Verify auto-generated student deliveries exist in DB
    const count = db
      .prepare("SELECT COUNT(*) as cnt FROM deliveries WHERE assignment_id = ?")
      .get() as { cnt: number };
    expect(count.cnt).toBeGreaterThan(0);
  });

  it("updates statuses and cascades down to delivery records", () => {
    const assignment = assignmentRepository.create(
      1,
      "Temporary Status Assignment",
      "",
      "NOT_DICTATED",
    );
    createdIds.push(assignment.id);

    assignmentRepository.updateStatus(assignment.id, "WAITING_FOR_STUDENTS");

    const updated = db
      .prepare("SELECT workflow_status FROM assignments WHERE id = ?")
      .get(assignment.id) as { workflow_status: string };
    expect(updated.workflow_status).toBe("WAITING_FOR_STUDENTS");

    const deliveryStatus = db
      .prepare("SELECT workflow_status FROM deliveries WHERE assignment_id = ?")
      .all(assignment.id) as { workflow_status: string }[];
    expect(deliveryStatus.every((d) => d.workflow_status === "WAITING_FOR_STUDENTS")).toBe(true);
  });

  it("copies assignments and generates student deliveries for target period", () => {
    // Copy period 1 assignments to period 2
    const initialCount = db
      .prepare("SELECT COUNT(*) as cnt FROM assignments WHERE period_id = 2 AND deletedAt IS NULL")
      .get() as { cnt: number };
    assignmentRepository.copy(1, 2);

    const afterCount = db
      .prepare("SELECT COUNT(*) as cnt FROM assignments WHERE period_id = 2 AND deletedAt IS NULL")
      .get() as { cnt: number };
    expect(afterCount.cnt).toBeGreaterThan(initialCount.cnt);

    const copied = db
      .prepare("SELECT id FROM assignments WHERE period_id = 2 AND deletedAt IS NULL")
      .all() as { id: number }[];
    for (const item of copied) {
      createdIds.push(item.id);
    }
  });
});
```

- [ ] **Step 2: Run test suite**
  - Execute `pnpm test run src/lib/server/repositories/assignment.repository.test.ts` and verify it passes.

---

### Task 7: Full Test Coverage Verification

- [ ] **Step 1: Run complete coverage report**
  - Run `pnpm test:coverage` and verify repository layer shows significant coverage improvements.
