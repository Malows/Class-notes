## Why

The dashboard sidebar currently relies on transactional navigation state and does not expose a reliable, server-prepared academic context. This makes the active period and subject list harder to surface consistently across SSR and client state, especially when the user lands on the app with a fresh session or stale client state.

## What Changes

- Add a server-side academic metadata endpoint that returns the active period and associated subjects.
- Introduce a shared metadata store and SSR preload path so the dashboard receives a canonical academic context payload.
- Update the quick-access sidebar to prioritize metadata-driven subject items while preserving the existing hierarchical navigation fallback.
- Add a dedicated metadata context section with a graceful empty state when no active period is available.

## Capabilities

### New Capabilities
- `academic-metadata-context`: Serve and surface the active academic context for the dashboard sidebar through SSR and client state.

### Modified Capabilities
- `dashboard`: Extend the dashboard experience with metadata-driven context and empty-state handling.
- `hierarchical-navigation`: Preserve and augment sidebar navigation with metadata-prioritized subject items and fallback behavior.

## Impact

- Backend API route and service layer under `src/routes/api/v1` and `src/lib/services`.
- Repository and typing updates around period and subject metadata.
- Sidebar and layout components in `src/lib/components` and `src/routes`.
- Test coverage for service/repository behavior and SSR data injection.
