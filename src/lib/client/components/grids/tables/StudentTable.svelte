<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { EnrollmentWithPerson } from "$lib/common/types/enrollment";

  import Button from "$lib/client/components/common/Button.svelte";
  import MobileCard from "$lib/client/components/common/MobileCard.svelte";
  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
  import StudentRow from "../rows/StudentRow.svelte";

  interface Props {
    enrollments: EnrollmentWithPerson[];
    onDelete: (enrollment: EnrollmentWithPerson) => void;
  }

  let { enrollments, onDelete }: Props = $props();
</script>

<ResponsiveTable items={enrollments}>
  {#snippet header()}
    <th>{$t("layout.name")}</th>
    <th>{$t("students.external_id_label")}</th>
    <th>{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(enrollment)}
    <StudentRow {enrollment} {onDelete} />
  {/snippet}
  {#snippet card(enrollment)}
    <MobileCard
      title={enrollment.name}
      href="/persons/{enrollment.person_id}"
      titleTestId="student-card-link-{enrollment.id}"
      meta={[{ label: $t("students.external_id_label"), value: enrollment.legajo ?? "—" }]}
      testId="student-card-{enrollment.id}"
    >
      {#snippet actions()}
        <RowActions label={enrollment.name} testId="student-card-actions-{enrollment.id}">
          {#snippet destructive()}
            <Button
              onclick={() => onDelete(enrollment)}
              testId="mobile-delete-btn-{enrollment.id}"
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
