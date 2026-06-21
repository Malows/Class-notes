<script lang="ts">
  import { themeStore } from "$lib/stores/theme.svelte";
</script>

<button
  class="paper-btn btn-small"
  onclick={themeStore.toggleTheme}
  aria-label={themeStore.currentTheme === "light" ? "Tema Claro" : "Tema Oscuro"}
  data-test-id="theme-toggle-btn"
>
  {themeStore.currentTheme === "light" ? "☀️" : "🌙"}
</button>

<style>
  button {
    height: 100%;
  }
</style>
