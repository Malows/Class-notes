# Native Dialog Migration

## Objective

Refactor the custom modal implementation in `DialogBase.svelte` to use the native HTML `<dialog>` element. This will provide native accessibility, focus trapping, top-layer stacking, and `Escape` key handling out of the box, while perfectly preserving the project's signature "sketchy" hand-drawn aesthetic.

## Key Files & Context

- `src/lib/components/common/DialogBase.svelte`: The central modal wrapper component.

## Implementation Steps

1. **DOM Restructuring**:
   - Remove the outer `<div class="modal">` and the separate `<div class="modal-bg">` backdrop overlay.
   - Convert the `<div class="modal-body">` wrapper into a native `<dialog>` element.
   - Retain the `.modal-body` class on the dialog so it inherently receives the sketchy PaperCSS aesthetic (borders, shadows, padding).
   - Retain all `data-test-id` attributes for E2E testing continuity.

2. **State Synchronization (`$effect`)**:
   - Bind the dialog DOM element to a Svelte variable (`bind:this={dialog}`).
   - Implement a Svelte 5 `$effect` block that watches the `isOpen` prop.
   - When `isOpen` is `true` and the dialog is not open, call `dialog.showModal()`.
   - When `isOpen` is `false` and the dialog is open, call `dialog.close()`.

3. **Event Handling (Close & Backdrop Click)**:
   - Bind the native `onclose` event of the dialog to trigger the Svelte `onClose()` prop callback.
   - To replicate the click-outside-to-close behavior, attach an `onclick` handler directly to the `<dialog>`. Because the native dialog's box model only covers the actual modal surface, clicks on the `::backdrop` register as clicks on the dialog element itself. The handler will check `event.target === dialog` to distinguish backdrop clicks from clicks inside the modal content, and trigger `onClose()` accordingly.

4. **Aesthetic Styling (`::backdrop`)**:
   - Remove the old `.modal` and `.modal-bg` CSS classes from `DialogBase.svelte`.
   - Add a `dialog::backdrop` CSS selector.
   - Apply a semi-transparent dark background to the `::backdrop` (e.g., `background: rgba(0, 0, 0, 0.4);`) to replicate the original overlay.
   - Reset native dialog defaults that might interfere with PaperCSS (e.g., resetting default browser borders or margins).

## Verification & Testing

1. **Interactive Verification**: Run `pnpm dev` and manually open a modal (e.g., Faculty or Subject modal).
2. **Behavioral Checks**:
   - Verify that pressing `Escape` closes the modal natively.
   - Verify that clicking the dark backdrop closes the modal.
   - Verify that clicking inside inputs or buttons does _not_ close the modal.
3. **Visual Checks**: Ensure the modal retains its sketchy border, shadow, and transitions.
4. **Test Suite**: Run `pnpm test run` to ensure all 71 unit tests continue to pass with the new DOM structure.
