<script lang="ts">
    import { t } from '$lib/i18n/config';
    import { navStore } from '$lib/stores/nav.svelte';
    import { subjectsStore } from '$lib/stores/subjects.svelte';
    import { periodsStore } from '$lib/stores/periods.svelte';
    import { commissionsStore } from '$lib/stores/commissions.svelte';

    import SidebarContextSection from './SidebarContextSection.svelte';
    import SidebarHeader from './SidebarHeader.svelte';
    import SidebarStaticLinks from './SidebarStaticLinks.svelte';
    import {
        buildCommissionItems,
        buildPeriodItems,
        buildSubjectItems
    } from './sidebar-context';

    let isOpen = $state(false);
    let isCollapsed = $state(false);

    // Use navStore directly as it's reactive in Svelte 5
    const context = navStore.context;

    function toggleMobile() {
        isOpen = !isOpen;
    }

    function toggleCollapse() {
        isCollapsed = !isCollapsed;
    }

    const subjectItems = $derived(
        context.facultyId
            ? buildSubjectItems(subjectsStore.items, {
                  facultyId: context.facultyId,
                  activeSubjectId: context.subjectId
              })
            : []
    );

    const periodItems = $derived(
        context.facultyId && context.subjectId
            ? buildPeriodItems(periodsStore.items, {
                  facultyId: context.facultyId,
                  subjectId: context.subjectId,
                  activePeriodId: context.periodId
              })
            : []
    );

    const commissionItems = $derived(
        context.facultyId && context.subjectId && context.periodId
            ? buildCommissionItems(commissionsStore.items, {
                  facultyId: context.facultyId,
                  subjectId: context.subjectId,
                  periodId: context.periodId,
                  activeCommissionId: context.commissionId
              })
            : []
    );
</script>

<!-- Mobile Toggle Button -->
<button class="paper-btn sidebar-toggle sm-only" onclick={toggleMobile} aria-label={isOpen ? $t('layout.menu_close') : $t('layout.menu_open')}>
    {isOpen ? '✕' : '☰'}
</button>

<aside
    class="sidebar sketch-border sketch-shadow"
    class:open={isOpen}
    class:collapsed={isCollapsed}
>
    <SidebarHeader {isCollapsed} onToggle={toggleCollapse} />

    <div class="sidebar-content">
        
        {#if context.facultyId}
            <SidebarContextSection
                heading={`${$t('layout.subjects')} (${context.facultyName || '...'})`}
                {isCollapsed}
                items={subjectItems}
            />
        {/if}

        {#if context.subjectId}
            <SidebarContextSection
                heading={$t('layout.periods')}
                {isCollapsed}
                items={periodItems}
            />
        {/if}

        {#if context.periodId}
            <SidebarContextSection
                heading={$t('layout.commissions')}
                {isCollapsed}
                items={commissionItems}
            />
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
        transition: width 0.3s ease, transform 0.3s ease;
    }

    .sidebar.collapsed {
        width: 80px;
        padding: 1rem 0.5rem;
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
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
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
