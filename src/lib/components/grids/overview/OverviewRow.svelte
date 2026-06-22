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
  <div class="overview-row__cells">
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
</div>

<style>
  .overview-row {
    display: grid;
    grid-template-columns: minmax(8rem, 12rem) minmax(0, 1fr);
    gap: 0.75rem;
    align-items: center;
  }

  .overview-row__name {
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .overview-row__cells {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(2.8rem, 2.8rem));
    gap: 0.5rem;
  }
</style>
