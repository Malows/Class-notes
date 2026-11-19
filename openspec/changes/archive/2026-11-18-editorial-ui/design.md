# Design

## Context

See `proposal.md` — Why.

- Today the UI is PaperCSS 1.9 plus ~110 lines of custom sketch utilities in `src/app.css`. PaperCSS supplies element styles (body, headings, tables, buttons, forms) and classes such as `.row/.col-*`, `.card`, `.table-hover`, `.badge`, `.paper-btn` and `.form-group`. The app adds `.sketch-border`, `.sketch-shadow` and `.link-quiet`, and several components already contain aspirational Stitch class names that resolve to nothing.
- There is no Tailwind today. Vite is v8; `@tailwindcss/vite` 4.3.5 supports Vite 8 and daisyUI 5.8.1 is a Tailwind plugin.
- Shared primitives live in `src/lib/client/components/common` and are consumed by 81 Svelte files across 17 routes. Most tests use `data-test-id` or visible text; only the overview grid test asserts a PaperCSS class (`btn-success`).
- Stitch supplies the "Academic Notebook System" tokens and 19 reference screens. Its HTML uses Tailwind CDN, Material Symbols and a custom utility vocabulary (`bg-surface-container-lowest`, `text-on-surface`, `font-headline-sm`, `tnum`); the HTML is a reference, not copy-paste source.
- `ui-consistency-pass` is archived, so the Page Header, Row Actions, Empty States, Link Treatment, Localized Feedback, Touch Targets and Content Measure requirements are now part of the main specs and must survive the restyle.
- `mobile-shell` was canceled; Stitch shows a mobile top header plus bottom navigation, not a drawer.

## Goals / Non-Goals

**Goals:**

- One styling system (Tailwind 4 + daisyUI 5) and one token source (Academic Notebook) for every screen.
- Editorial shell on desktop and a bottom-navigation shell on mobile.
- Preserve every existing feature, route, interaction, i18n key, test id and accessibility behavior.
- Light theme first, then dark, both from the same semantic tokens.

**Non-Goals:**

- No new product features from the Stitch screens (⌘K search, export, quick correction, vacancy balance, career fields, activity log, bulk assignment).
- No API, data, schema or routing changes.
- No component-library extraction beyond the primitives the migration needs.
- No attempt to reuse the Stitch HTML verbatim.

## Decisions

### D1. Tailwind 4 + daisyUI as the only styling layer

Install `tailwindcss`, `@tailwindcss/vite` and `daisyui`; add `tailwindcss()` to `vite.config.ts`; make `src/app.css` the Tailwind entry (`@import "tailwindcss"; @plugin "daisyui" { themes: false; }` plus the two custom themes). Remove the PaperCSS import and the `papercss` dependency.

Why not keep PaperCSS alongside: daisyUI and PaperCSS both style `.card`, `.btn`, `.badge`, `.input` and element selectors. A long hybrid period would make every screen unpredictable. The migration happens on a branch; PaperCSS is removed in the first commit, and pages are restyled before merge.

### D2. Two token layers: Tailwind theme + daisyUI theme

- Tailwind `@theme` defines the editorial fonts, the surface palette (`--color-surface`, `--color-surface-lowest`, `--color-on-surface`, `--color-outline`, …), the type scale (`--text-display-lg`, `--text-headline-*`, `--text-title-md`, `--text-body-*`, `--text-label-*`) and tabular-number utilities.
- A custom daisyUI theme (`@plugin "daisyui/theme"`) maps those tokens to component semantics: `base-100/200/300`, `primary`, `secondary`, `accent`, `neutral`, `info`, `success`, `warning`, `error`, their `-content` pairs, `--radius-field`, `--radius-box`, `--border: 1px`, `--depth: 0`, `--noise: 0`.

Why two layers: daisyUI components need semantic names (primary, base-100), while the Stitch screens use surface/typography names. Keeping both avoids hard-coding daisyUI colors into Tailwind utilities.

Light mapping by role (not by ordinal): `base-100` = content surface (cards, panels, white), `base-200` = page canvas (warm paper `#fbf9f2`), `base-300` = hairline `#c3c5d7`; `base-content` = ink `#1b1c18`; `primary` = Ink Blue `#2f5fe0`; `secondary` = muted emerald `#006d3a`; `accent` = tertiary `#7c4300`; `neutral` = `#5c5c57`; `success` = `#1b8049`; `warning` = `#b26200`; `error` = `#c5221f`; `info` = `#0045c5`. Radii: field/selector 4px, box 8px. `body` uses `bg-base-200`; cards use `bg-base-100`.

daisyUI does not expose a token for every editorial surface. Keep a small `--cn-*` layer for chrome, inputs, muted rows, overlays and chips: light `surface-input #ffffff`, `surface-chrome #fbf9f2`, `surface-muted #f5f4ed`, `surface-overlay #ffffff`, `border-control #747686`. Dark counterparts are listed in D7.

### D3. Self-hosted fonts and icons

Bundle `@fontsource-variable/inter` and `@fontsource-variable/newsreader`; bundle Material Symbols Outlined through `@fontsource/material-symbols-outlined`. No Google Fonts or other runtime CDN. Icon-only controls keep an accessible name; the existing emoji in grids, toasts and headers are replaced by the icon family where a semantic icon exists.

Why not `lucide-svelte`: the Stitch language uses Material Symbols consistently, and the font package is tree-shaken by unicode range. The icon font also keeps the visual language exact.

### D4. Shell: fixed sidebar/header desktop, bottom navigation mobile

Desktop: use the canonical Stitch shell — a 240 px fixed sidebar (`w-60`), a 48 px fixed header (`h-12`) and a main region with 36 px horizontal / 32 px vertical padding, offset by both and capped at 1600 px. The "Inicio" screen uses a slightly different 256 px/56 px shell; do not copy that variant.

Mobile (≤768 px): a fixed 64 px top header, a fixed 64 px bottom navigation with four primary destinations (Inicio, Facultades, Periodos, Alumnos), and content padded to `pb-28`-equivalent plus the safe-area inset. No drawer.

The existing sidebar context sections (subjects, periods, commissions) remain inside the desktop sidebar and in the mobile header context; the bottom navigation only covers primary destinations. Current-destination state is exposed with `aria-current="page"` and the editorial active tint.

The five commission-level routes (`students`, `attendance`, `overview`, `correct`, cursada `overview`) stay separate routes. Where Stitch uses a JS tab bar to switch between them, the app renders real links and marks the current one; tabs never hide routes.

### D5. Component mapping

| Current primitive | Editorial implementation |
|---|---|
| `Button` (`.paper-btn`) | `btn` with `btn-primary`, `btn-ghost`, `btn-outline`, `btn-error`, `btn-sm`; fixed 32 px height, 4 px radius, no shadow |
| `Card` | `card` / `card-body` with white surface, 1 px `outline-variant`, 8 px radius; serif card headings separated by a hairline |
| `Badge` | `badge` with semantic color and a 6 px dot; uppercase micro-label; no pill radius |
| Tables / `ResponsiveTable` | daisyUI `table` plus editorial density: 40 px rows, 32 px header, horizontal rules only; mobile cards restyled as list rows |
| `DialogBase` / `ConfirmDialog` | Native `<dialog>` retained; visual layer uses `modal` / `modal-box` styles with flat surface, 1 px border, ink veil backdrop |
| `Toast` / `ToastContainer` | daisyUI `alert` variants inside the existing toast region; no shadow |
| Forms | `input`, `select`, `checkbox`, `textarea`; 32 px standard height, 1 px border, focus ring 1 px primary + tint |
| `PageHeader` | serif `display-lg` / `display-lg-mobile`, optional Inter lead, primary action aligned right |
| `RowActions` | one `btn-sm` primary + `menu`/`dropdown` disclosure; destructive item after a separator |
| `EmptyState` | editorial card with icon, serif title, Inter description, one or two actions |
| `StatItem` | `MetricCard`: uppercase label, icon, tabular value, sublabel; `MetricGrid` and `MetricStrip` for repeated metrics |
| `Tabs` | real links with the active link marked; count badges styled as editorial stamps |
| `DataTable` | `ResponsiveTable` keeps its desktop/mobile split but adopts the 40 px editorial rows, sticky first column and a single set of `data-test-id` hooks |
| `SidePanel` / `InspectorRail` | optional 280–320 px contextual rail on commission screens; content column gets `min-width: 0` and its own scroll |
| `Callout` | info/warning callout for pending states, with icon and editorial tint |
| `ProgressBar` / `Avatar` | flat 6 px progress bar with optional marker; initials avatar for people |
| `MobileHeader` / `BottomNav` | fixed top header and four-destination bottom navigation with safe-area padding |
| Grids (`OverviewGrid`, `AttendanceGrid`) | keep CSS-grid layout; restyle cells, headers, zebra and status glyphs; sticky first column on horizontal scroll |

Seven routes have no Stitch reference (`/faculties`, subjects, periods list, `/periods`, period subjects, cursada overview, plus one detail variant); they are composed from these primitives rather than from a new screen design.

### D6. Theme switching

`themeStore` stops toggling the `.dark` class and writes `data-theme="classnotes"` or `data-theme="classnotes-dark"` on `<html>`. When no explicit preference is stored, the attribute is absent and daisyUI's `prefersdark` theme follows the system; the first manual toggle writes and persists an explicit value. Add a small blocking script in `app.html` that applies the stored `data-theme` before first paint, so dark mode does not flash the light canvas.

Why not keep `.dark`: daisyUI themes are selected with `data-theme`; keeping a parallel `.dark` system would double the palette.

### D7. Dark palette

Use a warm charcoal companion, not neutral grey, to keep the "paper at night" identity. The page is the darkest plane; cards rise one step. Borders are mandatory because the surface deltas are subtle.

| Token | Dark value |
|---|---|
| page / `base-200` | `#14140F` |
| card / `base-100` | `#1A1A14` |
| hairline / `base-300` | `#3A3A31` |
| sunken / progress track | `#0B0B08` |
| input | `#17170F` |
| chrome (sidebar/header/bottom nav) | `#191913` |
| muted row / table header | `#1F1F18` |
| overlay (menu, toast, modal box) | `#262620` |
| pressed / active neutral | `#2D2D26` |
| text | `#E8E6DC` |
| secondary text | `#B9B7AB` |
| muted text | `#8B8A7E` |
| disabled text | `#6E6D62` |
| icons / control border | `#8E8D80` / `#6B6A5E` |
| primary | `#B5C4FF` on `#00164E` |
| primary container | `#16408F` on `#DCE1FF` |
| secondary | `#7CDA99` on `#00210E` |
| accent | `#FFB77A` on `#2E1500` |
| success | `#63D68F` on `#00391C` |
| warning | `#F5B558` on `#2E1500` |
| error | `#FFB4AB` on `#690005` |
| info | `#8FD0F0` on `#00263A` |

Chips use solid tinted fills, not alpha: primary `#1C2A52`/`#C3D3FF`, success `#12301F`/`#9FE8B6`, warning `#33230C`/`#FFCF8F`, error `#3A1212`/`#FFB4AB`, info `#10283A`/`#A9D8F5`, pending `#1F1F18`/`#B9B7AB`. The pending chip is the third attendance state and must not read as an error.

Contrast: body text on page 14.8:1, secondary text 9.2:1, muted text 5.3:1, primary button 10.1:1, active sidebar 7.5:1, all semantic chips ≥8.2:1. The only low pair is the decorative hairline (1.6:1), so a hairline must never be the sole boundary of a control; control borders use `#6B6A5E` (3.0:1).

Stitch generated three dark reference screens (`Inicio`, `Comisiones`, `Padrón mobile`) from this palette. Their HTML is a visual reference only — the generated variants still contain stray light values, so this table is the source of truth.

### D8. Migration strategy: vertical slices on a branch

1. Tooling: Tailwind/daisyUI, theme tokens, fonts, icons, `app.css`; remove PaperCSS.
2. Primitives: Button, Card, Badge, Chip, Callout, MetricCard/MetricStrip, DataTable, forms, dialogs, toasts, PageHeader, RowActions, EmptyState, ProgressBar, Avatar.
3. Shell: layout, sidebar, header, breadcrumbs, bottom navigation, theme toggle.
4. Pages in order: dashboard → faculties → subjects → periods → commissions → roster → overview → attendance → take → registry → person detail → corrections.
5. Grid-specific polish and status semantics last.
6. Remove dead sketch utilities and PaperCSS references; run the full suite and the rendered walkthrough.

The seven routes without a Stitch reference are composed from the primitives in step 2. The five commission-level routes remain separate links even where Stitch shows a tab bar.

Each slice lands tests and a rendered check; the branch is not merged until every route is on the new system.

### D9. Tests and verification

Tests are the contract: `data-test-id` stays, `<a>` stays an `<a>` where tests assert `href`, and `<details>/<summary>` stays the disclosure implementation so the row/table tests keep working. Update the assertions that depend on PaperCSS or emoji:

- `overview.test.ts`: `btn-success`, the emoji content, the dead `data-popover-*` attributes and the cell `tagName`.
- `AttendanceGrid.test.ts`: striping class, header `a`/`span` structure and the `✓`/`–` glyphs.
- `StatItem.test.ts`: `badge`/`warning` class names.
- `Sidebar.svelte.test.ts`: `aside`, `.open`/`.collapsed`, the `h6` headings and the removed drawer toggle.
- `NavBar.test.ts` and `LanguageToggle.test.ts`: the first `<button>` and the flag emojis.
- `theme.svelte.test.ts`: `.dark` becomes `data-theme`.
- `RowActions`/row/table tests: keep `<details>/<summary>` and the existing `data-test-id`s.
- `FacultySubjectCheckboxes.test.ts` and `DeliveryForm.svelte.test.ts`: keep real `input`/`select` elements.
- Route tests: mostly `data-test-id`, `href` and text; verify they still pass after the shell rewrite.

Add route smoke checks for the shell (desktop sidebar/header, mobile bottom nav) and the theme switch. Verify with `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server`, `pnpm test:client`, and a Playwright walkthrough at 1440×900 and 390×844 in light and dark.

## Risks / Trade-offs

- **Big-bang CSS switch** → Work on a dedicated branch and migrate a vertical slice first; do not merge with mixed PaperCSS/daisyUI pages.
- **Component class collisions (`.card`, `.btn`, `.table`, `.badge`, `.input`)** → Remove PaperCSS before restyling pages; do not load both frameworks long-term.
- **Density regression** → 40 px rows and 32 px controls are denser than today; verify touch targets remain 44 px on coarse pointers and that tables stay readable at 390 px.
- **Font and icon payload** → Self-hosted variable fonts and a subsetted icon font; check bundle size and preload the two primary faces.
- **Theme drift** → One token source; no ad-hoc hex values in components. Dark palette is validated for AA before merge.
- **PaperCSS is unlayered** → Unlayered PaperCSS rules beat Tailwind's layers regardless of import order. Remove it in the same slice that adds Tailwind; do not attempt a long hybrid period.
- **Dynamic class strings are invisible to Tailwind** → Build complete class strings in maps (`success: "badge badge-success"`) instead of concatenating partial names like `badge ${badge}` or `background-${type}`.
- **`ResponsiveTable` renders `<td>` inside a `<div>` on mobile** → With SSR enabled this is invalid HTML. Replace the mobile rendering with a valid row snippet or a single table with block rows while migrating.
- **`<style lang="scss">` without Sass** → `ResponsiveTable` declares SCSS but no preprocessor is installed. Remove the block and use utilities.
- **Dark elevation inverts** → Light cards are the brightest surface; dark cards rise above a darker page. Map surfaces by role, never by token ordinal; borders are mandatory because the surface deltas are ~1.1:1.
- **Zebra disappears in dark** → Do not use daisyUI `table-zebra`; group rows with hairlines or section labels instead.
- **Printing** → Force the light tokens under `@media print` so attendance/roster printouts do not render a dark canvas.
- **Stitch dark variants contain stray light values** → Treat the generated screens as visual references; use the token table as the source of truth.
- **Stitch HTML is static and uses CDN classes** → Treat it as a layout/reference source; translate to local tokens and Svelte components, never copy the HTML.
- **Stitch has two desktop shells** → Adopt the canonical 240 px sidebar + 48 px header; do not copy the 256 px/56 px "Inicio" variant.
- **Stitch HTML diverges per screen** → Every screen carries its own Tailwind CDN config, mock data, inline JS and custom utilities (`text-on-surface`, `font-headline-sm`, `pt-safe`). Translate to one theme and Svelte state; never copy markup wholesale.
- **ResponsiveTable duplicates the DOM** → It renders desktop table and mobile cards at once today, so tests must keep scoping by `data-test-id`; verify text assertions still use `getAllBy*`.
- **Seven routes have no Stitch reference** → Compose them from the primitives; do not invent new layouts or features.
- **Stitch screens are 2560 px wide** → Re-measure density at 1280/1440; avoid the Stitch `min-w-[1200px]` table widths that cause horizontal scroll.
- **Large diff** → Commit by slice (tooling, primitives, shell, pages) with the full suite green at each checkpoint.

## Migration Plan

No data, API or schema changes. Ship as a branch of commits gated by the full check suite and a rendered walkthrough in both themes. Rollback is reverting the branch; the old PaperCSS system remains in git history.

## Open Questions

- Whether the icon family should cover every existing emoji or only the navigation/action glyphs in the first pass. Default: cover navigation, actions, statuses and empty states; keep emoji only where no icon matches.
- Whether the dark canvas should stay warm olive or fall back to neutral graphite if the visual review reads "military"; the warm palette is the current decision.
