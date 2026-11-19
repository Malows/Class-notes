<script lang="ts">
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";

  const destinations = [
    { key: "dashboard", href: "/", icon: "dashboard", label: "layout.home" },
    { key: "faculties", href: "/faculties", icon: "account_balance", label: "layout.faculties" },
    { key: "periods", href: "/periods", icon: "calendar_month", label: "layout.periods" },
    { key: "students", href: "/persons", icon: "groups", label: "layout.students" },
  ] as const;

  const path = $derived(page.url.pathname);
  const normalize = (value: string) => value.replace(/\/+$/, "") || "/";
  const isSection = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);
  const currentFor = (href: string) =>
    normalize(path) === normalize(href) ? "page" : isSection(href) ? "true" : undefined;
</script>

<nav
  class="fixed inset-x-0 bottom-0 z-40 flex border-t border-base-300 bg-surface md:hidden"
  style="padding-bottom: env(safe-area-inset-bottom, 0px);"
  aria-label={$t("layout.quick_access")}
  data-test-id="bottom-nav"
>
  {#each destinations as destination (destination.key)}
    <a
      href={destination.href}
      aria-current={currentFor(destination.href)}
      class="flex min-h-[64px] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-[min(0.6875rem,11px)] font-medium uppercase tracking-[0.04em] transition-colors {isSection(
        destination.href,
      )
        ? 'text-primary'
        : 'text-on-surface-variant'}"
      data-test-id="bottom-nav-{destination.key}"
    >
      <span class="material-symbols-outlined shrink-0 text-[20px]" aria-hidden="true"
        >{destination.icon}</span
      >
      <span class="w-full min-w-0 truncate text-center leading-none">{$t(destination.label)}</span>
    </a>
  {/each}
</nav>
