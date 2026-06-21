<script lang="ts">
  import { locale } from "$lib/i18n/config";
  import { themeStore } from "$lib/stores/theme.svelte";
</script>

<button
  class="paper-btn btn-small"
  onclick={themeStore.toggleLanguage}
  aria-label={$locale === "es" ? "Idioma Español" : "Language English"}
  data-test-id="language-toggle-btn"
>
  {$locale === "es" ? themeStore.esFlag : "🇬🇧"}
</button>

<style>
  button {
    height: 100%;
  }
</style>
