<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import { navStore } from "$lib/client/stores/nav.svelte";

  const breadcrumbs = $derived(
    navStore.breadcrumbs.map((crumb) => ({
      ...crumb,
      label: crumb.isRaw ? crumb.key : $t(crumb.key),
    })),
  );
</script>

<nav aria-label={$t("layout.breadcrumb")} data-test-id="breadcrumbs">
  <ol class="m-0 flex list-none items-center gap-1 overflow-hidden whitespace-nowrap p-0">
    {#each breadcrumbs as crumb, i (crumb.href)}
      <li
        class="flex min-w-0 items-center gap-1 text-[min(0.75rem,12px)] text-on-surface-variant"
        data-test-id="breadcrumb-step-{i}"
      >
        {#if i > 0}
          <span class="text-outline-variant" aria-hidden="true">/</span>
        {/if}
        {#if i === breadcrumbs.length - 1}
          <span
            class="overflow-hidden text-ellipsis font-medium text-base-content"
            aria-current="page"
            data-test-id="breadcrumb-text-{i}">{crumb.label}</span
          >
        {:else}
          <a
            href={crumb.href}
            class="overflow-hidden text-ellipsis text-on-surface-variant hover:text-primary hover:underline"
            data-test-id="breadcrumb-link-{i}">{crumb.label}</a
          >
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  @media (max-width: 600px) {
    li:not(:nth-last-child(-n + 2)) {
      display: none;
    }

    li:nth-last-child(2) > span:first-child {
      display: none;
    }
  }
</style>
