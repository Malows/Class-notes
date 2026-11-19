<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  interface Props {
    /**
     * The grid the legend describes. Both grids share one component and one
     * vocabulary: a mark sits in a cell-shaped token, next to its word.
     */
    variant: "attendance" | "overview";
    testId?: string;
  }

  let { variant, testId = "grid-legend" }: Props = $props();

  type Tone = "present" | "absent" | "pending" | "empty" | "ai";

  interface LegendItem {
    mark: string;
    label: string;
    tone: Tone;
  }

  const items = $derived.by<LegendItem[]>(() =>
    variant === "attendance"
      ? [
          { mark: "✓", label: $t("help.legend_present"), tone: "present" },
          { mark: "✗", label: $t("help.legend_absent"), tone: "absent" },
          { mark: "–", label: $t("help.legend_not_taken"), tone: "empty" },
        ]
      : [
          { mark: "✓", label: $t("help.legend_approved"), tone: "present" },
          { mark: "✗", label: $t("help.legend_rejected"), tone: "absent" },
          { mark: "…", label: $t("help.legend_pending"), tone: "pending" },
          { mark: "–", label: $t("help.legend_not_delivered"), tone: "empty" },
          // The label already carries the cell mark, so no second badge is drawn.
          { mark: "", label: $t("help.legend_ai_suspicion"), tone: "ai" },
          { mark: "", label: $t("help.legend_ai_certainty"), tone: "ai" },
        ],
  );

  // The 3 / 4 pair only exists on the attendance grid; the grades legend must
  // not borrow its summary.
  const summary = $derived(variant === "attendance" ? $t("help.legend_summary") : null);

  const titleId = $derived(`${testId}-title`);
</script>

<section class="grid-legend" aria-labelledby={titleId} data-test-id={testId}>
  <h2 id={titleId} class="grid-legend__title">{$t("help.legend_title")}</h2>
  <ul class="grid-legend__items">
    {#each items as item (item.label)}
      <li class="grid-legend__item">
        {#if item.mark}
          <span class="grid-legend__mark is-{item.tone}" aria-hidden="true">{item.mark}</span>
        {/if}
        <span class="grid-legend__label">{item.label}</span>
      </li>
    {/each}
  </ul>
  {#if summary}
    <p class="grid-legend__summary">{summary}</p>
  {/if}
</section>

<style>
  .grid-legend {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 0.375rem 0.75rem;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-outline-variant);
  }

  .grid-legend__title {
    margin: 0;
    font-family: var(--font-sans);
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    line-height: 0.875rem;
    text-transform: uppercase;
    color: var(--color-on-surface-variant);
  }

  .grid-legend__items {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.375rem 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .grid-legend__item {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    line-height: 1rem;
    color: var(--color-on-surface-variant);
  }

  .grid-legend__mark {
    display: inline-flex;
    min-width: 1.125rem;
    height: 1.125rem;
    align-items: center;
    justify-content: center;
    padding: 0 0.125rem;
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-field);
    font-size: var(--text-label-sm);
    font-weight: 600;
    line-height: 1;
  }

  .grid-legend__mark.is-present {
    border-color: color-mix(in srgb, var(--color-success) 35%, var(--color-outline));
    background-color: color-mix(
      in srgb,
      var(--color-success) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-success-ink);
  }

  .grid-legend__mark.is-absent {
    border-color: color-mix(in srgb, var(--color-error) 35%, var(--color-outline));
    background-color: color-mix(
      in srgb,
      var(--color-error) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-error-ink);
  }

  .grid-legend__mark.is-pending {
    border-color: color-mix(in srgb, var(--color-warning) 35%, var(--color-outline));
    background-color: color-mix(
      in srgb,
      var(--color-warning) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-warning-ink);
  }

  .grid-legend__mark.is-empty {
    background-color: var(--color-surface-container-low);
    color: var(--color-unmarked-ink);
  }

  .grid-legend__mark.is-ai {
    min-width: 1.5rem;
    border-color: var(--color-outline);
    background-color: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    font-weight: 700;
  }

  .grid-legend__summary {
    margin: 0;
    font-size: 0.75rem;
    line-height: 1rem;
    color: var(--color-muted);
    font-variant-numeric: tabular-nums;
  }
</style>
