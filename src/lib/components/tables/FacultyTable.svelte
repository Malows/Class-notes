<script lang="ts">
    import { goto } from "$app/navigation"
	import { t } from '$lib/i18n/config';
    import type { Faculty } from '$lib/types';
    
    import ResponsiveTable from '$lib/components/common/ResponsiveTable.svelte';
    import Button from '$lib/components/common/Button.svelte';

    interface Props {
        faculties: Faculty[];
        onEdit: (f: Faculty) => void;
        onDelete: (f: Faculty) => void;
    }
    
    let { faculties, onEdit, onDelete }: Props = $props();

    function goToFaculty(f: Faculty) {
        goto(`/faculties/${f.id}/subjects`);
    }
</script>

<ResponsiveTable items={faculties}>
    {#snippet header()}
        <th data-test-id="table-header-id">{$t('layout.id')}</th>
        <th data-test-id="table-header-name">{$t('layout.name')}</th>
        <th data-test-id="table-header-actions">{$t('layout.actions')}</th>
    {/snippet}
    {#snippet row(f)}
        <td data-test-id="faculty-id-{f.id}">{f.id}</td>
        <td data-test-id="faculty-name-{f.id}">{f.name}</td>
        <td>
            <div class="row flex-right gap-2">
                <Button onclick={() => goToFaculty(f)} data-test-id="view-subjects-btn-{f.id}">{$t('layout.view_subjects')}</Button>
                <Button onclick={() => onEdit(f)} data-test-id="edit-btn-{f.id}">{$t('layout.edit')}</Button>
                <Button onclick={() => onDelete(f)} data-test-id="delete-btn-{f.id}">{$t('layout.delete')}</Button>
            </div>
        </td>
    {/snippet}
</ResponsiveTable> 