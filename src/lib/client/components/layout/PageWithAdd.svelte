<script lang="ts">
  import type { Snippet } from "svelte";

  import { t } from "$lib/common/i18n/config";

  import CommonPage from "./CommonPage.svelte";

  let {
    title,
    addLabelKey = "common.add",
    onAdd,
    children,
  } = $props<{
    title: string;
    addLabelKey?: string;
    onAdd: () => void;
    children: () => Snippet;
  }>();
</script>

<CommonPage {title}>
  {#snippet extra()}
    <button data-test-id="add-btn" class="paper-btn btn-primary-outline" onclick={onAdd}>
      + {$t(addLabelKey)}
    </button>
  {/snippet}

  {@render children()}
</CommonPage>
