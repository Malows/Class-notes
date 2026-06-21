<script lang="ts">
  import type { Toast as ToastType } from "$lib/stores/notifications.svelte";

  interface Props {
    toast: ToastType;
    onDismiss: (id: number) => void;
  }
  let { toast, onDismiss }: Props = $props();
</script>

<div
  class="card toast-card toast-{toast.type}"
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
    border-radius: 4px;
    transition: all 0.2s ease-out;
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
    font-weight: bold;
  }

  .btn-close {
    padding: 0.1rem 0.5rem !important;
    margin: 0 !important;
    font-size: 1.25rem;
    line-height: 1;
    border: none;
    background: transparent;
  }

  /* Success Semantic Colors */
  .toast-success {
    background-color: #f0fdf4;
    border: 2px solid #16a34a;
    color: #166534;
  }
  :global(.dark) .toast-success {
    background-color: #052e16;
    border: 2px solid #22c55e;
    color: #bbf7d0;
  }

  /* Error Semantic Colors */
  .toast-error {
    background-color: #fef2f2;
    border: 2px solid #dc2626;
    color: #991b1b;
  }
  :global(.dark) .toast-error {
    background-color: #450a0a;
    border: 2px solid #ef4444;
    color: #fecaca;
  }

  /* Warning Semantic Colors */
  .toast-warning {
    background-color: #fefce8;
    border: 2px solid #ca8a04;
    color: #854d0e;
  }
  :global(.dark) .toast-warning {
    background-color: #422006;
    border: 2px solid #eab308;
    color: #fef08a;
  }
</style>
