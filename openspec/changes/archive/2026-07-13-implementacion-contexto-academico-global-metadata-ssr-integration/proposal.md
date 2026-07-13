## Why

The current dashboard structure for academic notes lacks a centralized, reliable source of truth for the user's active academic context (e.g., Year and Term). This leads to potential data inconsistencies or poor user experience when navigating complex structures, as the sidebar relies on multiple sources rather than a single, pre-loaded metadata payload. Implementing this dedicated Academic Context Metadata via SSR will ensure all components start with accurate, server-validated state, improving data integrity and UX immediately upon page load.

## What Changes

- **New API Endpoint**: Creation of `GET /api/v1/metadata` to serve the full academic context payload (`MetadataContextPayload`).
- **Service Layer Logic**: Implementation in `src/lib/services/metadata.service.ts` to calculate and return metadata based on strict date criteria (Year match AND Month <= Semester).
- **State Management**: Introduction of a dedicated store, `src/lib/stores/metadata.svelte`, to manage the global academic context state.
- **SSR Integration**: Modification of the layout (`src/routes/+layout.server.ts`) to pre-fetch and inject this metadata as props on initial load.
- **UI Component**: Creation of `<MetadataContextSection />` within `Sidebar.svelte` to prominently display the active academic context (Year, Term, Subjects).

## Capabilities

### New Capabilities

- **academic-metadata-ssr**: Introduces a dedicated API endpoint and service layer responsible for calculating and providing the single source of truth for the user's current academic period metadata via Server-Side Rendering. This capability manages the lifecycle from DB query to client state initialization.

### Modified Capabilities

- _(None)_: No existing spec requirements are changing, only new ones are being added.

## Impact

This change impacts the entire application stack:

- **API**: New endpoint `/api/v1/metadata`.
- **Services**: `src/lib/services/metadata.service.ts` (New).
- **Stores**: `src/lib/stores/metadata.svelte` (New).
- **Routes/Layout**: `src/routes/+layout.server.ts` (Modification).
- **Components**: `src/components/Sidebar.svelte` and new component `<MetadataContextSection />`.
- **Database**: Requires optimized SQL queries in existing repositories to support the date-based filtering for active periods.
