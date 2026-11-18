# Proposal

## Why

A review of the rendered screens (desktop 1440 and phone 390) found a set of inconsistencies that make the app harder to scan and, in a few cases, actually broken. They are cheap to fix but they compound: every list page uses a different title scale, every row carries five equally-weighted actions, and the two grids have column headers that overflow onto the first row.

They were found by looking at the app, not by reading it, so they are documented here with their evidence.

## What Changes

**Defects (wrong, not a matter of taste)**

- Attendance and overview grids: column headers render three lines and overlap the first data row, because the columns are `2.8rem` wide. Headers SHALL abbreviate (`TP1`) with the full title available, and SHALL NOT overlap content.
- The attendance grid's row striping starts on the wrong row: the header is counted as the first child in `:nth-child(odd)`.
- On phone widths, the floating sidebar toggle sits on top of the page content.
- Cell links in the cursada summary (`.../periods/{year}/{semester}/overview`) do not resolve, because the URL is built with an empty commission slug.
- 23 success/error messages are hardcoded in Spanish, so switching to English leaves the feedback in Spanish.

**Hierarchy and disposition**

- One page header pattern for every screen: title, optional lead, primary action, consistent type scale. Today `PageWithAdd`/`CommonPage` and raw `<h2>` produce two different title sizes, and the brand is the largest text on the page.
- Row actions: at most one primary action plus an overflow disclosure; destructive actions separated from the rest instead of sitting next to "Editar".
- A maximum content measure so list actions stay near their row instead of drifting to the far edge of a wide viewport.
- Narrow viewports keep a compact breadcrumb (current resource + parent) instead of losing the trail entirely.
- The cursada's attendance view moves next to the other cursada views (summary, commissions, assignments, subjects) instead of living on the commissions list.

**Consistency**

- One link treatment: navigating links stop looking like browser-default blue underlined text next to sketch-styled buttons.
- One empty-state pattern: a card that names what is missing and offers the action that creates it, instead of a bare sentence.
- Touch targets of at least 44×44 px on touch viewports.

## Capabilities

### New Capabilities

None. These are conventions that belong to capabilities which already own the relevant behavior.

### Modified Capabilities

- `sketch-design-system`: adds requirements for the page header, list row actions, link treatment, empty states, touch targets, localized feedback and content measure.
- `breadcrumbs`: adds a compact trail for narrow viewports instead of hiding the trail.
- `hierarchical-navigation`: adds co-located actions for the cursada's views, so attendance is reachable from the same place as the rest.
- `attendance`: adds grid readability — column headers identify the assignment without overlapping the first row.

## Impact

- **Shared components**: `CommonPage`/`PageWithAdd` (page header), the table/row components (actions, overflow, measure), `OverviewGrid`/`OverviewHeader` and `AttendanceGrid` (header and striping), `Breadcrumbs` and `NavBar` (compact trail), `Sidebar` (floating toggle), `Toast` usage.
- **Pages**: the two grid pages, the cursada overview, the commissions page (moving the attendance entry point), and every page whose toast strings are hardcoded.
- **i18n**: new keys for the toasts and for the abbreviated column labels (`attendance.json`, plus the namespaces of each page with toasts); EN and ES in the same commit.
- **No data, API or schema changes**: this is presentation and navigation only.
- **Out of scope**: a redesign or a new visual world; the incumbent sketch aesthetic and PaperCSS stay.
- **Open question for later, not decided here**: whether the sidebar's three context lists should collapse to the active one on wide screens (it conflicts with `hierarchical-navigation`'s current sibling-list requirement, so it needs its own change if wanted).
