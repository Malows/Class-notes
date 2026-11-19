<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Delivery } from "$lib/common/types/student";

  import DialogBase from "../common/DialogBase.svelte";
  import Button from "../common/Button.svelte";
  import DeliveryForm from "../DeliveryForm.svelte";

  interface Props {
    isOpen: boolean;
    delivery: Delivery | null;
    onSave: (d: Delivery) => void;
    onClose: () => void;
    onPrev?: () => void;
    onNext?: () => void;
    onSkip?: () => void;
  }

  let { isOpen, delivery, onSave, onClose, onPrev, onNext, onSkip }: Props = $props();
</script>

<DialogBase {isOpen} title={$t("layout.correct")} {onClose}>
  {#snippet children()}
    {#if delivery}
      <DeliveryForm
        {delivery}
        onSave={(d) => {
          onSave(d);
          onClose();
        }}
        {onPrev}
        {onNext}
        {onSkip}
        gradeTestId="correction-grade-input"
        approvedTestId="correction-approved-checkbox"
        commentsTestId="correction-comments-textarea"
        submitTestId="modal-save-btn"
      />
    {/if}
  {/snippet}

  {#snippet footer()}
    <Button class="btn-ghost" testId="modal-cancel-btn" onclick={onClose}>
      {$t("common.cancel")}
    </Button>
  {/snippet}
</DialogBase>
