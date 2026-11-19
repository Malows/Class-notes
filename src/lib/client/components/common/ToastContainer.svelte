<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import { notificationsStore } from "$lib/client/stores/notifications.svelte";

  import Toast from "./Toast.svelte";
</script>

<div class="toast-container" aria-label={$t("common.notifications")} role="log">
  {#each notificationsStore.items as toast (toast.id)}
    <Toast {toast} onDismiss={(id) => notificationsStore.dismiss(id)} />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 4rem;
    right: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  @media (max-width: 768px) {
    .toast-container {
      top: 5rem;
    }
  }
</style>
