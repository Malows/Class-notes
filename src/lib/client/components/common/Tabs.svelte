<script lang="ts">
  interface Tab {
    label: string;
    href: string;
    active?: boolean;
    count?: number;
  }

  let { items, label }: { items: Tab[]; label: string } = $props();
</script>

<nav aria-label={label}>
  <div class="flex gap-1 overflow-x-auto border-b border-base-300">
    {#each items as item (item.href)}
      <a
        href={item.href}
        aria-current={item.active ? "page" : undefined}
        class="-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2 text-title-md {item.active
          ? 'border-primary text-primary'
          : 'border-transparent text-on-surface-variant hover:border-base-300 hover:text-base-content'}"
      >
        {item.label}
        {#if item.count !== undefined}
          <span class="rounded-[var(--radius-selector)] bg-base-200 px-1.5 py-0.5 text-label-sm tnum"
            >{item.count}</span
          >
        {/if}
      </a>
    {/each}
  </div>
</nav>
