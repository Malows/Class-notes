<script lang="ts">
  import OverviewCell from "$lib/components/grids/overview/OverviewCell.svelte";
  import { getOverviewDeliveryStatus, type Delivery } from "$lib/types";

  interface Props {
    name: string;
    deliveries: Delivery[];
    facultyId: number;
    subjectId: number;
    periodId: number;
    commissionId: number;
  }

  let { name, deliveries, facultyId, subjectId, periodId, commissionId }: Props = $props();
</script>

<div class="overview-row" data-test-id="overview-row">
  <div class="overview-row__name" title={name} data-test-id="overview-row-student-name">{name}</div>
  {#each deliveries as delivery}
    <OverviewCell
      href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions/{commissionId}/correct?assignment_id={delivery.assignment_id}&student_id={delivery.student_id}&mode=single"
      status={getOverviewDeliveryStatus(delivery)}
      aiLevel={delivery.ai_level}
      label={getOverviewDeliveryStatus(delivery)}
      testId={`delivery-cell-${delivery.student_id}-${delivery.assignment_id}`}
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
    padding: 0.35rem 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s ease;
  }

  /* Zebra striping for even rows under the parent container */
  .overview-row:nth-child(even) {
    background-color: #f8f9fa;
  }

  :global(.dark) .overview-row:nth-child(even) {
    background-color: #1e1e24;
  }

  /* Smooth highlight hover row */
  .overview-row:hover {
    background-color: #e9ecef !important;
  }

  :global(.dark) .overview-row:hover {
    background-color: #2a2b36 !important;
  }

  .overview-row__name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
</style>
