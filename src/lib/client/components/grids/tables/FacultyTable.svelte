<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Faculty } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import MobileCard from "$lib/client/components/common/MobileCard.svelte";
  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
  import FacultyRow from "../rows/FacultyRow.svelte";

  interface Props {
    faculties: Faculty[];
    onEdit: (faculty: Faculty) => void;
    onDelete: (faculty: Faculty) => void;
  }

  let { faculties, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={faculties}>
  {#snippet header()}
    <th>{$t("layout.name")}</th>
    <th>{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(faculty)}
    <FacultyRow {faculty} {onEdit} {onDelete} />
  {/snippet}
  {#snippet card(faculty)}
    <MobileCard title={faculty.name} testId="faculty-card-{faculty.id}">
      {#snippet actions()}
        <RowActions label={faculty.name} testId="faculty-card-actions-{faculty.id}">
          {#snippet primary()}
            <Button
              href="/faculties/{faculty.slug}/subjects"
              testId="mobile-view-subjects-btn-{faculty.id}"
              withHover
            >
              {$t("layout.view_subjects")}
            </Button>
          {/snippet}
          {#snippet overflow()}
            <Button onclick={() => onEdit(faculty)} testId="mobile-edit-btn-{faculty.id}" withHover>
              {$t("common.edit")}
            </Button>
          {/snippet}
          {#snippet destructive()}
            <Button
              onclick={() => onDelete(faculty)}
              testId="mobile-delete-btn-{faculty.id}"
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
