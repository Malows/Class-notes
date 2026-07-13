## Context

The dashboard sidebar is currently driven by the existing navigation hierarchy and local store state. That works for transactional browsing, but it does not provide a canonical academic context for the current period and associated subjects. The change needs to introduce a single source of truth for that context, make it available during SSR, and keep the existing hierarchy as a fallback when metadata is unavailable.

## Goals / Non-Goals

**Goals:**
- Introduce an SSR-preloaded academic metadata payload for the dashboard shell.
- Create a metadata-backed sidebar section that prioritizes active-period subjects.
- Preserve existing hierarchical navigation behavior when metadata is missing or empty.
- Keep the implementation aligned with the existing service, repository, and component patterns in the app.

**Non-Goals:**
- Replacing the full navigation model with metadata-only behavior.
- Introducing a new persistence layer or database schema.
- Reworking unrelated dashboards or routes outside the sidebar context flow.

## Decisions

### 1. Server-side metadata as the source of truth

We will add a dedicated `GET /api/v1/metadata` endpoint that delegates to a service layer method, `getAcademicMetadata()`. The service will compute the active period using the server date and return a payload with the current period data plus its associated subject list.

- **Rationale**: This gives the dashboard a single authoritative payload for academic context and avoids relying on client-side state alone.
- **Alternatives**: Loading metadata only in the browser or deriving it from multiple stores would create race conditions and inconsistent UI state.

### 2. Repository-level filtering with optimized SQL

The repository layer will implement a targeted query that joins the relevant period and subject tables, filters by the active period window, and returns one row per subject with the metadata needed by the UI.

- **Rationale**: The change keeps data access logic close to the persistence layer and avoids pulling extra data into the service.
- **Alternatives**: Fetching all periods and filtering in memory would be less efficient and harder to test.

### 3. Metadata store plus layout-level SSR preload

A new store will hold the metadata context payload, and the root layout server load will call the service to preload it before rendering the dashboard shell.

- **Rationale**: This pattern allows the component tree to receive SSR data immediately while still supporting a client-side refresh path.
- **Alternatives**: Injecting metadata directly into component props without a store would make it harder to reuse and refresh later.

### 4. Sidebar priority ordering

The sidebar will resolve subject items using the following priority: metadata context first, then existing transactional store state. The existing hierarchical navigation remains available as a fallback.

- **Rationale**: This preserves the current navigation experience while making the active academic context prominent when available.
- **Alternatives**: Replacing the hierarchy entirely would reduce discoverability and break existing workflows.

## Risks / Trade-offs

- **[Risk] Active-period calculation ambiguity** → **Mitigation**: Implement the YEAR and MONTH/semester rule explicitly in the service and cover it with tests using mocked dates.
- **[Risk] SSR and client mismatch** → **Mitigation**: Initialize the store from the SSR payload and keep the fetch path as a fallback so the UI remains consistent.
- **[Risk] Missing metadata data** → **Mitigation**: Render an elegant empty state and continue showing the existing navigation hierarchy.

## Migration Plan

1. Add the metadata endpoint and service logic.
2. Update repository queries and shared types/schemas.
3. Wire the metadata store and SSR preload into the layout.
4. Update the sidebar and add the new metadata context section.
5. Add and run tests for service, repository, and SSR behavior.

## Open Questions

- Whether the active period should be based on the current server timezone or a fixed application timezone.
- Whether the metadata section should be shown only on the dashboard shell or in other layout contexts in the future.
