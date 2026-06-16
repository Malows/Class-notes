<script lang="ts">
    import { t } from '$lib/i18n/config';

    import type { Delivery } from '$lib/types';

    import DeliveryForm from '../DeliveryForm.svelte';
    import DialogBase from '../common/DialogBase.svelte';

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

<DialogBase 
    {isOpen} 
    title={$t('layout.correct')} 
    onClose={onClose}
>
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
        <button class="paper-btn" onclick={onClose} data-test-id="modal-cancel-btn">{$t('common.cancel')}</button>
    {#/snippet}
</DialogBase>
