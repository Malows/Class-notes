## Why

The current implementation uses server-side rendering (SSR) with Go templates, which is functional but limited for highly interactive UIs like the "Semaphore Overview" and "Sequential Correction".
Moving to SvelteKit provides a modern developer experience, better interactivity, and a cleaner separation between data (API) and presentation (UI), while maintaining the single-binary requirement through Go's `embed` package.

## What Changes

- **Frontend Refactor**: Rewrite the existing Go templates into Svelte components.
- **SvelteKit Setup**: Initialize a SvelteKit project in a `frontend/` directory.
- **Static Adapter**: Use `@sveltejs/adapter-static` to generate a SPA/Static site.
- **API Implementation**: Refactor Go handlers to return JSON instead of rendering HTML.
- **Asset Embedding**: Use Go `embed` to include the SvelteKit `build/` directory in the final binary.
- **Build Automation**: Update Makefile to handle both `pnpm` and `go` build steps.

## Capabilities

### New Capabilities

- `json-api`: Go handlers providing structured data for the frontend.
- `svelte-frontend`: Modern, interactive UI using SvelteKit.
- `unified-build`: Makefile automation for frontend and backend compilation.

### Modified Capabilities

- `portable-infrastructure`: Updated to serve embedded static files from SvelteKit instead of templates.
- `grading-and-integrity`: UI logic moved to Svelte for better interactivity.

## Impact

- **Development**: Requires Node.js and pnpm.
- **Binary Size**: May increase slightly due to frontend assets, but still portable.
- **Architecture**: Move from SSR to SPA (Single Page Application) backed by a Go API.
