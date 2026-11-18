# Design

## Context

See `proposal.md` — Why.

- Today the UI is PaperCSS 1.9 plus ~110 lines of custom sketch utilities in `src/app.css`. PaperCSS supplies element styles (body, headings, tables, buttons, forms) and classes such as `.row/.col-*`, `.card`, `.table-hover`, `.badge` and `.form-group`. The app adds `.paper-btn`, `.sketch-border`, `.sketch-shadow` and `.link-quiet`.
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

Install `tailwindcss`, `@tailwindcss/vite` and `daisyui`; add `tailwindcss()` to `vite.config.ts`; make `src/app.css` the Tailwind entry (`@import "tailwindcss"; @plugin "daisyui";`). Remove the PaperCSS import and the `papercss` dependency.

Why not keep PaperCSS alongside: daisyUI and PaperCSS both style `.card`, `.btn`, `.badge`, `.input` and element selectors. A long hybrid period would make every screen unpredictable. The migration happens on a branch; PaperCSS is removed in the first commit, and pages are restyled before merge.

### D2. Two token layers: Tailwind theme + daisyUI theme

- Tailwind `@theme` defines the editorial fonts, the surface palette (`--color-surface`, `--color-surface-lowest`, `--color-on-surface`, `--color-outline`, …), the type scale (`--text-display-lg`, `--text-headline-*`, `--text-title-md`, `--text-body-*`, `--text-label-*`) and tabular-number utilities.
- A custom daisyUI theme (`@plugin "daisyui/theme"`) maps those tokens to component semantics: `base-100/200/300`, `primary`, `secondary`, `accent`, `neutral`, `info`, `success`, `warning`, `error`, their `-content` pairs, `--radius-field`, `--radius-box`, `--border: 1px`, `--depth: 0`, `--noise: 0`.

Why two layers: daisyUI components need semantic names (primary, base-100), while the Stitch screens use surface/typography names. Keeping both avoids hard-coding daisyUI colors into Tailwind utilities.

Light mapping: `base-100` = white content surface, `base-200` = warm paper canvas, `base-300` = `surface-container`; `base-content` = ink `#1b1c18`; `primary` = Ink Blue `#2f5fe0`; `secondary` = muted emerald `#006d3a`; `accent` = tertiary `#7c4300`; `neutral` = `#5c5c57`; `success` = `#1b8049`; `warning` = `#b26200`; `error` = `#c5221f`; `info` = `#0045c5`. Radii: field 4px, box 8px, selector 4px.

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

`themeStore` stops toggling the `.dark` class and sets `data-theme="academic"` or `data-theme="academic-dark"` on `<html>`, preserving localStorage and the system preference fallback. The daisyUI theme declares both, with `academic` default and `academic-dark` as `prefersdark`.

Why not keep `.dark`: daisyUI themes are selected with `data-theme`; keeping a parallel `.dark` system would double the palette.

### D7. Dark palette

Use a warm dark companion rather than a neutral black, preserving the archival paper idea:

`base-100 #1b1a17`, `base-200 #141310`, `base-300 #2a2823`, `base-content #eee9df`; primary `#b5c4ff` with `#00164e` content; secondary `#7cda99` / `#00210e`; accent `#ffb77a` / `#2e1500`; neutral `#c3c5d7` / `#1b1c18`; info `#9db4ff` / `#00164e`; success `#4ade80` / `#052e16`; warning `#fbbf24` / `#2e1500`; error `#f87171` / `#450a0a`. Hairlines use `#3a3730`; hover tints use `#262521`. The exact values are validated by the Stitch dark pass and WCAG checks before implementation.

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

Most tests already use `data-test-id` or text. Update the overview test that asserts `btn-success` and any shell structure tests. Add route smoke checks for the shell (desktop sidebar/header, mobile bottom nav) and the theme switch. Verify with `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server`, `pnpm test:client`, and a Playwright walkthrough at 1440×900 and 390×844 in light and dark.

## Risks / Trade-offs

- **Big-bang CSS switch** → Work on a dedicated branch and migrate a vertical slice first; do not merge with mixed PaperCSS/daisyUI pages.
- **Component class collisions (`.card`, `.btn`, `.table`, `.badge`, `.input`)** → Remove PaperCSS before restyling pages; do not load both frameworks long-term.
- **Density regression** → 40 px rows and 32 px controls are denser than today; verify touch targets remain 44 px on coarse pointers and that tables stay readable at 390 px.
- **Font and icon payload** → Self-hosted variable fonts and a subsetted icon font; check bundle size and preload the two primary faces.
- **Theme drift** → One token source; no ad-hoc hex values in components. Dark palette is validated for AA before merge.
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

- Final dark palette values and whether the dark canvas should be warm near-black (proposed) or neutral graphite — the Stitch dark pass will decide.
- Whether the icon family should cover every existing emoji or only the navigation/action glyphs in the first pass. Default: cover navigation, actions, statuses and empty states; keep emoji only where no icon matches.
