# Spec Delta

## ADDED Requirements

### Requirement: Co-located cursada actions

The system SHALL expose the views of a cursada — summary, commissions, practical assignments, associated subjects and attendance — from the same place for that cursada, so every cursada view is discoverable next to the others.

#### Scenario: Cursada views are reached from one place

- **WHEN** the user is on the list of periods for a subject
- **THEN** that cursada's views are reachable from the cursada's own row
- **AND** the attendance view is reachable from there like the rest

#### Scenario: A cursada view does not live on an unrelated list

- **WHEN** a screen lists the commissions of a cursada
- **THEN** it does not carry the entry point to the cursada's attendance
- **AND** the entry point is available where the other cursada views are
