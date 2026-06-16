<script lang="ts">
    import { t } from '$lib/i18n/config';
    import type { Assignment } from '$lib/types';

    import ResponsiveTable from '$lib/components/common/ResponsiveTable.svelte';
    import Button from '$lib/components/common/Button.svelte';

    interface Props {
        assignments: Assignment[];
        onDelete: (id: number) => void;
    }

    let { assignments, onDelete }: Props = $props();
</script>

<ResponsiveTable items={assignments}>
    {#snippet header()}
        <th>{$t('layout.title')}</th>
        <th>{$t('layout.actions')}</th>
    {/snippet}
    {#snippet row(a)}
        <td data-test-id="assignment-title-{a.id}">{a.title}</td>
        <td>
            <div class="row flex-right gap-2">
                <Button data-test-id="delete-btn-{a.id}" onclick={() => onDelete(a.id)}>{$t('layout.remove')}</Button>
            </div>
        </td>
    {/snippet}
</ResponsiveTable>
