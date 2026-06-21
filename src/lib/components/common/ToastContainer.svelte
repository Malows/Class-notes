<script lang="ts">
  import { notificationsStore } from "$lib/stores/notifications.svelte";
  import Toast from "./Toast.svelte";
</script>

<div class="toast-container" aria-label="Notificaciones" role="log">
  {#each notificationsStore.items as toast (toast.id)}
    <Toast {toast} onDismiss={(id) => notificationsStore.dismiss(id)} />
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    top: 1rem;
    right: 1rem;
    z-index: 1000;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
</style>
