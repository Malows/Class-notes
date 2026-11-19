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
    /**
     * Dense two-line layout for phone registries: the first meta value sits on
     * the title line, the rest on a single subdued line. Labels stay available
     * to assistive technology. Other callers keep the labelled block layout.
     */
    compact?: boolean;
  }

  let { title, href, meta = [], testId, titleTestId, actions, compact = false }: Props = $props();
</script>

<article
  class="rounded-[var(--radius-box)] border border-base-300 bg-base-100 {compact ? 'p-3' : 'p-4'}"
  data-test-id={testId}
  data-density={compact ? "compact" : undefined}
>
  {#if compact}
    <div class="flex items-start justify-between gap-2">
      <div class="flex min-w-0 flex-col gap-0.5">
        <div class="flex flex-wrap items-baseline gap-x-2">
          {#if href}
            <a
              class="link-editorial font-serif text-headline-sm"
              {href}
              data-test-id={titleTestId}>{title}</a
            >
          {:else}
            <h2 class="m-0 font-serif text-headline-sm" data-test-id={titleTestId}>{title}</h2>
          {/if}

          {#if meta[0]}
            <span class="tnum text-body-sm text-on-surface-variant">
              <span class="sr-only">{meta[0].label}: </span>{meta[0].value}
            </span>
          {/if}
        </div>

        {#if meta.length > 1}
          <p class="m-0 text-body-sm text-on-surface-variant">
            {#each meta.slice(1) as item, index (item.label)}
              {#if index > 0}<span aria-hidden="true"> · </span>{/if}
              <span><span class="sr-only">{item.label}: </span>{item.value}</span>
            {/each}
          </p>
        {/if}
      </div>

      {#if actions}
        <!-- Inline so the dense card stays two lines; controls keep their
             touch target through RowActions. -->
        <div class="shrink-0">
          {@render actions()}
        </div>
      {/if}
    </div>
  {:else}
    <div class="flex flex-col gap-2">
      {#if href}
        <a
          class="link-editorial font-serif text-headline-sm"
          {href}
          data-test-id={titleTestId}>{title}</a
        >
      {:else}
        <h2 class="m-0 font-serif text-headline-sm" data-test-id={titleTestId}>{title}</h2>
      {/if}

      {#if meta.length > 0}
        <dl
          class="m-0 grid gap-x-4 gap-y-2"
          class:grid-cols-2={meta.length >= 2}
          class:grid-cols-1={meta.length < 2}
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
  {/if}

  {#if actions && !compact}
    <div class="mt-3 flex justify-end border-t border-base-300 pt-3">
      {@render actions()}
    </div>
  {/if}
</article>
