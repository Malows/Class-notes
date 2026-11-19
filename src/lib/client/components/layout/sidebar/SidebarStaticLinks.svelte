<script lang="ts">
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";

  import SidebarItem from "./SidebarItem.svelte";

  type Props = {
    isCollapsed: boolean;
  };

  let { isCollapsed }: Props = $props();

  const normalize = (pathname: string) => pathname.replace(/\/+$/, "") || "/";

  const path = $derived(normalize(page.url.pathname));

  // Section links stay highlighted on their subpages, but only the exact route
  // is the current page. A prefix match is `aria-current="true"`, never "page".
  const isActive = (href: string) =>
    href === "/" ? path === "/" : path === href || path.startsWith(`${href}/`);

  const ariaCurrent = (href: string): "page" | "true" | undefined =>
    isActive(href) ? (path === normalize(href) ? "page" : "true") : undefined;
</script>

<div class="flex flex-col gap-1">
  <SidebarItem
    href="/"
    title={$t("layout.dashboard")}
    icon="dashboard"
    {isCollapsed}
    active={isActive("/")}
    ariaCurrent={ariaCurrent("/")}
  />
  <SidebarItem
    href="/faculties"
    title={$t("layout.faculties")}
    icon="account_balance"
    {isCollapsed}
    active={isActive("/faculties")}
    ariaCurrent={ariaCurrent("/faculties")}
  />
  <SidebarItem
    href="/periods"
    title={$t("layout.periods")}
    icon="calendar_month"
    {isCollapsed}
    active={isActive("/periods")}
    ariaCurrent={ariaCurrent("/periods")}
  />
  <SidebarItem
    href="/persons"
    title={$t("layout.students")}
    icon="groups"
    {isCollapsed}
    active={isActive("/persons")}
    ariaCurrent={ariaCurrent("/persons")}
  />
</div>
