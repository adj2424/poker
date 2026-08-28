import { useEffect, useId, useRef } from "react";
import { GLOSSARY, type TermId } from "../content/glossary";
import { getOpenTermId, setOpenTerm, useOpenTermId } from "../engine/useTermRegistry";

/**
 * Inline jargon helper: a dotted-underline button that toggles a plain-
 * language definition popover. Open/closed state lives in a shared registry
 * (not local state) so opening one Term always closes any other -- including
 * via keyboard-only activation -- and so App's keyboard-shortcut gate can
 * check "is any term open" directly instead of relying on DOM focus, which
 * Safari doesn't reliably give a clicked <button> by default.
 */
export function Term({ id, children }: { id: TermId; children: React.ReactNode }) {
  const entry = GLOSSARY[id];
  const popoverId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);
  const openId = useOpenTermId();
  const open = openId === popoverId;

  // A stable JSX position can be reused for a different Term id (e.g. the
  // hero's seat label after a table-size switch) without unmounting -- close
  // rather than silently relabel an already-open popover out from under it.
  const prevId = useRef(id);
  useEffect(() => {
    if (prevId.current !== id) {
      prevId.current = id;
      if (open) setOpenTerm(null);
    }
  }, [id, open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenTerm(null);
    }
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpenTerm(null);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  // Unmounting while open (e.g. this Term's branch of the UI disappears)
  // must not leave the registry pointing at a popover id nothing renders.
  useEffect(() => {
    return () => {
      if (getOpenTermId() === popoverId) setOpenTerm(null);
    };
  }, [popoverId]);

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpenTerm(open ? null : popoverId)}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        style={{ font: "inherit" }}
        className="cursor-help border-b border-dotted border-current/50 text-inherit"
      >
        {children}
      </button>
      {open && (
        <span
          id={popoverId}
          role="tooltip"
          className="absolute left-1/2 top-full z-20 mt-1.5 w-56 -translate-x-1/2 rounded-lg border border-paper/15 bg-rail p-2.5 text-left font-mono text-[11px] font-normal leading-snug text-paper/85 shadow-xl"
        >
          <strong className="mb-1 block text-paper">{entry.term}</strong>
          {entry.plain}
        </span>
      )}
    </span>
  );
}
