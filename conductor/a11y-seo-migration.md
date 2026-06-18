# Accessibility (a11y) and SEO Enhancements Plan

## Objective

Elevate the application's automated Google Lighthouse audits to a perfect **100/100** in both **Accessibility (a11y)** and **SEO** across all routes. This involves dynamically aligning document language attributes with the selected locale, filling in crucial metadata (descriptions and dynamic titles) within the HTML head, and resolving structural heading hierarchy skips.

## Key Files & Context

- **Global Layout & Shell**:
  - `src/app.html`: The HTML wrapper.
  - `src/routes/+layout.svelte`: The parent layout loaded on every route.
- **Components & Tables**:
  - Headings inside various Svelte components and route pages.

## Implementation Steps

### 1. Dynamic HTML Language Synchronization (a11y)

- **Problem**: `app.html` has a hardcoded `lang="en"`. When a user toggles the language to Spanish (`es`), screen readers still read the content with English pronunciation rules, which is a major accessibility violation.
- **Fix**: Synchronize SvelteKit's active i18n locale store directly with the HTML document on the client side.
  - In `src/routes/+layout.svelte`, add a Svelte `$effect` or reactive subscription:

    ```typescript
    import { locale } from "$lib/i18n/config";

    $effect(() => {
      if (typeof document !== "undefined" && $locale) {
        document.documentElement.lang = $locale;
      }
    });
    ```

### 2. Standardized Head Metadata (SEO)

- **Problem**: Currently, the application has no `<meta name="description">` tag in its `<head>`, resulting in a capped SEO score (80/100) and poor search engine indexing results.
- **Fix**: Integrate a reactive, localized `<svelte:head>` block in the parent layout `src/routes/+layout.svelte` to dynamically inject optimized search meta tags and dynamic page titles:
  ```svelte
  <svelte:head>
    <title>{$t("layout.brand")} - {$t("layout.dashboard")}</title>
    <meta
      name="description"
      content="Class Notes - A robust and accessible academic management system to organize faculties, subjects, periods, and student grading with a sketchy aesthetic."
    />
    <meta name="robots" content="index, follow" />
  </svelte:head>
  ```

* Also, add page-specific, localized titles using `<svelte:head>` inside individual Svelte routes (such as the faculties, subjects, and periods views) so the browser tab title changes dynamically to match the active context (e.g., "Faculties - Class Notes", "Subjects - Class Notes").

### 3. Structural Heading Hierarchy Alignment (a11y)

- **Problem**: Svelte route views use `<h2>` for their main page titles (e.g. `<h2>Gestionar Periodos</h2>`), but Card wrappers inside use `<h4>` or `<h5>` for subheaders (e.g., `<h4 class="card-title">`). Skipping heading levels (e.g., from `<h2>` straight to `<h4>`) violates structural HTML semantics, which degrades screen reader navigation and is flagged by Lighthouse.
- **Fix**: Systematically check and adjust Svelte components and page templates to form a perfect, continuous heading hierarchy. Card headers within any page using `<h2>` main titles will be standardized to use `<h3>` elements instead.

## Verification & Testing

1. Run `pnpm test run` to verify that all Svelte tests continue to pass 100%.
2. Run SvelteKit build `pnpm build` to ensure error-free compilation.
3. Boot the development server and run automated Lighthouse audits on the pages in both Spanish and English, checking that both a11y and SEO scores hit a flawless **100/100**.
