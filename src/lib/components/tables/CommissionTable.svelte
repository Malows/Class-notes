<script lang="ts">
    import { goto } from "$app/navigation"
    import { t } from '$lib/i18n/config';
    import type { Commission } from '$lib/types';

    import ResponsiveTable from '$lib/components/common/ResponsiveTable.svelte';
    import Button from '$lib/components/common/Button.svelte';

    interface Props {
        commissions: Commission[];
        facultyId: number;
        subjectId: number;
        periodId: number;
        onEdit: (c: Commission) => void;
        onDelete: (id: number) => void;
    }

    let { commissions, facultyId, subjectId, periodId, onEdit, onDelete }: Props = $props();

    function goToStudents(c: Commission) {
        goto(`/faculties/${facultyId}/subjects/${subjectId}/periods/${periodId}/commissions/${c.id}/students`);
    }

    function goToOverview(c: Commission) {
        goto(`/faculties/${facultyId}/subjects/${subjectId}/periods/${periodId}/commissions/${c.id}/overview`);
    }
</script>

<ResponsiveTable items={commissions}>
    {#snippet header()}
        <th>{$t('layout.name')}</th>
        <th>{$t('layout.students')}</th>
        <th>{$t('layout.actions')}</th>
    {/snippet}
    {#snippet row(c)}
        <td>{c.name}</td>
        <td>{c.student_count}</td>
        <td>
            <div class="row flex-right gap-2">
                <Button onclick={() => goToStudents(c)}>{$t('layout.students_list')}</Button>
                <Button onclick={() => goToOverview(c)}>{$t('layout.overview')}</Button>
                <Button onclick={() => onEdit(c)}>{$t('layout.edit')}</Button>
                <Button onclick={() => onDelete(c.id)}>{$t('layout.delete')}</Button>
            </div>
        </td>
    {/snippet}
</ResponsiveTable>
