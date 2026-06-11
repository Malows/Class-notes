## Context

The user is a university professor needing a portable tool for academic management. Constraints include compatibility with Windows 7 and Linux, offline operation, and easy data backup via file copying.

## Goals / Non-Goals

**Goals:**

- Create a cross-platform, single-binary application.
- Implement a hierarchical data model (Faculty -> Subject -> Commission).
- Provide a visual "Semaphore" overview for student progress.
- Enable easy tracking of AI usage levels.

**Non-Goals:**

- Multi-user authentication (single user/local only).
- Cloud synchronization (portability is handled via the SQLite file).
- Advanced LMS features like online submission (manual entry only).

## Decisions

### 1. Backend Language: Go (Golang)

- **Rationale**: Generates static binaries without runtime dependencies. Excellent support for cross-compilation (GOOS=windows GOARCH=amd64).
- **Alternatives**: Python (packaging is complex and heavy), Node.js (requires runtime installation).

### 2. Database: SQLite

- **Rationale**: Serverless, single-file database. Perfect for local "file-based" backup and portability.
- **Alternatives**: PostgreSQL (requires server management), JSON files (fragile for relational data).

### 3. Frontend: Server-Side Rendering (SSR) with Go Templates

- **Rationale**: Minimizes frontend complexity and build steps. Works reliably in older browsers (relevant for Windows 7 environments).
- **Alternatives**: React/Vue (adds build complexity and potential browser compatibility issues on older systems).

### 4. CSS Framework: Minimalist / Vanilla

- **Rationale**: Use a small CSS file (like Water.css or Picnic CSS) to provide professional look with zero-to-low overhead.

### 5. Data Schema

- `faculties`: id, name
- `subjects`: id, faculty_id, name
- `periods`: id, subject_id, year, semester (1 or 2)
- `commissions`: id, period_id, name
- `students`: id, commission_id, name, external_id
- `assignments`: id, period_id, title
- `deliveries`: id, assignment_id, student_id, is_delivered, is_approved, grade, ai_level (0, 1, 2)

## Risks / Trade-offs

- **Windows 7 Compatibility** → Go 1.21+ has limited support for Win7. We might need to target a specific Go version or ensure we don't use APIs that require Win10+ (e.g., certain syscalls).
- **Manual Data Entry** → Cargar alumnos uno a uno es tedioso. _Mitigación_: Implementaremos una opción simple de "Pegar lista" (multiline text area) que procese nombres.
