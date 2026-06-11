## Context

Refactoring SvelteKit frontend to a clean architecture pattern.

## Goals / Non-Goals

**Goals:**

- Decouple data fetching from components (Services).
- Centralize shared state (Stores).
- Separate logic from presentation (Smart vs Dumb Components).

## Decisions

### 1. Structure

- `lib/services`: API wrappers.
- `lib/stores`: Writable stores.
- `lib/components`: UI components.

### 2. Implementation

- Services will return domain objects (DTOs).
- Stores will hold current commission/assignment data.
- Components will use slots and callbacks for interaction.
