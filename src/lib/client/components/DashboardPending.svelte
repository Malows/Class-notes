<script lang="ts">
  import { onMount } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import type { PendingSummary } from "$lib/common/types/dashboard";

  import Card from "$lib/client/components/common/Card.svelte";
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

  async function load() {
    try {
      pending = await overviewService.getPendingSummary();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  onMount(load);
</script>

<Card>
  <h3 class="card-title">{$t("dashboard.pending_title")}</h3>

  {#if loading}
    <p>{$t("dashboard.pending_loading")}</p>
  {:else if groups.length === 0}
    <p>{$t("dashboard.pending_empty_active")}</p>
  {:else}
    <ul class="no-bullet" data-test-id="pending-list">
      {#each groups as group (group.subjectId)}
        <li class="pending-subject" data-test-id="pending-subject-group-{group.subjectId}">
          <div class="pending-subject__header">
            <strong data-test-id="pending-subject-{group.subjectId}">{group.subjectName}</strong>
            <span class="badge secondary" data-test-id="pending-subject-total-{group.subjectId}"
              >{group.total}</span
            >
          </div>

          <ul
            class="no-bullet pending-commissions"
            data-test-id="pending-commissions-{group.subjectId}"
          >
            {#each group.items as item (item.commission_id)}
              <li class="pending-commission" data-test-id="pending-row-{item.commission_id}">
                <div class="pending-commission__info">
                  <span data-test-id="pending-commission-{item.commission_id}"
                    >{item.commission_name}</span
                  >
                  <small class="text-muted" data-test-id="pending-period-{item.commission_id}"
                    >{item.period_year} · {item.period_semester}º</small
                  >
                </div>
                <div class="pending-commission__actions">
                  <span class="badge secondary" data-test-id="pending-count-{item.commission_id}"
                    >{item.pending_count}</span
                  >
                  <a
                    href="/faculties/{item.faculty_slug}/subjects/{item.subject_slug}/periods/{item.period_year}/{item.period_semester}/commissions/{item.commission_slug}/overview"
                    class="paper-btn btn-small"
                    data-test-id="view-pending-btn-{item.commission_id}">{$t("dashboard.go")}</a
                  >
                </div>
              </li>
            {/each}
          </ul>
        </li>
      {/each}
    </ul>
  {/if}
</Card>

<style>
  .no-bullet {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .pending-subject {
    padding: 0.6rem 0;
    border-bottom: 1px solid #eee;
  }

  .pending-subject:last-child {
    border-bottom: none;
  }

  .pending-subject__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
  }

  .pending-commissions {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin: 0.45rem 0 0;
    padding-left: 0.75rem;
    border-left: 2px solid #eee;
  }

  .pending-commission {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding: 0.15rem 0;
  }

  .pending-commission__info {
    display: flex;
    align-items: baseline;
    gap: 0.4rem;
    min-width: 0;
  }

  .pending-commission__actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-shrink: 0;
  }
</style>