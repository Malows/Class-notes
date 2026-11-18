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

<div class="grid grid-rows-[2rem_2.8rem] items-center justify-items-center overflow-hidden text-center">
  <span
    class="w-full overflow-hidden text-ellipsis whitespace-nowrap text-label-sm font-semibold text-on-surface-variant"
    title={getFullTitle(assignment)}
    aria-label={getFullTitle(assignment)}
    data-test-id="overview-header-assignment-title-{assignment.id}"
  >
    {abbreviateTitle(assignment.title)}
  </span>
  <a
    href="/faculties/{facultySlug}/subjects/{subjectSlug}/periods/{periodYear}/{periodSemester}/commissions/{commissionSlug}/correct?assignment_id={assignment.id}"
    class="btn btn-ghost btn-sm btn-circle"
    data-test-id="correct-assignment-btn-{assignment.id}"
    aria-label={`Correct ${assignment.title}`}
  >
    <span class="material-symbols-outlined text-[18px]" aria-hidden="true">edit</span>
  </a>
</div>
