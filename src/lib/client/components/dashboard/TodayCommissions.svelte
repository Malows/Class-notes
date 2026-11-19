<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";
  import type { CommissionRow } from "./dashboard-model";

  interface Props {
    commissions: CommissionRow[];
    periodLabel: string;
    loading?: boolean;
  }

  let { commissions, periodLabel, loading = false }: Props = $props();
</script>

<section class="min-w-0" aria-labelledby="today-title" data-test-id="today-commissions">
  <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
    <h2 id="today-title" class="m-0 font-serif text-headline-md">{$t("dashboard.today_title")}</h2>
    <p class="m-0 text-body-sm text-on-surface-variant" data-test-id="today-scope">{periodLabel}</p>
  </div>

  {#if loading}
    <div
      class="mt-3 overflow-hidden rounded-[var(--radius-box)] border border-base-300 bg-base-100"
      aria-busy="true"
      data-test-id="today-loading"
    >
      <span class="sr-only">{$t("dashboard.today_loading")}</span>
      <div class="h-16 border-b border-base-300 bg-surface-container-low"></div>
      <div class="h-16 bg-surface-container-low"></div>
    </div>
  {:else if commissions.length === 0}
    <div
      class="mt-3 rounded-[var(--radius-box)] border border-base-300 bg-base-100 px-5 py-8 text-center"
      data-test-id="today-empty"
    >
      <p class="m-0 font-serif text-headline-sm">
        {$t("dashboard.today_empty_title", { period: periodLabel } as never)}
      </p>
      <p class="mx-auto mt-2 max-w-[46ch] text-body-md text-on-surface-variant">
        {$t("dashboard.today_empty_description")}
      </p>
    </div>
  {:else}
    <ul
      class="m-0 mt-3 list-none overflow-hidden rounded-[var(--radius-box)] border border-base-300 bg-base-100 p-0"
      data-test-id="today-list"
    >
      {#each commissions as commission (commission.id)}
        <li class="commission-row" data-test-id="commission-row-{commission.id}">
          <div class="min-w-0">
            <h3 class="m-0 font-serif text-headline-sm text-base-content">
              {commission.subjectName}
            </h3>
            <p
              class="m-0 mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-on-surface-variant"
            >
              <span>{commission.commissionName}</span>
              <span aria-hidden="true">·</span>
              <span>
                {commission.studentCount === 1
                  ? $t("dashboard.students_one", { count: commission.studentCount } as never)
                  : $t("dashboard.students_other", { count: commission.studentCount } as never)}
              </span>
              {#if commission.pendingCount > 0}
                <span
                  class="inline-flex items-center gap-1.5 text-base-content"
                  data-test-id="commission-pending-{commission.id}"
                >
                  <span class="h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true"
                  ></span>
                  {commission.pendingCount === 1
                    ? $t("dashboard.pending_mark_one", {
                        count: commission.pendingCount,
                      } as never)
                    : $t("dashboard.pending_mark_other", {
                        count: commission.pendingCount,
                      } as never)}
                </span>
              {/if}
            </p>
          </div>

          <div class="commission-actions">
            <Button
              href={commission.attendanceHref}
              class="btn-primary"
              testId="commission-attendance-{commission.id}"
            >
              {$t("dashboard.attendance_action")}
            </Button>
            <Button
              href={commission.overviewHref}
              class="btn-outline"
              testId="commission-overview-{commission.id}"
            >
              {$t("dashboard.overview_action")}
            </Button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .commission-row {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
    border-bottom: 1px solid var(--color-base-300);
    transition:
      background-color 150ms ease,
      border-color 150ms ease;
  }

  .commission-row:last-child {
    border-bottom: 0;
  }

  .commission-row:hover {
    background-color: var(--color-surface-container-low);
  }

  .commission-actions {
    display: flex;
    gap: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid var(--color-base-300);
  }

  .commission-actions :global(a:first-child) {
    flex: 1;
  }

  @media (min-width: 768px) {
    .commission-row {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      padding: 0.875rem 1rem;
    }

    .commission-actions {
      flex: none;
      padding-top: 0;
      border-top: 0;
    }

    .commission-actions :global(a:first-child) {
      flex: none;
    }
  }
</style>
