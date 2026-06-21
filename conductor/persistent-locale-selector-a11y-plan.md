# Persistent Locale Selector with localStorage & A11y Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create an interactive, accessible, and persistent language selector in the NavBar that allows users to override automatic browser locale detection, stores their preference in `localStorage`, and updates SvelteKit i18n and the DOM `lang` attribute dynamically.

**Architecture:** Use a Svelte button toggle inside `NavBar.svelte`. Bind to `locale.set` from `sveltekit-i18n`. Use Svelte 5 `$effect` in `+layout.svelte` to synchronize `document.documentElement.lang` on locale updates. Check `localStorage` proactively inside `+layout.ts` during load.

**Tech Stack:** Svelte 5 (Runes), sveltekit-i18n, TypeScript, Vitest, Testing Library.

## Global Constraints

- Never stage or commit your changes, unless you are explicitly instructed to commit.
- Use explicit and strongly typed code (no `any`).
- Add comments only for "why" something is complex, never "what" is being done.

---

### Task 1: Update SvelteKit Layout Loader for localStorage Support

**Files:**
- Modify: `src/routes/+layout.ts`

**Interfaces:**
- Consumes: `localStorage.getItem("preferred-locale")` and `navigator.language`
- Produces: `initLocale` string passed to `loadTranslations`

- [ ] **Step 1: Check existing layout loader code**
  - Verify that the loader currently dynamically queries `navigator.language` and splits to extract the language code.

- [ ] **Step 2: Update loader logic**
  - Modify `src/routes/+layout.ts` to inspect `localStorage.getItem("preferred-locale")` first. If it holds "es" or "en", set `initLocale` to it. If not, use the split-code browser language default, and fall back to "en". Maintain safe server-side checks for the global `typeof window` and `typeof localStorage` environments.
  - Implement logging of translation choices using `console.log`.

```typescript
import { loadTranslations } from "$lib/i18n/config";

export const ssr = false;
export const prerender = false;
export const trailingSlash = "always";

export const load = async ({ url }) => {
  const { pathname } = url;
  let initLocale = "en";

  if (typeof localStorage !== "undefined") {
    const saved = localStorage.getItem("preferred-locale");
    if (saved === "es" || saved === "en") {
      initLocale = saved;
    } else if (typeof navigator !== "undefined") {
      const browserLang = navigator.language.split("-")[0];
      if (browserLang === "es") {
        initLocale = "es";
      }
    }
  } else if (typeof navigator !== "undefined") {
    const browserLang = navigator.language.split("-")[0];
    if (browserLang === "es") {
      initLocale = "es";
    }
  }

  if (typeof window !== "undefined") {
    console.log(`[i18n] Initializing translations. Chosen locale: "${initLocale}". (Preferred saved: "${typeof localStorage !== "undefined" ? localStorage.getItem("preferred-locale") : null}", Browser default: "${typeof navigator !== "undefined" ? navigator.language : null}")`);
  }

  await loadTranslations(initLocale, pathname);
  return {};
};
```

---

### Task 2: Synchronize HTML document `lang` Attribute

**Files:**
- Modify: `src/routes/+layout.svelte`

**Interfaces:**
- Consumes: Svelte reactive `$locale` store from `$lib/i18n/config`
- Produces: Mutation of `document.documentElement.lang`

- [ ] **Step 1: Update Layout Component**
  - Modify `src/routes/+layout.svelte` to include a reactive `$effect` that automatically updates the HTML `lang` attribute whenever the active locale store changes.

```typescript
  import { locale, t } from "$lib/i18n/config";

  $effect(() => {
    if (typeof document !== "undefined" && $locale) {
      document.documentElement.lang = $locale;
    }
  });
```

---

### Task 3: Implement Language Toggle Button in NavBar

**Files:**
- Modify: `src/lib/components/layout/NavBar.svelte`

**Interfaces:**
- Consumes: `locale` and `t` from `$lib/i18n/config`
- Produces: UI Toggle button in navigation bar

- [ ] **Step 1: Update NavBar Markup & Logic**
  - Add language selector logic to change the active locale and synchronize it to `localStorage` on-click.
  - Implement a PaperCSS button with clean, hand-drawn styles, proper `aria-label`, and `data-test-id="language-toggle-btn"`.

```svelte
<script lang="ts">
  import Breadcrumbs from "$lib/components/layout/Breadcrumbs.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import { locale, t } from "$lib/i18n/config";

  function toggleLanguage() {
    const next = $locale === "en" ? "es" : "en";
    locale.set(next);
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("preferred-locale", next);
    }
  }
</script>

<nav class="navbar header-nav" data-test-id="navbar">
  <div class="nav-left">
    <div class="nav-brand">
      <h3>
        <a href="/" data-test-id="nav-brand-link">{$t("layout.brand")}</a>
      </h3>
    </div>
    <div class="nav-breadcrumbs">
      <Breadcrumbs />
    </div>
  </div>
  <div class="nav-actions">
    <div class="collapsible toggle-button">
      <input id="collapsible1" type="checkbox" name="collapsible1" data-test-id="nav-collapsible" />
      <label for="collapsible1">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
      </label>
      <div class="collapsible-body">
        <button
          class="paper-btn btn-small"
          onclick={toggleLanguage}
          aria-label={$locale === "en" ? "Cambiar idioma a Español" : "Change language to English"}
          data-test-id="language-toggle-btn"
          style="margin-right: 0.5rem;"
        >
          {$locale === "en" ? "🇪🇸 Español" : "🇬🇧 English"}
        </button>
        <ThemeToggle />
      </div>
    </div>
  </div>
</nav>
```

---

### Task 4: Add Automated Unit Tests for the Selector

**Files:**
- Modify: `src/lib/components/layout/NavBar.test.ts`

**Interfaces:**
- Consumes: Svelte testing framework and `@testing-library/svelte`
- Produces: Test verification of language changing and correct ARIA tags

- [ ] **Step 1: Write Unit Test in `NavBar.test.ts`**
  - Add test block verifying the language selector button correctly switches locale on-click.

```typescript
import { locale } from "$lib/i18n/config";
import { fireEvent } from "@testing-library/svelte";

test("NavBar renderiza el selector de idioma y responde al clic", async () => {
  await loadTranslations("en", "/");
  let currentLocale: string = "";
  const unsubscribe = locale.subscribe((val) => {
    currentLocale = val;
  });

  component = mount(NavBar, { target: document.body });
  flushSync();

  const toggleBtn = document.body.querySelector('[data-test-id="language-toggle-btn"]') as HTMLButtonElement;
  expect(toggleBtn).toBeTruthy();

  // Trigger click to toggle from English ("en") to Spanish ("es")
  await fireEvent.click(toggleBtn);
  flushSync();

  expect(currentLocale).toBe("es");

  unsubscribe();
});
```

- [ ] **Step 2: Run Unit Tests**
  - Execute `pnpm test run` and verify all tests pass perfectly.

- [ ] **Step 3: Run Production Build**
  - Execute `pnpm build` to confirm zero compilation errors.
