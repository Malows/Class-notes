# Metadata SSR Integration Proposal

## 🚀 Objective

The goal is to transform the Quick Access Dashboard Sidebar (`Sidebar.svelte`) into an intelligent component that displays not only traditional hierarchical navigation but also a dedicated block for the **Active Academic Context (Metadata)**. This context must be pre-loaded via Server-Side Rendering (SSR), establishing it as the single source of truth for the user's academic status within the application.

## 🎯 Scope

This change involves:

1.  Creating an API endpoint (`GET /metadata`) to serve the complete academic context payload.
2.  Implementing complex business logic in a dedicated service layer to calculate and validate the active academic period based on server date criteria (Year and Semester).
3.  Modifying repository access logic to query and retrieve metadata for the active period's subjects.
4.  Creating a global state store (`metadataStore`) to manage this context.
5.  Implementing SSR logic in the root layout (`+layout.server.ts`) to pre-fetch and pass the data as props.
6.  Updating `Sidebar.svelte` to prioritize and render this new metadata block.

## ✨ Why This is Important

Currently, the academic context is difficult to access or synchronize across components. By implementing SSR via a dedicated endpoint:

- **Data Consistency:** We ensure all client-side components receive consistent, pre-calculated data on initial load.
- **Performance:** The critical metadata is available immediately without requiring an extra client-side fetch call (improving perceived performance).
- **Single Source of Truth:** It centralizes the complex business logic for determining "active academic status" in one place (the service layer), making it testable and maintainable.
