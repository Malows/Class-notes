## Context

The existing Quick Access Sidebar (`Sidebar.svelte`) provides navigation based on a hierarchical structure of academic units (Subject $\rightarrow$ Period $\rightarrow$ Commission). However, it lacks a dedicated, easily visible block to display the **Academic Context**—the currently active period and associated subjects—which should be pre-fetched as a single source of truth via Server-Side Rendering (SSR).

This design proposes transforming the sidebar into an intelligent component that integrates this metadata context seamlessly, improving user experience by providing immediate visibility into the academic state upon loading.

## Goals / Non-Goals

**Goals:**

- Implement a dedicated API endpoint (`GET /metadata`) to serve a complete payload of the academic context.
- Establish a centralized `MetadataStore` within the application's state management layer.
- Ensure that the initial page load (SSR) pre-fetches this metadata, making it available as props in the main layout component.
- Refactor `Sidebar.svelte` to prioritize and display the active academic period details derived from the new global context.

**Non-Goals:**

- Changing the fundamental navigation structure or relationship between Subjects/Periods/Commissions (this remains the primary function).
- Implementing client-side data fetching fallback logic beyond basic state management (the focus is on SSR integration).

## Decisions

**1. Data Flow Architecture (The Core Logic)**
We adopt a strict, layered architecture: **DB $\rightarrow$ Repository $\rightarrow$ Service $\rightarrow$ API $\rightarrow$ Store $\rightarrow$ Component**.

- **Rationale:** This separation ensures that business logic (`Service`) is decoupled from data access details (`Repository`), making the system testable and maintainable. The `API` acts merely as a thin transport layer for the service's output.

**2. Academic Period Validity Logic (Business Rule)**
The core logic for determining if a period is "active" must reside in the service layer, specifically within `src/lib/services/metadata.service.ts`. This logic mandates two strict criteria based on the server's current date:

- `YEAR(Now) == YEAR(Period)`
- `MONTH(Now) <= SEMESTER(Period)` (Where Semester 1 = Cuatrimestre I, Semester 2 = Cuatrimestre II).
- **Rationale:** Placing this business rule in the service layer ensures that all parts of the application—API, SSR, etc.—use the same, single source of truth for determining context validity.

**3. API Endpoint & Payload Schema**

- **Endpoint:** `src/routes/api/v1/metadata` (GET).
- **Payload (`MetadataContextPayload`):** Must contain both period details and a list of associated subjects:
  ```typescript
  interface MetadataContextPayload {
    periodData: { year: number; term: "Cuatrimestre I" | "Cuatrimestre II" };
    subjects: Array<{ id: string; name: string; href: string }>; // Subject must include its formatted route.
  }
  ```

**4. Component Structure (`Sidebar.svelte`)**
We will introduce a dedicated component, `<MetadataContextSection />`, to encapsulate the visual representation of the metadata block. This keeps `Sidebar.svelte` clean and focused on controlling the display order: _Metadata Context_ $\rightarrow$ _Standard Navigation_.

## Risks / Trade-offs

- **[Risk] Data Staleness via Client Fetch:** If the client component relies solely on fetching data (e.g., during deep navigation), there is a risk of showing stale data if the SSR pre-fetch fails or is bypassed.
  - **Mitigation:** The `MetadataStore` must provide both an initialization method (`initializeStore(payload)`) and a fallback mechanism that clearly indicates when no context is available, ensuring existing navigation functionality remains intact (Subject $\rightarrow$ Period $\rightarrow$ Commission).
- **[Risk] Database Performance Impact:** Implementing complex date-based joins in the repository layer could degrade performance if not properly indexed.
  - **Mitigation:** The SQL query executed in `period-repository.ts` must be reviewed to ensure proper indexing on year and semester columns, optimizing for read speed.

## Migration Plan

1.  **Define Types & Schema:** Update/create interfaces in `src/lib/types/metadata.ts` and update the DTO schema in `src/lib/schemas/dto.schema.ts`.
2.  **Repository Layer (Data Access):** Modify existing repositories (e.g., `period-repository.ts`) to execute an optimized SQL query joining necessary tables and filtering by the active period criteria. This function will return the raw data structure required for the payload.
3.  **Service Layer (Business Logic):** Create/update `src/lib/services/metadata.service.ts`. Implement `getAcademicMetadata()` here, calling the repository layer and applying the date validation logic.
4.  **API Endpoint:** Create `src/routes/api/v1/metadata/+server.ts` to expose the service method as a GET endpoint.
5.  **State Management:** Create `src/lib/stores/metadata.svelte` to hold and manage the global state (`writable<MetadataContextPayload | null>`).
6.  **SSR Integration (CRITICAL):** Update `src/routes/+layout.server.ts` to call `metadataService.getAcademicMetadata()` on every request and pass the result as an initial prop: `{ metadata: payload }`.
7.  **Component Refactoring:** Update `src/components/Sidebar.svelte`'s `$derived subjectItems` block to use a prioritized logic: check for `context.activeMetadata` first, then fall back to store state or default navigation. Create `<MetadataContextSection />` in `src/lib/components`.
