<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import DashboardPending from "$lib/client/components/DashboardPending.svelte";
  import DashboardStats from "$lib/client/components/DashboardStats.svelte";
  import CommonPage from "$lib/client/components/layout/CommonPage.svelte";
</script>

<CommonPage title={$t("dashboard.welcome")} lead={$t("dashboard.lead")}>
  <div class="grid grid-cols-1 gap-6 xl:grid-cols-12">
    <section class="min-w-0 xl:col-span-7">
      <DashboardPending />
    </section>
    <section class="min-w-0 xl:col-span-5">
      <DashboardStats />
    </section>
  </div>
</CommonPage>
