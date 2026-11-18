<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import Button from "./Button.svelte";

  interface Props {
    message?: string;
    onRetry?: () => void;
  }

  let { message, onRetry }: Props = $props();
</script>

<div class="rounded-[var(--radius-box)] border border-error/30 bg-error/10 p-4 text-body-sm text-error" role="alert">
  <p class="m-0">{message ?? $t("common.load_error")}</p>
  {#if onRetry}
    <Button class="btn-ghost btn-sm mt-2" onclick={onRetry}>{$t("common.retry")}</Button>
  {/if}
</div>
