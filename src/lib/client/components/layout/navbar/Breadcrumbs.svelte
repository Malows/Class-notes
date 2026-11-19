<script lang="ts">
  import { getContext } from "svelte";

  import { t } from "$lib/common/i18n/config";
  import { StoreKey } from "$lib/common";

  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import { navStore, type NavCrumb } from "$lib/client/stores/nav.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";

  const facultiesStore = getContext<FacultiesStore | undefined>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore | undefined>(StoreKey.SUBJECTS);
  const periodsStore = getContext<PeriodsStore | undefined>(StoreKey.PERIODS);
  const commissionsStore = getContext<CommissionsStore | undefined>(StoreKey.COMMISSIONS);

  const ctx = $derived(navStore.context);

  const subject = $derived(
    ctx.subjectSlug ? subjectsStore?.bySlug.get(ctx.subjectSlug) : undefined,
  );

  const period = $derived(
    ctx.periodYear !== undefined && ctx.periodSemester !== undefined
      ? periodsStore?.items.find(
          (item) => item.year === ctx.periodYear && item.semester === ctx.periodSemester,
        )
      : undefined,
  );

  const commission = $derived(
    subject && period && ctx.commissionSlug
      ? commissionsStore?.findInScope(subject.id, period.id, ctx.commissionSlug)
      : undefined,
  );

  // Names come from the stores the pages already load; the route type is only a
  // fallback for the first paint or a missing record.
  function resolveLabel(crumb: NavCrumb): string {
    switch (crumb.kind) {
      case "faculty":
        return (
          facultiesStore?.bySlug.get(crumb.slug ?? "")?.name ??
          subject?.faculty_name ??
          $t("layout.faculty")
        );
      case "subject":
        return subject?.name ?? $t("layout.subject");
      case "commission":
        return commission?.name ?? $t("layout.commission");
      case "period":
        return $t("layout.period_short", {
          year: crumb.year ?? "",
          semester: crumb.semester ?? "",
        } as never);
      default:
        return crumb.isRaw ? (crumb.label ?? crumb.key) : $t(crumb.key);
    }
  }

  const breadcrumbs = $derived(
    navStore.breadcrumbs.map((crumb) => ({ ...crumb, label: resolveLabel(crumb) })),
  );

  // On a phone only the two deepest crumbs stay: the collapse keeps the last
  // two names rather than the last two route types.
  const lastTwoStart = $derived(Math.max(0, breadcrumbs.length - 2));
</script>

<nav aria-label={$t("layout.breadcrumb")} data-test-id="breadcrumbs">
  <ol class="m-0 flex list-none items-center gap-1 overflow-hidden whitespace-nowrap p-0">
    {#if lastTwoStart > 0}
      <li class="gap-mark text-on-surface-variant" aria-hidden="true">…</li>
    {/if}
    {#each breadcrumbs as crumb, i (i)}
      <li
        class="step flex min-w-0 items-center gap-1 text-[min(0.75rem,12px)] text-on-surface-variant"
        class:is-collapsed={i < lastTwoStart}
        data-test-id="breadcrumb-step-{i}"
      >
        {#if i > 0}
          <span class="text-outline-variant" aria-hidden="true">›</span>
        {/if}
        {#if i === breadcrumbs.length - 1}
          <span
            class="overflow-hidden text-ellipsis font-medium text-base-content"
            aria-current="page"
            data-test-id="breadcrumb-text-{i}">{crumb.label}</span
          >
        {:else}
          <a
            href={crumb.href}
            title={crumb.label}
            class="overflow-hidden text-ellipsis text-on-surface-variant hover:text-primary hover:underline"
            data-test-id="breadcrumb-link-{i}">{crumb.label}</a
          >
        {/if}
      </li>
    {/each}
  </ol>
</nav>

<style>
  .gap-mark {
    display: none;
  }

  @media (max-width: 600px) {
    .step.is-collapsed {
      display: none;
    }

    .gap-mark {
      display: flex;
    }
  }
</style>
