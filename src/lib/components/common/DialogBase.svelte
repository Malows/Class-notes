<script lang="ts">
  import type { Snippet } from "svelte";
  import { fade } from "svelte/transition";

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
    class="modal-body native-dialog"
    data-test-id="modal-container"
  >
    <button class="btn-close" onclick={onClose} aria-label="Close" data-test-id="modal-close-btn"
      >&times;</button
    >
    <h4 class="modal-title">{title}</h4>

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
    border: 2px solid var(--border-color);
    border-radius: var(--sketch-border-radius);
    background-color: #fff; /* Replicate PaperCSS background */
    max-width: 500px;
    width: 90%;
    padding: 1.5rem;
    box-shadow: var(--shadow-offset) var(--shadow-offset) 0px 0px var(--border-color);
    position: fixed;
    margin: auto;
    color: inherit;
  }

  /* Support dark mode theme */
  :global(.dark) dialog.native-dialog {
    background-color: #1a1c1c;
    border-color: var(--border-color);
    box-shadow: var(--shadow-offset) var(--shadow-offset) 0px 0px var(--border-color);
  }

  dialog.native-dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.4);
  }

  .modal-title {
    margin-top: 0;
    margin-bottom: 1.5rem;
    font-size: 1.25rem;
    font-weight: bold;
  }

  .modal-footer {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  .btn-close {
    background: none;
    border: none;
    font-size: 1.5rem;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    position: absolute;
    top: 1rem;
    right: 1rem;
  }
</style>
