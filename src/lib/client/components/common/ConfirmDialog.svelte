<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import DialogBase from "./DialogBase.svelte";

  interface Props {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onClose: () => void;
  }

  let { isOpen, title, message, confirmText, cancelText, onConfirm, onClose }: Props = $props();

  const confirmLabel = $derived(confirmText ?? $t("common.confirm"));
  const cancelLabel = $derived(cancelText ?? $t("common.cancel"));
</script>

<DialogBase {isOpen} {title} {onClose}>
  {#snippet children()}
    <p>{message}</p>
  {/snippet}

  {#snippet footer()}
    <button class="paper-btn" onclick={onClose} data-test-id="confirm-dialog-cancel-btn"
      >{cancelLabel}</button
    >
    <button class="btn-danger" onclick={onConfirm} data-test-id="confirm-dialog-confirm-btn"
      >{confirmLabel}</button
    >
  {/snippet}
</DialogBase>
