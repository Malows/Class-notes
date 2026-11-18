# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One teacher: the app's author. They teach one or several subjects across several commissions
(class groups) and several terms, and they are the only person who logs in — there is no student
portal, no institutional account, and no multi-teacher data separation. Future work assumes the
same single-user model unless the owner says otherwise.

## Product Purpose

Class Notes runs the day-to-day of the owner's courses: who is enrolled, which practical
assignments (TPs) were taught, who delivered, what grade they got, and who came to class. It
replaces the spreadsheet-plus-notebook combination with one navigable hierarchy where a
commission's information is read as a grid. Success means the teacher never has to reconstruct
class data from memory or scattered files: the roster, the deliveries and the attendance for any
commission are one or two clicks away, correct, and up to date.

## Positioning

Everything hangs off the *cursada* (subject × period) rather than off the student or the
institution: personas exist once and re-enroll across subjects and terms, TPs belong to the
cursada so every commission shares them, and enrollments, deliveries and attendance all hang off
that single academic axis. The result is a teacher-shaped record: no official registry, no
enrollment paperwork, no schedules — just the working set a teacher actually keeps.

## Operating Context

- Attendance is taken on a phone during class; grid reading, corrections and planning happen on
  desktop afterward.
- The working cycle is a term (cuatrimestre) per subject, with one or more commissions per term,
  and practical assignments that each act as a class meeting rather than a date on a calendar.
- Practical grades carry an AI-usage level and comments alongside the numeric grade.
- Rosters arrive as pasted batches and are registered by search-then-create (legajo or exact
  name), so data entry happens in bulk during or right after a class.
- The app is self-hosted: a single Docker container with a SQLite file on a mounted volume.
- The owner works in Spanish; the interface ships Spanish and English with full key parity.

## Capabilities and Constraints

Confirmed capabilities: academic hierarchy (faculty → subject → cursada → commission) with
human-readable slugs in URLs; person registry with optional legajo and historical enrollments;
cursada-wide assignments with per-enrollment deliveries, grades, AI-usage level and comments;
tri-state attendance (present / absent / not taken, where "no row" is the third state); dashboard
with pending corrections and global metrics; dual-language UI; light and dark themes.

Durable constraints:

- **Offline / no cloud.** Data stays in local SQLite; no external service may become required.
  Observability and analytics are optional and no-op when unset.
- **Real student data.** The database holds real rosters and grades, so destructive schema
  handling (recreating the DB from scratch to migrate) is unacceptable in normal use, and
  existing records must survive change.
- **Spanish is primary.** Spanish is the working language; English is a secondary locale that
  must keep full parity with it.
- **Cheap and self-hosted.** One container, local disk, no paid infrastructure or managed
  services.
- **Single user, no auth.** There is no login layer; adding one is a product decision, not an
  implementation detail.
- It is explicitly *not* an institutional student-records system: no official enrollment, no
  validated legajo, no student login, no correlations or study plans, no class dates or
  timetables.

Undecided / not asserted: data export or portability, multi-teacher support, and any hosted
deployment story.

## Brand Commitments

The product name in the interface is "Clase Notas" (repository and docs say "Class Notes"); the
owner has not fixed one spelling as canonical. The visual identity is an academic notebook:
warm paper canvas, ink typography, editorial serif headings with a sans interface face, 1 px
hairlines and dense tabular data. It is treated as a binding direction by the project docs
(`docs/descripcion-aplicacion.md` §3) and by the completed `editorial-ui` change.

## Evidence on Hand

- `README.md` — product overview, feature list and route table.
- `docs/descripcion-aplicacion.md` — screen-by-screen description in Spanish, including the
  academic model and the interface frame.
- `openspec/specs/**` — agreed behavior per capability (academic hierarchy, enrollment,
  assignment management, attendance, dashboard, navigation, design system).
- `openspec/changes/archive/**` — the decision history, including `editorial-ui`'s replacement of
  the sketch aesthetic.
- `.impeccable/audit/` — a technical audit of the shipped UI (a11y, performance, theming,
  responsive, integrity) with concrete findings.
- Real data exists in `class-notes.db`; there are no testimonials, customers, benchmarks or
  marketing claims, and future work must not invent any.

## Product Principles

1. **The cursada is the unit.** Anything scoped to "a subject in a period" is scoped by
   cursada, never by period alone; grids and lists must never leak across subjects.
2. **Record the exception, not the default.** "No row" means "not taken" in attendance, and
   "enrolled, awaiting a commission" is a valid state rather than an error. States are explicit
   and tri-state where reality is.
3. **Data density over decoration.** The interface exists to make rosters, deliveries and
   attendance readable in a glance; visual language yields to the data.
4. **Reuse people, never duplicate them.** A person exists once and enrolls repeatedly; the
   registry prefers matching an existing person over creating a new one.
5. **The teacher's phone is a working surface.** Attendance and roster tasks must be usable one-
   handed, in class, on a small screen — not a scaled-down desktop.

## Accessibility & Inclusion

No formal standard has been declared by the owner. The shipped UI targets WCAG AA in practice —
the existing technical audit scores it and lists contrast, accessible-name and grid-context
failures as defects to fix — and touch targets, keyboard dialogs and reduced-motion behavior are
part of the accepted baseline. Future work should not regress these.
