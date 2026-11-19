<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Commission } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import MobileCard from "$lib/client/components/common/MobileCard.svelte";
  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
  import CommissionRow from "../rows/CommissionRow.svelte";

  interface Props {
    commissions: Commission[];
    facultySlug: string;
    subjectSlug: string;
    periodYear: number;
    periodSemester: number;
    onEdit: (commission: Commission) => void;
    onDelete: (commission: Commission) => void;
  }

  let {
    commissions,
    facultySlug,
    subjectSlug,
    periodYear,
    periodSemester,
    onEdit,
    onDelete,
  }: Props = $props();

  const rootPath = (commission: Commission) =>
    `/faculties/${facultySlug}/subjects/${subjectSlug}/periods/${periodYear}/${periodSemester}/commissions/${commission.slug}`;
</script>

<ResponsiveTable items={commissions}>
  {#snippet header()}
    <th>{$t("layout.name")}</th>
    <th>{$t("layout.students")}</th>
    <th>{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(commission)}
    <CommissionRow
      {commission}
      {facultySlug}
      {subjectSlug}
      {periodYear}
      {periodSemester}
      {onEdit}
      {onDelete}
    />
  {/snippet}
  {#snippet card(commission)}
    <MobileCard
      title={commission.name}
      meta={[{ label: $t("layout.students"), value: commission.student_count }]}
      testId="commission-card-{commission.id}"
    >
      {#snippet actions()}
        <RowActions label={commission.name} testId="commission-card-actions-{commission.id}">
          {#snippet primary()}
            <Button
              href="{rootPath(commission)}/students"
              testId="mobile-view-students-btn-{commission.id}"
              withHover
            >
              {$t("layout.students_list")}
            </Button>
          {/snippet}
          {#snippet overflow()}
            <Button
              href="{rootPath(commission)}/overview"
              testId="mobile-view-overview-btn-{commission.id}"
              withHover
            >
              {$t("layout.overview")}
            </Button>
            <Button
              href="{rootPath(commission)}/attendance"
              testId="mobile-view-attendance-btn-{commission.id}"
              withHover
            >
              {$t("attendance.commission_title")}
            </Button>
            <Button
              onclick={() => onEdit(commission)}
              testId="mobile-edit-btn-{commission.id}"
              withHover
            >
              {$t("common.edit")}
            </Button>
          {/snippet}
          {#snippet destructive()}
            <Button
              onclick={() => onDelete(commission)}
              testId="mobile-delete-btn-{commission.id}"
              withHover
            >
              {$t("common.delete")}
            </Button>
          {/snippet}
        </RowActions>
      {/snippet}
    </MobileCard>
  {/snippet}
</ResponsiveTable>
