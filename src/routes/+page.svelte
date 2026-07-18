<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import DashboardPending from "$lib/client/components/DashboardPending.svelte";
  import DashboardStats from "$lib/client/components/DashboardStats.svelte";
  import CommonPage from "$lib/client/components/layout/CommonPage.svelte";
</script>

<CommonPage title={$t("dashboard.welcome")} lead={$t("dashboard.lead")}>
  <div class="row">
    <div class="col-8 col">
      <DashboardPending />
    </div>
    <div class="col-4 col">
      <DashboardStats />
    </div>
  </div>
</CommonPage>
