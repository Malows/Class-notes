<script lang="ts">
    import SidebarContextItem from './SidebarContextItem.svelte';
    import type { SidebarContextLink } from './sidebar-context';

    type Props = {
        heading: string;
        isCollapsed: boolean;
        items: SidebarContextLink[];
    };

    let { heading, isCollapsed, items }: Props = $props();
</script>

<div class="context-section">
    {#if !isCollapsed}
        <h6>{heading}</h6>
    {/if}
    <ul>
        {#each items as item (item.id)}
            <SidebarContextItem
                href={item.href}
                label={item.label}
                shortLabel={item.shortLabel}
                isActive={item.isActive}
                {isCollapsed}
            />
        {/each}
    </ul>
</div>

<style>
    .context-section {
        margin-bottom: 1.5rem;
    }

    .context-section h6 {
        margin-bottom: 0.5rem;
        color: var(--muted-color);
        font-size: 0.7rem;
        text-transform: uppercase;
        letter-spacing: 1px;
    }

    ul {
        list-style: none;
        padding-left: 0;
    }

    .context-section :global(li.collapsed) {
        text-align: center;
    }
</style>