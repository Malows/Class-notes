# Design: Component Test Strategy

## 1. Tooling

- Vitest as the test runner.
- `@testing-library/svelte` for component mounting and interaction simulation.

## 2. Test Approach

- **Render Tests:** Verify successful mounting with various props.
- **Interaction Tests:** Verify `onclick` handlers, dynamic class applications, and navigation link correctness.
- **State/Reactive Tests:** Verify components behave correctly when reactive stores or props change.

## 3. Mocking Strategy

- Mock Svelte stores (`$lib/stores/*.svelte`) where necessary to isolate component behavior.
- Mock external navigation/context providers.

## 4. Hierarchy

- Follow the directory structure of components.
- Place test files next to the source files (`Component.svelte` -> `Component.test.ts`).
