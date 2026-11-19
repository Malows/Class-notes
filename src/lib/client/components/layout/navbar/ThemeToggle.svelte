<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import { themeStore } from "$lib/client/stores/theme.svelte";
</script>

<!--
  Stable name ("Dark theme") plus `aria-pressed` for the state, instead of an
  action label paired with a pressed value that read backwards.
-->
<button
  type="button"
  class="btn btn-ghost btn-sm btn-circle"
  onclick={themeStore.toggleTheme}
  aria-label={$t("layout.theme_dark")}
  aria-pressed={themeStore.currentTheme === "dark"}
  data-test-id="theme-toggle-btn"
>
  <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
    >{themeStore.currentTheme === "light" ? "light_mode" : "dark_mode"}</span
  >
</button>
