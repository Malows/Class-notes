<script lang="ts">
  import type { Assignment } from "$lib/types/academic";

  interface Props {
    assignments: Assignment[];
    facultyId: number;
    subjectId: number;
    periodId: number;
    commissionId: number;
  }

  let { assignments, facultyId, subjectId, periodId, commissionId }: Props = $props();
</script>

<div class="overview-header" data-test-id="overview-header">
  <div class="overview-header__students">
    <div class="overview-header__students-title">Students</div>
    <div class="overview-header__students-empty"></div>
  </div>

  <div class="overview-header__assignments">
    {#each assignments as assignment}
      <div class="overview-header__assignment">
        <span class="overview-header__assignment-title" title={assignment.title}>
          {assignment.title}
        </span>
        <a
          href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions/{commissionId}/correct?assignment_id={assignment.id}"
          class="paper-btn btn-small overview-header__correct-btn"
          data-test-id={`correct-assignment-btn-${assignment.id}`}
          aria-label={`Correct ${assignment.title}`}
        >
          ✏️
        </a>
      </div>
    {/each}
  </div>
</div>

<style>
  .overview-header {
    display: grid;
    grid-template-columns: minmax(8rem, 12rem) minmax(0, 1fr);
    gap: 0.75rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid #ddd;
    width: 100%;
  }

  .overview-header__students {
    display: grid;
    grid-template-rows: 2rem 2rem;
    align-items: center;
  }

  .overview-header__students-title {
    font-weight: 700;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .overview-header__students-empty {
    height: 100%;
  }

  .overview-header__assignments {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(2.8rem, 2.8rem));
    gap: 0.5rem;
  }

  .overview-header__assignment {
    display: grid;
    grid-template-rows: 2rem 2rem;
    align-items: center;
    justify-items: center;
    text-align: center;
    width: 100%;
  }

  .overview-header__assignment-title {
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .overview-header__correct-btn {
    padding: 0.1rem 0.3rem !important;
    font-size: 0.8rem !important;
    margin: 0 !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.8rem;
    height: 1.8rem;
    cursor: pointer;
  }
</style>
