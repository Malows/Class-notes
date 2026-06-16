<script lang="ts">
    import { t } from '$lib/i18n/config';

    import type { Faculty } from '$lib/types';

    import DialogBase from '../common/DialogBase.svelte';

    interface Props {
        isOpen: boolean;
        mode: 'create' | 'edit';
        faculty: Faculty | null;
        onSave: (name: string, id?: number) => void;
        onClose: () => void;
    }

    let { isOpen, mode, faculty, onSave, onClose }: Props = $props();

    let name = $state('');

    $effect(() => {
        if (isOpen) {
            name = mode === 'edit' && faculty ? faculty.name : '';
        }
    });
</script>

<DialogBase
    {isOpen}
    title={mode === 'create' ? $t('faculties.new_faculty') : $t('faculties.edit_title')}
    onClose={onClose}
>
    {#snippet children()}
        <div class="form-group">
            <label for="faculty-name">{$t('faculties.faculty_name_label')}</label>
            <input
                type="text"
                id="faculty-name"
                bind:value={name}
                placeholder={$t('faculties.faculty_placeholder')}
                class="input-block"
                data-test-id="faculty-name-input"
            >
        </div>
    {/snippet}

    {#snippet footer()}
        <button class="paper-btn" onclick={onClose} data-test-id="modal-cancel-btn">{$t('common.cancel')}</button>
        <button
            class="paper-btn"
            onclick={() => onSave(name, faculty?.id)}
            data-test-id="modal-save-btn"
        >
            {mode === 'create' ? $t('common.create') : $t('common.save')}
        </button>
    {/snippet}
</DialogBase>
