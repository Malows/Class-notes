<script lang="ts">
  import { page } from "$app/stores";
  import { t } from "$lib/i18n/config";

  import SidebarItem from "./SidebarItem.svelte";

  type Props = {
    isCollapsed: boolean;
  };

  let { isCollapsed }: Props = $props();
</script>

<div class="static-links">
  <SidebarItem href="/" title={$t("layout.dashboard")} icon="📊" {isCollapsed} />
  <SidebarItem href="/faculties" title={$t("layout.faculties")} icon="🏫" {isCollapsed} />
</div>

<style>
</style>
