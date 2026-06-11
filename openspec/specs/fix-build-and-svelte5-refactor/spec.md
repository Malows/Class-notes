# Spec: Build Fix and Svelte 5 Refactor

## 1. Goal

Fix all build-blocking errors, re-implement the missing theme store, and address Svelte 5 deprecation/a11y warnings.

## 2. Approach

Systematic fix of import paths, creation of missing store, and surgical refactoring of components to adhere to Svelte 5 standards.

## 3. Changes

### 3.1 Path Corrections

- **`src/routes/+layout.svelte`**: Correct `Sidebar` import path.
- **`src/routes/faculties/[faculty_id]/subjects/+page.svelte`**: Correct `SubjectTable` import path.
- **`src/lib/components/Breadcrumbs.svelte`**: Correct `navStore` import path (add `.ts` or fix name).
- **`src/lib/components/ThemeToggle.svelte`**: Correct `themeStore` import path.

### 3.2 Theme Store (`src/lib/stores/theme.svelte.ts`)

Implement a Svelte 5 reactive store for theme management:

- State: `current` ('light' | 'dark').
- Methods: `toggle()`.
- Persistence: Sync with `localStorage`.
- DOM Sync: Toggle `.dark` class on `document.documentElement`.

### 3.3 Svelte 5 Modernization

- **`src/lib/components/common/Card.svelte`**:
  - Use `{@render children()}` instead of `<slot />`.
  - Accept `children` as a prop.
- **`src/lib/components/DeliveryForm.svelte`**:
  - Address "state referenced locally" warning by using `$derived` if data should be reactive to props, or clarifying intent.
  - Fix A11y labels by adding `id` to inputs and `for` to labels.
- **`src/lib/components/PeriodEditModal.svelte`**:
  - Address "state referenced locally" warning.

### 3.4 Verification

- Execute `pnpm build`.
- Verify no errors or critical warnings remain.

## 4. Success Criteria

- `pnpm build` completes successfully.
- Theme switching works (verified by presence of `.dark` class in DOM).
- Components render correctly with new Svelte 5 syntax.
