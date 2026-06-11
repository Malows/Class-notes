## Context

The current API lacks RESTful conventions, leading to inconsistent endpoints (e.g., `/create`, `/delete` appended to paths). This migration aims to clean up the routing structure to follow standard HTTP methods.

## Goals / Non-Goals

**Goals:**

- Implement RESTful endpoints (GET, POST, DELETE, PUT).
- Standardize response structures.
- Update frontend services to consume the new API.

**Non-Goals:**

- Significant data model changes.
- Auth system refactor (out of scope).

## Decisions

- **Routing**: Adopt `/api/v1/:resource` pattern.
  - `GET /api/v1/faculties` (List)
  - `POST /api/v1/faculties` (Create)
  - `DELETE /api/v1/students/:id` (Delete)
- **Frontend Services**: Create a service class/object per resource type (e.g., `student.service.ts`) to wrap `apiFetch`.

## Risks / Trade-offs

- [Risk] Frontend breaks during migration. → Mitigation: Update backend and frontend services in same deployment cycle, or use feature flags.
- [Trade-off] Initial effort to update all routes. → Mitigation: High long-term gain in maintainability.
