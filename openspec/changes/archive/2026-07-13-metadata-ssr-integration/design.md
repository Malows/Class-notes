# Metadata SSR Integration Design

## 📐 Architecture Overview

The system will adopt a layered architecture, ensuring separation of concerns between data access, business logic, state management, and presentation. The core flow is unidirectional: **DB $\rightarrow$ Repository $\rightarrow$ Service $\rightarrow$ API $\rightarrow$ Store/SSR $\rightarrow$ Component**.

### Data Flow Diagram (Conceptual)

```mermaid
graph TD
    A[Client Request] --> B(GET /metadata);
    B --> C{Controller (+server.ts)};
    C --> D[MetadataService];
    D --> E[PeriodRepository];
    E --> F[(Database)];
    F -- Period & Subjects --> E;
    E -- Raw Data --> D;
    D -- MetadataContextPayload --> C;
    C -- Props/SSR Context --> G(Layout Component);
    G -- Initial Payload --> H[metadataStore (Svelte Store)];
    H -- State Access --> I[Sidebar.svelte];
```

### Components and Responsibilities

1.  **API Endpoint (`src/routes/api/v1/metadata`):**
    - **Role:** Thin layer controller. Handles request validation and delegates the core business logic to `MetadataService`.
    - **Action:** Calls `getAcademicMetadata()` and returns the structured JSON payload.

2.  **Service Layer (`src/lib/services/metadata.service.ts`):**
    - **Role:** Core Business Logic Engine. This layer is responsible for determining _what_ constitutes the "active academic context."
    - **Critical Logic (Date Validation):** It must implement the strict date validation criteria:
      1.  `YEAR(Current) == YEAR(Period)`
      2.  `MONTH(Current) <= SEMESTER(Period)`
    - **Output:** Must return a `MetadataContextPayload` containing the active period details and an array of associated subject IDs/names/HREFs.

3.  **Repository Layer (Modified):**
    - **Role:** Data Access Object (DAO). Responsible for optimized SQL interaction with the database.
    - **Modification:** The existing repository logic must be updated to accept parameters defining a target period and execute a complex `JOIN` query that filters records based on both the academic period AND the subject association, returning all necessary metadata fields in one go. **No new repositories are created.**

4.  **State Management (`src/lib/stores/metadata.svelte`):**
    - **Role:** Global state container for the academic context.
    - **Functionality:** Provides `initializeStore(payload)` (for SSR) and an asynchronous `fetchMetadataContext()` method (for client-side fallback).

5.  **SSR Integration (`src/routes/+layout.server.ts`):**
    - **Role:** Pre-loader. Executes the service layer logic _on the server_ before rendering the page.
    - **Action:** Calls `metadataService.getAcademicMetadata()` and passes the resulting payload as a prop to the root layout component, ensuring immediate availability on client mount.

## 🧱 Technical Implementation Details

### Data Structure (Typing)

The following types will be defined/updated in `src/lib/types/metadata.ts`:

```typescript
interface MetadataContextPayload {
  periodData: { year: number; term: "Cuatrimestre I" | "Cuatrimestre II" };
  subjects: Array<{ id: string; name: string; href: string }>;
}
// DTO Schema update in src/lib/schemas/dto.schema.ts (MetadataDto)
```

### Frontend Component Logic (`Sidebar.svelte`)

The component's derived state logic for `subjectItems` must be updated to prioritize the metadata context if it exists, ensuring that the new block is rendered first and uses its provided list of subjects.

## 🧪 Testing Strategy

1.  **Unit Tests (Service/Repository):** Mocking `Date()` function or using time-travel utilities (`jest.spyOn(Date)`) to test the date validation logic under various scenarios (e.g., current month > semester month, year mismatch).
2.  **Integration Test (API):** Testing the full flow from controller $\rightarrow$ service $\rightarrow$ repository with mocked database calls.
3.  **SSR/E2E Test:** Verifying that the data payload is correctly passed to the component props during server rendering, confirming client-side fetch fallback is only used if SSR fails or is bypassed.
