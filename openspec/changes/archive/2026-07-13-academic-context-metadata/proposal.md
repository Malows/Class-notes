## Why

The current Quick Access Panel (Sidebar) provides only traditional hierarchical navigation. This change is necessary to transform it into an intelligent component that displays the user's Active Academic Context (Metadata). By pre-loading this data via Server-Side Rendering (SSR) and establishing a single source of truth for academic status, we provide users with immediate, context-aware information upon dashboard load, significantly improving navigation efficiency and user experience.

## What Changes

- **New API Endpoint**: Creation of the `GET /metadata` endpoint at `src/routes/api/v1/metadata`. This endpoint will serve a complete payload detailing the current academic context.
- **Service Logic Enhancement**: The core business logic in `src/lib/services/metadata.service.ts` must be updated to calculate period validity based on two strict criteria using the server's current date: 1) The year of 'Now' must match the Period Year, AND 2) The month of 'Now' must be less than or equal to the Semester (Semester 1 = Cuatrimestre I, Semester 2 = Cuatrimestre II).
- **State Management**: Introduction of a new global store (`src/lib/stores/metadata.svelte`) to manage the academic context state (`MetadataContextPayload`).
- **SSR Integration**: Critical implementation in `src/routes/+layout.server.ts` (or relevant layout) to pre-fetch and pass the metadata payload as props, ensuring data availability client-side without an initial API call delay.
- **UI Component**: Creation of a dedicated `<MetadataContextSection />` component within `Sidebar.svelte` to visually display the active context details (Year, Term, Subject list).

## Capabilities

### New Capabilities

- **metadata-context-api**: Provides the structured and validated academic metadata payload for SSR pre-loading and client-side consumption. This capability defines the rules for determining 'active' status based on date logic.

### Modified Capabilities

- None at the spec level are changing; this is an addition of a new, critical data context layer that affects existing components but introduces no change to existing requirements.

## Impact

- **Code**: `src/routes/api/v1/metadata/+server.ts` (New), `src/lib/services/metadata.service.ts` (Modification), `src/lib/stores/metadata.svelte` (New).
- **Types/Schemas**: Modification of types in `src/lib/types/metadata.ts` and updating the DTO schema in `src/lib/schemas/dto.schema.ts`.
- **Frontend**: Modification of `src/routes/+layout.server.ts`, `src/lib/components/SidebarContextSection.svelte`, and `src/components/Sidebar.svelte`.

---
