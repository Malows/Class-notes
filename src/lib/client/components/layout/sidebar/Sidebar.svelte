<script lang="ts">
  import { t } from "$lib/common/i18n/config";
  import { commissionsStore } from "$lib/client/stores/commissions.svelte";
  import { navStore } from "$lib/client/stores/nav.svelte";
  import { periodsStore } from "$lib/client/stores/periods.svelte";
  import { subjectsStore } from "$lib/client/stores/subjects.svelte";
  import { metadataStore } from "$lib/client/stores/metadata.svelte";

  import { buildCommissionItems, buildPeriodItems, buildSubjectItems } from "./sidebar-context";
  import SidebarContextSection from "./SidebarContextSection.svelte";
  import SidebarHeader from "./SidebarHeader.svelte";
  import SidebarStaticLinks from "./SidebarStaticLinks.svelte";

  let isOpen = $state(false);
  let isCollapsed = $state(false);

  const context = navStore.context;
  const metadataContext = metadataStore.context;

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
    context.facultyId
      ? buildSubjectItems(subjectsStore.items, {
          facultyId: context.facultyId,
          activeSubjectId: context.subjectId,
        })
      : [],
  );

  const periodItems = $derived(
    context.facultyId && context.subjectId
      ? buildPeriodItems(periodsStore.items, {
          facultyId: context.facultyId,
          subjectId: context.subjectId,
          activePeriodId: context.periodId,
        })
      : [],
  );

  const commissionItems = $derived(
    context.facultyId && context.subjectId && context.periodId
      ? buildCommissionItems(commissionsStore.items, {
          facultyId: context.facultyId,
          subjectId: context.subjectId,
          periodId: context.periodId,
          activeCommissionId: context.commissionId,
        })
      : [],
  );

  const activeMetadataSubjects = $derived(metadataContext?.subjects?.length ? metadataSubjectItems : []);

  const hasMetadataContext = $derived(Boolean(metadataContext?.periodData || metadataContext?.subjects?.length));
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
        heading={metadataContext?.periodData ? `Cuatrimestre Activo (${metadataContext.periodData.year} - ${metadataContext.periodData.term})` : "Cuatrimestre Activo"}
        {isCollapsed}
        items={activeMetadataSubjects}
      />
    {:else if context.facultyId}
      <SidebarContextSection
        heading={`${$t("layout.subjects")} (${context.facultyName || "..."})`}
        {isCollapsed}
        items={subjectItems}
      />
    {/if}

    {#if context.subjectId}
      <SidebarContextSection heading={$t("layout.periods")} {isCollapsed} items={periodItems} />
    {/if}

    {#if context.periodId}
      <SidebarContextSection
        heading={$t("layout.commissions")}
        {isCollapsed}
        items={commissionItems}
      />
    {/if}

    {#if !hasMetadataContext && !context.facultyId && !context.subjectId && !context.periodId}
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
