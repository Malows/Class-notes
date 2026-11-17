<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    title: string;
    lead?: string;
    testId?: string;
    /** The screen's primary action, aligned with the title. */
    primary?: Snippet;
    /** A supporting row under the title (for example "« Volver"). */
    secondary?: Snippet;
  }

  let { title, lead, testId, primary, secondary }: Props = $props();
</script>

<header class="page-header">
  <div class="page-header__main">
    <h1 class="page-header__title" data-test-id={testId}>{title}</h1>
    {#if primary}
      <div class="page-header__primary">
        {@render primary()}
      </div>
    {/if}
  </div>

  {#if lead}
    <p class="page-header__lead">{lead}</p>
  {/if}

  {#if secondary}
    <div class="page-header__secondary">
      {@render secondary()}
    </div>
  {/if}
</header>

<style>
  .page-header {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .page-header__main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .page-header__title {
    margin: 0;
    font-size: 1.75rem;
    line-height: 1.2;
  }

  .page-header__primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .page-header__lead {
    margin: 0;
    color: var(--muted-color);
  }

  .page-header__secondary {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
  }
</style>
