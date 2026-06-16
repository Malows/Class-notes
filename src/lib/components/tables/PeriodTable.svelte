<script lang="ts">
    import { goto } from "$app/navigation"
	import { t } from '$lib/i18n/config';
	import type { Period } from '$lib/types';

    import ResponsiveTable from '$lib/components/common/ResponsiveTable.svelte';
    import Button from '$lib/components/common/Button.svelte';

    interface Props {
        periods: Period[];
        facultyId: number;
        subjectId: number;
        onEdit: (p: Period) => void;
        onDelete: (id: number) => void;
    }

    let { periods, facultyId, subjectId, onEdit, onDelete }: Props = $props();

    function goToCommissions(p: Period) {
        goto(`/faculties/${facultyId}/subjects/${subjectId}/periods/${p.id}/commissions`);
    }

    function goToAssignments(p: Period) {
        goto(`/faculties/${facultyId}/subjects/${subjectId}/periods/${p.id}/assignments`);
    }
</script>

<ResponsiveTable items={periods}>
    {#snippet header()}
        <th>{$t('layout.year')}</th>
        <th>{$t('layout.semester')}</th>
        <th>{$t('layout.actions')}</th>
    {/snippet}
    {#snippet row(p)}
        <td data-test-id="period-name-{p.id}">{p.year}</td>
        <td>{p.semester}º</td>
        <td>
            <div class="row flex-right gap-2">
                <Button data-test-id="view-commissions-btn-{p.id}" onclick={() => goToCommissions(p)}>{$t('layout.commissions')}</Button>
                <Button data-test-id="view-assignments-btn-{p.id}" onclick={() => goToAssignments(p)}>{$t('layout.define_tps')}</Button>
                <Button data-test-id="edit-btn-{p.id}" onclick={() => onEdit(p)}>{$t('layout.edit')}</Button>
                <Button data-test-id="delete-btn-{p.id}" onclick={() => onDelete(p.id)}>{$t('layout.delete')}</Button>
            </div>
        </td>
    {/snippet}
</ResponsiveTable>
