<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";

  import { t } from "$lib/common/i18n/config";

  interface Props {
    isOpen: boolean;
    title: string;
    children: Snippet;
    footer?: Snippet;
    onClose: () => void;
  }

  let { isOpen, title, children, footer, onClose }: Props = $props();

  let dialogElement = $state<HTMLDialogElement | null>(null);

  // Synchronize 'isOpen' state with native dialog showModal/close API
  $effect(() => {
    if (isOpen) {
      if (dialogElement && !dialogElement.open) {
        dialogElement.showModal();
        // Data-entry dialogs open on their first field; a dialog that marks a
        // safe action with autofocus (confirmations) keeps that target.
        queueMicrotask(() => {
          const root = dialogElement;
          if (!root || root.querySelector("[autofocus]")) return;
          root
            .querySelector<HTMLElement>(
              'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])',
            )
            ?.focus();
        });
      }
    } else {
      if (dialogElement && dialogElement.open) {
        dialogElement.close();
      }
    }
  });

  // Handle browser's native 'close' event (e.g., via the Escape key)
  function handleClose() {
    onClose();
  }

  // Handle clicking on the ::backdrop (clicking outside the dialog box)
  function handleBackdropClick(event: MouseEvent) {
    if (event.target === dialogElement) {
      onClose();
    }
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <dialog
    bind:this={dialogElement}
    onclose={handleClose}
    onclick={handleBackdropClick}
    transition:fade={{ duration: 150 }}
    class="native-dialog"
    aria-label={title}
    data-test-id="modal-container"
  >
    <header class="modal-header">
      <h2 class="modal-title">{title}</h2>
      <button
        type="button"
        class="btn btn-ghost btn-sm btn-circle"
        onclick={onClose}
        aria-label={$t("common.close")}
        data-test-id="modal-close-btn"
      >
        &times;
      </button>
    </header>

    <div class="modal-text" data-test-id="modal-body">
      {@render children()}
    </div>

    {#if footer}
      <footer class="modal-footer">
        {@render footer()}
      </footer>
    {/if}
  </dialog>
{/if}

<style>
  dialog.native-dialog {
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-box);
    background-color: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    max-width: 36rem;
    width: min(92vw, 36rem);
    padding: 0;
    box-shadow: none;
    position: fixed;
    margin: auto;
  }

  /* Native modal scroll containment: gestures over the backdrop or inside the
     dialog must not chain to the page behind it. */
  dialog.native-dialog:modal {
    overscroll-behavior: contain;
  }

  dialog.native-dialog::backdrop {
    background-color: var(--color-scrim);
    overflow: hidden;
    overscroll-behavior: contain;
  }

  .modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 1.25rem;
    border-bottom: 1px solid var(--color-outline-variant);
  }

  .modal-title {
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.75rem;
  }

  .modal-text {
    padding: 1.25rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    padding: 1rem 1.25rem;
    border-top: 1px solid var(--color-outline-variant);
  }
</style>
