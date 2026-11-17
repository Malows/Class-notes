<script lang="ts">
  import { getContext } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";

  import type { SidebarUiStore } from "$lib/client/stores/sidebar-ui.svelte";

  import Breadcrumbs from "./Breadcrumbs.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import LanguageToggle from "./LanguageToggle.svelte";

  const sidebarUi = getContext<SidebarUiStore>(StoreKey.SIDEBAR_UI);
</script>

<nav class="navbar header-nav" data-test-id="navbar">
  <div class="nav-left">
    <button
      type="button"
      class="paper-btn nav-menu-toggle"
      onclick={() => sidebarUi.toggle()}
      aria-label={sidebarUi.isOpen ? $t("layout.menu_close") : $t("layout.menu_open")}
      aria-expanded={sidebarUi.isOpen}
      data-test-id="nav-menu-toggle"
    >
      {sidebarUi.isOpen ? "✕" : "☰"}
    </button>
    <div class="nav-brand">
      <h3>
        <a href="/" data-test-id="nav-brand-link">{$t("layout.brand")}</a>
      </h3>
    </div>
    <div class="nav-breadcrumbs">
      <Breadcrumbs />
    </div>
  </div>
  <div class="nav-actions">
    <div class="collapsible toggle-button">
      <input id="collapsible1" type="checkbox" name="collapsible1" data-test-id="nav-collapsible" />
      <label for="collapsible1">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
      </label>
      <div class="collapsible-body">
        <LanguageToggle />
        <ThemeToggle />
      </div>
    </div>
  </div>
</nav>

<style>
  .header-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0;
  }

  .nav-left {
    display: flex;
    align-items: center;
    gap: 2rem;
  }

  .nav-menu-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    min-width: 44px;
    padding: 0 0.5rem;
    line-height: 1;
  }

  @media (max-width: 768px) {
    .nav-left {
      gap: 1rem;
    }

    .nav-menu-toggle {
      display: inline-flex;
    }
  }

  .nav-brand h3 {
    margin: 0;
  }

  .nav-breadcrumbs {
    display: flex;
    align-items: center;
  }

  @media (max-width: 600px) {
    .nav-breadcrumbs {
      display: none;
    }
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .toggle-button {
    height: 100%;
  }
</style>
