<script lang="ts">
  import "papercss/dist/paper.min.css";
  import "../app.css";

  import { locale, t } from "$lib/i18n/config";
  import ClassNoteFooter from "$lib/components/layout/ClassNoteFooter.svelte";
  import NavBar from "$lib/components/layout/navbar/NavBar.svelte";
  import Sidebar from "$lib/components/layout/sidebar/Sidebar.svelte";
  import { initStoreContext } from "$lib/stores/context-initializer";
  import ToastContainer from "$lib/components/common/ToastContainer.svelte";

  let { children } = $props();
  initStoreContext();

  // Dynamic document language synchronization for accessibility (a11y)
  $effect(() => {
    if (typeof document !== "undefined" && $locale) {
      document.documentElement.lang = $locale;
    }
  });
</script>

<svelte:head>
  <title>{$t("layout.brand")} - {$t("layout.dashboard")}</title>
  <meta
    name="description"
    content="Class Notes - A robust and accessible academic management system to organize faculties, subjects, periods, and student grading with a sketchy aesthetic."
  />
  <meta name="robots" content="index, follow" />
</svelte:head>

<div class="paper">
  <div class="container-fluid">
    <NavBar />
    <ToastContainer />

    <div class="layout-body">
      <Sidebar />

      <main class="main-content">
        <div class="page-container">
          {@render children()}
        </div>
      </main>
    </div>

    <ClassNoteFooter />
  </div>
</div>

<style>
  .paper {
    margin: 0;
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  .container-fluid {
    height: 100%;
    padding: 0 1rem;
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .layout-body {
    height: 100%;
    display: flex;
    flex: 1;
    gap: 1rem;
  }

  .main-content {
    height: 100%;
    flex: 1;
    min-width: 0;
    padding-top: 1rem;
  }

  .page-container {
    padding: 1rem 0;
    height: 100%;
  }

  @media (max-width: 768px) {
    .layout-body {
      flex-direction: column;
    }
  }
</style>
