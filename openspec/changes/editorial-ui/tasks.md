# Tasks

## 1. Tooling and theme

- [ ] 1.1 Add `tailwindcss`, `@tailwindcss/vite`, `daisyui` and the self-hosted Inter, Newsreader and Material Symbols packages; add `tailwindcss()` to `vite.config.ts`; make `src/app.css` the Tailwind entry and remove `papercss` and its import; verify `pnpm build` succeeds and the dev server serves Tailwind utilities.
- [ ] 1.2 Define the Academic Notebook light theme in `app.css` (`@theme` tokens plus `@plugin "daisyui/theme"`): warm paper canvas, white surfaces, ink text, Ink Blue primary, muted semantic colors, 4/8 px radii, 1 px border, no depth/noise; verify computed surfaces, primary button and typography on a migrated page.
- [ ] 1.3 Add the dark theme from the Stitch dark pass as a second `@plugin "daisyui/theme"` with `prefersdark`, plus the `--cn-*` dark surfaces; change `themeStore` and the `app.html` pre-paint script to write `data-theme` instead of the `.dark` class and update `theme.svelte.test.ts`; verify the toggle persists, there is no light flash on reload, and text, secondary text, primary buttons and semantic chips meet AA in both themes.
- [ ] 1.4 Add the editorial base layer: page canvas, body typography, heading scale, tabular-number utility, focus ring, selection, hairline defaults and the `@media print` light-token override; verify headings use Newsreader, UI uses Inter, numeric table cells use tabular figures, and printing uses the light palette.

## 2. Primitives

- [ ] 2.1 Rebuild `Button`, `Card` and `Badge` on daisyUI classes and the editorial tokens, using complete static class strings (not `badge ${tone}` or `background-${type}`) and mapping `btn-danger` to `btn-error`; keep the default button neutral rather than making every action primary; verify primary, ghost, outline, destructive and small variants render at 32 px, and cards use the white surface with a 1 px border and 8 px radius.
- [ ] 2.2 Rebuild the form primitives (inputs, selects, textareas, checkboxes, error text) on daisyUI with 32 px control height and the editorial focus ring; verify the faculty, subject, period, commission, assignment, enrollment and person modals still submit and show validation.
- [ ] 2.3 Restyle `DialogBase` and `ConfirmDialog` with the editorial modal surface and ink backdrop, keeping the native `<dialog>` focus trap, Escape handling and focus return; verify the existing dialog tests and a delete confirmation.
- [ ] 2.4 Restyle `Toast`, `ToastContainer`, `ErrorSpan` and `StatItem`; verify success, error and warning toasts keep their colors, auto-dismiss behavior and contrast in both themes.
- [ ] 2.5 Rebuild the table layer (`ResponsiveTable` plus the table components) with daisyUI `table` and editorial density: 40 px rows, 32 px header, horizontal rules only and no zebra striping in dark; replace the invalid mobile `<td>`-inside-`<div>` rendering with a valid row snippet or block rows, and delete the unused `<style lang="scss">`; verify the roster, faculties and periods lists at 1440 and 390 in both themes.
- [ ] 2.6 Rebuild `PageHeader`, `RowActions`, `EmptyState` and the editorial display primitives (`Chip`, `Callout`, `MetricCard`/`MetricStrip`, `Tabs`, `ProgressBar`, `Avatar`) plus the overview/attendance cell primitives; replace the dead `popover`/`data-popover-*` legend with a working tooltip or inline legend, and keep `<details>/<summary>` for row disclosures; verify the title scale, one primary row action plus disclosure, empty-state CTAs, tab links and the 44 px coarse-pointer targets.
- [ ] 2.7 Update the unit tests that assert PaperCSS structure, classes or emoji: `overview.test.ts` (`btn-success`, cell tag, emoji, dead popover attrs), `AttendanceGrid.test.ts` (striping, header structure, `✓`/`–`), `StatItem.test.ts` (badge classes), `RowActions`/row/table tests (keep `<details>` and test ids), `Sidebar.svelte.test.ts` (`aside`, open/collapsed, `h6`), `NavBar`/`LanguageToggle` tests (first button, flags), `theme.svelte.test.ts` (`.dark` → `data-theme`), and the form tests that rely on real `input`/`select` elements; verify the client suite passes before migrating pages.

## 3. Shell

- [ ] 3.1 Rebuild `+layout.svelte` as the editorial shell: fixed 240 px sidebar and 56 px header on desktop, fixed top header and bottom navigation on mobile, main offset and capped at 1600 px; verify no horizontal scroll at 1440 and 390.
- [ ] 3.2 Restyle `NavBar`, brand, breadcrumbs, language and theme controls for the new header; verify the compact breadcrumb remains visible at 390 and the parent entry still navigates.
- [ ] 3.3 Restyle the desktop `Sidebar` and its context sections with the editorial surfaces, labels and active tint; add `aria-current="page"` to the active destination and verify the context lists still switch subjects, periods and commissions.
- [ ] 3.4 Replace the mobile menu toggle and drawer state with the four-destination bottom navigation (Inicio, Facultades, Periodos, Alumnos), safe-area padding and `aria-current`; remove the now-unused `SidebarUiStore`/drawer code and update the shell tests.
- [ ] 3.5 Add the editorial shell tests: desktop sidebar/header render, mobile bottom navigation render, current destination state and theme switch; run them with `pnpm exec vitest run src/lib/client/components/layout src/routes`.

## 4. Pages

- [ ] 4.1 Migrate the dashboard to the editorial 12-column layout with module cards, the pending list and the statistics block; verify 1440 uses the editorial grid, 390 stacks without horizontal scroll and the statistics stay readable.
- [ ] 4.2 Migrate faculties, subjects and periods lists plus their modals and row actions; verify create, edit and delete flows and the 40 px table density at 1440 and 390.
- [ ] 4.3 Migrate the commissions list, the pending-enrollment block and the commission roster; verify the pending assignment flow and the student links in both viewports.
- [ ] 4.4 Migrate the period and commission overview grids, including headers, status cells, legend and sticky first column; replace the dead popover legend and align the status glyphs, colors and accessible names with the legend; verify the cursada cells still link to the correct commission and the grid scrolls inside its container at 390.
- [ ] 4.5 Migrate the cursada attendance page, commission attendance page, attendance cells and take mode; verify striping, header labels, tap targets, the pending "sin registrar" state and the swipe/take flow at 390 in both themes.
- [ ] 4.6 Migrate the assignments page, corrections flow, period-subjects page, persons registry (converting the manual table to the shared `DataTable`), person detail and their modals; verify every route renders with the editorial shell and no PaperCSS class remains.

## 5. Cleanup and verification

- [ ] 5.1 Remove the dead sketch utilities, PaperCSS references, local `gap-2`, dead popover/collapsible classes and unused CSS from `app.css`; update the stack references in `AGENTS.md`/`README.md` if they mention PaperCSS or the sketch system; verify `grep -R "paper-btn\|sketch-\|papercss" src` returns nothing.
- [ ] 5.2 Run `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`, fixing every failure.
- [ ] 5.3 Run the full route walkthrough at 1440×900 and 390×844 in light and dark: dashboard, faculties, subjects, periods, commissions, roster, overview, attendance, take mode, registry and person detail; capture screenshots and confirm the shell, density, focus states and theme switch.
- [ ] 5.4 Confirm the change did not add Stitch-only features or alter routes, data or i18n keys; compare the route list and the rendered copy before closing the change.
