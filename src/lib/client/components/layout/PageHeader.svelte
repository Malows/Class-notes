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

<header class="flex flex-col gap-3 border-b border-base-300 pb-4">
  <div class="flex flex-wrap items-center justify-between gap-4">
    <h1
      class="m-0 font-serif text-display-lg-mobile tracking-[-0.015em] text-base-content md:text-display-lg"
      data-test-id={testId}
    >
      {title}
    </h1>
    {#if primary}
      <div class="flex items-center gap-2">
        {@render primary()}
      </div>
    {/if}
  </div>

  {#if lead}
    <p class="m-0 text-body-lg text-on-surface-variant">{lead}</p>
  {/if}

  {#if secondary}
    <div class="flex flex-wrap items-center gap-2">
      {@render secondary()}
    </div>
  {/if}
</header>
