<script lang="ts">
  import { t } from "$lib/i18n/config";

  interface Props {
    message: string | undefined;
    id: string;
    testId?: string;
  }

  let { message, id, testId }: Props = $props();
</script>

{#if message}
  <span {id} class="text-danger form-error-msg" role="alert" data-test-id={testId}>
    {$t(message)}
  </span>
{/if}

<style>
  .form-error-msg {
    display: block;
    margin-top: 0.25rem;
    font-weight: bold;
    font-size: 0.9em;
  }
</style>
