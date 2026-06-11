## Why

Users often reach pages (like Subjects or Periods) without having created their prerequisites (Faculties or Subjects). This leads to confusing empty states. We need a declarative way to guard pages that depend on the existence of other resources.

## What Changes

- Create `src/lib/components/GuardWrapper.svelte` to handle conditional rendering and redirection.
- Refactor `subjects/+page.svelte` to check `facultiesStore`.
- Refactor `periods/+page.svelte` (or relevant page) to check `subjectsStore`.

## Capabilities

### New Capabilities

- `dependency-guarding`: Declarative component for guarding pages based on store state.

## Impact

- Frontend: Pages become more robust and provide better guidance when prerequisites are missing.
