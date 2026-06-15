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
        <th>{$t('layout.id')}</th>
        <th>{$t('layout.name')}</th>
        <th>{$t('layout.actions')}</th>
    {/snippet}
    {#snippet row(f)}
        <td>{f.id}</td>
        <td>{f.name}</td>
        <td>
            <div class="row flex-right gap-2">
                <Button onclick={() => goToFaculty(f)}>{$t('layout.view_subjects')}</Button>
                <Button onclick={() => onEdit(f)}>{$t('layout.edit')}</Button>
                <Button onclick={() => onDelete(f)}>{$t('layout.delete')}</Button>
            </div>
        </td>
    {/snippet}
</ResponsiveTable> 