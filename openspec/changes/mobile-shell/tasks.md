# Tasks

## 1. Dashboard on narrow viewports

- [ ] 1.1 Replace the dashboard's `.row`/`.col-8`/`.col-4` containers with a local `dashboard-grid` that keeps two tracks on wide viewports and collapses to one at ≤900 px; verify at 390 that `document.scrollWidth` equals the viewport width and at 1440 that pending and statistics remain side by side.
- [ ] 1.2 Replace the statistics card's `.row`/`.col-6` grid with a `stats-grid` of two equal columns; verify at 390 that the four labels do not wrap one word per line and the card stays inside the viewport.
- [ ] 1.3 Add a dashboard render test that mounts `+page.svelte` with the overview service mocked and asserts that the pending section, the statistics section and the four stat items render inside the new grid containers; run it with `pnpm exec vitest run src/routes/dashboard-page.test.ts`.

## 2. Mobile drawer

- [ ] 2.1 Make the mobile drawer opaque using `--main-background`, size it with `min(20rem, 85vw)`, and render a backdrop button while it is open; verify at 390 that page text is not readable through the drawer and the backdrop separates it from the page.
- [ ] 2.2 Add a mobile-only close control inside the drawer with an accessible name and a 44×44 target, and add the EN/ES keys for the drawer and sidebar-control labels; verify at 390 that the control is visible, closes the drawer, and `pnpm validate:i18n` passes.
- [ ] 2.3 Extend `SidebarUiStore` with `open(trigger)`, `toggle(trigger)` and `close()` that returns focus to the recorded trigger, and pass the navbar control's element from `NavBar`; verify focus lands on the menu control after closing.
- [ ] 2.4 Close the drawer on Escape, backdrop click and route change; verify each path in the sidebar tests (dispatch Escape, click the backdrop, update the mocked page URL and flush).
- [ ] 2.5 Apply `inert` to `<main>` and `overflow: hidden` to the body while the drawer is open, using the same `SidebarUiStore` instance returned by `initStoreContext`; verify at 390 that keyboard focus cannot reach page content and the background does not scroll.
- [ ] 2.6 Update the sidebar tests to cover the open class, backdrop presence, all dismissal paths, focus return and the accessible labels; run `pnpm exec vitest run src/lib/client/components/layout/sidebar`.

## 3. Verification

- [ ] 3.1 Run `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`, fixing every failure.
- [ ] 3.2 Walk the app at 1440×900 and 390×844 in light and dark: confirm the dashboard has no horizontal scroll, open and dismiss the drawer with the close control, Escape and a backdrop click, and navigate from a drawer link; confirm no focus or scroll leaks behind the open drawer.
