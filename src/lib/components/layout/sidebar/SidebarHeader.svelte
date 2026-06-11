<script lang="ts">
    import { t } from '$lib/i18n/config';

    type Props = {
        isCollapsed: boolean;
        onToggle: () => void;
    };

    let { isCollapsed, onToggle }: Props = $props();
</script>

<div class="sidebar-header">
    {#if !isCollapsed}
        <h4>{$t('layout.quick_access')}</h4>
    {/if}
    <button class="paper-btn btn-small" onclick={onToggle}>
        {isCollapsed ? '»' : '«'}
    </button>
</div>

<style>
    .sidebar-header {
        display: flex;
        justify-content: space-between;
        margin-bottom: 1rem;
    }

    .sidebar-header h4 {
        margin: 0;
    }

    @media (max-width: 768px) {
        .sidebar-header {
            display: none;
        }
    }
</style>