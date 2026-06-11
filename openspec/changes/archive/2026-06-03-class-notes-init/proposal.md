## Why

Professor needs a dedicated, lightweight, and cross-platform tool to track student practical assignments (TPs), grades, and AI usage integrity. Current systems are either too complex or not available offline/portably for both Linux (personal) and Windows 7 (teaching) environments.

## What Changes

- **Initial Project Structure**: Setup for a Go-based application with a local Web UI.
- **Data Model**: Implementation of an academic hierarchy (Faculty -> Subject -> Academic Year -> Semester -> Commission -> Students).
- **Assignment Management**: Capability to create TPs at the Subject/Period level and track them across commissions.
- **Grading & AI Tracking**: A 3-level AI usage scale (None, Suspected, Definite) and a "Semaphore" (Green/Red/Gray) overview of student progress.
- **Data Portability**: SQLite-based storage for easy backups and single-binary distribution.

## Capabilities

### New Capabilities

- `academic-hierarchy`: Managing the structure of faculties, subjects, commissions, and students.
- `assignment-management`: Creating and managing practical assignments (TPs), including copying from previous periods.
- `grading-and-integrity`: Tracking student submissions, grades, and AI usage levels with a visual overview.
- `portable-infrastructure`: Go backend with embedded SQLite and local Web UI for cross-platform portability (Linux/Windows 7).

### Modified Capabilities

<!-- None - Initial Project Setup -->

## Impact

- **Storage**: A local `class-notes.db` (SQLite) file.
- **Distribution**: Single executable binary for Linux and Windows.
- **User Interface**: Local web browser accessed via a local port.
