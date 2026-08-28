import { useEffect, type RefObject } from "react";

const FOCUSABLE = 'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Moves focus into the dialog on mount, traps Tab within it, closes on
 * Escape, and restores focus on unmount.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, onClose: () => void) {
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    ref.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab" || !ref.current) return;
      const focusable = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [ref, onClose]);
}
