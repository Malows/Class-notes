<script lang="ts">
    import { t } from '$lib/i18n/config';

    import type { Assignment } from '$lib/types';

    import DialogBase from '../common/DialogBase.svelte';

    interface Props {
        isOpen: boolean;
        mode: 'create' | 'edit';
        assignment: Assignment | null;
        onSave: (title: string, id?: number) => void;
        onClose: () => void;
    }

    let { isOpen, mode, assignment, onSave, onClose }: Props = $props();
    
    let title = $state('');

    $effect(() => {
        if (isOpen) {
            title = mode === 'edit' && assignment ? assignment.title : '';
        }
    });
</script>

<DialogBase 
    {isOpen} 
    title={mode === 'create' ? $t('assignments.new_title') : $t('assignments.edit_title')} 
    onClose={onClose}
>
    {#snippet children()}
        <div class="form-group">
            <label for="assignment-title">{$t('assignments.title_label')}</label>
            <input 
                type="text" 
                id="assignment-title" 
                bind:value={title} 
                placeholder={$t('assignments.placeholder')} 
                class="input-block"
                data-test-id="assignment-title-input"
            >
        </div>
    {/snippet}

    {#snippet footer()}
        <button class="paper-btn" onclick={onClose} data-test-id="modal-cancel-btn">{$t('common.cancel')}</button>
        <button 
            class="paper-btn btn-primary" 
            onclick={() => onSave(title, assignment?.id)}
            data-test-id="modal-save-btn"
        >
            {mode === 'create' ? $t('common.create') : $t('common.save')}
        </button>
    {/snippet}
</DialogBase>
