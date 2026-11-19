# commission-summary Specification

## Purpose

Summarise a commission's grading and attendance at a glance, and give that summary a labelled way into the correction sheet.

## Requirements

### Requirement: Commission grading summary

The overview of a commission SHALL show aggregate grading counts and rates for the selected period, derived from the commission's deliveries: approved, rejected, pending correction, not delivered, and the share of corrected deliveries over the total.

#### Scenario: Counts by status

- **WHEN** the user opens a commission overview with deliveries
- **THEN** the summary shows the number of approved, rejected, pending-correction and not-delivered deliveries
- **AND** the counts add up to the number of enrolled students

#### Scenario: Correction progress

- **WHEN** the commission has deliveries with a correction status
- **THEN** the summary shows how many were corrected out of the total
- **AND** the value is expressed as a count and as a percentage

#### Scenario: No deliveries yet

- **WHEN** the commission has no deliveries or no assignments
- **THEN** the summary states that there is nothing to correct yet
- **AND** it does not show a zero-percent approval rate as if grading had failed

### Requirement: Commission attendance summary

The commission overview SHALL show an attendance rate for the commission, counting only assignments that have at least one attendance record, so an assignment that was not taken is not treated as an absence.

#### Scenario: Attendance rate with taken assignments

- **WHEN** the commission has attendance records for one or more assignments
- **THEN** the summary shows present records over recorded records for those assignments
- **AND** the rate is accompanied by the counts it derives from

#### Scenario: No attendance taken

- **WHEN** no assignment of the commission has an attendance record
- **THEN** the summary says attendance has not been taken yet
- **AND** does not display zero percent as a measured result

#### Scenario: Attendance unavailable

- **WHEN** the attendance data fails to load but grading data is available
- **THEN** the grading summary still renders
- **AND** the attendance area shows a retryable failure instead of a misleading value

### Requirement: Labelled correction entry point

The commission overview SHALL offer a labelled action that opens the correction sheet for the commission, and the action SHALL state that it corrects the whole commission rather than a single student.

#### Scenario: Entering correction from the summary

- **WHEN** the user activates the correction action
- **THEN** the commission-level correction sheet opens for the selected assignment or for an explicit assignment choice
- **AND** the action is reachable by keyboard and has an accessible name

#### Scenario: No assignment to correct

- **WHEN** the commission has no practical assignments
- **THEN** the correction action is absent or disabled with an explanation
- **AND** the user can reach the place where assignments are defined
