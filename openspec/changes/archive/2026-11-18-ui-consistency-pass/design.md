# Design

## Context

See `proposal.md` — Why. Constraints that shape the approach:

- The look is fixed: PaperCSS "sketch" with CSS custom properties for light/dark. This is a consistency pass, not a redesign; no new visual world.
- Pages are built two ways today: `PageWithAdd`/`CommonPage` (title + "+ Agregar") and raw `<h2>` (grids, take mode). That is the root of the two title scales.
- Row components (`FacultyRow`, `SubjectRow`, `SubjectPeriodRow`, `CommissionRow`, `AssignmentRow`, `StudentRow`) render their actions directly, with stable `data-test-id`s that the tests assert.
- `ResponsiveTable` renders the desktop table and the mobile cards at the same time, so any action change must stay consistent in both.
- The grids (`OverviewGrid`, `AttendanceGrid`) share a CSS-grid layout with `subgrid` rows and a `--cols` variable at `2.8rem` per column.
- Toasts are raised from pages with hardcoded Spanish strings (23 call sites).
- There is no CI; verification is local plus rendered inspection at 1440 and 390.

## Goals / Non-Goals

**Goals:**

- One header, one action pattern, one link treatment, one empty-state pattern.
- Grids that stay readable with long assignment titles and many TPs.
- Keep every navigation entry point where the user already looks for it.

**Non-Goals:**

- No redesign, no new typography or colour system, no dark-mode rework.
- No new data, API or schema change.
- No change to the sidebar's information architecture (see Open Questions).
- No component library extraction beyond the pieces these fixes need.

## Decisions

### D1. One `PageHeader`, replacing both current patterns

A single component with `title`, optional `lead`, an optional primary action slot and an optional secondary row (for things like "« Volver"). `PageWithAdd` and `CommonPage` become thin wrappers over it, and the pages using raw `<h2>` move to it.

Why not keep two patterns: the page title is the anchor for scanning, and two scales (≈1.2rem vs the browser default 1.5em) make the same app feel like two products. Why not a full `Page` abstraction: the pages differ too much in content; only the header is genuinely shared.

The brand in the navbar drops to logo scale so the page title wins the hierarchy.

### D2. Row actions: primary + one disclosure, reusing the existing popover

```
hoy                                   propuesto
[Alumnos][Resumen][Asistencia]         [Resumen] [⋯]
[Editar][Borrar]                         ⋯ → Alumnos · Asistencia · Editar
                                              ────────────
                                              Borrar
```

A `RowActions` component takes `primary` and `overflow` lists. The disclosure reuses the popover attribute pattern already implemented in `OverviewLegend` instead of adding a menu dependency. Destructive items render after a separator, with the existing confirm dialog.

Consequence for tests: `edit-btn-*` / `delete-btn-*` stop being directly in the row. Tests must open the disclosure first, or assert on the menu's items after opening. That is a deliberate test change, not an accident.

Why not one icon button per action: the row already has up to five actions and the icons would be unguessable.

### D3. Link treatment: one `link-quiet` style

Navigating values (a person's name in a roster, a cursada in a person's detail) use the app's own link style — inherited colour, sketch underline — and never the browser default. Mutating controls stay `Button`.

Why: today a roster mixes blue underlined text with sketch buttons in the same cell, which reads as two different systems.

### D4. Empty states: one `EmptyState` card

`EmptyState` takes an icon, a title, a description and one or two actions. It replaces the two `OverviewEmpty*` components and the bare `<p>` used by the attendance grid, so "no students" and "no TPs" look the same everywhere.

### D5. Grid headers: abbreviate, never overlap

Column width grows to `3.2rem` and the header becomes a single line:

```
TP1  TP2  TP3        <- visible
tooltip / aria-label  -> "Trabajo Práctico 1"
```

The abbreviation is derived: the trailing number of the title if it has one (`Trabajo Práctico 2` → `TP2`), otherwise the initials of its words. The full title is always in `title` and `aria-label`, and the header row gets a reserved height so it cannot collide with the first data row. Columns no longer wrap text — if the grid does not fit, it scrolls horizontally (which the layout already allows).

Why not rotate the labels: unreadable at mobile widths. Why not widen to fit the full title: five TPs would need ~800px of header.

### D6. Row striping and the floating toggle

- Striping moves to `:nth-child(even)` (or the header leaves the striped container), so alternation starts on the first data row.
- The floating sidebar toggle is removed: the navbar already carries the menu control on narrow viewports, and the floating one covers content. `Sidebar` keeps its in-sidebar collapse control.

### D7. Cursada overview cells link to a real commission

The cursada grid already receives the cursada's commissions; each row carries `commission_id`. The cell builds its correction URL from the row's commission slug (looked up in `commissions`) instead of the empty `commissionSlug` prop. Rows without a commission keep the cell non-navigating (there is no commission view to return to).

### D8. Attendance entry belongs to the cursada, not to the commissions list

`[Asistencia]` joins `Resumen · Comisiones · Definir TPs · Materias` on the period row, and the button disappears from the commissions page. Why: the other cursada-level views live on the period row; the commissions page is a list of commissions, not a hub of cursada views.

### D9. Content measure as a token

`--content-measure: 72rem` applied to the page container; grids opt out with their existing horizontal overflow. Row actions sit at the end of the measured column instead of the end of a 1440px viewport.

### D10. Toast copy: per-namespace keys, not a generic message

Each entity namespace gets `created_success`, `updated_success`, `deleted_success` (and the specific ones that already exist, like `enrollments.register_success`). A generic "Guardado" would lose the subject of the sentence, which is the useful part. EN and ES land together because `pnpm build` validates parity.

### D11. Touch targets behind `pointer: coarse`

`@media (pointer: coarse)` raises grid cells to `3rem` and the small controls to a 44px minimum, without inflating desktop density.

## Risks / Trade-offs

- **Row action test churn.** Moving edit/delete into a disclosure rewrites several row tests. Mitigation: one mechanical pass per row component, then `pnpm test:client`.
- **Abbreviated headers lose information.** `TP1` is a guess from the title; a TP named "Guía de problemas" becomes `GP`. The full title stays one hover/focus away, and the header keeps `aria-label`.
- **`ResponsiveTable` duplicates the DOM**, so an action change must be verified in both the table and the card rendering.
- **`PageHeader` migration touches every page**, which is the biggest mechanical risk of this change. Mitigation: migrate screen by screen, with the existing page render tests as the safety net.
- **`--content-measure` can make grids feel cramped** if applied to them; they opt out explicitly.
- **Removing the floating toggle** could leave narrow viewports without a menu control if the navbar control is not actually present in every breakpoint — verify before deleting.

## Migration Plan

Presentation only: no schema, no API, no data. Ships as one commit series gated by `pnpm check`, `pnpm lint`, `pnpm validate:i18n`, `pnpm test:server`, `pnpm test:client`, plus rendered comparison at 1440×900 and 390×844 for every touched screen.

## Open Questions

- **Sidebar context lists**: collapsing them to the active section on wide screens would reduce ~15 items to ~5, but `hierarchical-navigation` currently requires the full sibling lists. That is a requirement change, so it needs its own change if wanted.
- **Not-taken glyph**: the cells use `–` today; a hollow circle or a dot might read better at small sizes. Cosmetic, decide with a visual pass.
