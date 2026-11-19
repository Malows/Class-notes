# Design

## Context

See `proposal.md` — Why. The current app already has: a correction form with dirty tracking for `Next`/`Skip` (`DeliveryForm.svelte`), soft-delete endpoints per entity, a toast store, overview data with the delivery grid, a commission attendance store, a paginated person registry (page size 50), and a term-scoped dashboard with a period picker. No schema or API change is needed.

## Goals / Non-Goals

**Goals**

- Close the six friction points with client-side changes that preserve the editorial system and existing test ids.
- Keep the undo, guard and summary behavior honest: no fake data, no hidden server state, no silent commits.

**Non-Goals**

- Server-side restore after reload, a summary endpoint, registry virtualization, or a new grading model.
- Aggressive token removal that could change the rendered theme.

## Decisions

### 1. Unsaved-changes guard owns dirty state in the form, navigation in the page

- `DeliveryForm` keeps `isDirty` and exposes it upward (callback or bound prop) together with a `save()` entry point.
- The correction page registers a reusable `useNavigationGuard` composable: `beforeNavigate` cancels the navigation, stores the target, and opens the same editorial dialog used for confirmations with Save / Discard / Keep editing. `beforeunload` covers reload and close with the native prompt.
- Save-first: on Save, call the form's save, await success, then `goto(target)` with a bypass flag. On failure, stay on the page and show the existing inline error.
- Browser Back is handled by cancelling `beforeNavigate` and offering the dialog; confirming navigates to the stored target.
- Alternatives: a global dirty-store (more moving parts, stale entries when forms unmount) and native `confirm()` (inconsistent with the editorial dialog system).

### 2. Undo is a delayed commit, not a restore endpoint

- A small `deferredDelete` client helper schedules the DELETE after ~6 s and exposes `undo()`. It lives beside the toast store rather than inside each page.
- Entity pages hand it a commit callback and a restore callback (reinsert the row at its previous index, or refetch the list).
- The toast becomes action-capable (message + Undo button); only the most recent deletion per list is presented, and a second deletion adopts the new one.
- On in-app navigation, pending deletions are committed before leaving (`beforeNavigate` flush). On `pagehide`, a best-effort `fetch(..., { keepalive: true })` is attempted; the window is not guaranteed after a tab close.
- If the delayed DELETE fails, restore the row and show a retryable error.
- Alternatives: server restore (rejected: new API, slug/legajo conflicts, longer scope) and immediate delete with a toast that cannot undo.

### 3. Commission summary is computed on the client from existing data

- `OverviewData.grid` already carries each delivery's status; grade counts and correction progress derive from it.
- Attendance comes from `attendanceStore.loadCommission(commissionId)` (already used by the attendance page). The summary counts present over recorded, excluding assignments with no records, matching the attendance spec.
- Attendance loading is independent: if it fails, grade aggregates still render and the attendance area shows a retry.
- A new `CommissionSummary` component renders the counts, rates and a labelled `Correct commission` action in `PageHeader.secondary` or directly above the grid.
- No endpoint: the extra request is the same one the attendance grid makes, and the store deduplicates in-flight loads.

### 4. Registry adapts page size and card density at the breakpoint

- Page size is chosen from a `matchMedia("(max-width: 767px)")` check: 20 on phones, 50 on desktop, re-read on resize; changing the query resets to page one.
- The mobile card drops to two text lines (name + legajo, last cursada) and keeps its controls at touch size; the desktop table is untouched.
- The search field becomes sticky below the shell header so it stays reachable while scrolling.

### 5. Term context is a placement and target fix

- The fallback note moves directly under the period selector; the selector still defaults to the active term when it has commissions, otherwise the newest term with data.
- The sidebar's current-term shortcut links to `/periods/{year}/{semester}/subjects` and stays outside the "you are viewing" trail, with no `aria-current="page"`.

### 6. Design-system cleanup is documentation-first

- Refresh `.impeccable/design.json` after the code lands, using the `document` workflow.
- Remove only token aliases with zero references across `src`; daisyUI role tokens stay even when unused by components.
- Document the ink, scrim and icon-family additions already present in `app.css`; keep `DESIGN.md` as the compact map and do not re-compact it.

## Risks / Trade-offs

- **Undo timer leaks or double commits** → a single helper owns timers, clears them on undo/unmount, and ignores late responses; tests use fake timers.
- **Pending delete lost on tab close** → documented as best effort; in-app navigation always flushes, and the entity is still on the server if the request never lands.
- **Guard blocks a save that is already failing** → Save-first only navigates on success; a failed save keeps the form and error.
- **Multiple dirty forms** (e.g. a dialog over a page) → the guard is registered by the active form only; dialogs keep their own confirmation.
- **Summary attendance request adds latency** → the module renders grade aggregates first and the attendance block independently.
- **Compact cards shrink targets** → mobile cards keep 44 px actions; only the text density changes.
- **Token cleanup removes something daisyUI needs** → only remove aliases with zero references; keep role tokens and verify both themes after removal.
- **Page-size change breaks pagination tests** → tests assert the responsive choice and reset-on-query behavior.

## Migration Plan

No data or API migration. Deploy the client change; rollback is a revert of the branch. Pending undo timers only exist in the browser session, so a reload leaves the soft-deleted or not-deleted state exactly as committed.

## Open Questions

None blocking. The undo window (~6 s) and the phone page size (20) are product defaults recorded in the proposal and can be tuned without changing the specs.
