<script lang="ts">
  import { onMount } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import type { PendingSummary } from "$lib/common/types/dashboard";

  import Button from "$lib/client/components/common/Button.svelte";
  import Card from "$lib/client/components/common/Card.svelte";
  import Chip from "$lib/client/components/common/Chip.svelte";
  import LoadError from "$lib/client/components/common/LoadError.svelte";
  import { overviewService } from "$lib/client/services/overview.service";

  interface PendingSubjectGroup {
    subjectId: number;
    subjectName: string;
    total: number;
    items: PendingSummary[];
  }

  let pending = $state<PendingSummary[]>([]);
  let loading = $state(true);

  const groups = $derived.by<PendingSubjectGroup[]>(() => {
    const bySubject = new Map<number, PendingSubjectGroup>();

    for (const item of pending) {
      let group = bySubject.get(item.subject_id);
      if (!group) {
        group = {
          subjectId: item.subject_id,
          subjectName: item.subject_name,
          total: 0,
          items: [],
        };
        bySubject.set(item.subject_id, group);
      }
      group.items.push(item);
      group.total += item.pending_count;
    }

    return Array.from(bySubject.values())
      .map((group) => ({
        ...group,
        items: [...group.items].sort((a, b) => b.pending_count - a.pending_count),
      }))
      .sort((a, b) => b.total - a.total || a.subjectName.localeCompare(b.subjectName));
  });

  let failed = $state(false);

  async function load() {
    loading = true;
    failed = false;
    try {
      pending = await overviewService.getPendingSummary();
    } catch (e) {
      console.error(e);
      failed = true;
    } finally {
      loading = false;
    }
  }

  onMount(load);
</script>

<Card>
  <h2 class="m-0 font-serif text-headline-md">{$t("dashboard.pending_title")}</h2>

  {#if loading}
    <p class="text-body-md text-on-surface-variant">{$t("dashboard.pending_loading")}</p>
  {:else if failed}
    <LoadError onRetry={load} />
  {:else if groups.length === 0}
    <p class="text-body-md text-on-surface-variant">{$t("dashboard.pending_empty_active")}</p>
  {:else}
    <ul class="m-0 flex list-none flex-col gap-4 p-0" data-test-id="pending-list">
      {#each groups as group (group.subjectId)}
        <li
          class="border-b border-base-300 pb-3 last:border-0 last:pb-0"
          data-test-id="pending-subject-group-{group.subjectId}"
        >
          <div class="flex items-center justify-between gap-2">
            <strong
              class="font-sans text-title-md font-semibold text-base-content"
              data-test-id="pending-subject-{group.subjectId}">{group.subjectName}</strong
            >
            <Chip tone="neutral" testId="pending-subject-total-{group.subjectId}"
              >{group.total}</Chip
            >
          </div>

          <ul
            class="m-0 mt-2 flex list-none flex-col gap-1.5 border-l border-base-300 pl-3"
            data-test-id="pending-commissions-{group.subjectId}"
          >
            {#each group.items as item (item.commission_id)}
              <li
                class="flex items-center justify-between gap-3"
                data-test-id="pending-row-{item.commission_id}"
              >
                <div class="flex min-w-0 items-baseline gap-1.5">
                  <span
                    class="truncate text-body-md text-base-content"
                    data-test-id="pending-commission-{item.commission_id}"
                    >{item.commission_name}</span
                  >
                  <small
                    class="whitespace-nowrap text-body-sm text-on-surface-variant"
                    data-test-id="pending-period-{item.commission_id}"
                    >{item.period_year} · {item.period_semester}º</small
                  >
                </div>
                <div class="flex shrink-0 items-center gap-2">
                  <Chip tone="primary" testId="pending-count-{item.commission_id}"
                    >{item.pending_count}</Chip
                  >
                  <Button
                    href="/faculties/{item.faculty_slug}/subjects/{item.subject_slug}/periods/{item.period_year}/{item.period_semester}/commissions/{item.commission_slug}/overview"
                    class="btn-sm"
                    withHover
                    testId="view-pending-btn-{item.commission_id}"
                  >
                    {$t("dashboard.go")}
                  </Button>
                </div>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  {/if}
</Card>
