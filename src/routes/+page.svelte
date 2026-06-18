<script lang="ts">
  import DashboardPending from "$lib/components/DashboardPending.svelte";
  import DashboardStats from "$lib/components/DashboardStats.svelte";
  import CommonPage from "$lib/components/layout/CommonPage.svelte";
  import { t } from "$lib/i18n/config";
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
