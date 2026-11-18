<script lang="ts">
  interface Props {
    title: string;
    href: string;
    isCollapsed: boolean;
    icon: string;
    active?: boolean;
  }

  let { title, href, isCollapsed, icon, active = false }: Props = $props();
</script>

<a
  {href}
  {title}
  aria-current={active ? "page" : undefined}
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
