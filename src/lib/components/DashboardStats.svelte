<script lang="ts">
    import { onMount } from 'svelte';

    import { overviewService } from '$lib/services/overview.service';
    import { APPROVAL_RATE_THRESHOLD } from '$lib/constants';
    import { t } from '$lib/i18n/config';

    import Card from '$lib/components/common/Card.svelte';
    import StatItem from '$lib/components/common/StatItem.svelte';

    let stats = $state<any>(null);
    let loading = $state(true);

    async function load() {
        try {
            stats = await overviewService.getGlobalStats();
        } catch (e) {
            console.error(e);
        } finally {
            loading = false;
        }
    }

    onMount(load);
</script>

<Card>
    <h3 class="card-title">{$t('dashboard.title')}</h3>
    
    {#if loading}
        <p>{$t('dashboard.loading')}</p>
    {:else if !stats}
        <p>{$t('dashboard.no_data')}</p>
    {:else}
        <div class="row">
            <div class="col-6 col">
                <StatItem label={$t('dashboard.total_students')} value={stats.totalStudents} data-test-id="total-students-stat" />
            </div>
            <div class="col-6 col">
                <StatItem label={$t('dashboard.subjects')} value={stats.totalSubjects} data-test-id="total-subjects-stat" />
            </div>
            <div class="col-6 col">
                <StatItem 
                    label={$t('dashboard.approval_rate')} 
                    value={`${stats.approvalRate}%`} 
                    badge={stats.approvalRate > APPROVAL_RATE_THRESHOLD ? 'success' : 'warning'} 
                    data-test-id="approval-rate-stat"
                />
            </div>
            <div class="col-6 col">
                <StatItem label={$t('dashboard.deliveries')} value={stats.totalDeliveries} data-test-id="total-deliveries-stat" />
            </div>
        </div>
    {/if}
</Card>
