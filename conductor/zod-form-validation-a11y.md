# Form Validation with Zod, Svelte 5 Runes & A11y

## Objective

Standardize client-side form validation across all admin modals (Faculties, Subjects, Periods, Commissions, Students, and Assignments) using Zod schemas and Svelte 5 reactive states (`$state`), guaranteeing fully accessible interaction models (ARIA compliance, keyboard focus shift, and screen-reader announcements).

## Key Files & Context

- **Schemas**: `src/lib/schemas/dto.schema.ts`
- **Modals**:
  - `src/lib/components/modals/FacultyModal.svelte`
  - `src/lib/components/modals/SubjectModal.svelte`
  - `src/lib/components/modals/PeriodModal.svelte`
  - `src/lib/components/modals/CommissionModal.svelte`
  - `src/lib/components/modals/StudentModal.svelte`
  - `src/lib/components/modals/AssignmentModal.svelte`

## Accessibility (A11y) Assertions

To comply with WCAG 2.1 AA and ensure "First World Class" accessibility, all validated forms must fulfill these standards:

1. **Dynamic ARIA Descriptors**:
   - Every input with an active validation error must have `aria-invalid="true"`.
   - Error text containers must have unique IDs (e.g., `id="error-{inputId}"`) and be linked to their inputs using `aria-describedby="error-{inputId}"` so screen readers read the error message when the user focuses on the field.
2. **First-Error Keyboard Focus Management**:
   - On submitting a form with validation errors, the system must automatically capture the first invalid DOM input element and programmatically trigger `.focus()` on it, allowing immediate keyboard corrections.
3. **Screen-Reader Announcements**:
   - Error messages must render inside/with `role="alert"` or `aria-live="polite"` to ensure instant user-agent speech announcements without stealing focus.
4. **Contrast & Themes**:
   - Error borders and texts must utilize established theme colors (`var(--warning-text)` and `var(--warning-bg)`) to maintain AA contrast ratios in both light and dark mode.

## Implementation Steps

### Step 1: Create Validation Utility

1. Create a helper or composable `src/lib/composables/useFormValidation.ts` to manage form validation state:
   - Accept a Zod schema.
   - Maintain a Svelte 5 reactive `$state` object of field errors (e.g. `errors: Record<string, string>`).
   - Export a `validate(data: unknown)` function that returns a boolean, populates/clears the reactive errors state, and dynamically focuses the first invalid element on the page using standard DOM selectors (e.g. `document.getElementById`).

### Step 2: Apply to AssignmentModal & Other Modals

1. Refactor `AssignmentModal.svelte` (and other modals subsequently):
   - Import `CreateAssignmentSchema` from `dto.schema.ts`.
   - Replace manual empty-string validation with the `useFormValidation` validator.
   - Bind input elements with `aria-invalid={!!errors.title}` and `aria-describedby={errors.title ? "error-assignment-title" : undefined}`.
   - Render errors using a sketchy-bordered small text node with `id="error-assignment-title"` and `role="alert"`.

## Verification & Testing

1. **Automated Unit Tests**:
   - Add unit tests validating that submitting invalid modal fields populates the errors, assigns `aria-invalid="true"`, and displays the localized warning.
2. **Keyboard Testing**:
   - Verify that submitting with errors shifts the keyboard focus directly to the first invalid field.
