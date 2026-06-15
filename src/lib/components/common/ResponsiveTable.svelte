<script lang="ts" generics="T">
    import type { Snippet } from 'svelte';
    import Card from './Card.svelte';

    interface Props {
        items: T[];
        header: Snippet;
        row: Snippet<[T]>;
    }

    let { items, header, row }: Props = $props();
</script>

<!-- Desktop Table -->
<table class="table-hover hidden md:table">
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
<div class="md:hidden">
    {#each items as item}
        <Card class="margin-top-small">
            {@render row(item)}
        </Card>
    {/each}
    {#if items.length === 0}
        <Card>No hay datos disponibles.</Card>
    {/if}
</div>

<style lang="scss">
    .hidden {
        display: none;
    }

    @media (min-width: 768px) {
        .md\:hidden {
            display: none;
        }

        .md\:table {
            display: table;
        }
    }
</style>