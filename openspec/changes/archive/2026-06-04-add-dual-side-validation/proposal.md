## Why

Inconsistent input validation leads to poor UX on the frontend and security/integrity risks on the backend. This change implements dual-side validation to ensure rapid UI feedback and robust data integrity.

## What Changes

- **Frontend**: Implement Zod schemas in `frontend/src/lib/schemas/` and integrate them into service layer calls.
- **Backend**: Implement `go-playground/validator` middleware/logic in `internal/controllers` or `internal/dto` to validate incoming requests.

## Capabilities

### New Capabilities

- `frontend-inline-validation`: Zod-based validation in services.
- `backend-request-validation`: Struct tag-based validation in controllers.

### Modified Capabilities

-

## Impact

- Frontend: Service calls will now perform validation, requiring components to handle validation errors.
- Backend: API controllers will require an additional validation step, potentially changing response bodies on error (to structured validation error messages).
