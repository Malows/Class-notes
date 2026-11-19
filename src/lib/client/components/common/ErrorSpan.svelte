<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  interface Props {
    message: string | undefined;
    id: string;
    testId?: string;
  }

  let { message, id, testId }: Props = $props();
</script>

{#if message}
  <span {id} class="form-error-msg" role="alert" data-test-id={testId}>
    {$t(message)}
  </span>
{/if}
