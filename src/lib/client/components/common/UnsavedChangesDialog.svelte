<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import DialogBase from "./DialogBase.svelte";

  interface Props {
    isOpen: boolean;
    saving?: boolean;
    onSave: () => void;
    onDiscard: () => void;
    onStay: () => void;
  }

  let { isOpen, saving = false, onSave, onDiscard, onStay }: Props = $props();
</script>

<DialogBase {isOpen} title={$t("common.unsaved_title")} onClose={onStay}>
  {#snippet children()}
    <p class="m-0">{$t("common.unsaved_message")}</p>
  {/snippet}

  {#snippet footer()}
    <!-- Safe action first: focus lands on the non-destructive choice. -->
    <!-- svelte-ignore a11y_autofocus -->
    <button
      type="button"
      class="btn btn-ghost"
      autofocus
      onclick={onStay}
      data-test-id="unsaved-stay-btn"
    >
      {$t("common.keep_editing")}
    </button>
    <button
      type="button"
      class="btn btn-outline btn-error"
      onclick={onDiscard}
      data-test-id="unsaved-discard-btn"
    >
      {$t("common.discard_and_leave")}
    </button>
    <button
      type="button"
      class="btn btn-primary"
      onclick={onSave}
      disabled={saving}
      data-test-id="unsaved-save-btn"
    >
      {$t("common.save_and_leave")}
    </button>
  {/snippet}
</DialogBase>
