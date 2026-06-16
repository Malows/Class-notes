<script lang="ts">
    import DialogBase from '../common/DialogBase.svelte';
    import type { Subject } from '$lib/types';
    import { t } from '$lib/i18n/config';

    interface Props {
        isOpen: boolean;
        mode: 'create' | 'edit';
        subject: Subject | null;
        onSave: (name: string, id?: number) => void;
        onClose: () => void;
    }

    let { isOpen, mode, subject, onSave, onClose }: Props = $props();
    
    let name = $state('');

    $effect(() => {
        if (isOpen) {
            name = mode === 'edit' && subject ? subject.name : '';
        }
    });
</script>

<DialogBase 
    {isOpen} 
    title={mode === 'create' ? $t('subjects.new_title') : $t('subjects.edit_title')} 
    onClose={onClose}
>
    {#snippet children()}
        <div class="form-group">
            <label for="subject-name">{$t('subjects.name_label')}</label>
            <input 
                type="text" 
                id="subject-name" 
                bind:value={name} 
                placeholder={$t('subjects.placeholder')} 
                class="input-block"
                data-test-id="subject-name-input"
            >
        </div>
    {/snippet}

    {#snippet footer()}
        <button class="paper-btn" data-test-id="cancel-btn" onclick={onClose}>{$t('common.cancel')}</button>
        <button 
            class="paper-btn btn-primary" 
            data-test-id="submit-btn"
            onclick={() => onSave(name, subject?.id)}
        >
            {mode === 'create' ? $t('common.create') : $t('common.save')}
        </button>
    {/snippet}
</DialogBase>
