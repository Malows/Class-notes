<script lang="ts">
  import type { Assignment } from "$lib/types/academic";

  interface Props {
    assignment: Assignment;
    facultyId: number;
    subjectId: number;
    periodId: number;
    commissionId: number;
  }

  let { assignment, facultyId, subjectId, periodId, commissionId }: Props = $props();

  // Rules:
  // - Split title by words.
  // - If a word is a number, it stays complete.
  // - Otherwise, take its first letter capitalised.
  // - Concatenate everything.
  function abbreviateTitle(title: string): string {
    if (!title) return "";
    return title
      .split(/\s+/)
      .filter((word) => word.length > 0)
      .map((word) => {
        const isNum = /^\d+$/.test(word);
        if (isNum) {
          return word;
        }
        return word.charAt(0).toUpperCase();
      })
      .join("");
  }

  // Format combined title and subtitle for standard HTML hover tooltip
  function getFullTitle(assignment: Assignment): string {
    return assignment.subtitle ? `${assignment.title} — ${assignment.subtitle}` : assignment.title;
  }
</script>

<div class="overview-header-cell">
  <span
    class="overview-header-cell__title"
    title={getFullTitle(assignment)}
    data-test-id="overview-header-assignment-title-{assignment.id}"
  >
    {abbreviateTitle(assignment.title)}
  </span>
  <a
    href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions/{commissionId}/correct?assignment_id={assignment.id}"
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
</style>
