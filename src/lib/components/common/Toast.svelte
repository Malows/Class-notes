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
