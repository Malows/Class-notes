<script lang="ts">
  import { getContext } from "svelte";
  import { t } from "$lib/common/i18n/config";

  import type { CommissionsStore } from "$lib/client/stores/commissions.svelte";
  import type { FacultiesStore } from "$lib/client/stores/faculties.svelte";
  import type { NavStore } from "$lib/client/stores/nav.svelte";
  import type { PeriodsStore } from "$lib/client/stores/periods.svelte";
  import type { SubjectsStore } from "$lib/client/stores/subjects.svelte";
  import { metadataStore } from "$lib/client/stores/metadata.svelte";
  import { StoreKey } from "$lib/common";

  import {
    buildCommissionItems,
    buildPeriodItems,
    buildSubjectItems,
    currentTermHref,
    termToSemester,
    type SidebarContextLink,
  } from "./sidebar-context";
  import SidebarContextSection from "./SidebarContextSection.svelte";
  import SidebarHeader from "./SidebarHeader.svelte";
  import SidebarStaticLinks from "./SidebarStaticLinks.svelte";

  // The sidebar consumes the same store instances the pages use via Svelte
  // context (provided by initStoreContext in +layout.svelte) so the quick
  // access sections reflect the data the pages already load.
  const navStore = getContext<NavStore>(StoreKey.NAV);
  const facultiesStore = getContext<FacultiesStore>(StoreKey.FACULTIES);
  const subjectsStore = getContext<SubjectsStore>(StoreKey.SUBJECTS);
  const periodsStore = getContext<PeriodsStore>(StoreKey.PERIODS);
  const commissionsStore = getContext<CommissionsStore>(StoreKey.COMMISSIONS);
  const metadataContext = $derived(metadataStore.context);
  const context = $derived(navStore.context);

  // The current-term shortcut is a destination, not a description of where the
  // user is, so it carries its own label and its own period.
  const currentTermHeading = $derived.by(() => {
    const periodData = metadataContext?.periodData;
    if (!periodData) return $t("layout.go_to_current_term");
    return `${$t("layout.go_to_current_term")} · ${$t("layout.period_short", {
      year: periodData.year,
      semester: termToSemester(periodData.term),
    } as never)}`;
  });

  // The active term is global, so the shortcut opens the period's subject list
  // rather than an arbitrary subject's period index.
  const currentTermLink = $derived.by(() => {
    const periodData = metadataContext?.periodData;
    if (!periodData) return null;
    return currentTermHref(periodData.year, termToSemester(periodData.term));
  });

  // Trigger guarded loads for the current context so empty stores populated
  // by the pages still get fetched here when needed.
  let loadedContext = $state<{
    facultySlug?: string;
    subjectSlug?: string;
    periodKey?: string;
  }>({});

  $effect(() => {
    const ctx = navStore.context;
    if (ctx.facultySlug && loadedContext.facultySlug !== ctx.facultySlug) {
      loadedContext = { ...loadedContext, facultySlug: ctx.facultySlug, subjectSlug: undefined };
      void facultiesStore.load();
      void subjectsStore.load();
    }
    if (ctx.subjectSlug && loadedContext.subjectSlug !== ctx.subjectSlug) {
      const subjectSlug = ctx.subjectSlug;
      loadedContext = { ...loadedContext, subjectSlug };
      void (async () => {
        await subjectsStore.load();
        const subjectId = subjectsStore.bySlug.get(subjectSlug)?.id;
        if (subjectId) {
          await periodsStore.load(subjectId);
        }
      })();
    }
    if (ctx.periodYear !== undefined && ctx.periodSemester !== undefined) {
      const key = `${ctx.periodYear}:${ctx.periodSemester}`;
      if (loadedContext.periodKey !== key) {
        loadedContext = { ...loadedContext, periodKey: key };
        void commissionsStore.load();
      }
    }
  });

  const subjectItems = $derived(
    context.facultySlug
      ? buildSubjectItems(subjectsStore.items, {
          facultySlug: context.facultySlug,
          activeSubjectSlug: context.subjectSlug,
        })
      : [],
  );

  const viewedPeriod = $derived(
    context.periodYear !== undefined && context.periodSemester !== undefined
      ? periodsStore.items.find(
          (p) => p.year === context.periodYear && p.semester === context.periodSemester,
        )
      : undefined,
  );

  const activePeriodId = $derived(viewedPeriod?.id);

  const viewedSubject = $derived(
    context.subjectSlug ? subjectsStore.bySlug.get(context.subjectSlug) : undefined,
  );

  const viewedCommission = $derived(
    viewedSubject && viewedPeriod && context.commissionSlug
      ? commissionsStore.findInScope(viewedSubject.id, viewedPeriod.id, context.commissionSlug)
      : undefined,
  );

  // "You are viewing": the cursada trail read from the same stores the pages
  // populate. The deepest known level is the current one.
  const locationItems = $derived.by(() => {
    const items: SidebarContextLink[] = [];
    if (!context.facultySlug) return items;

    const facultyName =
      facultiesStore.bySlug.get(context.facultySlug)?.name ?? viewedSubject?.faculty_name;
    if (facultyName) {
      items.push({
        id: 1,
        href: `/faculties/${context.facultySlug}/subjects`,
        label: facultyName,
        shortLabel: facultyName.substring(0, 2).toUpperCase(),
        isActive: false,
      });
    }

    if (context.subjectSlug && viewedSubject) {
      items.push({
        id: 2,
        href: `/faculties/${context.facultySlug}/subjects/${context.subjectSlug}/periods`,
        label: viewedSubject.name,
        shortLabel: viewedSubject.name.substring(0, 2).toUpperCase(),
        isActive: false,
      });
    }

    if (viewedPeriod) {
      const label = $t("layout.period_short", {
        year: viewedPeriod.year,
        semester: viewedPeriod.semester,
      } as never);
      items.push({
        id: 3,
        href: `/faculties/${context.facultySlug}/subjects/${context.subjectSlug}/periods/${viewedPeriod.year}/${viewedPeriod.semester}/commissions`,
        label,
        shortLabel: `${viewedPeriod.year % 100}-${viewedPeriod.semester}`,
        isActive: false,
      });
    }

    if (context.commissionSlug && viewedCommission) {
      items.push({
        id: 4,
        href: `/faculties/${context.facultySlug}/subjects/${context.subjectSlug}/periods/${context.periodYear}/${context.periodSemester}/commissions/${context.commissionSlug}/overview`,
        label: viewedCommission.name,
        shortLabel: viewedCommission.name.substring(0, 2).toUpperCase(),
        isActive: false,
      });
    }

    if (items.length > 0) {
      items[items.length - 1]!.isActive = true;
    }
    return items;
  });

  const periodItems = $derived(
    context.facultySlug && context.subjectSlug
      ? buildPeriodItems(periodsStore.items, {
          facultySlug: context.facultySlug,
          subjectSlug: context.subjectSlug,
          activePeriodYear: context.periodYear,
          activePeriodSemester: context.periodSemester,
          formatPeriod: (year, semester) => $t("layout.period_short", { year, semester } as never),
        })
      : [],
  );

  const commissionItems = $derived(
    context.facultySlug &&
      context.subjectSlug &&
      context.periodYear !== undefined &&
      context.periodSemester !== undefined &&
      activePeriodId !== undefined
      ? buildCommissionItems(commissionsStore.items, {
          subjects: subjectsStore.items,
          facultySlug: context.facultySlug,
          subjectSlug: context.subjectSlug,
          periodId: activePeriodId,
          periodYear: context.periodYear,
          periodSemester: context.periodSemester,
          activeCommissionSlug: context.commissionSlug,
        })
      : [],
  );

  const hasMetadataContext = $derived(
    Boolean(metadataContext?.periodData || metadataContext?.subjects?.length),
  );
</script>

<aside
  class="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto border-r border-base-300 bg-surface px-3 py-4 md:flex"
  aria-label={$t("layout.quick_access")}
  data-test-id="sidebar"
>
  <SidebarHeader />

  <div class="flex flex-col gap-4">
    {#if locationItems.length > 0}
      <SidebarContextSection
        heading={$t("layout.current_context")}
        isCollapsed={false}
        items={locationItems}
      />
    {/if}

    {#if currentTermLink}
      <div
        class={locationItems.length > 0 ? "border-t border-base-300 pt-3" : ""}
        data-test-id="sidebar-current-term"
      >
        <p
          class="m-0 px-2 text-label-sm uppercase tracking-[0.04em] text-on-surface-variant"
          data-test-id="sidebar-current-term-label"
        >
          {$t("layout.active_term")}
        </p>
        <a
          href={currentTermLink}
          title={currentTermHeading}
          class="mt-1 flex items-center gap-2 rounded-[var(--radius-field)] px-2 py-1.5 text-body-sm text-on-surface-variant transition-colors hover:bg-base-200 hover:text-base-content"
          data-test-id="sidebar-current-term-link"
        >
          <span class="shrink-0 text-body-md" aria-hidden="true">→</span>
          <span class="min-w-0 truncate">{currentTermHeading}</span>
        </a>
      </div>
    {:else if context.facultySlug}
      <SidebarContextSection
        heading={`${$t("layout.subjects")} (${facultiesStore.bySlug.get(context.facultySlug)?.name ?? "..."})`}
        isCollapsed={false}
        items={subjectItems}
      />
    {/if}

    {#if context.subjectSlug}
      <SidebarContextSection
        heading={$t("layout.periods")}
        isCollapsed={false}
        items={periodItems}
      />
    {/if}

    {#if context.periodYear !== undefined && context.periodSemester !== undefined && commissionItems.length > 0}
      <SidebarContextSection
        heading={$t("layout.commissions")}
        isCollapsed={false}
        items={commissionItems}
      />
    {/if}

    {#if !hasMetadataContext && !context.facultySlug && !context.subjectSlug && context.periodYear === undefined && context.periodSemester === undefined}
      <div
        class="rounded-[var(--radius-box)] border border-dashed border-base-300 p-3 text-body-sm text-on-surface-variant"
      >
        <p class="m-0">{$t("layout.no_context")}</p>
      </div>
    {/if}

    <SidebarStaticLinks isCollapsed={false} />
  </div>
</aside>
