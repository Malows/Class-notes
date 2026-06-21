<script lang="ts">
  import { t } from "$lib/i18n/config";
  import { navStore } from "$lib/stores/nav.svelte";

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
</style>
