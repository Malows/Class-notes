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
  </div>
  <div class="nav-breadcrumbs">
    <Breadcrumbs />
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
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 0;
  }

  .nav-left {
    display: flex;
    align-items: center;
    gap: 1rem;
    min-width: 0;
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
    .nav-menu-toggle {
      display: inline-flex;
    }

    .nav-actions {
      min-height: 44px;
    }

    /* The papercss collapsible is built for a wide navbar; on narrow screens
       keep the language and theme controls inline instead of overlapping. */
    .nav-actions :global(.collapsible) {
      width: auto;
    }

    .nav-actions :global(.collapsible > label) {
      display: none;
    }

    .nav-actions :global(.collapsible-body) {
      display: flex;
      gap: 0.5rem;
      max-height: none;
      opacity: 1;
      overflow: visible;
      padding: 0;
    }

    /* Keep the trail visible on its own row instead of squeezing it out. */
    .nav-breadcrumbs {
      order: 3;
      flex-basis: 100%;
    }
  }

  @media (max-width: 600px) {
    .nav-brand {
      display: none;
    }
  }

  .nav-brand h3 {
    margin: 0;
    font-size: 1.1rem;
    line-height: 1.2;
    letter-spacing: 0.02em;
  }

  .nav-breadcrumbs {
    display: flex;
    align-items: center;
    min-width: 0;
    overflow: hidden;
    flex: 1 1 auto;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
    flex-shrink: 0;
  }

  .toggle-button {
    height: 100%;
  }
</style>
