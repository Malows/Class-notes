# Design

## Context

See `proposal.md` — Why.

- PaperCSS provides `.row` (`flex-flow: row wrap`) but `.col-8`/`.col-4` are fixed percentages (66.6 % / 33.3 %) with no breakpoints. The dashboard uses them in `src/routes/+page.svelte` and `DashboardStats.svelte`, so its columns never stack.
- The root font size is 20 px (PaperCSS), so the `14rem` measure and `1rem` card padding are larger than they look in a 16 px reference.
- At ≤768 px `Sidebar.svelte` is a fixed `<aside>` translated off-canvas. It has no background (the declaration is commented out), no backdrop, and no dismissal logic. The navbar menu control and the sidebar share `SidebarUiStore` through Svelte context.
- `main` is a sibling of the sidebar inside `.layout-body` in `src/routes/+layout.svelte`.
- Tests run in jsdom: media queries and layout geometry are not evaluated, so state-driven behavior (open class, backdrop, inert, focus) must be assertable without CSS.

## Goals / Non-Goals

**Goals:**

- Dashboard fits 390 px with no horizontal page scroll and legible statistics.
- The mobile drawer reads as a modal overlay: opaque, backed by a dimmed page, dismissible, and isolated from the page behind it.
- Desktop sidebar behavior stays unchanged.

**Non-Goals:**

- No dashboard content redesign, breadcrumb names, sidebar link resolution, i18n cleanup or custom 404 (separate changes).
- No new drawer focus trap beyond making the page content inert; the navbar stays available.
- No change to the data model, APIs or URL scheme.

## Decisions

### D1. Dashboard uses a local CSS grid, not PaperCSS columns

Replace the dashboard's `.row/.col-8/.col-4` with a `dashboard-grid`: two `minmax(0, …)` tracks at wide sizes, one full-width track at ≤900 px. The statistics card gets its own `stats-grid` with `repeat(2, minmax(0, 1fr))`.

Why not override `.row > [class*="col-"]` in `app.css`: that would change every page that uses PaperCSS columns and hide the root cause. A local grid keeps the fix scoped and makes the intended breakpoint explicit. `minmax(0, …)` is required so card content can shrink instead of forcing overflow.

### D2. The drawer is an overlay with an opaque surface and a backdrop

At ≤768 px the sidebar becomes a fixed overlay with `background-color: var(--main-background)` (PaperCSS supplies the light and dark values), a width of `min(20rem, 85vw)`, and a backdrop button covering the viewport below it. The drawer also gets its own mobile-only close button because the navbar control sits under the backdrop.

Why a backdrop button instead of a click-handling `div`: a button is keyboard reachable, has an accessible name, and avoids non-interactive click-handler warnings.

### D3. Dismissal is state-driven

`SidebarUiStore` gains `open(trigger)`, `close()` and a `trigger` reference. The navbar menu control calls `toggle(event.currentTarget)`; closing returns focus to that trigger. The sidebar closes on Escape (window keydown), on the backdrop's click, and on a route change (`$effect` on `page.url.pathname`). The route effect only closes when the drawer is open, so the initial mount does not steal focus.

Why store the trigger: the close can happen from three places, and querying the DOM for the navbar button would couple the drawer to a test id. On the desktop the control is hidden, so `focus()` is only attempted when a trigger was recorded.

### D4. The layout owns background isolation

`initStoreContext()` returns the created `SidebarUiStore` so `+layout.svelte` can read the same instance without a module singleton. The layout applies `inert` to `<main>` and toggles a `drawer-open` class on `document.body`; `app.css` maps that class to `overflow: hidden` inside the mobile breakpoint.

Why not have the sidebar mutate `main` directly: the layout owns those elements, and the store is already provided per request through context. `inert` is the native primitive for removing the page from focus and accessibility trees; no custom focus trap is needed.

### D5. The collapse control gets a name and a touch target

`SidebarHeader` adds `aria-label` (collapse/expand) and a `pointer: coarse` minimum of 44×44. The mobile drawer's close button uses the same minimum. New `layout.*` keys cover both labels in EN and ES.

### D6. Tests target state, not media queries

Sidebar tests toggle the store and assert the open class, backdrop presence, Escape/backdrop dismissal, route-change dismissal and focus return. The dashboard's responsive arrangement is verified in the rendered walkthrough at 390 and 1440; jsdom cannot evaluate the media query.

## Risks / Trade-offs

- **Changing `initStoreContext` return type** → Only `+layout.svelte` consumes it; update the one call site and keep the existing `setContext` behavior.
- **`inert` support** → Supported by current Chromium, Firefox and Safari; the server still renders normal markup, so older browsers fall back to the backdrop and Esc.
- **Backdrop covers the navbar** → The drawer provides its own close button and Esc/backdrop dismissal; focus returns to the menu control after closing.
- **Route-change effect runs on first mount** → Guard with `if (sidebarUi.isOpen)` before closing.
- **Panel width on small phones** → `min(20rem, 85vw)` leaves a visible backdrop strip and prevents the drawer from hiding its own dismissal affordance.
- **Dashboard grid differs from PaperCSS pages** → Scope it to the dashboard; other pages keep their existing layout.

## Migration Plan

Presentation only: no schema, data or API changes. One commit series gated by `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:client`, plus the rendered walkthrough at 1440×900 and 390×844 in light and dark. Rollback is reverting the layout and drawer commits.
