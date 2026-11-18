<script lang="ts">
  interface Item {
    label: string;
    value: string | number;
  }

  let { items, class: className = "" }: { items: Item[]; class?: string } = $props();
</script>

<div
  class="flex flex-wrap items-center gap-3 rounded-[var(--radius-box)] border border-base-300 bg-base-100 px-3.5 py-2 {className}"
>
  {#each items as item, index (item.label)}
    {#if index > 0}
      <span class="h-4 w-px bg-base-300" aria-hidden="true"></span>
    {/if}
    <span class="flex items-center gap-1.5 text-body-sm">
      <span class="font-semibold text-on-surface-variant">{item.label}</span>
      <span class="font-medium tnum text-base-content">{item.value}</span>
    </span>
  {/each}
</div>
