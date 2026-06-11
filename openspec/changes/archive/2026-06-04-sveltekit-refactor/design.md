## Context

Transitioning from Go Templates (SSR) to a SvelteKit (SPA) frontend to improve interactivity and maintainability, while keeping the Go + SQLite single-binary portable nature.

## Goals / Non-Goals

**Goals:**

- Decouple Frontend and Backend via a JSON API.
- Use SvelteKit for a reactive and polished UI.
- Maintain single-binary distribution using `embed`.
- Automate the build with a unified Makefile.

**Non-Goals:**

- Changing the underlying SQLite schema.
- Adding complex frontend state management (keep it simple).

## Decisions

### 1. Frontend Framework: SvelteKit

- **Rationale**: Fast, small bundles, and excellent DX.
- **Adapter**: `@sveltejs/adapter-static` with `fallback: 'index.html'` for SPA behavior.

### 2. Communication: JSON API

- **Path**: All API endpoints will be prefixed with `/api/v1/`.
- **Format**: Standard JSON request/response.

### 3. Integration: Go `embed`

- The Go backend will use `//go:embed frontend/build/*` to include the compiled frontend.
- A custom `http.FileServer` or `fs.FS` handler will serve these files.

### 4. Routing

- Frontend routing handled by SvelteKit (Client-side).
- Backend must serve `index.html` for any non-API route to support deep linking in the SPA.

### 5. Build Automation (Makefile)

```makefile
.PHONY: build-frontend build-backend build

build-frontend:
	cd frontend && pnpm install && pnpm build

build-backend:
	go build -o class-notes main.go

build: build-frontend build-backend
```

## Risks / Trade-offs

- **SEO** → Not a priority for a local academic tool.
- **Initial Load** → Slightly more JS to download, but negligible for a local app.
- **Complexity** → Two separate projects (Go/Svelte) to manage, mitigated by a clear API contract.
