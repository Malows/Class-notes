<script lang="ts">
  import type { SidebarContextLink } from "./sidebar-context";

  import SidebarContextItem from "./SidebarContextItem.svelte";

  type Props = {
    heading: string;
    isCollapsed: boolean;
    items: SidebarContextLink[];
  };

  let { heading, isCollapsed, items }: Props = $props();
</script>

<div class="flex flex-col gap-1.5">
  {#if !isCollapsed}
    <p class="m-0 px-2 text-label-sm uppercase tracking-[0.04em] text-on-surface-variant" data-test-id="sidebar-context-heading">
      {heading}
    </p>
  {/if}
  <ul class="m-0 flex list-none flex-col gap-0.5 p-0">
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
