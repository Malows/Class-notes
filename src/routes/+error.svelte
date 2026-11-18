<script lang="ts">
  import { page } from "$app/state";

  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";
  import Card from "$lib/client/components/common/Card.svelte";

  const status = $derived(page.status);
  const isNotFound = $derived(status === 404);
</script>

<svelte:head>
  <title>{isNotFound ? $t("common.error_not_found") : $t("common.error_generic")}</title>
</svelte:head>

<div class="mx-auto flex max-w-xl flex-col gap-4 py-10">
  <p class="m-0 text-label-sm uppercase tracking-[0.08em] text-on-surface-variant">
    {$t("common.error_code", { code: String(status) } as never)}
  </p>

  <Card>
    <h1 class="m-0 font-serif text-headline-lg text-base-content">
      {isNotFound ? $t("common.error_not_found") : $t("common.error_generic")}
    </h1>

    {#if page.error?.message && !isNotFound}
      <p class="m-0 mt-2 text-body-md text-on-surface-variant">{page.error.message}</p>
    {/if}

    <div class="mt-6">
      <Button href="/" withHover testId="error-dashboard-btn">
        {$t("common.go_dashboard")}
      </Button>
    </div>
  </Card>
</div>
