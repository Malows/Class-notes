## Context

The current application structure uses flat routing for entities (e.g., `/subjects/[id]`, `/periods/[id]`), which loses the context of parent entities as the user navigates deeper. The home page is a simple static menu. The UI uses _PaperCSS_.

## Goals / Non-Goals

**Goals:**

- Implement a hierarchical routing system (e.g., `/faculties/[f_id]/subjects/[s_id]...`).
- Add dynamic breadcrumbs showing entity names.
- Create a responsive sidebar (fixed on desktop, collapsible on mobile).
- Transform the home page into a functional dashboard.
- Centralize navigation context management in a `NavStore`.

**Non-Goals:**

- Implementing deep search or global filtering.
- Changing the primary CSS framework (_PaperCSS_).

## Decisions

### 1. Hierarchical Routing Structure

- **Decision**: Refactor all routes to follow the data hierarchy: `faculties/` -> `[f_id]/subjects/` -> `[s_id]/periods/` -> `[p_id]/commissions/` -> `[c_id]/`.
- **Rationale**: Ensures that parent IDs are always available in the URL, allowing components to load context without complex state management.

### 2. NavStore for Name Resolution

- **Decision**: Create a `NavStore` that subscribes to `$page`. It will parse parameters and use existing stores (`facultiesStore`, `subjectsStore`, etc.) to map IDs to Names.
- **Rationale**: Decouples the UI components (like Breadcrumbs) from the fetching logic and ensures name updates are reflected across the app.

### 3. Responsive Sidebar Implementation

- **Decision**: Use a layout grid in `+layout.svelte` with a conditional `aside` element. Desktop (>768px) will show it fixed. Mobile will use a button to toggle a collapsible overlay.
- **Rationale**: Provides consistent access to sibling entities (e.g., other commissions in the same period) without cluttering the screen on smaller devices.

### 4. Functional Dashboard Components

- **Decision**: Add specific widgets to the home page for "Pending Corrections", "Active Subjects", and "Statistics".
- **Rationale**: Provides immediate value to the professor upon opening the application.

## Risks / Trade-offs

- **Route Refactor Surface Area**: Changing almost all routes will require updating many `goto` calls and `href` attributes. → **Mitigation**: Perform the refactor incrementally and use a search-and-replace approach for known path patterns.
- **Deep URLs**: Paths will become longer. → **Mitigation**: This is an acceptable trade-off for the clarity and state persistence provided by hierarchical URLs.
- **Store Load Dependencies**: `NavStore` needs other stores to be loaded. → **Mitigation**: `NavStore` will trigger loads if data is missing for the current route context.
