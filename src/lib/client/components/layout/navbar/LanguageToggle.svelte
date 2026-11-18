<script lang="ts">
  import { locale, t } from "$lib/common/i18n/config";

  import { themeStore } from "$lib/client/stores/theme.svelte";
</script>

<button
  type="button"
  class="btn btn-ghost btn-sm btn-circle"
  onclick={themeStore.toggleLanguage}
  aria-label={$locale === "es" ? $t("layout.switch_to_english") : $t("layout.switch_to_spanish")}
  aria-pressed={$locale === "es"}
  data-test-id="language-toggle-btn"
>
  <span class="text-sm leading-none">{$locale === "es" ? themeStore.esFlag : "🇬🇧"}</span>
</button>
