<script lang="ts">
  import { page } from "$app/state";

  type Props = {
    href: string;
    label: string;
    shortLabel: string;
    isCollapsed: boolean;
    isActive?: boolean;
  };

  let { href, label, shortLabel, isCollapsed, isActive = false }: Props = $props();

  const isSameDocument = (pathname: string) =>
    pathname.replace(/\/+$/, "") === href.replace(/\/+$/, "");

  // Contextual shortcuts mark the current item in the set, but their href often
  // points at an overview or index rather than the page on screen. Only claim
  // `aria-current="page"` when the location actually matches.
  const ariaCurrent = $derived(
    isActive ? (isSameDocument(page.url.pathname) ? "page" : "true") : undefined,
  );
</script>

<li class={isCollapsed ? "text-center" : ""}>
  <a
    {href}
    title={label}
    aria-current={ariaCurrent}
    class="block truncate rounded-[var(--radius-field)] px-2 py-1.5 text-body-sm transition-colors {isActive
      ? 'bg-primary/10 font-medium text-primary'
      : 'text-on-surface-variant hover:bg-base-200 hover:text-base-content'}"
  >
    {isCollapsed ? shortLabel : label}
  </a>
</li>
