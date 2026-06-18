# Build Fix and Svelte 5 Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix build-blocking errors, re-implement the theme store, and modernize components for Svelte 5.

**Architecture:** Reactive state-based stores using Svelte 5 runes (`$state`, `$derived`, `$effect`). Decoupled components with clear prop interfaces.

**Tech Stack:** Svelte 5, SvelteKit, TypeScript, Vite.

---

### Task 1: Theme Store Implementation

**Files:**

- Create: `src/lib/stores/theme.svelte.ts`
- Test: `src/lib/stores/theme.svelte.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { ThemeStore } from "./theme.svelte";

describe("ThemeStore", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("initializes with light theme by default", () => {
    const store = new ThemeStore();
    expect(store.current).toBe("light");
  });

  it("toggles theme correctly", () => {
    const store = new ThemeStore();
    store.toggle();
    expect(store.current).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    store.toggle();
    expect(store.current).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest src/lib/stores/theme.svelte.test.ts`
Expected: FAIL (file not found or compilation error)

- [ ] **Step 3: Write implementation**

```typescript
export class ThemeStore {
  #current = $state<"light" | "dark">("light");

  constructor() {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme") as "light" | "dark";
      if (saved) {
        this.#current = saved;
      } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        this.#current = "dark";
      }
      this.#updateDOM();
    }
  }

  get current() {
    return this.#current;
  }

  toggle = () => {
    this.#current = this.#current === "light" ? "dark" : "light";
    if (typeof window !== "undefined") {
      localStorage.setItem("theme", this.#current);
      this.#updateDOM();
    }
  };

  #updateDOM() {
    if (typeof document !== "undefined") {
      document.documentElement.classList.toggle("dark", this.#current === "dark");
    }
  }
}

export const themeStore = new ThemeStore();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest src/lib/stores/theme.svelte.test.ts`
Expected: PASS

---

### Task 2: Fix Import Paths and Component Names

**Files:**

- Modify: `src/routes/+layout.svelte`
- Modify: `src/lib/components/ThemeToggle.svelte`
- Modify: `src/lib/components/Breadcrumbs.svelte`
- Modify: `src/routes/faculties/[faculty_id]/subjects/+page.svelte`

- [ ] **Step 1: Update +layout.svelte**
      Change: `import Sidebar from '$lib/components/layout/Sidebar.svelte';`
      To: `import Sidebar from '$lib/components/layout/sidebar/Sidebar.svelte';`

- [ ] **Step 2: Update ThemeToggle.svelte**
      Change: `import { themeStore } from '$lib/stores/theme.store';`
      To: `import { themeStore } from '$lib/stores/theme.svelte';`
      And change `{$themeStore === 'light' ? '🌙 Dark' : '☀️ Light'}` to `{themeStore.current === 'light' ? '🌙 Dark' : '☀️ Light'}` since it's now a class-based store with a getter, not a Svelte 4 store.

- [ ] **Step 3: Update Breadcrumbs.svelte**
      Change: `import { navStore } from '$lib/stores/nav.store';`
      To: `import { navStore } from '$lib/stores/nav.svelte';`

- [ ] **Step 4: Update SubjectTable import in Page**
      Change: `import SubjectTable from '$lib/components/tables/SubjectTable.svelte';`
      To: `import SubjectTable from '$lib/components/SubjectTable.svelte';`

---

### Task 3: Modernize Card Component

**Files:**

- Modify: `src/lib/components/common/Card.svelte`

- [ ] **Step 1: Replace slot with snippet**

```svelte
<script lang="ts">
  import type { Snippet } from "svelte";
  let { children }: { children: Snippet } = $props();
</script>

<div class="sketch-border sketch-shadow p-stack-md bg-surface-container-lowest">
  {@render children()}
</div>
```

---

### Task 4: Fix DeliveryForm and PeriodEditModal

**Files:**

- Modify: `src/lib/components/DeliveryForm.svelte`
- Modify: `src/lib/components/PeriodEditModal.svelte`

- [ ] **Step 1: Fix DeliveryForm state and a11y**
      Update state initialization to acknowledge it's a local copy, and add `id`/`for` to form elements.

- [ ] **Step 2: Fix PeriodEditModal state**
      Ensure `year` and `semester` update when `period` prop changes using `$effect` or `$derived` if appropriate, or acknowledge the copy.

---

### Task 5: Final Build Verification

- [ ] **Step 1: Run build**
      Run: `pnpm build`
      Expected: SUCCESS with no errors.
