<script lang="ts">
  import { OverviewDeliveryStatus } from "$lib/types";

  interface Props {
    href: string;
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

<a
  class="paper-btn overview-cell"
  class:btn-success={status === OverviewDeliveryStatus.APPROVED}
  class:btn-danger={status === OverviewDeliveryStatus.REJECTED}
  class:btn-secondary={status === OverviewDeliveryStatus.PENDING_CORRECTION}
  {href}
  data-test-id={testId}
  aria-label={label || statusIcon[status]}
>
  {cellContent()}
</a>

<style>
  .overview-cell {
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.8rem;
    min-width: 2.8rem;
    text-decoration: none;
    font-weight: 700;
    background-image: none;
    transition: transform 0.15s ease;
    line-height: 1;
  }

  .overview-cell:hover {
    transform: scale(1.05);
  }
</style>
