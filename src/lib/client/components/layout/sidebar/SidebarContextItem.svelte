<script lang="ts">
  type Props = {
    href: string;
    label: string;
    shortLabel: string;
    isCollapsed: boolean;
    isActive?: boolean;
  };

  let { href, label, shortLabel, isCollapsed, isActive = false }: Props = $props();
</script>

<li class={isCollapsed ? "text-center" : ""}>
  <a
    {href}
    title={label}
    aria-current={isActive ? "page" : undefined}
    class="block truncate rounded-[var(--radius-field)] px-2 py-1.5 text-body-sm transition-colors {isActive
      ? 'bg-primary/10 font-medium text-primary'
      : 'text-on-surface-variant hover:bg-base-200 hover:text-base-content'}"
  >
    {isCollapsed ? shortLabel : label}
  </a>
</li>
