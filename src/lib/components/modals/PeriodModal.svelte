<script lang="ts">
    import { t } from '$lib/i18n/config';

    import type { Period } from '$lib/types';

    import DialogBase from '../common/DialogBase.svelte';

    interface Props {
        isOpen: boolean;
        mode: 'create' | 'edit';
        period: Period | null;
        onSave: (year: number, semester: number, id?: number) => void;
        onClose: () => void;
    }
    let { isOpen, mode, period, onSave, onClose }: Props = $props();
    
    let year = $state(new Date().getFullYear());
    let semester = $state(1);

    $effect(() => {
        if (isOpen) {
            year = mode === 'edit' && period ? period.year : new Date().getFullYear();
            semester = mode === 'edit' && period ? period.semester : 1;
        }
    });
</script>

<DialogBase 
    {isOpen} 
    title={mode === 'create' ? $t('periods.new_title') : $t('periods.edit_title')} 
    onClose={onClose}
>
    {#snippet children()}
        <div class="form-group">
            <label for="edit-year">{$t('periods.year_label')}</label>
            <input type="number" id="edit-year" bind:value={year} class="input-block" data-test-id="period-year-input">
        </div>
        <div class="form-group">
            <label for="edit-semester">{$t('periods.semester_label')}</label>
            <select id="edit-semester" bind:value={semester} class="input-block" data-test-id="period-semester-select">
                <option value={1}>1º {$t('periods.semester')}</option>
                <option value={2}>2º {$t('periods.semester')}</option>
            </select>
        </div>
    {/snippet}

    {#snippet footer()}
        <button class="paper-btn" data-test-id="cancel-btn" onclick={onClose}>{$t('common.cancel')}</button>
        <button 
            class="paper-btn btn-secondary" 
            data-test-id="submit-btn"
            onclick={() => onSave(Number(year), Number(semester), period?.id)}
        >
            {mode === 'create' ? $t('common.create') : $t('common.save')}
        </button>
    {/snippet}
</DialogBase>
