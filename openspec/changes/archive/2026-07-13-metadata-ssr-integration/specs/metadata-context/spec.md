## ADDED Requirements

### Requirement: Metadata Context Calculation (Backend)
The system SHALL calculate the active academic period based on server time and repository data.

#### Scenario: Current date is within active period
- **WHEN** Server Date = 2026-07-13, Period Year = 2026, Semester = Cuatrimestre II (Month 8)
- **THEN** The system MUST return the metadata payload for the current academic year/semester.

#### Scenario: Current date is past period end
- **WHEN** Server Date = 2025-12-31, Period Year = 2025, Semester = Cuatrimestre I (Month 1)
- **THEN** The system MUST NOT return the metadata payload for this period.

#### Scenario: Current date is before start of academic year
- **WHEN** Server Date = 2024-01-01, Period Year = 2026
- **THEN** The system MUST NOT return any active context data.