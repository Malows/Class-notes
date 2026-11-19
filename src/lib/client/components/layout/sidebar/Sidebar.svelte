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

  import { buildCommissionItems, buildPeriodItems, buildSubjectItems } from "./sidebar-context";
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

  const metadataSubjectItems = $derived(
    metadataContext?.subjects?.length
      ? metadataContext.subjects.map((subject) => ({
          id: Number(subject.id),
          href: subject.href,
          label: subject.name,
          shortLabel: subject.name.substring(0, 2).toUpperCase(),
          isActive: false,
        }))
      : [],
  );

  const subjectItems = $derived(
    context.facultySlug
      ? buildSubjectItems(subjectsStore.items, {
          facultySlug: context.facultySlug,
          activeSubjectSlug: context.subjectSlug,
        })
      : [],
  );

  const activePeriodId = $derived(
    context.periodYear !== undefined && context.periodSemester !== undefined
      ? periodsStore.items.find(
          (p) => p.year === context.periodYear && p.semester === context.periodSemester,
        )?.id
      : undefined,
  );

  const periodItems = $derived(
    context.facultySlug && context.subjectSlug
      ? buildPeriodItems(periodsStore.items, {
          facultySlug: context.facultySlug,
          subjectSlug: context.subjectSlug,
          activePeriodYear: context.periodYear,
          activePeriodSemester: context.periodSemester,
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

  const activeMetadataSubjects = $derived(
    metadataContext?.subjects?.length ? metadataSubjectItems : [],
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
    {#if activeMetadataSubjects.length > 0}
      <SidebarContextSection
        heading={metadataContext?.periodData
          ? `${$t("layout.active_term")} (${metadataContext.periodData.year} - ${metadataContext.periodData.term})`
          : $t("layout.active_term")}
        isCollapsed={false}
        items={activeMetadataSubjects}
      />
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
