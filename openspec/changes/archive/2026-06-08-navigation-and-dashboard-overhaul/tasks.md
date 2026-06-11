## 1. Setup & NavStore

- [x] 1.1 Create `src/lib/stores/nav.store.ts` to track route context and resolve names
- [x] 1.2 Implement name resolution logic in `NavStore` using existing stores

## 2. Hierarchical Route Refactor

- [x] 2.1 Refactor `/faculties` to support nested `/faculties/[f_id]/subjects`
- [x] 2.2 Refactor `/subjects/[id]/periods` to nested `/faculties/[f_id]/subjects/[s_id]/periods`
- [x] 2.3 Refactor `/periods/[id]/commissions` to nested hierarchical path
- [x] 2.4 Refactor `/commissions/[id]/overview` and `/students` to nested hierarchical paths
- [x] 2.5 Update all `goto` calls and `href` attributes to match new hierarchical structure

## 3. UI Components

- [x] 3.1 Create `src/lib/components/Breadcrumbs.svelte` component
- [x] 3.2 Create `src/lib/components/Sidebar.svelte` with responsive behavior
- [x] 3.3 Update `src/routes/+layout.svelte` to include Sidebar and Breadcrumbs

## 4. Dashboard Implementation

- [x] 4.1 Create `DashboardPending` component for uncorrected deliveries
- [x] 4.2 Create `DashboardStats` component for academic overview
- [x] 4.3 Refactor `src/routes/+page.svelte` to implement the functional Dashboard

## 5. Final Polish

- [x] 5.1 Add \"Collapse\" toggle for Sidebar on desktop
- [x] 5.2 Ensure Sidebar correctly highlights the active route
- [x] 5.3 Verify all navigation links work correctly across the app
