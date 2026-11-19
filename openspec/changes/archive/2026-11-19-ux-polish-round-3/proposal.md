# Proposal

## Why

The UI now clears the 6/10 bar on every heuristic, but the third critique left six concrete friction points: unsaved grading changes can be lost through back navigation, deletions are irreversible, the commission summary shows marks without grades or attendance, the registry is a ~6,400 px scroll on a phone, and the dashboard/sidebar still misplace term context. The design system also drifted from its documentation after the last round (stale sidecar, unused tokens). This change closes those gaps without adding a new data model or server surface.

## What Changes

- **Unsaved-changes guard**: a dirty correction form intercepts client navigation (`beforeNavigate`) and page unload (`beforeunload`) with a Save / Discard / Keep-editing dialog. Covers breadcrumb, "back" links and the browser Back button, not only the existing `Next`/`Skip` actions.
- **Undoable deletions**: deletes commit after a short client-side window (~6 s) with a toast action to undo; undo cancels the pending request, so no restore endpoint or schema change is needed. Applies to the entities that already expose delete (faculties, subjects, periods, commissions, persons, assignments, enrollments).
- **Commission summary with real aggregates**: the existing overview pages gain a compact summary band — approval percentage, approved / pending / not-delivered counts, correction completion, and attendance rate for the commission — plus a labelled "Correct commission" entry instead of the unlabeled pencil. Built from the data already loaded plus one attendance request; no new endpoint.
- **Registry density**: a compact mobile card (name, legajo, last cursada in two lines), pages of 20 with "load more", and a search field that stays reachable while scrolling. Desktop tables are unchanged.
- **Term context**: the dashboard's fallback note moves next to the period picker, and the sidebar's "Go to current term" links to the global period page (`/periods/{year}/{semester}/subjects`) instead of each subject's period index.
- **Design-system hygiene**: refresh `.impeccable/design.json`, remove genuinely unreferenced token aliases, and document the new ink/scrim/icon tokens in `DESIGN.md`. The compact map stays as is; no aggressive theme refactor.
- **Preserved behavior**: routing, slugs, stores, i18n, grid semantics, keyboard shortcuts, touch targets, and the editorial visual language.

## Capabilities

### New Capabilities

- `commission-summary`: a commission-level summary of grading and attendance, and the labelled entry point to correction.
- `deletion-undo`: confirmed deletions that commit after a short window and can be undone before commit.
- `unsaved-changes`: protection of dirty forms across client navigation, history and page unload.

### Modified Capabilities

- `student-enrollment`: registry browsing gains compact mobile rows, a reachable search field, and phone-sized pagination.
- `dashboard`: the active-term selector states its scope and explains the fallback; the continue shortcut and pending/statistics scoping are specified.
- `hierarchical-navigation`: the current-term shortcut points at the global period view, and the sidebar context remains the viewed cursada.

## Impact

- **Code**: `DeliveryForm`, the correction route, `ConfirmDialog`/toast plumbing, entity rows/tables and delete handlers, `OverviewGrid`/summary components, `persons` page and mobile cards, dashboard period picker, sidebar context, `app.css`, `DESIGN.md`, and `.impeccable/design.json`.
- **No API, schema, migration or dependency changes**; summaries reuse loaded data plus the existing attendance endpoint, and undo is a delayed client commit.
- **Tests**: navigation-guard and timer-based undo tests (fake timers), summary arithmetic, registry pagination at 20, and copy/format assertions.
- **Docs**: `DESIGN.md` and the Impeccable sidecar are refreshed; no change to the compact map strategy.
- **Out of scope**: server-side restore after reload, virtualized registry, a new summary endpoint, aggressive token deletion, and new grading features.
