<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
    
    import { t } from '$lib/i18n/config';
	import { overviewService } from '$lib/services/overview.service';
	import type { OverviewData } from '$lib/types';
	import OverviewTable from '$lib/components/OverviewTable.svelte';

	let data = $state<OverviewData | null>(null);
	let loading = $state(true);

    const facultyID = Number(page.params.faculty_id);
    const subjectID = Number(page.params.subject_id);
    const periodID = Number(page.params.period_id);
	const commissionID = Number(page.params.commission_id);

	async function loadData() {
		try {
			data = await overviewService.get(commissionID);
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	onMount(loadData);
</script>

<h2>{$t('commissions.commission_overview_title')}</h2>
<p><a href="/faculties/{facultyID}/subjects/{subjectID}/periods/{periodID}/commissions" class="paper-btn btn-small">{$t('layout.back_to_commissions')}</a></p>

{#if loading}
	<p>{$t('commissions.loading_info')}</p>
{:else if data}
	<div style="overflow-x: auto;">
		<OverviewTable 
            {data} 
            {commissionID} 
            facultyId={facultyID}
            subjectId={subjectID}
            periodId={periodID}
        />
	</div>
	<p>
		<small><b>{$t('commissions.legend')}</b> {$t('commissions.legend_text')}</small>
	</p>
{/if}
