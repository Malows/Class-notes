<script lang="ts">
  import { fade, fly } from 'svelte/transition';
  import type { Snippet } from 'svelte';

  interface Props {
    isOpen: boolean;
    title: string;
    children: Snippet;
    footer?: Snippet;
    onClose: () => void;
  }

  let { isOpen, title, children, footer, onClose }: Props = $props();
</script>

{#if isOpen}
  <div class="modal" transition:fade={{ duration: 200 }} data-test-id="modal-container">
    <div 
      class="modal-bg" 
      onclick={onClose} 
      onkeydown={(e) => e.key === 'Escape' && onClose()} 
      role="button" 
      tabindex="-1" 
      aria-label="Close modal"
      data-test-id="modal-backdrop"
    ></div>
    <div class="modal-body" transition:fly={{ y: 20, duration: 300 }} data-test-id="modal-body">
      <button class="btn-close" onclick={onClose} aria-label="Close" data-test-id="modal-close-btn">&times;</button>
      <h4 class="modal-title">{title}</h4>
      
      <div class="modal-text">
        {@render children()}
      </div>

      {#if footer}
        <footer class="modal-footer">
          {@render footer()}
        </footer>
      {/if}
    </div>
  </div>
{/if}

<style>
  /* Force visibility because PaperCSS hides .modal by default without checkbox state */
  .modal {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .modal-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1 !important;
  }

  .modal-body {
    max-width: 500px;
    width: 90%;
    margin: auto !important;
    position: relative !important;
    z-index: 2 !important;
    transform: none !important;
    left: auto !important;
    top: auto !important;
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
