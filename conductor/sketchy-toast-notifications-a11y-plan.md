# Sketchy Toast Notification System with A11y Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Design, integrate, and test a fully accessible "Sketchy Toast" notification system utilizing Svelte 5 reactive states (`$state`), replacing all browser `alert()` popups with high-contrast, screen-reader announced statuses and alerts.

**Architecture:** Create `notifications.svelte.ts` managing reactive toast structures. Render notification lists globally using `<ToastContainer>` and `<Toast>` in `+layout.svelte`. Intercept and replace page catch `alert(e)` blocks with `notificationsStore.addError(e.message)`.

**Tech Stack:** Svelte 5 (Runes), PaperCSS, TypeScript, Vitest.

## Global Constraints

- Never stage or commit your changes, unless you are explicitly instructed to commit.
- Use explicit and strongly typed code (no `any`).
- Add comments only for "why" something is complex, never "what" is being done.

---

### Task 1: Create Svelte 5 Notification Store

**Files:**

- Create: `src/lib/stores/notifications.svelte.ts`

**Interfaces:**

- Produces: `notificationsStore` with methods `addSuccess(message)`, `addError(message)`, `addWarning(message)`, and `dismiss(id)`.

- [x] **Step 1: Write Svelte 5 Notification Store**
  - Define `Toast` type: `{ id: number; message: string; type: "success" | "error" | "warning"; autoDismiss: boolean }`.
  - Export a reactive `class NotificationsStore` maintaining an items list with `$state`.
  - Add auto-dismiss setTimeout logic for `"success"` type notifications (5 seconds duration). Error and warning messages must **never** auto-dismiss (A11y Cognitive Compliance).

```typescript
export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "warning";
  autoDismiss: boolean;
}

export class NotificationsStore {
  items = $state<Toast[]>([]);
  private nextId = 1;

  addSuccess(message: string) {
    const id = this.nextId++;
    this.items.push({ id, message, type: "success", autoDismiss: true });
    setTimeout(() => this.dismiss(id), 5000);
  }

  addError(message: string) {
    const id = this.nextId++;
    // Errors do NOT auto-dismiss for cognitive pacing compliance (WCAG 2.2.4)
    this.items.push({ id, message, type: "error", autoDismiss: false });
  }

  addWarning(message: string) {
    const id = this.nextId++;
    // Warnings do NOT auto-dismiss
    this.items.push({ id, message, type: "warning", autoDismiss: false });
  }

  dismiss(id: number) {
    this.items = this.items.filter((item) => item.id !== id);
  }
}

export const notificationsStore = new NotificationsStore();
```

---

### Task 2: Implement `<Toast>` and `<ToastContainer>` Components

**Files:**

- Create: `src/lib/components/common/Toast.svelte`
- Create: `src/lib/components/common/ToastContainer.svelte`

**Interfaces:**

- Consumes: `notificationsStore.items` and `notificationsStore.dismiss`
- Produces: Visual toast overlay cards in viewport

- [x] **Step 1: Implement `<Toast>` Component**
  - Use `role="alert" aria-live="assertive"` for error toasts, and `role="status" aria-live="polite"` for success/warning toasts.
  - Implement focusable `<button class="close-btn" aria-label="Cerrar notificación">` utilizing PaperCSS styling and outlines.

```svelte
<script lang="ts">
  import type { Toast as ToastType } from "$lib/stores/notifications.svelte";

  interface Props {
    toast: ToastType;
    onDismiss: (id: number) => void;
  }
  let { toast, onDismiss }: Props = $props();
</script>

<div
  class="card toast-card border-{toast.type === 'success' ? 'success' : 'danger'}"
  role={toast.type === "error" ? "alert" : "status"}
  aria-live={toast.type === "error" ? "assertive" : "polite"}
>
  <div class="card-body toast-body">
    <p class="toast-text">{toast.message}</p>
    <button
      class="paper-btn btn-small btn-close"
      onclick={() => onDismiss(toast.id)}
      aria-label="Cerrar notificación"
    >
      ×
    </button>
  </div>
</div>

<style>
  .toast-card {
    min-width: 250px;
    max-width: 400px;
    margin-bottom: 0.5rem;
    box-shadow: 4px 4px 0px 0px var(--border-color);
  }
  .toast-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 1rem !important;
    gap: 1rem;
  }
  .toast-text {
    margin: 0;
    font-size: 0.95rem;
    word-break: break-word;
  }
  .btn-close {
    padding: 0.1rem 0.5rem !important;
    margin: 0 !important;
    font-size: 1.25rem;
    line-height: 1;
  }
</style>
```

- [x] **Step 2: Implement `<ToastContainer>` Component**
  - Style as a fixed container overlaying in the viewport (e.g., top-right corner with `z-index: 1000`).

```svelte
<script lang="ts">
  import { notificationsStore } from "$lib/stores/notifications.svelte";
  import Toast from "./Toast.svelte";
</script>

<div class="toast-container" aria-label="Notificaciones" role="log">
  {#each notificationsStore.items as toast (toast.id)}
    <Toast {toast} onDismiss={(id) => notificationsStore.dismiss(id)} />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
</style>
```

---

### Task 3: Register ToastContainer Globally in Layout

**Files:**

- Modify: `src/routes/+layout.svelte`

**Interfaces:**

- Produces: Insertion of `<ToastContainer />` at root of document

- [x] **Step 1: Modify Layout**
  - Mount `<ToastContainer />` right before `<ClassNoteFooter />` or nested inside the grid of `src/routes/+layout.svelte`.

```svelte
import ToastContainer from "$lib/components/common/ToastContainer.svelte";
```

```html
<ToastContainer />
```

---

### Task 4: Replace All `alert()` Triggers with Notifications Store

**Files:**

- Modify: `src/routes/faculties/+page.svelte`
- Modify: `src/routes/faculties/[faculty_id]/subjects/+page.svelte`
- Modify: `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/+page.svelte`
- Modify: `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/[period_id]/assignments/+page.svelte`
- Modify: `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/[period_id]/commissions/+page.svelte`
- Modify: `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/[period_id]/commissions/[commission_id]/correct/+page.svelte`
- Modify: `src/routes/faculties/[faculty_id]/subjects/[subject_id]/periods/[period_id]/commissions/[commission_id]/students/+page.svelte`

**Interfaces:**

- Consumes: `notificationsStore.addError` and `notificationsStore.addSuccess`

- [x] **Step 1: Refactor Page Files**
  - Import `notificationsStore` from `notifications.svelte`.
  - Change all catch blocks containing `alert(e)` or `alert(e.message)` to `notificationsStore.addError(e.message || e)`.
  - Introduce an optional informative success toast, such as `notificationsStore.addSuccess("Operación realizada con éxito")`, inside successful CRUD callback saves or deletions to delight users.

---

### Task 5: Write Automated Tests and Verify

**Files:**

- Create: `src/lib/stores/notifications.svelte.test.ts`
- Create: `src/lib/components/common/Toast.test.ts`

**Interfaces:**

- Produces: Test results for Toast rendering, live-roles, and auto-dismiss pacing compliance.

- [x] **Step 1: Write Notifications Store Test**
  - Verify that success pushes an item that auto-dismisses, while errors/warnings push items that stay on screen.

- [x] **Step 2: Write `<Toast>` Component Test**
  - Assert that success renders with `role="status"` and errors render with `role="alert"`.

- [x] **Step 3: Run Vitest and Production Build**
  - Run `pnpm test run`.
  - Run `pnpm build`.
