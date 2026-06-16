<script lang="ts">
    import { t } from '$lib/i18n/config';

	import type { Subject } from '$lib/types';
    import ResponsiveTable from '$lib/components/common/ResponsiveTable.svelte';
    import Button from '$lib/components/common/Button.svelte';

    interface Props {
        subjects: Subject[];
        onEdit: (s: Subject) => void;
        onDelete: (s: Subject) => void;
    }
    let { subjects, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={subjects}>
    {#snippet header()}
        <th data-test-id="table-header-name">{$t('layout.name')}</th>
        <th data-test-id="table-header-faculty">{$t('layout.faculty')}</th>
        <th data-test-id="table-header-actions">{$t('layout.actions')}</th>
    {/snippet}
    {#snippet row(subject)}
        <td data-test-id="subject-name-{subject.id}">{subject.name}</td>
        <td data-test-id="subject-faculty-name-{subject.id}">{subject.faculty_name}</td>
        <td>
            <div class="row flex-right gap-2">
                <Button href="/faculties/{subject.faculty_id}/subjects/{subject.id}/periods" data-test-id="view-periods-btn-{subject.id}">{$t('layout.view_periods')}</Button>
                <Button onclick={() => onEdit(subject)} data-test-id="edit-btn-{subject.id}">{$t('common.edit')}</Button>
                <Button onclick={() => onDelete(subject)} data-test-id="delete-btn-{subject.id}">{$t('common.delete')}</Button>
            </div>
        </td>
    {/snippet}
</ResponsiveTable>
