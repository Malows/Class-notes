<script lang="ts">
  import { OverviewDeliveryStatus } from "$lib/common/types/student";

  interface Props {
    href?: string;
    status: OverviewDeliveryStatus;
    aiLevel?: number;
    label?: string;
    testId?: string;
  }

  let { href, status, aiLevel = 0, label = "", testId = "" }: Props = $props();

  const aiEmoji = {
    1: "⚠️",
    2: "🤖",
  } as const;

  const statusIcon = {
    [OverviewDeliveryStatus.APPROVED]: "✅",
    [OverviewDeliveryStatus.REJECTED]: "❌",
    [OverviewDeliveryStatus.PENDING_CORRECTION]: "⏳",
    [OverviewDeliveryStatus.PENDING_DELIVERY]: "-",
  } as const;

  const cellContent = $derived(() => {
    if (aiLevel > 0) {
      return aiEmoji[aiLevel as keyof typeof aiEmoji] ?? "";
    }
    return statusIcon[status];
  });
</script>

{#if href}
  <a
    class="overview-cell"
    class:is-approved={status === OverviewDeliveryStatus.APPROVED}
    class:is-rejected={status === OverviewDeliveryStatus.REJECTED}
    class:is-pending={status === OverviewDeliveryStatus.PENDING_CORRECTION}
    class:is-empty={status === OverviewDeliveryStatus.PENDING_DELIVERY}
    class:has-ai={aiLevel > 0}
    {href}
    data-test-id={testId}
    data-status={status}
    aria-label={label || statusIcon[status]}
  >
    {cellContent()}
  </a>
{:else}
  <span
    class="overview-cell"
    class:is-approved={status === OverviewDeliveryStatus.APPROVED}
    class:is-rejected={status === OverviewDeliveryStatus.REJECTED}
    class:is-pending={status === OverviewDeliveryStatus.PENDING_CORRECTION}
    class:is-empty={status === OverviewDeliveryStatus.PENDING_DELIVERY}
    class:has-ai={aiLevel > 0}
    data-test-id={testId}
    data-status={status}
    aria-label={label || statusIcon[status]}
  >
    {cellContent()}
  </span>
{/if}

<style>
  .overview-cell {
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.5rem;
    min-width: 2.5rem;
    border: 1px solid var(--color-outline-variant);
    border-radius: var(--radius-field);
    background-color: var(--color-surface-container-lowest);
    color: var(--color-on-surface);
    font-weight: 600;
    line-height: 1;
    text-decoration: none;
    transition: background-color 0.15s ease;
  }

  .overview-cell:hover {
    background-color: var(--color-surface-container-low);
  }

  .overview-cell.is-approved {
    border-color: color-mix(in srgb, var(--color-success) 35%, var(--color-outline-variant));
    background-color: color-mix(
      in srgb,
      var(--color-success) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-success);
  }

  .overview-cell.is-rejected {
    border-color: color-mix(in srgb, var(--color-error) 35%, var(--color-outline-variant));
    background-color: color-mix(
      in srgb,
      var(--color-error) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-error);
  }

  .overview-cell.is-pending {
    border-color: color-mix(in srgb, var(--color-warning) 35%, var(--color-outline-variant));
    background-color: color-mix(
      in srgb,
      var(--color-warning) 12%,
      var(--color-surface-container-lowest)
    );
    color: var(--color-warning);
  }

  .overview-cell.is-empty {
    color: var(--color-muted);
  }

  .overview-cell.has-ai {
    border-color: var(--color-warning);
  }

  @media (pointer: coarse) {
    .overview-cell {
      min-height: 3rem;
      min-width: 3rem;
    }
  }
</style>
