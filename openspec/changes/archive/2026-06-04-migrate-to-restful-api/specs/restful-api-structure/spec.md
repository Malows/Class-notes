## ADDED Requirements

### Requirement: RESTful API Endpoint Structure

The system MUST expose API endpoints following standard RESTful patterns, utilizing HTTP verbs correctly.

#### Scenario: Successful List Retrieval

- **WHEN** client sends a GET request to `/api/v1/:resource`
- **THEN** system returns 200 OK with the resource list in JSON format

#### Scenario: Successful Resource Creation

- **WHEN** client sends a POST request to `/api/v1/:resource` with valid payload
- **THEN** system returns 201 Created

#### Scenario: Successful Resource Deletion

- **WHEN** client sends a DELETE request to `/api/v1/:resource/:id`
- **THEN** system returns 204 No Content

## REMOVED Requirements

### Requirement: Legacy Non-RESTful Endpoints

**Reason**: Replaced by standard RESTful endpoints.
**Migration**: Update frontend services to use new endpoints:

- POST `/api/v1/faculties/create` -> POST `/api/v1/faculties`
- DELETE `/api/v1/students/delete` -> DELETE `/api/v1/students/:id`
