---
name: Class Notes
description: A teacher's academic notebook, built as warm paper, ink typography and dense tabular records.
colors:
  paper-canvas: "#fbf9f2"
  content-surface: "#ffffff"
  sunken-paper: "#f5f4ed"
  ledger-panel: "#f0eee7"
  deep-paper: "#e4e2dc"
  ink: "#1b1c18"
  ink-secondary: "#434654"
  ink-muted: "#5f6a73"
  control-border: "#747686"
  hairline: "#c3c5d7"
  ink-blue: "#2f5fe0"
  ink-blue-wash: "#dce1ff"
  ink-blue-deep: "#00164e"
  emerald-mark: "#006d3a"
  amber-mark: "#b26200"
  brick-error: "#c5221f"
  info-blue: "#0045c5"
  paper-night: "#14140f"
  surface-night: "#1a1a14"
  hairline-night: "#3a3a31"
  ink-night: "#e8e6dc"
  ink-secondary-night: "#b9b7ab"
  ink-muted-night: "#8b8a7e"
  ink-blue-night: "#b5c4ff"
typography:
  display:
    fontFamily: "Newsreader Variable, Newsreader, ui-serif, Georgia, serif"
    fontSize: "2.25rem"
    fontWeight: 500
    lineHeight: "2.75rem"
    letterSpacing: "-0.02em"
  display-mobile:
    fontFamily: "Newsreader Variable, Newsreader, ui-serif, Georgia, serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: "2.25rem"
    letterSpacing: "-0.015em"
  headline-lg:
    fontFamily: "Newsreader Variable, Newsreader, ui-serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: "2rem"
    letterSpacing: "-0.015em"
  headline-md:
    fontFamily: "Newsreader Variable, Newsreader, ui-serif, Georgia, serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: "1.75rem"
    letterSpacing: "-0.01em"
  headline-sm:
    fontFamily: "Newsreader Variable, Newsreader, ui-serif, Georgia, serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: "1.5rem"
    letterSpacing: "-0.005em"
  title-md:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    lineHeight: "1.25rem"
    letterSpacing: "-0.005em"
  body-lg:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: "1.375rem"
  body-md:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  body-sm:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
  label-md:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: "1rem"
    letterSpacing: "0.02em"
  label-sm:
    fontFamily: "Inter Variable, Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 600
    lineHeight: "0.875rem"
    letterSpacing: "0.04em"
rounded:
  field: "0.25rem"
  box: "0.5rem"
  circle: "9999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "6": "1.5rem"
  "8": "2rem"
  "9": "2.25rem"
components:
  button-primary:
    backgroundColor: "{colors.ink-blue}"
    textColor: "{colors.content-surface}"
    rounded: "{rounded.field}"
    height: "2rem"
    padding: "0 0.75rem"
    typography: "{typography.body-md}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.field}"
    height: "2rem"
    padding: "0 0.75rem"
    typography: "{typography.body-md}"
  button-outline:
    backgroundColor: "{colors.content-surface}"
    textColor: "{colors.ink-blue}"
    rounded: "{rounded.field}"
    height: "2rem"
    padding: "0 0.75rem"
    typography: "{typography.body-md}"
  button-danger:
    backgroundColor: "{colors.brick-error}"
    textColor: "{colors.content-surface}"
    rounded: "{rounded.field}"
    height: "2rem"
    padding: "0 0.75rem"
    typography: "{typography.body-md}"
  card:
    backgroundColor: "{colors.content-surface}"
    rounded: "{rounded.box}"
    padding: "1rem"
  input-text:
    backgroundColor: "{colors.content-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "2rem"
    padding: "0 0.75rem"
    typography: "{typography.body-md}"
  chip:
    backgroundColor: "{colors.sunken-paper}"
    textColor: "{colors.ink-secondary}"
    rounded: "{rounded.field}"
    padding: "0.125rem 0.5rem"
    typography: "{typography.label-sm}"
  metric-card:
    backgroundColor: "{colors.content-surface}"
    rounded: "{rounded.box}"
    padding: "1rem"
---

# Design System: Class Notes

## Overview

**Creative North Star: "The Academic Notebook"**

Class Notes looks like the notebook it replaces: a warm paper page, ink text, ruled columns and one blue pen. The canvas is warm paper (`#fbf9f2`), records sit on clean white sheets, and every boundary is a 1 px hairline rather than a shadow. Headings are set in Newsreader, an editorial serif with real ink traps and a little warmth; everything the teacher touches or reads as data is Inter. The tone is archival and unhurried — this is a record that will be consulted months later, not a dashboard that needs to impress in five seconds.

The layout is built for density. Rosters, deliveries and attendance are grids of small type: 40 px rows, a 32 px uppercase header, tabular numerals, and status carried by a glyph and a word as much as by a tint. Decoration is deliberately scarce so that the two surfaces that carry meaning — the paper and the marks on it — stay legible at a glance and on a phone held one-handed in class.

Restraint is the identity. There is exactly one accent (Ink Blue), no gradients, no blurred shadows and no elevation at rest; state changes arrive as a background tint or a border shift. The dark theme is the same notebook at night: a warm charcoal page, cards one step brighter, hairlines doing the work that shadows do elsewhere.

**Key Characteristics:**
- Warm paper canvas with white content surfaces and 1 px `#c3c5d7` hairlines.
- Editorial serif for titles (Newsreader), Inter for UI, labels and numbers.
- One Ink Blue accent, reserved for action, links and current state.
- Dense tabular data: 40 px rows, 32 px headers, tabular figures, uppercase micro-labels.
- Flat by construction: `--depth: 0`, no drop shadows, no gradients.
- Tri-state semantics (present / absent / not taken) expressed with glyph + label + tint.
- Phone-first for the in-class tasks: 64 px bottom navigation, 44 px touch targets.

## Colors

The palette is warm paper and ink with a single cool blue voice and a muted set of marking colors.

### Primary
- **Ink Blue** (`#2f5fe0`): the only accent in the system. Primary buttons, links, the active sidebar item, the active tab underline and the `aria-current` state. On paper it reads 5.20:1, and as a fill with white text it reads 5.48:1.
- **Blue Wash** (`#dce1ff`): the quiet tint behind a primary selection or chip; never a large surface.
- **Deep Ink** (`#00164e`): text that must sit on Blue Wash, and the dark theme's primary-content color.

### Secondary
- **Emerald Mark** (`#006d3a`): success, present, approved, delivered on time.
- **Amber Mark** (`#b26200`): warning and "needs attention" quantities.
- **Brick Error** (`#c5221f`): errors, destructive confirmation, absent and rejected.
- **Info Blue** (`#0045c5`): neutral informational notices, distinct from Ink Blue so a notice is never mistaken for an action.

### Neutral
- **Paper Canvas** (`#fbf9f2`): the page background, the chrome (sidebar, navbar, bottom nav) and the base for everything.
- **Content Surface** (`#ffffff`): cards, tables, dialogs, menus and inputs — the sheet you write on.
- **Sunken Paper** (`#f5f4ed`): table hover, striped rows, untaken grid cells and neutral chips.
- **Ledger Panel** (`#f0eee7`): table header rows and grouped blocks.
- **Deep Paper** (`#e4e2dc`): the heaviest neutral step, for recessed strips.
- **Ink** (`#1b1c18`): body text and headings; 16.26:1 on the canvas and 17.13:1 on white.
- **Ink Secondary** (`#434654`): leads, labels and metadata; 8.89:1 on the canvas.
- **Ink Muted** (`#5f6a73`): placeholders and the "not taken" qualifier; 5.25:1 on the canvas.
- **Control Border** (`#747686`): the 1 px stroke around inputs and selects.
- **Hairline** (`#c3c5d7`): dividers, card borders, table rules. At 1.62:1 it is a separator, never the only boundary of a control.

### Night Palette
- **Paper at Night** (`#14140f`): the page, darker than its cards.
- **Surface at Night** (`#1a1a14`): cards and inputs, one step up from the page.
- **Hairline at Night** (`#3a3a31`): borders, mandatory because surface deltas are ~1.1:1.
- **Ink at Night** (`#e8e6dc`) 14.76:1, **Secondary** (`#b9b7ab`) 9.17:1, **Muted** (`#8b8a7e`) 5.31:1.
- **Ink Blue at Night** (`#b5c4ff`) with Deep Ink text, 10.05:1 — the accent inverts, the meaning does not.
- Semantic marks lighten: success `#63d68f`, warning `#f5b558`, error `#ffb4ab`, info `#8fd0f0`; chips use solid tinted fills (success `#12301f` / `#9fe8b6`, warning `#33230c` / `#ffcf8f`, error `#3a1212` / `#ffb4ab`, info `#10283a` / `#a9d8f5`, primary `#1c2a52` / `#c3d3ff`, pending `#1f1f18` / `#b9b7ab`), all ≥9.3:1.

### Named Rules
**The One Blue Voice Rule.** Ink Blue appears only where the teacher can act or where they currently are. It is used sparingly; when a screen has no primary action, it may show no Ink Blue at all.

**The Mark, Not A Mood Rule.** Semantic colors are marks made on the page — present, approved, rejected, pending — never decoration. A container, heading or icon does not get a semantic tint unless it is reporting that state.

**The Quiet Third State Rule.** "Not taken" is a valid, ordinary state: a sunken paper cell with muted ink and an en dash. It must never share the error treatment, because a class that has not happened yet is not a failure.

## Typography

**Display Font:** Newsreader Variable (with Newsreader, ui-serif, Georgia, serif)
**Body Font:** Inter Variable (with Inter, ui-sans-serif, system-ui, sans-serif)
**Label/Mono Font:** Inter, with tabular figures for all numeric data; Material Symbols Outlined for icons.

**Character:** A reading face for titles and a working face for everything else. Newsreader is slightly literary and gives the app its notebook voice; Inter keeps 13 px table text, 11 px labels and grades perfectly legible at density. The pairing never argues — the serif is never used for controls, and the sans never used for a screen title.

### Hierarchy
- **Display** (500, 2.25rem/2.75rem, −0.02em; 1.75rem/2.25rem on mobile): the page title in `PageHeader`, and only there. One per screen.
- **Headline LG** (500, 1.5rem/2rem): error pages and large section titles.
- **Headline MD** (500, 1.25rem/1.75rem): card and panel titles, `EmptyState` titles, metric values.
- **Headline SM** (500, 1.125rem/1.5rem): list-card titles on mobile, the sidebar brand.
- **Title MD** (400, 0.9375rem/1.25rem): tab labels and inline titles.
- **Body LG** (400, 0.9375rem/1.375rem): page leads and form help.
- **Body MD** (400, 0.8125rem/1.25rem): the default table row, form field and button text.
- **Body SM** (400, 0.75rem/1rem): secondary metadata, legends, mobile card labels.
- **Label MD** (500, 0.75rem/1rem, +0.02em): form labels and field captions.
- **Label SM** (600, 0.6875rem/0.875rem, +0.04em, uppercase): table headers, chips, badges, metric labels, nav labels, breadcrumb segments.

### Named Rules
**The Two Hands Rule.** Serif for reading, sans for operating. If text is a page title, card title or empty-state title it is Newsreader; if it is a control, a value, a label or a number it is Inter.

**The Tabular Record Rule.** Legajos, grades, percentages, counts and dates always use tabular figures (`font-variant-numeric: tabular-nums`, the `.tnum` utility), so columns of numbers line up like a ledger.

## Layout

A fixed shell on desktop and a bottom-navigation shell on mobile, with a 4 px spacing grid inside.

- **Desktop (≥ 768 px):** 240 px fixed sidebar (`w-60`), 48 px fixed header, main offset by both with 36 px horizontal and 32 px vertical padding. Content is capped at 1600 px and centered; the shell chrome is the paper canvas, the content sits on it.
- **Mobile (< 768 px):** 64 px fixed header carrying breadcrumbs, language and theme; a fixed 64 px bottom navigation with four destinations (Inicio, Facultades, Periodos, Alumnos) and `env(safe-area-inset-bottom)` padding. The sidebar is hidden entirely — there is no drawer.
- **Rhythm:** 4 px base unit; 8/12/16 px inside a card, 24 px between page sections, 32 px page padding on desktop.
- **Density:** 40 px table rows, 32 px table headers, 32 px controls (`h-8`), 16 px mobile card padding. Table separators are horizontal hairlines only; there are no vertical rules.
- **Responsive behavior:** tables below 768 px become stacked cards (`ResponsiveTable` renders both, the inactive one hidden); grids scroll horizontally inside their own container and keep the student column pinned. On coarse pointers every control grows to a 44 px minimum target.
- **Measure:** there is no separate prose measure — the container cap (1600 px) and the dense row layout keep a row's actions beside its data. Long text blocks wrap within the card they belong to.

**The 40/32 Rule.** A record is 40 px tall, its header is 32 px, and a control is 32 px. If a row grows to fit a paragraph, it has stopped being a record.

## Elevation & Depth

There are no elevation shadows. `--depth` is `0` in both themes, the dialog sets `box-shadow: none`, and no component lifts or scales on hover. Depth is carried instead by surface steps and hairlines: paper canvas → white content surface → sunken paper, with a 1 px hairline wherever two surfaces meet. On desktop the sidebar and header are the same canvas as the page, separated only by a hairline; cards read as sheets laid on the page, not as floating panels.

In dark mode the relationship inverts: the page is the darkest plane (`#14140f`), cards rise one step (`#1a1a14`), and borders (`#3a3a31`) become mandatory because the surface delta is barely perceptible. Hover states use a tonal step, not a shadow.

The single deliberate exception is the take-attendance card, which floats above the page in take mode with one soft shadow (`0 10px 30px -18px` at 40% ink) so it clearly sits in front of the roster it was opened from. The focus treatment is not elevation either: a 2 px outline offset outside the element, plus, on inputs, a 3 px `22%` primary tint.

### Shadow Vocabulary
- **Take card** (`box-shadow: 0 10px 30px -18px color-mix(in srgb, var(--color-on-surface) 40%, transparent)`): only the swipe/tap attendance card in take mode, to separate it from the page behind.
- **Everything else** (`box-shadow: none`): cards, menus, dialogs, toasts and the sidebar.

### Named Rules
**The Paper Has No Shadow Rule.** A surface is separated from the page by a 1 px hairline, not by a shadow. If a block needs to stand out, change its surface step — do not add elevation.

## Shapes

A rectangular, printed-page geometry with two radii: **4 px** for anything small and interactive (buttons, inputs, selects, chips, badges, grid cells, sidebar items, tabs' count stamps) and **8 px** for anything that is a container (cards, dialogs, menus, callouts, empty states, mobile cards, toasts). Full circles appear only where the object is round in the world: avatars and progress bars.

Borders are always 1 px and always a token: `#c3c5d7` hairlines between sections and around cards, `#747686` around inputs, and a 3 px left edge on toasts to color-code the message. There is no pill radius, no cut corner, no clipped or skewed container. Grid cells keep a square 1:1 aspect ratio with the 4 px field radius, which makes a row of attendance marks read as a checklist.

**The Two-Radius Rule.** 4 px for things you press, 8 px for things that hold things. Never mix the two inside one element.

## Components

### Buttons
- **Shape:** 32 px high (`h-8`), 4 px radius, 1 px border or filled, no shadow, label in 13 px Inter, icon 18 px on the leading edge.
- **Primary:** Ink Blue fill (`#2f5fe0`) with white text, one per screen, living in the page header or a dialog footer.
- **Hover / Focus:** hover deepens the fill or the border tint; focus draws a 2 px Ink Blue outline at 2 px offset (3 px offset and ink-colored on filled primaries). Pressed never moves the button.
- **Ghost / Outline:** ghost buttons carry row and header icon actions on a transparent fill with secondary ink; outline buttons are white with an Ink Blue label and border and are the neutral way to offer a second action.
- **Danger:** Brick Error fill, reserved for the confirming action inside a `ConfirmDialog`; on a row it lives behind the disclosure, after a separator.
- **On touch:** minimum 44 × 44 px; icon-only buttons become circles of that size.

### Chips and Badges
- **Style:** 11 px uppercase semibold with +0.04em tracking, 4 px radius, 13 px vertical padding, `-` and `+` 8 px horizontal, a 1 px tinted border and a 10% tinted fill; an optional 6 px dot precedes the label.
- **Tones:** neutral and pending read as quiet paper (Sunken Paper fill, secondary or muted ink) — the pending chip is the third attendance state and must not look like an error. Success, warning, error and info use their mark color on its own 10% tint; at 11 px those pairs measure 4.2–6.7:1, and the amber pair is the weakest, so warning is used for quantities and always alongside a glyph.
- **Badges** reuse the same micro-label treatment at `badge-sm`; they are stamps, not pills.

### Cards / Containers
- **Corner Style:** 8 px (`--radius-box`).
- **Background:** Content Surface, with Paper Canvas behind it and Sunken Paper for hovered rows.
- **Shadow Strategy:** none (see Elevation & Depth).
- **Border:** 1 px Hairline.
- **Internal Padding:** 16 px (`p-4`), 12 px gap between blocks; card titles are Newsreader and separated from the body by a hairline when the card has a footer.
- **Mobile cards:** the same recipe with a two-column `dt/dd` metadata grid (11 px uppercase labels over 13 px values) and an action strip divided by a top hairline.

### Inputs / Fields
- **Style:** 32 px minimum height, 1 px Control Border, 4 px radius, white fill, 13 px Inter text, 12 px horizontal padding. Labels are 12 px, 500 weight, secondary ink, sitting 4 px above the field.
- **Focus:** border turns Ink Blue and a 3 px `22%` primary tint ring appears; the native outline is suppressed in favor of that ring.
- **Error / Disabled:** error text is 12 px Brick Error under the field; invalid fields keep the normal border and rely on `aria-invalid` plus the message. Placeholders use Ink Muted.
- **Checkboxes / radios:** 14 px, accented with Ink Blue.

### Navigation
- **Sidebar (desktop):** 240 px fixed rail on the canvas, 1 px right hairline, 16 px vertical padding. Brand at the top (icon + Newsreader 18 px), then context sections (subjects, periods, commissions) whose labels are 11 px uppercase secondary ink, then the global links. Items are 13 px Inter with an 18 px icon, 4 px radius, 8 px padding; hover fills Sunken Paper, the active item uses a 10% Ink Blue wash with Ink Blue text and `aria-current="page"`.
- **Navbar:** 48 px on desktop (64 px on mobile), hairline bottom, breadcrumbs filling the middle, language and theme toggles at the end as 32 px circular ghost buttons with action-oriented labels and `aria-pressed`.
- **Bottom navigation (mobile):** four destinations, 64 px tall, each an icon above an 11 px uppercase label; the current destination is Ink Blue, the rest secondary ink.
- **Tabs:** real links in a row with a 2 px underline; the active one is Ink Blue with a Ink Blue underline, the rest secondary ink with a transparent underline that becomes a hairline on hover. Counts sit in a small Sunken Paper stamp with tabular figures.

### Tables
- **Style:** full-width, no outer border, no vertical rules. Header row 32 px on Ledger Panel with 11 px uppercase labels; body rows 40 px with a bottom hairline, no hairline on the last row, and a Sunken Paper hover.
- **Numbers:** tabular, right- or center-aligned by column, never proportional.
- **Row actions:** at most one visible primary action, the rest behind a `⋯` disclosure (32 px circle) that opens an 8 px-radius white menu with a hairline border; destructive items are separated by a rule and confirm before acting.
- **Mobile:** rows become cards; the table is hidden, not shrunk.

### Page Header
One per screen: the title in Newsreader Display (mobile size under 768 px), an optional 15 px lead line below, the primary action aligned to the title on the right, and an optional secondary row (a back link, tabs or context) under it. A 16 px bottom hairline closes the header.

### Metric Cards
A single number per card: 11 px uppercase label in secondary ink with an optional 18 px icon, the value in 20 px Inter medium with tabular figures, and an optional 12 px sublabel. Used for dashboard totals and any repeated count.

### Attendance and Overview Grids (signature)
Two CSS grids that express the product's core record. The student column is 12 rem (10 rem on mobile) and stays pinned while the assignment columns (3.2 rem each) scroll horizontally; a summary column closes each row with `present / taken` in tabular figures.
- **Cells:** square (1:1), minimum 32 px (48 px on coarse pointers), 4 px radius, 1 px hairline; present/approved uses a 12% success tint with an emerald glyph (`✓`, `✅`), absent/rejected the same treatment in Brick Error (`✗`, `❌`), pending correction a warning glyph (`⏳`), and "not taken" a sunken paper cell with a muted en dash.
- **Headers:** 11 px uppercase, truncated to the assignment's abbreviation (`TP1`) with the full title in `title` and an accessible name that starts with the abbreviation.
- **Striping:** alternate rows use Sunken Paper in light mode and no striping in dark mode, where hairlines alone separate rows; the column-count row is separated by a top hairline.
- **Take mode:** a floating card with the student's name in Newsreader, two large decision targets, and a single soft shadow (the one elevation exception).

## Do's and Don'ts

### Do:
- **Do** place records on Content Surface over a Paper Canvas page, with a 1 px Hairline as the only boundary.
- **Do** keep every control at 32 px and every record at 40 px, then grow only on coarse pointers (44 px).
- **Do** use Newsreader for screen, card and empty-state titles and Inter for everything a teacher operates or reads as data.
- **Do** set numbers with tabular figures and 11 px uppercase micro-labels for headers and field labels.
- **Do** express state with a glyph, a word and a tint together — present/absent/not taken, approved/rejected/pending.
- **Do** reserve Ink Blue for the primary action, the active navigation item and links; a screen with no action may show none.
- **Do** render the "not taken" state as Sunken Paper with Ink Muted, never as an error.
- **Do** pair each light surface, ink and mark with its night counterpart token; the dark theme is a full palette, not an inversion filter.
- **Do** keep row actions inside the row: one visible primary plus a `⋯` disclosure, destructive actions separated.

### Don't:
- **Don't** add drop shadows, glows, gradients or blur to create hierarchy — only the take-mode card is allowed one shadow.
- **Don't** lift, scale or animate position on hover; hover is a background tint or a border shift at 150–200 ms.
- **Don't** draw vertical cell borders or use zebra stripes in dark mode.
- **Don't** introduce a second accent or a second chromatic temperature; blue-violet is the only voice.
- **Don't** use pill radii on chips, badges, buttons or tabs — 4 px pressable, 8 px containers, circles only for avatars and progress.
- **Don't** put a metric inside a filled semantic badge, where dark ink on an amber or emerald fill drops to 3.5–3.8:1; keep the number in Ink and move the tone to a label, dot or glyph.
- **Don't** rely on color alone for any state, grid mark or legend.
- **Don't** use a semantic mark color as a label color on its own 10% tint at micro-label size for warning content (3.97:1); pair it with a glyph or a darker ink.
- **Don't** let a hairline be the only boundary of an input or button — controls use Control Border (`#747686`), which reaches 3.0:1 against paper.
- **Don't** hide routes behind a tab bar or a drawer; navigation is real links, marked with `aria-current`.
