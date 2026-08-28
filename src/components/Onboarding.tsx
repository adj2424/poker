import { useEffect, useRef, useState } from "react";
import { PlayingCard } from "./Card";
import type { Card as CardModel } from "../core/cards";
import { ONBOARDING_STEPS as STEPS } from "../content/onboardingSteps";
import { useFocusTrap } from "../engine/useFocusTrap";

export function Onboarding({ heroCards, onClose }: { heroCards: [CardModel, CardModel]; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const dialogRef = useRef<HTMLDivElement>(null);
  const last = step === STEPS.length - 1;

  useFocusTrap(dialogRef);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-ink/70 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        tabIndex={-1}
        className="w-full max-w-sm rounded-xl border border-paper/15 bg-rail p-5 shadow-2xl outline-none"
      >
        {step === 0 && (
          <div className="mb-3 flex justify-center gap-1.5">
            <PlayingCard card={heroCards[0]} size="md" />
            <PlayingCard card={heroCards[1]} size="md" />
          </div>
        )}

        <p className="font-mono text-[10px] uppercase tracking-widest text-paper/40">
          Step {step + 1} of {STEPS.length}
        </p>
        <h2 id="onboarding-title" className="mt-1 font-display text-lg font-bold text-paper">
          {STEPS[step].title}
        </h2>
        <p className="mt-2 text-sm leading-snug text-paper/75">{STEPS[step].body}</p>

        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="font-mono text-xs text-paper/40 underline decoration-dotted hover:text-paper/70"
          >
            Skip
          </button>
          <div className="flex gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-lg border border-paper/15 px-4 py-2 font-mono text-xs font-semibold text-paper/70 hover:text-paper"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (last ? onClose() : setStep((s) => s + 1))}
              className="rounded-lg bg-accent px-4 py-2 font-display text-sm font-bold text-ink hover:bg-accent-dim hover:text-paper"
            >
              {last ? "Let's play" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
