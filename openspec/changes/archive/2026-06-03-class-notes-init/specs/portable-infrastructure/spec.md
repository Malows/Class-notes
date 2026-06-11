## ADDED Requirements

### Requirement: Single Binary Distribution

The system SHALL be compilable into a single executable file for target platforms (Linux and Windows).

#### Scenario: Compiling for Windows 7

- **WHEN** the project is built for windows/amd64
- **THEN** it generates a single .exe file that runs on Windows 7 without external dependencies

### Requirement: Embedded Database

The system SHALL use SQLite for data storage, embedded within the local filesystem.

#### Scenario: Data backup

- **WHEN** the user wants to backup their data
- **THEN** they only need to copy the `class-notes.db` file

### Requirement: Local Web Interface

The system SHALL serve a web-based user interface on a local port, accessible via standard browsers.

#### Scenario: Accessing the app

- **WHEN** the user runs the binary
- **THEN** the system starts a local server and the user can access the GUI at http://localhost:PORT
