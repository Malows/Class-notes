<script lang="ts">
    interface Props {
        label: string;
        value: string | number;
        badge?: string;
        'data-test-id'?: string;
    }
    let { label, value, badge, 'data-test-id': testId }: Props = $props();
</script>

<div class="stat-item" data-test-id={testId}>
    <strong>{label}:</strong>
    <span class={badge ? `badge ${badge}` : ''}>{value}</span>
</div>

<style>
    .stat-item {
        display: flex;
        flex-direction: column;
        margin-bottom: 1rem;
    }
    .stat-item strong {
        font-size: 0.8rem;
        color: var(--muted-color);
        text-transform: uppercase;
    }
    .stat-item span {
        font-size: 1.5rem;
        font-weight: bold;
    }
</style>
