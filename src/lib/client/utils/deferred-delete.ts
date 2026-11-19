import { notificationsStore } from "$lib/client/stores/notifications.svelte";

export const DEFAULT_UNDO_WINDOW_MS = 6000;

export interface DeferredDeleteConfig {
  /** The server call that actually deletes the record. */
  commit: () => Promise<void>;
  /** Puts the record back in the view without a server call. */
  restore: () => void;
  /** Message shown while the undo window is open. */
  message: string;
  /** Label of the inline undo action. */
  undoLabel: string;
  /** Called when the delayed commit fails; the record is already restored. */
  onError?: (error: unknown) => void;
  /** How long the user has to undo. Defaults to 6 s. */
  windowMs?: number;
}

interface PendingDeletion {
  timer: ReturnType<typeof setTimeout>;
  toastId: number;
  settled: boolean;
  config: DeferredDeleteConfig;
}

const pending = new Set<PendingDeletion>();

export interface DeferredDeleteHandle {
  /** Cancels the server call and restores the record. */
  undo: () => void;
  /** Commits now, skipping the rest of the window. */
  flush: () => Promise<void>;
}

function settle(entry: PendingDeletion) {
  entry.settled = true;
  clearTimeout(entry.timer);
  pending.delete(entry);
  notificationsStore.dismiss(entry.toastId);
}

async function commitNow(entry: PendingDeletion) {
  if (entry.settled) return;
  settle(entry);
  try {
    await entry.config.commit();
  } catch (error) {
    entry.config.restore();
    entry.config.onError?.(error);
  }
}

function undo(entry: PendingDeletion) {
  if (entry.settled) return;
  settle(entry);
  entry.config.restore();
}

/**
 * Removes a record from the view immediately and schedules its deletion.
 * The user can undo while the toast is visible; leaving the view commits it.
 */
export function scheduleDeferredDelete(config: DeferredDeleteConfig): DeferredDeleteHandle {
  const windowMs = config.windowMs ?? DEFAULT_UNDO_WINDOW_MS;
  const entry: PendingDeletion = {
    timer: setTimeout(() => void commitNow(entry), windowMs),
    toastId: -1,
    settled: false,
    config,
  };

  entry.toastId = notificationsStore.addAction(
    config.message,
    { label: config.undoLabel, onAction: () => undo(entry) },
    windowMs,
  );
  pending.add(entry);

  return {
    undo: () => undo(entry),
    flush: () => commitNow(entry),
  };
}

/** Commits every deletion still waiting for its window (used on navigation). */
export function flushPendingDeletions() {
  for (const entry of pending) {
    void commitNow(entry);
  }
}

/** Test hook: how many deletions are still undoable. */
export function pendingDeletionCount() {
  return pending.size;
}
