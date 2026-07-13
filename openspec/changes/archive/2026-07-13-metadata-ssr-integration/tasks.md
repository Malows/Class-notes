## 1. Backend API & Business Logic (Data Source)

- [x] 1.1 Create endpoint handler at `src/routes/api/v1/metadata/+server.ts` to expose metadata context via GET `/v1/metadata`.
- [x] 1.2 Implement core business logic in `src/lib/services/metadata.service.ts`: create `getAcademicMetadata()` function that calculates the active period based on server date rules (Year match AND Month <= Semester).
- [x] 1.3 Update existing repositories (`period-repository.ts` or similar) with optimized SQL queries to retrieve: a) Active Period details, and b) List of associated Subject IDs/Names for that period.
- [x] 1.4 Define necessary interfaces in `src/lib/types/metadata.ts`, including the full payload structure (`MetadataContextPayload`).
- [x] 1.5 Update DTO schema definition in `src/lib/schemas/dto.schema.ts` to include `MetadataDto`.

## 2. State Management & SSR Integration (Data Flow)

- [x] 2.1 Create new store file at `src/lib/stores/metadata.svelte`, defining the writable state and implementing `initializeStore(payload)` for initial load.
- [x] 2.2 Implement asynchronous data fetching method (`fetchMetadataContext()`) in the metadata store.
- [x] 2.3 Update the main layout file at `src/routes/+layout.ts` to execute `metadataService.getAcademicMetadata()` during SSR and pass the result as a prop (`{ metadata: payload }`).

## 3. Frontend Components (Presentation)

- [x] 3.1 Modify `Sidebar.svelte`: Update the `$derived subjectItems` logic block to prioritize and consume data from the newly available active metadata context, ensuring it overrides standard navigation items when present.
- [x] 3.2 Create new component `<MetadataContextSection />` in `src/lib/components/`. This component must receive the payload and render: a) The title (Cuatrimestre Activo), b) Year and Term details, and c) A list of active subjects using the correct `SidebarContextItem` structure with pre-formatted links (`href`).
- [x] 3.3 Adapt visual presentation in `src/lib/components/SidebarContextSection.svelte` to accommodate the new metadata block at the top of the sidebar.

## 4. Testing and Validation (Verification)

- [x] 4.1 Write unit tests for `metadata.service.ts`, utilizing date mocking (`jest.spyOn(Date)`) to rigorously test the academic period calculation logic against various dates/semesters.
- [x] 4.2 Implement end-to-end or component tests verifying that the data payload is correctly passed from `src/routes/+layout.ts` props into the store and subsequently rendered by `<MetadataContextSection />`.
- [x] 4.3 Implement robust fallback state handling in `Sidebar.svelte`: if metadata fails to load or is empty, the sidebar must gracefully degrade and retain its existing Subject $\to$ Period $\to$ Commission navigation flow without errors.
