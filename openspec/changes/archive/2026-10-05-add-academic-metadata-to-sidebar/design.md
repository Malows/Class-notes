## Context

The current dashboard component (`src/routes/dashboard/page.tsx`) is a core user view, but its contextually relevant metadata (like available academic programs) is either missing or not efficiently surfaced. The existing data fetching mechanism is insufficient for global, SSR-driven meta-context display. Stakeholders include all users needing quick access to program information and the development team responsible for API integration.

## Goals / Non-Goals

**Goals:**

- To implement a robust, performant method (SSR) to fetch comprehensive academic metadata (Faculties, Subjects, Periods).
- To display this metadata in a dedicated, non-intrusive component within the dashboard sidebar.
- To establish a clear contract for data consumption via the new `/api/v1/academic-metadata` endpoint.

**Non-Goals:**

- Modifying the core logic of existing academic services (e.g., student enrollment). This change is purely about _discovery_ and _display_.

## Decisions

### 1. Data Fetching Mechanism: Server-Side Rendering (SSR)

**Decision:** Use SSR for fetching metadata on the dashboard page.
**Rationale:** Client-side rendering would lead to a poor user experience due to hydration delays and potential flash of empty content. Since this data is foundational context required for initial view rendering, fetching it at the server level ensures immediate availability and better SEO/caching opportunities.

### 2. API Endpoint: `/api/v1/academic-metadata`

**Decision:** Define a dedicated GET endpoint `/api/v1/academic-metadata`.
**Rationale:** Centralizing this data fetch prevents scattering metadata logic across various components or services. This service layer will be responsible for aggregating data from underlying repositories (e.g., `FacultyRepository`, `SubjectRepository`).

### 3. Data Structure: Flat Object Model

**Decision:** The API should return a single, flattened object containing arrays for major entities (`{ faculties: [], subjects: [], periods: [] }`) rather than nested resource structures.
**Rationale:** This simplifies consumption in the dashboard component and avoids complex data mapping/traversal on the client side, keeping the sidebar widget implementation lean.

## Risks / Trade-offs

- **[Risk] Data Staleness**: If the underlying repositories are slow or fail to connect, the SSR process could time out or serve stale data.
  - **Mitigation**: Implement a robust fallback mechanism (e.g., serving cached/default data and logging an error) and set strict timeouts on the API call within `src/lib/services/academicService.ts`.
- **[Trade-off] Complexity vs. Performance**: Aggregating all metadata into one endpoint is simple for consumption but might create a performance bottleneck if the underlying repositories grow very large. We accept this risk initially, prioritizing fast development and clean component separation.

## Migration Plan

1.  Update `src/routes/dashboard/page.tsx` to call the new SSR data fetching utility.
2.  Implement the service logic in `src/lib/services/academicService.ts` to construct the payload for `/api/v1/academic-metadata`.
3.  (If necessary) Update API gateway routes to expose and handle the new endpoint.

## Open Questions

- What is the exact caching strategy (e.g., Redis TTL, CDN cache headers) that should be applied to the `/api/v1/academic-metadata` response?
