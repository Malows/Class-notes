<script lang="ts">
    import { onMount } from 'svelte';

    import { overviewService } from '$lib/services/overview.service';
    import { t } from '$lib/i18n/config';

    import Card from '$lib/components/common/Card.svelte';

    let pending = $state<any[]>([]);
    let loading = $state(true);

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
    <h3 class="card-title">{$t('dashboard.pending_title')}</h3>
    
    {#if loading}
        <p>{$t('dashboard.pending_loading')}</p>
    {:else if pending.length === 0}
        <p>{$t('dashboard.pending_empty')}</p>
    {:else}
        <ul class="no-bullet">
            {#each pending as item}
                <li>
                    <div class="row flex-middle">
                        <div class="col-8 col">
                            <strong>{item.subject_name}</strong><br>
                            <small class="text-muted">{item.commission_name}</small>
                        </div>
                        <div class="col-4 col text-right">
                            <span class="badge secondary">{item.pending_count}</span>
                            <a href="/faculties/{item.faculty_id}/subjects/{item.subject_id}/periods/{item.period_id}/commissions/{item.commission_id}/overview" class="paper-btn btn-small">{$t('dashboard.go')}</a>
                        </div>
                    </div>
                </li>
            {/each}
        </ul>
    {/if}
</Card>

<style>
    .no-bullet {
        list-style: none;
        padding: 0;
    }
    .no-bullet li {
        padding: 0.5rem 0;
        border-bottom: 1px solid #eee;
    }
    .no-bullet li:last-child {
        border-bottom: none;
    }
</style>
