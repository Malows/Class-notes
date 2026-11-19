<script lang="ts">
  import { locale, t } from "$lib/common/i18n/config";

  import { themeStore } from "$lib/client/stores/theme.svelte";
</script>

<!--
  The name describes the Spanish option in both locales; `aria-pressed` carries
  the state. Pairing an action name ("Switch to English") with `aria-pressed`
  announced the opposite language.
-->
<button
  type="button"
  class="btn btn-ghost btn-sm btn-circle"
  onclick={themeStore.toggleLanguage}
  aria-label={$t("layout.language_spanish")}
  aria-pressed={$locale === "es"}
  data-test-id="language-toggle-btn"
>
  <span class="text-sm leading-none">{$locale === "es" ? themeStore.esFlag : "🇬🇧"}</span>
</button>
