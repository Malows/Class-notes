<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Assignment } from "$lib/common/types/academic";
  import {
    getOverviewDeliveryStatus,
    OverviewDeliveryStatus,
    type Delivery,
  } from "$lib/common/types/student";

  import OverviewCell from "./OverviewCell.svelte";

  interface Props {
    name: string;
    deliveries: Delivery[];
    assignments?: Assignment[];
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
    commissionSlug?: string;
  }

  let {
    name,
    deliveries,
    assignments = [],
    facultySlug,
    subjectSlug,
    periodYear,
    periodSemester,
    commissionSlug,
  }: Props = $props();

  const assignmentTitles = $derived(new Map(assignments.map((item) => [item.id, item.title])));

  const cellContext = (delivery: Delivery) => {
    const title = assignmentTitles.get(delivery.assignment_id);
    return title ? `${name} — ${title}` : name;
  };

  const correctHref = (delivery: Delivery) =>
    commissionSlug
      ? `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodYear}/${periodSemester}/commissions/${commissionSlug}/correct?assignment_id=${delivery.assignment_id}&enrollment_id=${delivery.enrollment_id}&mode=single`
      : undefined;

  const statusKey: Record<OverviewDeliveryStatus, string> = {
    [OverviewDeliveryStatus.APPROVED]: "commissions.status_approved",
    [OverviewDeliveryStatus.REJECTED]: "commissions.status_rejected",
    [OverviewDeliveryStatus.PENDING_CORRECTION]: "commissions.status_pending_correction",
    [OverviewDeliveryStatus.PENDING_DELIVERY]: "commissions.status_pending_delivery",
  };

  const label = (delivery: Delivery) => {
    const base = $t(statusKey[getOverviewDeliveryStatus(delivery)]);
    if (delivery.ai_level === 1) return `${base} · ${$t("commissions.ai_suspicion")}`;
    if (delivery.ai_level === 2) return `${base} · ${$t("commissions.ai_confirmed")}`;
    return base;
  };
</script>

<div class="overview-row" data-test-id="overview-row">
  <div
    class="overview-row__name overflow-hidden text-ellipsis whitespace-nowrap font-semibold"
    title={name}
    data-test-id="overview-row-student-name">{name}</div
  >
  {#each deliveries as delivery}
    <OverviewCell
      href={correctHref(delivery)}
      status={getOverviewDeliveryStatus(delivery)}
      aiLevel={delivery.ai_level}
      label={label(delivery)}
      contextLabel={cellContext(delivery)}
      testId={`delivery-cell-${delivery.enrollment_id}-${delivery.assignment_id}`}
    />
  {/each}
</div>

<style>
  .overview-row {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: subgrid;
    gap: inherit;
    align-items: center;
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-field);
    transition: background-color 0.15s ease;
  }

  .overview-row:nth-child(even) {
    background-color: var(--color-surface-container-low);
  }

  :global([data-theme="classnotes-dark"]) .overview-row:nth-child(even) {
    background-color: transparent;
  }

  .overview-row:hover {
    background-color: var(--color-surface-container);
  }

  :global([data-theme="classnotes-dark"]) .overview-row:hover {
    background-color: var(--color-surface-container);
  }

  .overview-row__name {
    position: sticky;
    left: 0;
    z-index: 1;
    background-color: var(--color-surface);
  }

  .overview-row:nth-child(even) .overview-row__name {
    background-color: var(--color-surface-container-low);
  }

  :global([data-theme="classnotes-dark"]) .overview-row:nth-child(even) .overview-row__name {
    background-color: var(--color-surface);
  }
</style>
