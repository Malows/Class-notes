## 1. Project Infrastructure & Data Layer

- [x] 1.1 Initialize Go module and project directory structure
- [x] 1.2 Setup SQLite database connection and basic migration runner
- [x] 1.3 Implement core DB models (Faculty, Subject, Period, Commission, Student, Assignment, Delivery)

## 2. Academic Hierarchy Management

- [x] 2.1 Create web handlers and templates for Faculty and Subject management
- [x] 2.2 Implement Period and Commission creation (Year + Semester logic)
- [x] 2.3 Implement Student roster management for Commissions (with "Paste List" support)

## 3. Assignment & Grading System

- [x] 3.1 Implement TP definition at the Subject/Period level
- [x] 3.2 Implement "Copy TPs" logic from previous periods
- [x] 3.3 Build the "Correction Mode" interface (sequential student grading)
- [x] 3.4 Implement AI usage level tracking (3-level scale)

## 4. Visualizations & Final Polish

- [x] 4.1 Implement the "Semaphore Overview" grid for Commissions
- [x] 4.2 Add icons for AI level alerts in the overview
- [x] 4.3 Setup Makefile/Build script for cross-compilation (Linux/Windows)
- [x] 4.4 Final testing of the portable binary and SQLite backup flow
