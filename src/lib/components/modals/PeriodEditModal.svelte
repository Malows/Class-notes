<script lang="ts">
    import { t } from '$lib/i18n/config';

    import type { Period } from '$lib/types';

    import DialogBase from '../common/DialogBase.svelte';

    interface Props {
        isOpen: boolean;
        period: Period | null;
        onSave: (id: number, year: number, semester: number) => void;
        onClose: () => void;
    }
    let { isOpen, period, onSave, onClose }: Props = $props();
    
    let year = $state(new Date().getFullYear());
    let semester = $state(1);

    $effect(() => {
        if (period) {
            year = period.year;
            semester = period.semester;
        }
    });
</script>

<DialogBase 
    {isOpen} 
    title={period ? $t('periods.edit_title') : $t('periods.new_period')} 
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
            class="paper-btn btn-primary" 
            data-test-id="submit-btn"
            onclick={() => period && onSave(period.id, Number(year), Number(semester))}
        >
            {$t('common.save')}
        </button>
    {/snippet}
</DialogBase>
