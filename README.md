# Class Notes

A robust academic management system designed to organize faculties, subjects, periods, and commissions with a focus on data integrity, hierarchical navigation, and a distinctive "sketchy" aesthetic.

## 🚀 Overview

Class Notes provides a centralized platform for educators and academic administrators to manage the complex hierarchy of higher education. From high-level faculty management to granular student assignment tracking, the system ensures everything is organized and easily accessible via an actionable dashboard.

## ✨ Key Features

- **Academic Hierarchy**: Manage Faculties, Subjects, Periods (Year/Semester), and Commissions.
- **Student Management**: Detailed tracking of student rosters within specific commissions.
- **Assignment Tracking**: Integrated management of assignments and student deliveries.
- **Actionable Dashboard**: Real-time statistics, approval rates, and pending correction alerts.
- **i18n Support**: Full internationalization support (English/Spanish).
- **Responsive "Sketchy" UI**: A unique visual style powered by PaperCSS with seamless Dark/Light mode support.

## 🛠 Tech Stack

- **Framework**: [Svelte 5](https://svelte.dev/) (Runes-based state management)
- **Meta-framework**: [SvelteKit](https://kit.svelte.dev/)
- **Styling**: [PaperCSS](https://www.getpapercss.com/) + Vanilla CSS
- **Database**: SQLite (via `better-sqlite3`)
- **Validation**: Zod (Dual-side validation)
- **Testing**: Vitest + Svelte Testing Library
- **Linting/Formatting**: Oxlint & Oxfmt

## 🏗 Architecture

The project follows **Clean Architecture** principles to ensure maintainability and testability:

1.  **UI Components**: Svelte components decoupled from business logic.
2.  **Stores**: Centralized state management using Svelte 5 runes (`$state`, `$derived`).
3.  **Services**: Orchestration layer handling business rules and coordinating between stores and API.
4.  **Repositories**: Data access layer (Server-side) for SQLite persistence.
5.  **DTOs/Schemas**: Type-safe data structures validated with Zod.

## 📦 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS)
- [pnpm](https://pnpm.io/) (Mandatory package manager)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd class-notes

# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev

# Run internationalization key validation
pnpm validate:i18n

# Run tests
pnpm test

# Run linting
pnpm lint
```

## 🔄 Development Workflow (OpenSpec)

This project uses the **OpenSpec** methodology for managing changes. All significant features or refactors follow a structured process:

1.  **Design**: Requirements and scenarios are defined in `openspec/specs/`.
2.  **Proposal**: Technical implementation plans are drafted.
3.  **Tasks**: Implementation is tracked via granular tasks.
4.  **Archive**: Completed changes are moved to `openspec/changes/archive/`.

## 📜 License

Private Project - All rights reserved.
