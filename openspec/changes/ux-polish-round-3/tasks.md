# Tasks

## 1. Shared primitives

- [x] 1.1 Extend the toast store and container with an optional action button (label + callback) without changing existing toasts
- [x] 1.2 Add a `deferredDelete` client helper with a ~6 s timer, `undo()`, flush, failure callback and cleanup
- [x] 1.3 Add a `useNavigationGuard` composable built on `beforeNavigate` + `beforeunload`, with cancel/confirm and a save-first path
- [x] 1.4 Unit-test the helper and composable with fake timers: undo, timeout commit, flush, save failure, clean form bypass

## 2. Unsaved-changes guard

- [x] 2.1 Expose dirty state and a save entry point from `DeliveryForm` to the correction page (no duplicate validation)
- [x] 2.2 Register the guard on the correction page and show the editorial Save / Discard / Keep editing dialog on links, breadcrumb and browser Back
- [x] 2.3 Add the native unload warning only while the form is dirty
- [x] 2.4 Ensure Save-first navigates only after a successful save and restores focus on Keep editing
- [x] 2.5 Test dirty/clean navigation, Save success/failure, Discard and Back interception

## 3. Undoable deletions

- [x] 3.1 Wire deferred deletion into faculties, subjects, periods and commissions lists
- [ ] 3.2 Wire deferred deletion into persons (index and detail) and assign the correct post-delete destination
- [x] 3.3 Wire deferred deletion into assignments and roster enrollment removal
- [x] 3.4 Restore the row at its previous position on undo and refetch on commit failure with a retryable error
- [x] 3.5 Flush pending deletions on in-app navigation and attempt a keepalive commit on `pagehide`
- [ ] 3.6 Test undo, timeout, navigation flush and failed commit per entity group

## 4. Commission summary

- [ ] 4.1 Add pure helpers for grade counts, correction progress and attendance rate (recorded-only denominator)
- [ ] 4.2 Build `CommissionSummary` with count/rate modules, labelled `Correct commission` action and independent attendance loading/retry
- [ ] 4.3 Mount the summary on the commission overview and keep the grid below it
- [ ] 4.4 Cover empty roster, no assignments, no deliveries, no attendance and attendance failure states
- [ ] 4.5 Test the arithmetic and the independent failure behavior

## 5. Registry density

- [ ] 5.1 Choose page size by viewport (20 phone / 50 desktop) and reset to page one on query change
- [ ] 5.2 Compact the mobile person card to two text lines while keeping touch-sized actions
- [ ] 5.3 Make the search field stay reachable while the registry scrolls
- [ ] 5.4 Test responsive page size, reset-on-search, compact card and no desktop regression

## 6. Term context

- [x] 6.1 Move the dashboard fallback note directly under the period picker
- [x] 6.2 Point the sidebar current-term shortcut at `/periods/{year}/{semester}/subjects` and keep it outside the viewed-context trail
- [x] 6.3 Test the shortcut target and the note placement in both locales

## 7. Design system and docs

- [ ] 7.1 Audit token references and remove only aliases with zero usages, keeping daisyUI role tokens
- [ ] 7.2 Document the ink, scrim and icon-family tokens in `DESIGN.md`; keep the compact map
- [ ] 7.3 Refresh `.impeccable/design.json` with the `document` workflow after the code lands
- [ ] 7.4 Verify both themes and the detector after the cleanup

## 8. Verification

- [ ] 8.1 Run `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server`, `pnpm test:client` and `pnpm build`
- [ ] 8.2 Verify at 390/1440 light and dark: guard on Back, undo window, summary aggregates, compact registry, term link
- [ ] 8.3 Run a final Impeccable pass and record the updated score
