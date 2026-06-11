<script lang="ts">
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
</script>

<ResponsiveTable items={periods}>
    {#snippet header()}
        <th>{$t('layout.year')}</th>
        <th>{$t('layout.semester')}</th>
        <th>{$t('layout.actions')}</th>
    {/snippet}
    {#snippet row(p)}
        <td>{p.year}</td>
        <td>{p.semester}º</td>
        <td>
            <div class="flex gap-2 flex-wrap">
                <Button href="/faculties/{facultyId}/subjects/{subjectId}/periods/{p.id}/commissions">{$t('layout.commissions')}</Button>
                <Button href="/faculties/{facultyId}/subjects/{subjectId}/periods/{p.id}/assignments">{$t('layout.define_tps')}</Button>
                <Button onclick={() => onEdit(p)}>{$t('layout.edit')}</Button>
                <Button onclick={() => onDelete(p.id)}>{$t('layout.delete')}</Button>
            </div>
        </td>
    {/snippet}
</ResponsiveTable>
