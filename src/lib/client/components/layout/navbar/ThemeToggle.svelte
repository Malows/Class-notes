<script lang="ts">
  import { t } from "$lib/common/i18n/config";

  import { themeStore } from "$lib/client/stores/theme.svelte";
</script>

<button
  type="button"
  class="btn btn-ghost btn-sm btn-circle"
  onclick={themeStore.toggleTheme}
  aria-label={themeStore.currentTheme === "light" ? $t("layout.light") : $t("layout.dark")}
  data-test-id="theme-toggle-btn"
>
  <span class="material-symbols-outlined text-[18px]" aria-hidden="true"
    >{themeStore.currentTheme === "light" ? "light_mode" : "dark_mode"}</span
  >
</button>
