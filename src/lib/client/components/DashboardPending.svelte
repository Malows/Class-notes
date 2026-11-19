<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import type { PendingRow } from "./dashboard/dashboard-model";

  interface Props {
    rows: PendingRow[];
    periodLabel: string;
    loading?: boolean;
    failed?: boolean;
    onRetry?: () => void;
  }

  let { rows, periodLabel, loading = false, failed = false, onRetry }: Props = $props();
</script>

<section aria-labelledby="pending-title" data-test-id="pending-module">
  <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
    <h2 id="pending-title" class="m-0 font-serif text-headline-md">
      {$t("dashboard.pending_title")}
    </h2>
    <p class="m-0 text-body-sm text-on-surface-variant" data-test-id="pending-scope">
      {periodLabel}
    </p>
  </div>

  {#if loading}
    <div
      class="mt-3 overflow-hidden rounded-[var(--radius-box)] border border-base-300 bg-base-100"
      aria-busy="true"
      data-test-id="pending-loading"
    >
      <span class="sr-only">{$t("dashboard.pending_loading")}</span>
      <div class="h-14 border-b border-base-300 bg-surface-container-low"></div>
      <div class="h-14 bg-surface-container-low"></div>
    </div>
  {:else if failed}
    <div class="mt-3">
      <LoadError onRetry={onRetry} />
    </div>
  {:else if rows.length === 0}
    <p
      class="m-0 mt-3 rounded-[var(--radius-box)] border border-base-300 bg-base-100 px-4 py-5 text-body-md text-on-surface-variant"
      data-test-id="pending-empty"
    >
      {$t("dashboard.pending_empty")}
    </p>
  {:else}
    <ul
      class="m-0 mt-3 list-none overflow-hidden rounded-[var(--radius-box)] border border-base-300 bg-base-100 p-0"
      data-test-id="pending-list"
    >
      {#each rows as row (row.id)}
        <li class="pending-row" data-test-id="pending-row-{row.id}">
          <div class="min-w-0">
            <p class="m-0 text-title-md font-semibold text-base-content">{row.subjectName}</p>
            <p class="m-0 mt-0.5 truncate text-body-sm text-on-surface-variant">
              {row.commissionName}
            </p>
          </div>

          <div class="flex shrink-0 items-center gap-3">
            <div class="text-right">
              <p class="m-0 flex items-center justify-end gap-1.5">
                <span class="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden="true"></span>
                <span class="text-title-md font-medium tabular-nums text-base-content"
                  >{row.pendingCount}</span
                >
              </p>
              <p class="m-0 text-label-sm uppercase tracking-[0.04em] text-on-surface-variant">
                {$t("dashboard.pending_unchecked")}
              </p>
            </div>
            <Button
              href={row.href}
              class="btn-ghost btn-sm"
              testId="pending-open-{row.id}"
            >
              {$t("dashboard.pending_open")}
            </Button>
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<style>
  .pending-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    border-bottom: 1px solid var(--color-base-300);
    transition: background-color 150ms ease;
  }

  .pending-row:last-child {
    border-bottom: 0;
  }

  .pending-row:hover {
    background-color: var(--color-surface-container-low);
  }
</style>
