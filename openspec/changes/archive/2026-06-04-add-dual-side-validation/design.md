## Context

Current validation is ad-hoc or missing, creating gaps between frontend UX and backend security. We need a standardized approach for both.

## Goals / Non-Goals

**Goals:**

- Provide inline validation messages to users (Frontend).
- Guarantee data structure integrity (Backend).
- Shared or closely mapped validation rules.

**Non-Goals:**

- Full schema migration (just validation logic).

## Decisions

- **Frontend**: `zod`.
  - Schema storage: `frontend/src/lib/schemas/`.
  - Pattern: Services validate input before `apiFetch`.
- **Backend**: `go-playground/validator`.
  - Pattern: Add struct tags to `dto` types.
  - Middleware/utility in controller to run validation immediately after JSON decode.

## Risks / Trade-offs

- [Risk] Mismatched rules between front and back. → Mitigation: High discipline in defining rules; eventually, we could explore a shared schema definition if feasible.
- [Risk] Backend validation overhead. → Mitigation: Minimal given the library choice and struct tag efficiency.
