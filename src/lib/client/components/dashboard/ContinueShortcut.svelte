<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Button from "$lib/client/components/common/Button.svelte";

  interface Props {
    href: string;
    subjectName: string;
    commissionName?: string;
    periodLabel: string;
    routeLabel: string;
    onForget: () => void;
  }

  let { href, subjectName, commissionName, periodLabel, routeLabel, onForget }: Props = $props();
</script>

<section
  class="rounded-[var(--radius-box)] border border-base-300 bg-surface-container-low p-4"
  aria-labelledby="continue-title"
  data-test-id="continue-shortcut"
>
  <div class="flex flex-col gap-3">
    <div class="min-w-0">
      <h2 id="continue-title" class="m-0 font-serif text-headline-md">
        {$t("dashboard.last_visit_title")}
      </h2>
      <p class="m-0 mt-1 text-title-md font-medium text-base-content" title={href}>
        {subjectName}{#if commissionName}<span
            class="mx-1 text-on-surface-variant"
            aria-hidden="true">·</span
          ><span class="font-normal text-on-surface-variant">{commissionName}</span>{/if}
      </p>
      <p class="m-0 mt-0.5 text-body-sm text-on-surface-variant">
        {periodLabel}<span class="mx-1" aria-hidden="true">·</span>{routeLabel}
      </p>
    </div>

    <div class="flex shrink-0 items-center gap-2">
      <Button
        href={href}
        class="btn-outline"
        testId="continue-visit">{$t("dashboard.last_visit_action")}</Button
      >
      <Button
        class="btn-ghost btn-sm"
        onclick={onForget}
        testId="forget-visit"
      >
        {$t("dashboard.last_visit_forget")}
      </Button>
    </div>
  </div>
</section>
