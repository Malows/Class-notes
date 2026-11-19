<script lang="ts">
  import type { Assignment } from "$lib/common/types/academic";

  import { abbreviateTitle } from "$lib/client/utils/abbreviate-title";

  interface Props {
    assignment: Assignment;
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
    commissionSlug: string;
  }

  let {
    assignment,
    facultySlug,
    subjectSlug,
    periodYear,
    periodSemester,
    commissionSlug,
  }: Props = $props();

  // Format combined title and subtitle for standard HTML hover tooltip
  function getFullTitle(assignment: Assignment): string {
    return assignment.subtitle ? `${assignment.title} — ${assignment.subtitle}` : assignment.title;
  }
</script>

<div class="overview-header-cell">
  <span
    class="overview-header-cell__title"
    title={getFullTitle(assignment)}
    aria-label={getFullTitle(assignment)}
    data-test-id="overview-header-assignment-title-{assignment.id}"
  >
    {abbreviateTitle(assignment.title)}
  </span>
  <a
    href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions/{commissionSlug}/correct?assignment_id={assignment.id}"
    class="paper-btn overview-header-cell__correct-btn"
    data-test-id="correct-assignment-btn-{assignment.id}"
    aria-label={`Correct ${assignment.title}`}
  >
    ✏️
  </a>
</div>

<style>
  .overview-header-cell {
    display: grid;
    grid-template-rows: 2rem 2.8rem;
    align-items: center;
    justify-items: center;
    text-align: center;
    width: 100%;
    min-height: 4.8rem;
    overflow: hidden;
  }

  .overview-header-cell__title {
    font-size: 0.8rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    width: 100%;
  }

  .overview-header-cell__correct-btn {
    aspect-ratio: 1 / 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 2.8rem;
    min-width: 2.8rem;
    max-height: 2.8rem;
    max-width: 2.8rem;
    padding: 0 !important;
    margin: 0 !important;
    cursor: pointer;
    background-image: none;
    transition: transform 0.15s ease;
    line-height: 1;
  }

  .overview-header-cell__correct-btn:hover {
    transform: scale(1.05);
  }

  @media (pointer: coarse) {
    .overview-header-cell__correct-btn {
      min-height: 3rem;
      min-width: 3rem;
      max-height: 3rem;
      max-width: 3rem;
    }
  }
</style>
