# Proposal

## Why

The application shell does not work on a phone. At 390 px the dashboard measures 427 px wide because its PaperCSS `.row`/`.col-*` grid never stacks, so the pending and statistics cards are clipped. The mobile drawer opens transparent over the page with no backdrop, no Escape or click-outside dismissal, no scroll lock, and no `inert` background: the page stays readable and scrollable behind it. A teacher opening the app between classes cannot read the dashboard and cannot use the menu.

## What Changes

- **Dashboard layout**: the main pending/statistics columns stack on narrow viewports and the page SHALL NOT scroll horizontally at 390 px. The statistics block keeps a two-by-two grid inside its card.
- **Mobile drawer**: on narrow viewports the sidebar behaves as an opaque overlay with a page backdrop. It closes with Escape, a backdrop click, or a route change, and returns focus to the navbar menu control.
- **Background isolation**: while the drawer is open, the page content is `inert` and the document cannot scroll.
- **Sidebar collapse control**: gets an accessible name and a 44×44 target on coarse pointers.
- **No content redesign**: the dashboard's information architecture, breadcrumbs, sidebar link resolution and copy stay as they are.

## Capabilities

### New Capabilities

None. The behavior belongs to capabilities that already own the dashboard and the navigation shell.

### Modified Capabilities

- `dashboard`: adds a requirement for its layout on narrow viewports (stacked sections, no horizontal overflow).
- `hierarchical-navigation`: adds a requirement for the sidebar as a mobile drawer (opaque overlay, dismissal paths, focus return, inert background).

## Impact

- **Components**: `src/routes/+page.svelte`, `DashboardStats.svelte`, `Sidebar.svelte`, `SidebarHeader.svelte`, `src/routes/+layout.svelte`, `app.css`, `SidebarUiStore`.
- **Tests**: `Sidebar.svelte.test.ts`, `DashboardPending.svelte.test.ts`, a dashboard page/layout test, and an accessibility assertion for the collapse control.
- **No data, API or schema changes**.
- **Out of scope**: breadcrumb entity names, sidebar links that resolve to another cursada, remaining English strings and the default 404, delivery-grid semantics, and the dashboard's empty-space/content redesign. Those are separate changes.
