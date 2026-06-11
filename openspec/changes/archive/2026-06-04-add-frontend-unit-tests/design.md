## Context

The project lacks comprehensive test coverage for frontend logic (stores, services) and components. We aim to reach 60% global coverage to improve maintainability and prevent regressions.

## Goals / Non-Goals

**Goals:**

- Reach 60% global coverage in the frontend project.
- Test all stores and services.
- Test key UI components.

**Non-Goals:**

- End-to-end (E2E) testing (currently out of scope).

## Decisions

- **Framework**: Vitest (already installed).
- **Mocking**: Use `vi.mock` for mocking `apiFetch` in service and store tests.
- **Components**: Use `@testing-library/svelte` for UI tests.

## Risks / Trade-offs

- [Risk] Mocks becoming stale as APIs evolve. → Mitigation: Regularly run tests against real backend in CI; keep mocks minimal and updated.
