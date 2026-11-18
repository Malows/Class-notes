<script lang="ts">
  import type { Snippet } from "svelte";

  interface MetaItem {
    label: string;
    value: string | number;
  }

  interface Props {
    title: string;
    href?: string;
    meta?: MetaItem[];
    testId?: string;
    titleTestId?: string;
    actions?: Snippet;
  }

  let { title, href, meta = [], testId, titleTestId, actions }: Props = $props();
</script>

<article
  class="rounded-[var(--radius-box)] border border-base-300 bg-base-100 p-4"
  data-test-id={testId}
>
  <div class="flex flex-col gap-2">
    {#if href}
      <a
        class="link-editorial font-serif text-headline-sm"
        {href}
        data-test-id={titleTestId}>{title}</a
      >
    {:else}
      <h3 class="m-0 font-serif text-headline-sm" data-test-id={titleTestId}>{title}</h3>
    {/if}

    {#if meta.length > 0}
      <dl
        class="m-0 grid gap-x-4 gap-y-2 {meta.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'}"
      >
        {#each meta as item (item.label)}
          <div>
            <dt
              class="m-0 text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-on-surface-variant"
            >
              {item.label}
            </dt>
            <dd class="m-0 text-body-md text-base-content">{item.value}</dd>
          </div>
        {/each}
      </dl>
    {/if}
  </div>

  {#if actions}
    <div class="mt-3 flex justify-end border-t border-base-300 pt-3">
      {@render actions()}
    </div>
  {/if}
</article>
