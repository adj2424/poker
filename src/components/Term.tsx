import { useEffect, useId, useRef, useState } from "react";
import { GLOSSARY, type TermId } from "../content/glossary";

/**
 * Inline jargon helper: a dotted-underline button that toggles a plain-
 * language definition popover. A real <button> is load-bearing -- App.tsx's
 * global keydown handler already skips events inside `button, a, input,
 * select, textarea`, so `f`/`space` never fire while a term is focused.
 */
export function Term({ id, children }: { id: TermId; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const entry = GLOSSARY[id];
  const popoverId = useId();
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <span ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-describedby={open ? popoverId : undefined}
        className="cursor-help border-b border-dotted border-current/50 font-inherit text-inherit"
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
