<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    /**
     * @deprecated Legacy decorative hint left by callers. The primitive now
     * draws the quiet "not taken" mark itself, so the emoji is not rendered.
     */
    icon?: string;
    title: string;
    description?: string;
    testId?: string;
    /** One or two actions that move the user forward. */
    actions?: Snippet;
  }

  let { title, description, testId, actions }: Props = $props();
</script>

<div
  class="mt-6 rounded-[var(--radius-box)] border border-base-300 bg-base-100 px-6 py-8 text-center"
  data-test-id={testId}
>
  <div class="flex flex-col items-center gap-2">
    <!--
      The empty state borrows the grid's quiet third state: a sunken cell with
      a muted en dash. It says "nothing recorded yet" without an emoji or an
      icon in a system that has neither.
    -->
    <span class="empty-state__mark" aria-hidden="true" data-test-id="empty-state-mark"></span>
    <h2 class="m-0 font-serif text-headline-md">{title}</h2>
    {#if description}
      <p class="m-0 text-body-md text-on-surface-variant">{description}</p>
    {/if}
    {#if actions}
      <div class="mt-2 flex flex-wrap justify-center gap-2">
        {@render actions()}
      </div>
    {/if}
  </div>
</div>

<style>
  .empty-state__mark {
    position: relative;
    display: inline-block;
    width: 2.5rem;
    height: 2.5rem;
    margin-bottom: 0.25rem;
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-field);
    background-color: var(--color-surface-container-low);
  }

  .empty-state__mark::before {
    content: "–";
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    color: var(--color-unmarked-ink);
    font-family: var(--font-sans);
    font-size: var(--text-headline-sm);
    line-height: 1;
  }
</style>
