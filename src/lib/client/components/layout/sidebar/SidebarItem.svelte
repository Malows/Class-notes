<script lang="ts">
  interface Props {
    title: string;
    href: string;
    isCollapsed: boolean;
    icon: string;
    active?: boolean;
    /** Overrides the current-page inference: "page" for an exact match, "true" for the current section. */
    ariaCurrent?: "page" | "true";
  }

  let { title, href, isCollapsed, icon, active = false, ariaCurrent }: Props = $props();

  const current = $derived(ariaCurrent ?? (active ? "page" : undefined));
</script>

<a
  {href}
  {title}
  aria-current={current}
  class="flex items-center gap-2.5 rounded-[var(--radius-field)] px-2 py-2 text-body-md transition-colors {active
    ? 'bg-primary/10 font-medium text-primary'
    : 'text-on-surface-variant hover:bg-base-200 hover:text-base-content'}"
  data-test-id="sidebar-item-{title.toLowerCase().trim().replace(/\s+/g, '-')}"
>
  <span class="material-symbols-outlined shrink-0 text-[18px]" aria-hidden="true">{icon}</span>
  {#if !isCollapsed}
    <span class="truncate">{title}</span>
  {/if}
</a>
