<script lang="ts">
  import type { Snippet } from "svelte";

    let { title, lead, children } = $props<{
        title?: string;
        lead?: string;
        children?: () => Snippet[] | string;
    }>();
</script>

<section class="common-page">
    {#if title}
        <header class="common-page__header">
            <h1 class="common-page__title">{title}</h1>
        </header>
        {#if lead}
        <p class="common-page__lead">{lead}</p>
        {/if}
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

    .common-page__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    }

    .common-page__title {
        margin: 0;
        font-size: 1.75rem;
        line-height: 1.2;
    }

    .common-page__body {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
</style>
