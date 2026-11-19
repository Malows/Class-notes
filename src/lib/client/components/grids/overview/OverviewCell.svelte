<script lang="ts">
  import { OverviewDeliveryStatus } from "$lib/common/types/student";

  interface Props {
    href?: string;
    status: OverviewDeliveryStatus;
    aiLevel?: number;
    label?: string;
    contextLabel?: string;
    testId?: string;
  }

  let { href, status, aiLevel = 0, label = "", contextLabel, testId = "" }: Props = $props();

  const statusIcon = {
    [OverviewDeliveryStatus.APPROVED]: "✓",
    [OverviewDeliveryStatus.REJECTED]: "✗",
    [OverviewDeliveryStatus.PENDING_CORRECTION]: "…",
    [OverviewDeliveryStatus.PENDING_DELIVERY]: "–",
  } as const;

  // The status glyph stays the primary mark; the AI level is a corner chip
  // so a graded cell never loses its approved/rejected reading, and the
  // marker stays legible in both themes.
  const aiMark = $derived(aiLevel > 0 ? (aiLevel >= 2 ? "IA!!" : "IA!") : "");

  const accessibleLabel = $derived(
    contextLabel
      ? `${label || statusIcon[status]} · ${contextLabel}`
      : label || statusIcon[status],
  );
</script>

{#snippet cellContent()}
  <span class="overview-cell__status">{statusIcon[status]}</span>
  {#if aiMark}
    <span class="overview-cell__ai" aria-hidden="true">{aiMark}</span>
  {/if}
{/snippet}

{#if href}
  <a
    class="overview-cell"
    class:is-approved={status === OverviewDeliveryStatus.APPROVED}
    class:is-rejected={status === OverviewDeliveryStatus.REJECTED}
    class:is-pending={status === OverviewDeliveryStatus.PENDING_CORRECTION}
    class:is-empty={status === OverviewDeliveryStatus.PENDING_DELIVERY}
    {href}
    data-test-id={testId}
    data-status={status}
    aria-label={accessibleLabel}
  >
    {@render cellContent()}
  </a>
{:else}
  <span
    class="overview-cell"
    class:is-approved={status === OverviewDeliveryStatus.APPROVED}
    class:is-rejected={status === OverviewDeliveryStatus.REJECTED}
    class:is-pending={status === OverviewDeliveryStatus.PENDING_CORRECTION}
    class:is-empty={status === OverviewDeliveryStatus.PENDING_DELIVERY}
    data-test-id={testId}
    data-status={status}
    aria-label={accessibleLabel}
  >
    {@render cellContent()}
  </span>
{/if}

<style>
  .overview-cell {
    position: relative;
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    min-width: 2.5rem;
    /* Interactive cell: the boundary is a control edge, not a table rule. */
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-field);
    background-color: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .overview-cell__status {
    line-height: 1;
  }

  /*
   * Secondary AI marker: a legible 11px stamp in the bottom-right corner,
   * clear of the centred status glyph even in a 40px cell. The solid sheet
   * keeps it readable on every status tint, in both themes.
   */
  .overview-cell__ai {
    position: absolute;
    right: 1px;
    bottom: 1px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 13px;
    min-width: 13px;
    padding: 0 2px;
    border: 1px solid var(--color-outline);
    border-radius: var(--radius-field);
    background-color: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    font-family: var(--font-sans);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.01em;
    line-height: 1;
  }

  .overview-cell:hover {
    background-color: var(--color-surface-container-low);
  }

  .overview-cell.is-approved {
    border-color: color-mix(in srgb, var(--color-success) 35%, var(--color-outline));
    background-color: color-mix(
      in srgb,
      var(--color-success) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-success-ink);
  }

  .overview-cell.is-rejected {
    border-color: color-mix(in srgb, var(--color-error) 35%, var(--color-outline));
    background-color: color-mix(
      in srgb,
      var(--color-error) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-error-ink);
  }

  .overview-cell.is-pending {
    border-color: color-mix(in srgb, var(--color-warning) 35%, var(--color-outline));
    background-color: color-mix(
      in srgb,
      var(--color-warning) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-warning-ink);
  }

  .overview-cell.is-empty {
    color: var(--color-unmarked-ink);
  }

  @media (pointer: coarse) {
    .overview-cell {
      min-height: 3rem;
      min-width: 3rem;
    }
  }
</style>
