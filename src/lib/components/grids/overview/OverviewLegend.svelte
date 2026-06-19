<script lang="ts">
  import { t } from "$lib/i18n/config";
</script>

<div class="overview-legend">
  <button
    class="paper-btn btn-small popover"
    data-popover-content="Approved ✓  • Rejected ✗  • Pending –  • AI warning ⚠️/🤖"
    data-popover-position="bottom"
  >
    {$t("commissions.legend")}
  </button>
  <p>
    <small>{$t("commissions.legend_text")}</small>
  </p>
</div>

<style>
  .overview-legend {
    display: inline-flex;
    margin-top: 0.75rem;
  }

  .overview-legend :global(.popover) {
    cursor: help;
  }
</style>
