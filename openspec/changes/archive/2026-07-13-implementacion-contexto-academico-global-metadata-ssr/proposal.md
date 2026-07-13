## Proposal: Global Academic Context Metadata Integration (SSR)

**Problem Statement:**
The current Quick Access Sidebar (`Sidebar.svelte`) provides navigation based solely on a historical or transactional view of academic units (Subject $\rightarrow$ Period $\rightarrow$ Commission). This approach fails to provide users with an immediate, high-level understanding of their *current* academic context—the active period and associated subjects as determined by the server's date logic. This leads to potential confusion, requires multiple clicks to confirm status, and degrades the user experience upon initial page load.

**Proposed Solution (The "What"):**
We propose implementing a dedicated **Academic Context Metadata layer**. This involves creating a new API endpoint (`GET /metadata`) that serves a centralized payload containing:
1.  The active academic period details (Year and Term).
2.  A list of all subjects currently associated with that active period.

This metadata will be pre-fetched on the server side during the initial page load (SSR) and exposed via a new global state store (`MetadataStore`). The `Sidebar.svelte` component will then prioritize displaying this context block, making it the single source of truth visible immediately to the user.

**Justification (The "Why"):**
1.  **Improved UX & Discoverability:** By surfacing the active academic context upfront, users instantly know where they are and what resources are available without navigating through the hierarchy first.
2.  **Single Source of Truth (SSOT):** Centralizing the logic for determining the *active* period in a dedicated service layer prevents inconsistencies across different parts of the application that might rely on manual date checks or differing data sources.
3.  **Architectural Cleanliness:** Following modern web patterns, integrating this via SSR ensures the client component receives all necessary data upfront, minimizing client-side fetching overhead and improving perceived performance (Core Web Vitals).

**Expected Impact:**
*   The application gains a robust mechanism for displaying dynamic, server-validated academic context.
*   Code separation is achieved by isolating business logic in `metadata.service.ts`.
*   The user experience becomes more intuitive and actionable from the moment they load the dashboard.