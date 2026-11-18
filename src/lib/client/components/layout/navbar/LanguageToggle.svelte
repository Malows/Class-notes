<script lang="ts">
  import { locale } from "$lib/common/i18n/config";

  import { themeStore } from "$lib/client/stores/theme.svelte";
</script>

<button
  type="button"
  class="btn btn-ghost btn-sm btn-circle"
  onclick={themeStore.toggleLanguage}
  aria-label={$locale === "es" ? "Idioma Español" : "Language English"}
  data-test-id="language-toggle-btn"
>
  <span class="text-sm leading-none">{$locale === "es" ? themeStore.esFlag : "🇬🇧"}</span>
</button>
