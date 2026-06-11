## ADDED Requirements

### Requirement: Frontend Inline Validation

The frontend MUST validate user inputs against predefined rules before submitting to the backend.

#### Scenario: Validation Failure

- **WHEN** user submits invalid input (e.g., empty field, invalid format)
- **THEN** UI displays a clear, localized error message inline

### Requirement: Backend Request Validation

The backend MUST validate all incoming request payloads against strict rules before processing.

#### Scenario: Invalid Payload

- **WHEN** client sends an invalid request payload
- **THEN** system rejects request with 400 Bad Request and detailed error reasons
