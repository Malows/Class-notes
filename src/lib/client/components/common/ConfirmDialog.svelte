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
    <button
      type="button"
      class="btn btn-ghost"
      onclick={onClose}
      data-test-id="confirm-dialog-cancel-btn">{cancelLabel}</button
    >
    <button
      type="button"
      class="btn btn-error"
      onclick={onConfirm}
      data-test-id="confirm-dialog-confirm-btn">{confirmLabel}</button
    >
  {/snippet}
</DialogBase>
