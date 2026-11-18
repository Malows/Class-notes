<script lang="ts" generics="T">
  import type { Snippet } from "svelte";

  import { t } from "$lib/common/i18n/config";

  import Card from "./Card.svelte";

  interface Props {
    items: T[];
    header: Snippet;
    row: Snippet<[T]>;
  }

  let { items, header, row }: Props = $props();
</script>

<!-- Desktop Table -->
<table class="editorial-table hidden w-full md:table">
  <thead>
    <tr>
      {@render header()}
    </tr>
  </thead>
  <tbody>
    {#each items as item}
      <tr>
        {@render row(item)}
      </tr>
    {/each}
    {#if items.length === 0}
      <tr>
        <td colspan={100}>{$t("common.no_data")}</td>
      </tr>
    {/if}
  </tbody>
</table>

<!-- Mobile Cards -->
<div class="md:hidden">
  {#each items as item}
    <Card class="mt-4">
      <table class="mobile-row-table w-full">
        <tbody>
          <tr>
            {@render row(item)}
          </tr>
        </tbody>
      </table>
    </Card>
  {/each}
  {#if items.length === 0}
    <Card class="mt-4">
      <p class="text-body-sm text-base-content/70">{$t("common.no_data")}</p>
    </Card>
  {/if}
</div>

<style>
  :global(.editorial-table thead th) {
    height: 2rem;
    padding: 0 0.75rem;
    border-bottom: 1px solid var(--color-outline-variant);
    background-color: var(--color-surface-container);
    color: var(--color-on-surface-variant);
    font-size: 0.6875rem;
    line-height: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-align: left;
    text-transform: uppercase;
    white-space: nowrap;
  }

  :global(.editorial-table tbody td) {
    height: 2.5rem;
    padding: 0 0.75rem;
    border-bottom: 1px solid var(--color-outline-variant);
    vertical-align: middle;
  }

  :global(.editorial-table tbody tr:hover) {
    background-color: var(--color-surface-container-low);
  }

  :global(.editorial-table tbody tr:last-child td) {
    border-bottom: 0;
  }

  :global(.mobile-row-table td) {
    display: block;
    padding: 0.25rem 0;
    border: 0;
  }

  :global(.mobile-row-table td:first-child) {
    padding-top: 0;
    font-weight: 500;
  }

  :global(.mobile-row-table td:last-child) {
    padding-bottom: 0;
  }
</style>
