<script lang="ts">
  interface Props {
    label: string;
    value: string | number;
    badge?: string;
    "data-test-id"?: string;
  }
  let { label, value, badge, "data-test-id": testId }: Props = $props();

  const badgeClass = $derived(
    badge
      ? {
          success: "badge badge-success",
          warning: "badge badge-warning",
          error: "badge badge-error",
          info: "badge badge-info",
          secondary: "badge badge-secondary",
        }[badge] ?? "badge badge-neutral"
      : "",
  );

  const valueClass = $derived(["stat-value", badgeClass].filter(Boolean).join(" "));
</script>

<div class="stat-item" data-test-id={testId}>
  <p class="stat-label">{label}</p>
  <span class={valueClass}>{value}</span>
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
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--color-on-surface);
  }
</style>
