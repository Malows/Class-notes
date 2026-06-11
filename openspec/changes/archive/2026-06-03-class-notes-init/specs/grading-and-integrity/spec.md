## ADDED Requirements

### Requirement: Delivery Registration

The system SHALL allow the user to register the delivery and correction status of a TP for a specific student.

#### Scenario: Mark TP as Approved

- **WHEN** the user selects a student and a TP, and marks it as "Delivered" and "Approved"
- **THEN** the system updates the student's record for that TP

### Requirement: AI Usage Level

The system SHALL support tracking the level of AI usage in a TP submission using a 3-level scale.

#### Scenario: Set AI usage level

- **WHEN** the user selects a delivery and sets the AI level to "Suspected" (Level 1) or "Definite" (Level 2)
- **THEN** the system stores this level and displays an appropriate icon in the overview

### Requirement: Semaphore Overview

The system SHALL provide a grid view showing all students and TPs for a Commission, using colors to indicate status.

#### Scenario: Visualizing commission progress

- **WHEN** the user views the Commission Overview
- **THEN** they see a table where Green = Approved, Red = Disapproved, and Gray = Not Delivered

### Requirement: Correction Flow

The system SHALL provide a sequential correction interface for a selected TP.

#### Scenario: Sequential correction

- **WHEN** the user enters correction mode for a TP
- **THEN** the system shows students one by one, allowing the user to enter data and navigate to the next student
