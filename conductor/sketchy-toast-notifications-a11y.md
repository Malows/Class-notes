# Sketchy Toast Notification System with A11y

## Objective

Design and integrate a fully accessible, hand-drawn "Sketchy Toast" notification system that replaces intrusive native browser dialogs (`alert()`), allowing success, warning, and error messages to be announced dynamically to screen readers.

## Key Files & Context

- **Store**: `src/lib/stores/notifications.svelte.ts` (NEW)
- **Container Component**: `src/lib/components/common/ToastContainer.svelte` (NEW)
- **Toast Component**: `src/lib/components/common/Toast.svelte` (NEW)
- **Layout Mounting**: `src/routes/+layout.svelte`
- **Form/Page Triggers**: All files calling `alert()`

## Accessibility (A11y) Assertions

1. **Explicit Live Roles**:
   - Standard notifications (success, informative) must use `role="status"` and `aria-live="polite"` so screen readers announce them when quiet without interrupting the user.
   - High-severity or critical error notifications must use `role="alert"` and `aria-live="assertive"` so assistive technologies instantly interrupt active speech and announce the danger.
2. **Keyboard Accessible Close Action**:
   - Each notification card must render a focusable dismiss button `<button>` styled with a distinct outlines and an accessible tag (`aria-label="Cerrar notificación"`).
3. **Responsive Display Durations (A11y Cognitive Compliance)**:
   - Positive feedback/Success notifications can automatically fade out after a standard delay (e.g., 5-6 seconds).
   - Critical errors or form failure warnings **must NOT auto-dismiss**. They must remain displayed until the user programmatically clicks the close button. This conforms to WCAG 2.2.4 guidelines for user-controlled pacing, ensuring slow readers have ample time to process critical errors.

## Implementation Steps

### Step 1: Create Svelte 5 Notification Store
1. Create `src/lib/stores/notifications.svelte.ts`:
   - Declare a reactive array `$state<Toast[]>([])`.
   - Export methods: `addSuccess(message)`, `addError(message)`, `addWarning(message)`, and `dismiss(id)`.
   - Ensure a unique ID generation scheme for each toast.

### Step 2: Implement components
1. Create `<Toast>` component using sketchy borders (`sketch-border`, `sketch-shadow`) and accessible markup:
   - Inject matching theme colors (e.g., success color vs `--warning-bg`).
   - Add close button with `aria-label`.
2. Create `<ToastContainer>` styled as fixed in the viewport (e.g., top-right corner):
   - Render lists of active toasts.
3. Mount `<ToastContainer />` inside the global layout file `src/routes/+layout.svelte`.

### Step 3: Replace `alert()` Triggers
1. Search and replace standard `alert()` calls inside Svelte page routes with calls to `notificationStore.addError(message)`.

## Verification & Testing

1. **Component Tests**:
   - Create unit tests verifying that invoking `addSuccess()` pushes a message to the DOM inside a node possessing `role="status"` and `aria-live="polite"`.
   - Verify that calling `addError()` pushes a message inside a node possessing `role="alert"` and `aria-live="assertive"`, and does not trigger any auto-dismiss intervals.
