<script lang="ts">
    import { t } from '$lib/i18n/config';
    import type { Student } from '$lib/types';

    import ResponsiveTable from '$lib/components/common/ResponsiveTable.svelte';
    import Button from '$lib/components/common/Button.svelte';

    interface Props {
        students: Student[];
        onEdit: (s: Student) => void;
        onDelete: (id: number) => void;
    }
    
    let { students, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={students}>
    {#snippet header()}
        <th>{$t('layout.name')}</th>
        <th>{$t('layout.actions')}</th>
    {/snippet}
    {#snippet row(s)}
        <td data-test-id="student-name-{s.id}">{s.name}</td>
        <td>
            <div class="row flex-right gap-2">
                <Button data-test-id="edit-btn-{s.id}" onclick={() => onEdit(s)}>{$t('layout.edit')}</Button>
                <Button data-test-id="delete-btn-{s.id}" onclick={() => onDelete(s.id)}>{$t('layout.delete')}</Button>
            </div>
        </td>
    {/snippet}
</ResponsiveTable>
