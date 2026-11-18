<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { onMount } from "svelte";

  import { locale, t } from "$lib/common/i18n/config";

  import { initSentryClient } from "$lib/client/observability/sentry.client.js";
  import { trackPageView } from "$lib/client/observability/analytics.client.js";
  import BottomNav from "$lib/client/components/layout/BottomNav.svelte";
  import ClassNoteFooter from "$lib/client/components/layout/ClassNoteFooter.svelte";
  import NavBar from "$lib/client/components/layout/navbar/NavBar.svelte";
  import Sidebar from "$lib/client/components/layout/sidebar/Sidebar.svelte";
  import { initStoreContext } from "$lib/client/stores/context-initializer";
  import ToastContainer from "$lib/client/components/common/ToastContainer.svelte";
  import { metadataStore } from "$lib/client/stores/metadata.svelte";

  import "../app.css";

  let { data, children } = $props();

  initStoreContext();

  $effect(() => {
    metadataStore.initializeStore((data?.metadata as never) ?? null);
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
    content="Class Notes - A robust and accessible academic management system to organize faculties, subjects, periods, and student grading with an editorial academic aesthetic."
  />
  <meta name="robots" content="index, follow" />
</svelte:head>

<div class="min-h-dvh bg-surface">
  <Sidebar />
  <NavBar />
  <ToastContainer />

  <main class="min-h-dvh pb-24 pt-16 md:pb-8 md:pl-60 md:pt-12" data-test-id="main-content">
    <div class="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-9 md:py-8">
      {@render children()}
      <ClassNoteFooter />
    </div>
  </main>

  <BottomNav />
</div>
