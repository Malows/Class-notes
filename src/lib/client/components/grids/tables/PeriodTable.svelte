<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import type { Period } from "$lib/common/types/academic";

  import Button from "$lib/client/components/common/Button.svelte";
  import MobileCard from "$lib/client/components/common/MobileCard.svelte";
  import ResponsiveTable from "$lib/client/components/common/ResponsiveTable.svelte";
  import RowActions from "$lib/client/components/common/RowActions.svelte";
  import PeriodRow from "../rows/PeriodRow.svelte";

  interface Props {
    periods: Period[];
    onEdit: (period: Period) => void;
    onDelete: (period: Period) => void;
  }

  let { periods, onEdit, onDelete }: Props = $props();
</script>

<ResponsiveTable items={periods}>
  {#snippet header()}
    <th data-test-id="table-header-year">{$t("layout.year")}</th>
    <th data-test-id="table-header-semester">{$t("layout.semester")}</th>
    <th data-test-id="table-header-actions">{$t("layout.actions")}</th>
  {/snippet}
  {#snippet row(period)}
    <PeriodRow {period} {onEdit} {onDelete} />
  {/snippet}
  {#snippet card(period)}
    <MobileCard title={`${period.year} · ${period.semester}º`} testId="period-card-{period.id}">
      {#snippet actions()}
        <RowActions
          label={`${period.year} - ${period.semester}º`}
          testId="period-card-actions-{period.id}"
        >
          {#snippet primary()}
            <Button
              href="/periods/{period.year}/{period.semester}/subjects"
              testId="mobile-view-subjects-btn-{period.id}"
              withHover
            >
              {$t("layout.subjects")}
            </Button>
          {/snippet}
          {#snippet overflow()}
            <Button onclick={() => onEdit(period)} testId="mobile-edit-btn-{period.id}" withHover>
              {$t("common.edit")}
            </Button>
          {/snippet}
          {#snippet destructive()}
            <Button onclick={() => onDelete(period)} testId="mobile-delete-btn-{period.id}" withHover>
              {$t("common.delete")}
            </Button>
          {/snippet}
        </RowActions>
      {/snippet}
    </MobileCard>
  {/snippet}
</ResponsiveTable>
