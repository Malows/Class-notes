<script lang="ts">
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
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

  const isDashboard = $derived(page.url.pathname === "/");

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
    content="Gestión Docente: sistema de gestión académica para organizar facultades, materias, períodos y calificaciones de estudiantes con una estética académica editorial."
  />
  <meta name="robots" content="index, follow" />
</svelte:head>

<div class="min-h-dvh bg-surface">
  <a
    href="#main"
    class="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-[var(--radius-field)] focus:bg-base-100 focus:px-4 focus:py-2 focus:text-body-md focus:text-base-content focus:outline focus:outline-2 focus:outline-primary"
  >
    {$t("layout.skip_to_content")}
  </a>
  <Sidebar />
  <NavBar />
  <ToastContainer />

  <main
    id="main"
    tabindex="-1"
    class="min-h-dvh pt-16 md:pl-60 md:pt-12 {isDashboard ? 'pb-44 md:pb-24' : 'pb-24 md:pb-8'}"
    data-test-id="main-content"
  >
    <div class="mx-auto w-full max-w-[1600px] px-4 py-6 md:px-9 md:py-8">
      {@render children()}
    </div>
  </main>

  {#if isDashboard}
    <div
      class="fixed inset-x-0 bottom-20 z-30 border-t border-base-300 bg-surface px-4 py-2 md:bottom-0 md:left-60 md:px-9"
    >
      <ClassNoteFooter />
    </div>
  {/if}

  <BottomNav />
</div>
