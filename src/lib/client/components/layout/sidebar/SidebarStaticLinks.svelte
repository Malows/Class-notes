<script lang="ts">
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";

  import SidebarItem from "./SidebarItem.svelte";

  type Props = {
    isCollapsed: boolean;
  };

  let { isCollapsed }: Props = $props();

  const path = $derived(page.url.pathname);
  const isActive = (href: string) => (href === "/" ? path === "/" : path.startsWith(href));
</script>

<div class="flex flex-col gap-1">
  <SidebarItem
    href="/"
    title={$t("layout.dashboard")}
    icon="dashboard"
    {isCollapsed}
    active={isActive("/")}
  />
  <SidebarItem
    href="/faculties"
    title={$t("layout.faculties")}
    icon="account_balance"
    {isCollapsed}
    active={isActive("/faculties")}
  />
  <SidebarItem
    href="/periods"
    title={$t("layout.periods")}
    icon="calendar_month"
    {isCollapsed}
    active={isActive("/periods")}
  />
  <SidebarItem
    href="/persons"
    title={$t("layout.students")}
    icon="groups"
    {isCollapsed}
    active={isActive("/persons")}
  />
</div>
