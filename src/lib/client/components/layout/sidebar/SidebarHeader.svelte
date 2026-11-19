<script lang="ts">
  import { t } from "$lib/common/i18n/config";
</script>

<a
  href="/"
  class="mb-6 flex items-center gap-2 px-2 text-base-content"
  data-test-id="sidebar-brand"
>
  <span class="material-symbols-outlined text-[20px] text-primary" aria-hidden="true"
    >local_library</span
  >
  <span class="font-serif text-headline-sm font-medium">{$t("layout.brand")}</span>
</a>
