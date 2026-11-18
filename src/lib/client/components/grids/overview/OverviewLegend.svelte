<script lang="ts">
  import { t } from "$lib/common/i18n/config";
</script>

<details class="overview-legend" data-test-id="overview-legend">
  <summary
    class="btn btn-ghost btn-sm cursor-pointer list-none"
    data-test-id="overview-legend-toggle"
  >
    {$t("commissions.legend")}
  </summary>
  <p class="mt-2 max-w-xl text-body-sm text-on-surface-variant" data-test-id="overview-legend-text">
    {$t("commissions.legend_text")}
  </p>
</details>

<style>
  .overview-legend {
    display: inline-block;
    margin-top: 0.75rem;
  }

  .overview-legend > summary::-webkit-details-marker {
    display: none;
  }

  .overview-legend > summary::marker {
    content: "";
  }
</style>
