<script lang="ts">
    import { t } from '$lib/i18n/config';

    import type { Commission } from '$lib/types';

    import DialogBase from '../common/DialogBase.svelte';

    interface Props {
        isOpen: boolean;
        mode: 'create' | 'edit';
        commission: Commission | null;
        onSave: (name: string, id?: number) => void;
        onClose: () => void;
    }

    let { isOpen, mode, commission, onSave, onClose }: Props = $props();
    
    let name = $state('');

    $effect(() => {
        if (isOpen) {
            name = mode === 'edit' && commission ? commission.name : '';
        }
    });
</script>

<DialogBase 
    {isOpen} 
    title={mode === 'create' ? $t('commissions.new_title') : $t('commissions.edit_title')} 
    onClose={onClose}
>
    {#snippet children()}
        <div class="form-group">
            <label for="commission-name">{$t('commissions.name_label')}</label>
            <input 
                type="text" 
                id="commission-name" 
                bind:value={name} 
                placeholder={$t('commissions.placeholder')} 
                class="input-block"
                data-test-id="commission-name-input"
            >
        </div>
    {/snippet}

    {#snippet footer()}
        <button class="paper-btn" onclick={onClose} data-test-id="modal-cancel-btn">{$t('common.cancel')}</button>
        <button 
            class="paper-btn btn-secondary" 
            onclick={() => onSave(name, commission?.id)}
            data-test-id="modal-save-btn"
        >
            {mode === 'create' ? $t('common.create') : $t('common.save')}
        </button>
    {/snippet}
</DialogBase>
