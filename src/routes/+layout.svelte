<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { onMount } from "svelte";

  import { locale, t } from "$lib/common/i18n/config";

  import { initSentryClient } from "$lib/client/observability/sentry.client.js";
  import { trackPageView } from "$lib/client/observability/analytics.client.js";
  import ClassNoteFooter from "$lib/client/components/layout/ClassNoteFooter.svelte";
  import NavBar from "$lib/client/components/layout/navbar/NavBar.svelte";
  import Sidebar from "$lib/client/components/layout/sidebar/Sidebar.svelte";
  import { initStoreContext } from "$lib/client/stores/context-initializer";
  import ToastContainer from "$lib/client/components/common/ToastContainer.svelte";
  import { metadataStore } from "$lib/client/stores/metadata.svelte";

  import "papercss/dist/paper.min.css";
  import "../app.css";

  let { data, children } = $props();

  initStoreContext();

  $effect(() => {
    metadataStore.initializeStore(data?.metadata ?? null);
  });

  // Dynamic document language synchronization for accessibility (a11y)
  $effect(() => {
    if (typeof document !== "undefined" && $locale) {
      document.documentElement.lang = $locale;
    }
  });

  onMount(() => {
    initSentryClient();
    void trackPageView(window.location.href, document.referrer || undefined);
  });

  afterNavigate(({ to, from }) => {
    if (!to || to.url.href === from?.url.href) {
      return;
    }

    void trackPageView(to.url.href, from?.url.href);
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
