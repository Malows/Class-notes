<script lang="ts">
  import { t } from "$lib/i18n/config";
  import type { OverviewData } from "$lib/types";

  interface Props {
    data: OverviewData;
    facultyId: number;
    subjectId: number;
    periodId: number;
    commissionID: number;
  }
  let { data, facultyId, subjectId, periodId, commissionID }: Props = $props();
</script>

<table class="table-hover" data-test-id="overview-table">
  <thead>
    <tr>
      <th data-test-id="overview-header-student">{$t("layout.students")}</th>
      {#each data.assignments as a}
        <th class="text-center">
          <small>{a.title}</small><br />
          <a
            href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions/{commissionID}/correct?assignment_id={a.id}"
            class="paper-btn btn-small"
            data-test-id="correct-assignment-btn-{a.id}">{$t("layout.correct")}</a
          >
        </th>
      {/each}
    </tr>
  </thead>
  <tbody>
    {#each data.grid as student}
      <tr data-test-id="student-row-{student.id}">
        <td data-test-id="student-name-{student.id}">{student.name}</td>
        {#each student.deliveries as d}
          <td class="text-center" style="padding: 0;">
            <a
              href="/faculties/{facultyId}/subjects/{subjectId}/periods/{periodId}/commissions/{commissionID}/correct?assignment_id={d.assignment_id}&student_id={student.id}&mode=single"
              class="paper-btn btn-small btn-block {!d.is_delivered
                ? 'btn-secondary'
                : d.is_approved
                  ? 'btn-success'
                  : 'btn-danger'}"
              style="margin: 0; border: none; border-radius: 0;"
              data-test-id="delivery-cell-{student.id}-{d.assignment_id}"
            >
              {d.is_delivered ? (d.is_approved ? "V" : "R") : "-"}
              {#if d.ai_level === 1}⚠️{/if}
              {#if d.ai_level === 2}🤖{/if}
            </a>
          </td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>
