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

  let isOpen = $state(false);
  let isCollapsed = $state(false);

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

  function toggleMobile() {
    isOpen = !isOpen;
  }

  function toggleCollapse() {
    isCollapsed = !isCollapsed;
  }

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

<!-- Mobile Toggle Button -->
<button
  class="paper-btn sidebar-toggle sm-only"
  onclick={toggleMobile}
  aria-label={isOpen ? $t("layout.menu_close") : $t("layout.menu_open")}
>
  {isOpen ? "✕" : "☰"}
</button>

<aside
  class="sidebar sketch-border sketch-shadow"
  class:open={isOpen}
  class:collapsed={isCollapsed}
>
  <SidebarHeader {isCollapsed} onToggle={toggleCollapse} />

  <div class="sidebar-content">
    {#if activeMetadataSubjects.length > 0}
      <SidebarContextSection
        heading={metadataContext?.periodData
          ? `Cuatrimestre Activo (${metadataContext.periodData.year} - ${metadataContext.periodData.term})`
          : "Cuatrimestre Activo"}
        {isCollapsed}
        items={activeMetadataSubjects}
      />
    {:else if context.facultySlug}
      <SidebarContextSection
        heading={`${$t("layout.subjects")} (${facultiesStore.bySlug.get(context.facultySlug)?.name ?? "..."})`}
        {isCollapsed}
        items={subjectItems}
      />
    {/if}

    {#if context.subjectSlug}
      <SidebarContextSection heading={$t("layout.periods")} {isCollapsed} items={periodItems} />
    {/if}

    {#if context.periodYear !== undefined && context.periodSemester !== undefined}
      <SidebarContextSection
        heading={$t("layout.commissions")}
        {isCollapsed}
        items={commissionItems}
      />
    {/if}

    {#if !hasMetadataContext && !context.facultySlug && !context.subjectSlug && context.periodYear === undefined && context.periodSemester === undefined}
      <div class="metadata-empty-state">
        <p>No hay contexto académico activo disponible.</p>
      </div>
    {/if}

    <SidebarStaticLinks {isCollapsed} />
  </div>
</aside>

<style>
  .sidebar {
    width: 250px;
    /* background: var(--background-body); */
    height: min-content;
    overflow-y: auto;
    padding: 1rem;
    margin: 1rem 0 1rem 1rem;
    transition:
      width 0.3s ease,
      transform 0.3s ease;
  }

  .sidebar.collapsed {
    width: 80px;
    padding: 1rem 0.5rem;
  }

  .metadata-empty-state {
    margin: 1rem 0;
    padding: 0.75rem;
    border: 1px dashed var(--border-color);
    border-radius: 0.5rem;
    color: var(--muted-color);
    font-size: 0.85rem;
  }

  .sidebar-toggle {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    z-index: 1001;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .sm-only {
    display: none;
  }

  @media (max-width: 768px) {
    .sm-only {
      display: flex;
    }
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      z-index: 1000;
      transform: translateX(-100%);
      box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
      margin: 0;
      border-radius: 0;
      border-right: 1px solid var(--border-color);
    }
    .sidebar.open {
      transform: translateX(0);
    }
    .sidebar.collapsed {
      width: 250px; /* Disable collapse on mobile */
    }
  }
</style>
