## 1. Frontend Setup

- [x] 1.1 Initialize SvelteKit project in `frontend/` directory using pnpm
- [x] 1.2 Configure `@sveltejs/adapter-static` for SPA mode
- [x] 1.3 Setup base UI layout and navigation in Svelte

## 2. API Refactor (Backend)

- [x] 2.1 Refactor existing Go handlers to return JSON (API v1)
- [x] 2.2 Implement a generic response wrapper for the API
- [x] 2.3 Verify API endpoints with `curl` or a test script

## 3. Frontend Implementation

- [x] 3.1 Implement Faculty and Subject management pages in Svelte
- [x] 3.2 Implement Period and Commission management pages in Svelte
- [x] 3.3 Recreate the "Semaphore Overview" with reactive Svelte components
- [x] 3.4 Implement the sequential correction flow in Svelte

## 4. Integration & Build

- [x] 4.1 Configure Go `embed` to include the `frontend/build` directory
- [x] 4.2 Update the Go router to serve embedded files and handle SPA fallback
- [x] 4.3 Update the `Makefile` to automate the dual-build process
- [x] 4.4 Verify the single-binary distribution works as expected
