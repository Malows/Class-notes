## ADDED Requirements

### Requirement: Global Metadata Store Management
The system SHALL provide a dedicated Svelte store (`src/lib/stores/metadata.svelte`) to manage and expose the active academic context globally across the application components.

#### Scenario: Initializing state from SSR (Successful)
- **WHEN** The `initializeStore` function is called with a valid payload received via Server-Side Rendering (SSR).
- **THEN** The store's internal state MUST be set immediately to this payload, making it available in client components without an initial fetch call.

#### Scenario: Initializing state on Client Mount (Fallback)
- **WHEN** The component mounts on the client side and no SSR data is present.
- **THEN** The store must trigger `fetchMetadataContext()` asynchronously to populate the context, showing a loading state until data arrives.

#### Scenario: Data Update/Refresh
- **WHEN** A user action or background process requires updating the metadata (e.g., checking for next term).
- **THEN** The store MUST expose an explicit method (`refreshMetadata`) that calls the API and updates the local state atomically.