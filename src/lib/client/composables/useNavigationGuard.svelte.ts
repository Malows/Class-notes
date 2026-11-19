import { beforeNavigate, goto } from "$app/navigation";

export interface NavigationGuardOptions {
  /** Whether the form currently has unsaved changes. */
  isDirty: () => boolean;
  /** Saves the form; resolves to true only when the save succeeded. */
  save: () => Promise<boolean>;
}

/**
 * Protects a dirty form from silent navigation. Client navigation and the
 * browser Back button open the guard dialog; reload/close use the native
 * beforeunload prompt. The caller renders the dialog from `open`/`saving`.
 */
export function useNavigationGuard(options: NavigationGuardOptions) {
  let open = $state(false);
  let saving = $state(false);
  let target = $state<string | null>(null);
  let bypass = false;
  let restoreFocus: HTMLElement | null = null;

  beforeNavigate(({ to, cancel }) => {
    if (bypass || !to || !options.isDirty()) return;
    cancel();
    target = to.url.href;
    restoreFocus = (document.activeElement as HTMLElement | null) ?? null;
    open = true;
  });

  $effect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!options.isDirty()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  });

  function proceed() {
    const href = target;
    open = false;
    target = null;
    if (!href) return;
    bypass = true;
    void goto(href).finally(() => {
      bypass = false;
    });
  }

  async function saveAndLeave() {
    if (saving) return;
    saving = true;
    try {
      if (!(await options.save())) return;
    } catch {
      return;
    } finally {
      saving = false;
    }
    proceed();
  }

  function discardAndLeave() {
    proceed();
  }

  function stay() {
    open = false;
    target = null;
    restoreFocus?.focus();
  }

  return {
    get open() {
      return open;
    },
    get saving() {
      return saving;
    },
    saveAndLeave,
    discardAndLeave,
    stay,
  };
}
