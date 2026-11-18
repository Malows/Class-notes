<script lang="ts">
  import type { Snippet } from "svelte";

  interface Props {
    /** Decorative glyph that hints at the missing resource. */
    icon?: string;
    title: string;
    description?: string;
    testId?: string;
    /** One or two actions that move the user forward. */
    actions?: Snippet;
  }

  let { icon, title, description, testId, actions }: Props = $props();
</script>

<div
  class="mt-6 rounded-[var(--radius-box)] border border-base-300 bg-base-100 px-6 py-8 text-center"
  data-test-id={testId}
>
  <div class="flex flex-col items-center gap-2">
    {#if icon}
      <p class="m-0 text-2xl leading-none" aria-hidden="true">{icon}</p>
    {/if}
    <h4 class="m-0 font-serif text-headline-md">{title}</h4>
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
