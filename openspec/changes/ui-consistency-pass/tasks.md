# Tasks

## 1. Defectos de las grillas

- [x] 1.1 Replace the grid column header with a single-line abbreviated label (`TP1` derived from the trailing number, else initials) with the full title in `title` and `aria-label`, raise the column to `3.2rem` and reserve the header row height; verify at 1440 and 390 that no header overlaps the first data row and that the full title appears on hover.
- [x] 1.2 Fix the attendance row striping so alternation starts on the first data row (header out of the striped selector or `:nth-child(even)`); verify by inspecting that the first data row is not striped and the second is.
- [x] 1.3 Make the cursada summary cells navigate to the row's own commission (commission slug looked up from the row's `commission_id`); verify with a test asserting the href of a cell in a cursada grid and that a row without commission keeps a non-navigating cell.
- [x] 1.4 Remove the floating sidebar toggle on narrow viewports after confirming the navbar control is present, and verify at 390 that no control overlaps page content.

## 2. Shell y navegación

- [ ] 2.1 Create `PageHeader` (title, optional lead, primary action slot, optional secondary row) and make `CommonPage`/`PageWithAdd` thin wrappers; verify the existing page tests still pass.
- [ ] 2.2 Migrate every page that uses a raw `<h2>` (the two attendance grids, take mode, the ported overview and correct screens) to `PageHeader`; verify at 1440 that all screen titles render at the same scale and position.
- [ ] 2.3 Reduce the navbar brand to logo scale so the page title is the most prominent text in the content area; verify at 1440 and 390.
- [ ] 2.4 Add the compact breadcrumb for narrow viewports (current resource + parent, parent navigable) while keeping the full trail on wide screens; verify at 390 that the trail is visible and its parent entry navigates.
- [ ] 2.5 Add `[Asistencia]` to the period row's cursada actions and remove the cursada attendance button from the commissions page; update the row test to assert the new entry point and verify the commissions page no longer offers it.

## 3. Listas y acciones

- [ ] 3.1 Apply the content measure token to the page container and confirm grids opt out; verify at 1440 that list actions sit near their row instead of the viewport edge.
- [ ] 3.2 Create `RowActions` (one primary action plus a disclosure reusing the popover pattern) and migrate the commission, subject, period, subject-period and assignment rows; verify the disclosure opens, lists the secondary actions and is keyboard reachable.
- [ ] 3.3 Separate destructive actions inside the disclosure (after a separator) and keep the existing confirmation; update the row tests to open the disclosure before asserting edit/delete, and verify the whole client suite passes.
- [ ] 3.4 Introduce the `link-quiet` treatment for navigating values (roster person name, person detail cursadas) and verify no navigating value falls back to the browser default underline.

## 4. Estados y feedback

- [ ] 4.1 Create `EmptyState` (icon, title, description, one or two actions) and replace the two overview empty components and the attendance empty sentences; verify every empty collection on the grid pages offers a way forward.
- [ ] 4.2 Move every hardcoded toast to translation keys per namespace (`created_success`/`updated_success`/`deleted_success`, plus the specific ones), adding EN and ES in the same pass; verify `pnpm validate:i18n` passes and no Spanish literal remains in `notificationsStore` calls.
- [ ] 4.3 Raise grid cells and small controls to a 44×44 minimum under `pointer: coarse`; verify at 390 that a cell can be tapped without hitting its neighbour and that desktop density is unchanged.

## 5. Integración

- [ ] 5.1 Run `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server` and `pnpm test:client`, fixing every failure.
- [ ] 5.2 Walk the app at 1440×900 and 390×844 through dashboard → faculties → subjects → periods → commissions → roster → overview → attendance → take mode → students registry, and confirm each screen uses the page header, the row action pattern and the compact trail where applicable.
