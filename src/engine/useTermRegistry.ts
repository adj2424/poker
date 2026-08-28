import { useSyncExternalStore } from "react";

/**
 * Tracks which single Term popover (if any) is open across the whole app, so
 * opening one always closes any other -- including via keyboard-only
 * activation, which never fires the outside-mousedown close a lone Term
 * relies on. Also lets App's global keyboard shortcuts gate on "is a term
 * open" directly, instead of relying on DOM focus landing on the button
 * (unreliable: Safari doesn't focus a clicked <button> by default).
 */
let openTermId: string | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function setOpenTerm(id: string | null) {
  if (openTermId === id) return;
  openTermId = id;
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return openTermId;
}

/** Current value outside React, e.g. an effect cleanup on unmount. */
export function getOpenTermId(): string | null {
  return openTermId;
}

/** The currently open Term's id, or null when none is open. */
export function useOpenTermId(): string | null {
  return useSyncExternalStore(subscribe, getSnapshot);
}

/** True when any Term popover is open anywhere in the app. */
export function useAnyTermOpen(): boolean {
  return useOpenTermId() !== null;
}
