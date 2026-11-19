<script lang="ts">
  import type { Toast } from "$lib/common/types/layout";
  import { t } from "$lib/common/i18n/config";

  interface Props {
    toast: Toast;
    onDismiss: (id: number) => void;
  }
  let { toast, onDismiss }: Props = $props();

  const toneClass = {
    success: "toast-success",
    warning: "toast-warning",
    error: "toast-error",
  } as const;
</script>

<div
  class="toast-card {toneClass[toast.type]}"
  role={toast.type === "error" ? "alert" : "status"}
  aria-live={toast.type === "error" ? "assertive" : "polite"}
  data-test-id={`toast-card-${toast.id}`}
>
  <div class="toast-body">
    <p class="toast-text" data-test-id={`toast-text-${toast.id}`}>{toast.message}</p>
    <button
      type="button"
      class="btn btn-ghost btn-sm btn-circle"
      onclick={() => onDismiss(toast.id)}
      aria-label={$t("common.close")}
      data-test-id={`toast-close-btn-${toast.id}`}
    >
      ×
    </button>
  </div>
</div>

<style>
  .toast-card {
    min-width: 250px;
    max-width: 400px;
    border: 1px solid var(--color-outline-variant);
    border-left-width: 3px;
    border-radius: var(--radius-box);
    background-color: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    transition: background-color 0.2s ease-out;
  }

  .toast-success {
    border-left-color: var(--color-success);
  }

  .toast-warning {
    border-left-color: var(--color-warning);
  }

  .toast-error {
    border-left-color: var(--color-error);
  }

  .toast-body {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 0.75rem 1rem;
  }

  .toast-text {
    margin: 0;
    /* On the type ramp: transient copy reads at Body LG, not an off-ramp 14px. */
    font-size: var(--text-body-lg);
    line-height: var(--text-body-lg--line-height);
    font-weight: 500;
    word-break: break-word;
  }
</style>
