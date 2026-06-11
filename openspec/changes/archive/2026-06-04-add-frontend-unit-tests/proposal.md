## Why

Current test coverage is limited to a small subset of components and services. To ensure reliability and meet the 60% global coverage target, we need to implement unit tests for all stores, services, and core UI components.

## What Changes

- Create test files for all stores (`lib/stores/`).
- Create test files for all services (`lib/services/`).
- Expand test coverage for core UI components, specifically those in `frontend/src/lib/components/pure/` as they are isolated and easily testable.

## Capabilities

### New Capabilities

- `frontend-unit-testing`: Systematic testing of frontend business logic and UI.

## Impact

- Frontend: Significantly increased test suite size and run time.
- Quality: Higher confidence in refactoring and feature additions.
