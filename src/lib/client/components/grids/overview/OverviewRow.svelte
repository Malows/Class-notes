<script lang="ts">
  import { getOverviewDeliveryStatus, type Delivery } from "$lib/common/types/student";

  import OverviewCell from "./OverviewCell.svelte";

  interface Props {
    name: string;
    deliveries: Delivery[];
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
    commissionSlug: string;
  }

  let { name, deliveries, facultySlug, subjectSlug, periodYear, periodSemester, commissionSlug }: Props =
    $props();
</script>

<div class="overview-row" data-test-id="overview-row">
  <div class="overview-row__name" title={name} data-test-id="overview-row-student-name">{name}</div>
  {#each deliveries as delivery}
    <OverviewCell
      href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions/{commissionSlug}/correct?assignment_id={delivery.assignment_id}&enrollment_id={delivery.enrollment_id}&mode=single"
      status={getOverviewDeliveryStatus(delivery)}
      aiLevel={delivery.ai_level}
      label={getOverviewDeliveryStatus(delivery)}
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
    border-radius: 0.25rem;
    transition: background-color 0.15s ease;
  }

  /* Extremely subtle zebra striping for even rows under the parent container */
  .overview-row:nth-child(even) {
    background-color: #f3f4f6;
  }

  :global(.dark) .overview-row:nth-child(even) {
    background-color: #4c4b49;
  }

  /* Smooth highlight hover row - highly distinguishable from the subtle zebra baseline */
  .overview-row:hover {
    background-color: #e5e8ec !important;
  }

  :global(.dark) .overview-row:hover {
    background-color: #5a5957 !important;
  }

  .overview-row__name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
