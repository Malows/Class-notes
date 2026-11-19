<script lang="ts">
  interface Props {
    label: string;
    value: string | number;
    badge?: string;
    "data-test-id"?: string;
  }
  let { label, value, badge, "data-test-id": testId }: Props = $props();
</script>

<div class="stat-item" data-test-id={testId}>
  <p class="stat-label">{label}</p>
  <p class="stat-value">
    {value}
    {#if badge}
      <span class="stat-tone" data-tone={badge} aria-hidden="true"></span>
    {/if}
  </p>
</div>

<style>
  .stat-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    margin-bottom: 1rem;
  }

  .stat-label {
    margin: 0;
    font-size: 0.6875rem;
    line-height: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--color-on-surface-variant);
  }

  .stat-value {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    margin: 0;
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--color-on-surface);
  }

  .stat-tone {
    display: inline-block;
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 9999px;
    background-color: var(--color-neutral);
  }

  .stat-tone[data-tone="success"] {
    background-color: var(--color-success);
  }

  .stat-tone[data-tone="warning"] {
    background-color: var(--color-warning);
  }

  .stat-tone[data-tone="error"] {
    background-color: var(--color-error);
  }

  .stat-tone[data-tone="info"] {
    background-color: var(--color-info);
  }

  .stat-tone[data-tone="secondary"] {
    background-color: var(--color-secondary);
  }
</style>
