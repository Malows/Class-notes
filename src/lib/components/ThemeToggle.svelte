<script lang="ts">
  import { t } from "$lib/i18n/config";
  import { themeStore } from "$lib/stores/theme.svelte";
</script>

<button class="paper-btn btn-small" onclick={themeStore.toggle}>
  {themeStore.current === "light" ? `🌙 ${$t("layout.dark")}` : `☀️ ${$t("layout.light")}`}
</button>

<style>
  button {
    height: 100%;
  }
</style>
