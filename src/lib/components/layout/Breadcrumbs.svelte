<script lang="ts">
    import { navStore } from '$lib/stores/nav.svelte';
    import { t } from '$lib/i18n/config';

    const breadcrumbs = $derived(
        navStore.breadcrumbs.map((crumb) => ({
            ...crumb,
            label: $t(crumb.key),
        }))
    );
</script>

<ul class="breadcrumb">
    {#each breadcrumbs as crumb, i}
        <li>
            {#if i === breadcrumbs.length - 1}
                {crumb.label}
            {:else}
                <a href={crumb.href}>{crumb.label}</a>
            {/if}
        </li>
    {/each}
</ul>

<style>
    .breadcrumb a {
        color: var(--primary);
    }

    .breadcrumb a:hover {
        text-decoration: none;
    }
</style>