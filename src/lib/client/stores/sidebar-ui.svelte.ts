/**
 * Shared open/closed state for the mobile sidebar.
 *
 * The menu control lives in the navbar on narrow viewports, while the sidebar
 * itself renders the panel, so both need the same state. It is provided
 * through Svelte context (see `initStoreContext`) instead of a module
 * singleton so SSR requests never share it.
 */
export class SidebarUiStore {
  isOpen = $state(false);

  toggle() {
    this.isOpen = !this.isOpen;
  }

  close() {
    this.isOpen = false;
  }
}
