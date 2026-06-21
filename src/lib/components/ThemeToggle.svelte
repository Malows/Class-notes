<script lang="ts">
  import { t } from "$lib/i18n/config";
  import { themeStore } from "$lib/stores/theme.svelte";
</script>

<button class="paper-btn btn-small" onclick={themeStore.toggleTheme}>
  {themeStore.currentTheme === "light" ? `☀️ ${$t("layout.light")}` : `🌙 ${$t("layout.dark")}`}
</button>

<style>
  button {
    height: 100%;
  }
</style>
