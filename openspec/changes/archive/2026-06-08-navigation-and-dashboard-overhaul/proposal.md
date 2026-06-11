## Why

The current navigation structure is overly linear and lacks context, making it difficult for users to understand their position in the academic hierarchy (Faculty > Subject > Period > Commission). Additionally, the home page is underutilized, serving only as a simple menu rather than a functional dashboard.

## What Changes

- **Hierarchical Routing**: Refactor the route structure to reflect the actual data hierarchy (e.g., `/faculties/[f_id]/subjects/[s_id]...`).
- **Breadcrumbs Component**: A dynamic navigation aid at the top of the application showing the current path using entity names instead of IDs.
- **Responsive Sidebar**: A sidebar providing context-aware quick access to related entities, persistent on large screens and collapsible on mobile.
- **Functional Dashboard**: Transform the home page into a dashboard showing pending corrections, active subjects, and summary statistics.
- **NavStore**: A dedicated Svelte store to manage the navigation state and resolve ID-to-Name mappings reactively.

## Capabilities

### New Capabilities

- `breadcrumbs`: Implementation of a dynamic breadcrumb component with name resolution.
- `dashboard`: A functional landing page with summarized academic information.
- `hierarchical-navigation`: A robust, nested routing system that maintains data context.

### Modified Capabilities

- `academic-hierarchy`: Update route definitions to be nested rather than flat.

## Impact

- **Routes**: Significant movement of files within `src/routes/`.
- **Layout**: Modification of `+layout.svelte` to include Sidebar and Breadcrumbs.
- **Stores**: Creation of `NavStore` and potentially updates to existing stores for better cross-entity lookups.
- **UI**: New dashboard components and navigation elements.
