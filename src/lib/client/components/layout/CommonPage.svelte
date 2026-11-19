<script lang="ts">
  import type { Snippet } from "svelte";

  import PageHeader from "./PageHeader.svelte";

  let { title, lead, extra, children } = $props<{
    title?: string;
    lead?: string;
    extra?: Snippet;
    children?: () => Snippet[] | string;
  }>();
</script>

<section class="common-page">
  {#if title}
    <PageHeader {title} {lead} primary={extra} />
  {/if}
</section>

<section class="common-page__body">
  {@render children?.()}
</section>

<style>
  .common-page {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .common-page__body {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
</style>
