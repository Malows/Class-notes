<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Breadcrumbs from "./Breadcrumbs.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import LanguageToggle from "./LanguageToggle.svelte";
</script>

<nav class="navbar header-nav" data-test-id="navbar">
  <div class="nav-left">
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
