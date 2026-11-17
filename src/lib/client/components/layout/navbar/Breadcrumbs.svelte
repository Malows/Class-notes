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

<ul class="breadcrumb" data-test-id="breadcrumbs">
  {#each breadcrumbs as crumb, i}
    <li data-test-id="breadcrumb-step-{i}">
      {#if i === breadcrumbs.length - 1}
        <span data-test-id="breadcrumb-text-{i}">{crumb.label}</span>
      {:else}
        <a href={crumb.href} data-test-id="breadcrumb-link-{i}">{crumb.label}</a>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .breadcrumb a {
    color: var(--primary);
  }

  .breadcrumb a:hover {
    text-decoration: none;
  }

  /* Narrow viewports keep the current resource and its parent instead of
     losing the trail entirely. */
  @media (max-width: 600px) {
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0;
      overflow: hidden;
      white-space: nowrap;
      font-size: 0.9rem;
    }

    .breadcrumb li {
      display: none;
      font-size: 0.9rem;
      min-width: 0;
    }

    .breadcrumb li:nth-last-child(-n + 2) {
      display: inline-flex;
      align-items: center;
    }

    .breadcrumb li:nth-last-child(2)::before {
      content: none;
      padding: 0;
    }

    .breadcrumb li:last-child span {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
