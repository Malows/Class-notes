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

<!-- impeccable:design-map -->
Name: Class Notes
Colors: primary: ink-blue #2f5fe0; secondary: emerald-mark #006d3a; tertiary: info-blue #0045c5; neutral: paper-canvas #fbf9f2; primary: ink-blue-wash #dce1ff; primary: ink-blue-deep #00164e (+18 more in the sidecar)
Fonts: Newsreader Variable (display, display-mobile, headline-lg, headline-md, headline-sm); Inter Variable (title-md, body-lg, body-md, body-sm, label-md, label-sm)
Spacing: 1 0.25rem, 2 0.5rem, 3 0.75rem, 4 1rem, 6 1.5rem, 8 2rem, 9 2.25rem
Radius: field 0.25rem, box 0.5rem, circle 9999px
North Star: "The Academic Notebook"
Rules:
- The One Blue Voice Rule. Ink Blue appears only where the teacher can act or where they currently are.
- The Mark, Not A Mood Rule. Semantic colors are marks made on the page — present, approved, rejected, pending — never decoration.
- The Quiet Third State Rule. "Not taken" is a valid, ordinary state: a sunken paper cell with muted ink and an en dash.
- (+5 more)
Elevation:
- Take card: 0 10px 30px -18px color-mix(in srgb, var(--color-on-surface) 40%, transparent)
- Everything else: none
Don't:
- Don't add drop shadows, glows, gradients or blur to create hierarchy — only the take-mode card is allowed one shadow.
- Don't lift, scale or animate position on hover; hover is a background tint or a border shift at 150–200 ms.
- Don't draw vertical cell borders or use zebra stripes in dark mode.
- Don't introduce a second accent or a second chromatic temperature; blue-violet is the only voice.
- Don't use pill radii on chips, badges, buttons or tabs — 4 px pressable, 8 px containers, circles only for avatars and progress.
- Don't put a metric inside a filled semantic badge, where dark ink on an amber or emerald fill drops to 3.5–3.8:1; keep the number in Ink and move the tone to a label, dot or glyph.
- Don't rely on color alone for any state, grid mark or legend.
- Don't use a semantic mark color as a label color on its own 10% tint at micro-label size for warning content (3.97:1); pair it with a glyph or a darker ink.
- Don't let a hairline be the only boundary of an input or button — controls use Control Border (`#747686`), which reaches 3.0:1 against paper.
- Don't hide routes behind a tab bar or a drawer; navigation is real links, marked with `aria-current`.
Full: .impeccable/design-full.md (read a section when you need its detail)
