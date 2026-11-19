<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import type { PeriodOption } from "./dashboard-model";

  interface Props {
    options: PeriodOption[];
    selectedKey: string;
    onSelect: (key: string) => void;
  }

  let { options, selectedKey, onSelect }: Props = $props();

  const selected = $derived(options.find((option) => option.key === selectedKey) ?? null);
  const active = $derived(options.find((option) => option.isActive) ?? null);
  const showActiveNote = $derived(
    active !== null && !active.hasData && selected?.key !== active.key,
  );
  const selectedLabel = $derived(
    selected
      ? $t("dashboard.period_option", {
          year: selected.year,
          semester: selected.semester,
        } as never)
      : "",
  );
  const activeNote = $derived(
    $t("dashboard.period_active_empty", { period: selectedLabel } as never),
  );
</script>

<section
  class="flex flex-col gap-3 border-b border-base-300 pb-4 md:flex-row md:items-end md:justify-between md:gap-6"
  aria-labelledby="period-picker-label"
  data-test-id="period-picker"
>
  <div class="flex min-w-0 flex-col gap-1">
    <label
      id="period-picker-label"
      for="period-select"
      class="text-label-md font-medium text-on-surface-variant"
    >
      {$t("dashboard.period_label")}
    </label>
    <select
      id="period-select"
      class="md:w-72"
      value={selectedKey}
      onchange={(event) => onSelect(event.currentTarget.value)}
      data-test-id="period-select"
    >
      {#each options as option (option.key)}
        <option value={option.key}>
          {$t("dashboard.period_option", {
            year: option.year,
            semester: option.semester,
          } as never)}{option.isActive ? ` · ${$t("dashboard.period_active")}` : ""}
        </option>
      {/each}
    </select>
    {#if showActiveNote}
      <p
        class="m-0 mt-1 max-w-prose text-body-sm text-on-surface-variant"
        data-test-id="period-active-note"
      >
        {activeNote}
      </p>
    {/if}
  </div>

  <div class="flex min-w-0 flex-col gap-1 md:items-end md:text-right">
    {#if selected}
      <p class="m-0 text-body-sm text-on-surface-variant" data-test-id="period-summary">
        {selected.commissionCount === 1
          ? $t("dashboard.commissions_one", { count: selected.commissionCount } as never)
          : $t("dashboard.commissions_other", { count: selected.commissionCount } as never)}
        <span aria-hidden="true"> · </span>
        {selected.studentCount === 1
          ? $t("dashboard.students_one", { count: selected.studentCount } as never)
          : $t("dashboard.students_other", { count: selected.studentCount } as never)}
      </p>
    {/if}
  </div>
</section>
