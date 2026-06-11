<script lang="ts">
    import type { Snippet } from 'svelte';
    import Card from './Card.svelte';

    interface Props<T> {
        items: T[];
        header: Snippet;
        row: Snippet<[T]>;
    }

    let { items, header, row }: Props<any> = $props();
</script>

<!-- Desktop Table -->
<table class="table-hover hidden md:block">
    <thead>
        <tr>
            {@render header()}
        </tr>
    </thead>
    <tbody>
        {#each items as item}
            <tr>
                {@render row(item)}
            </tr>
        {/each}
        {#if items.length === 0}
            <tr>
                <td colspan="100%">No hay datos disponibles.</td>
            </tr>
        {/if}
    </tbody>
</table>

<!-- Mobile Cards -->
<div class="md:hidden space-y-2">
    {#each items as item}
        <Card>
            {@render row(item)}
        </Card>
    {/each}
    {#if items.length === 0}
        <Card>No hay datos disponibles.</Card>
    {/if}
</div>
