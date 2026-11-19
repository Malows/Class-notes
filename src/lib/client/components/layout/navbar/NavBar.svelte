<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Breadcrumbs from "./Breadcrumbs.svelte";
  import ThemeToggle from "./ThemeToggle.svelte";
  import LanguageToggle from "./LanguageToggle.svelte";
</script>

<header
  class="fixed inset-x-0 top-0 z-40 flex h-16 items-center gap-3 border-b border-base-300 bg-surface px-4 md:left-60 md:h-12 md:gap-6 md:px-9"
  data-test-id="navbar"
>
  <a
    href="/"
    class="hidden shrink-0 whitespace-nowrap font-serif text-headline-sm font-medium text-base-content sm:inline md:hidden"
    data-test-id="nav-brand-link">{$t("layout.brand")}</a
  >

  <div class="min-w-0 flex-1">
    <Breadcrumbs />
  </div>

  <div class="flex shrink-0 items-center gap-1">
    <LanguageToggle />
    <ThemeToggle />
  </div>
</header>
