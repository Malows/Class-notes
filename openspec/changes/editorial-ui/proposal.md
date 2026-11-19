# Proposal

## Why

The sketch aesthetic carried the app when it was small, but it no longer fits a product with 17 routes, dense rosters, attendance grids and 63 shared components. The hand-drawn borders and shadows compete with the data, the shell wastes horizontal space, and the mobile navigation does not scale. PaperCSS also locks the UI out of the component patterns the app now needs.

Stitch provides a complete editorial design system for this domain — **Academic Notebook System**: warm paper, ink typography, Newsreader headings, Inter UI and tabular numbers, 1px hairlines, 40 px table rows, 32 px controls, and a fixed sidebar/header shell on desktop with a bottom navigation on mobile. Replacing the visual foundation and the shell with that system gives the existing features room to breathe without inventing new product behavior.

## What Changes

- **Styling stack**: add Tailwind CSS 4 with `@tailwindcss/vite` and daisyUI 5; remove PaperCSS and the sketch utilities.
- **Theme**: a custom daisyUI theme built from the Stitch tokens (warm paper canvas, white surfaces, ink text, Ink Blue primary, muted semantic colors, 4/8 px radii, 1 px borders, no shadows), plus a dark theme derived from the same tokens.
- **Shell**: fixed sidebar and header on desktop; fixed header and bottom navigation on mobile. The drawer design from the canceled `mobile-shell` change is not carried forward.
- **Components**: rebuild Button, Card, Badge, tables, dialogs, toasts, form controls, page header, row actions and empty states on daisyUI/Tailwind while preserving their current behavior and test ids.
- **Density and typography**: Newsreader for headings, Inter for UI and tabular numbers, uppercase micro-labels, 40 px table rows, 32 px controls, 4 px spacing grid.
- **Assets**: self-host Inter, Newsreader and the icon set; no runtime CDN.
- **Preserved behavior**: routing, data, i18n, dialogs, confirmations, toast keys, touch targets and content measure. The archived `ui-consistency-pass` requirements remain the behavioral baseline.
- **Light first, dark second**: the dark palette and component rules land from the Stitch design pass, then are applied after the light theme is stable.

## Capabilities

### New Capabilities

- `academic-design-system`: the editorial visual language (tokens, typography, surfaces, density, components, light/dark themes, status semantics, icons) that replaces the sketch system.

### Modified Capabilities

- `sketch-design-system`: removed; its behavioral requirements (page header, row actions, link treatment, empty states, touch targets, localized feedback, content measure) move into `academic-design-system` with the new visual rules.
- `hierarchical-navigation`: the application shell changes to the fixed sidebar/header layout on desktop and the fixed header/bottom navigation on mobile.
- `dashboard`: the dashboard adopts the editorial 12-column layout with the pending and statistics blocks.

## Impact

- **Dependencies**: `tailwindcss`, `@tailwindcss/vite`, `daisyui`, font and icon packages; `papercss` removed.
- **Code**: `vite.config.ts`, `src/app.css`, `src/routes/+layout.svelte`, `NavBar`, `Sidebar`, all shared primitives, all list/table/grid components and all 17 pages (81 Svelte files).
- **Tests**: assertions on PaperCSS classes and shell structure; most tests already use `data-test-id` or text.
- **No API, data or schema changes**.
- **Out of scope**: Stitch-only features such as ⌘K search, export, quick correction, vacancy balance, career fields, activity log, bulk assignment and any new route.
