export interface OnboardingStep {
  title: string;
  body: string;
}

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: "What you're holding",
    body: "You're dealt two cards. Nobody has bet yet this hand -- it's on you first.",
  },
  {
    title: "The one choice",
    body:
      "Fold gives up the hand -- you lose nothing more. Play raises and takes the hand on. That's the whole decision.",
  },
  {
    title: "Where you sit matters",
    body:
      "Seats closer to the dealer button have fewer players left to act behind them, so they can profitably play more hands than early seats can.",
  },
  {
    title: "How you're scored",
    body:
      "Correct matches the chart, leak clearly disagrees with it, and defensible means the chart itself is split -- either action is fine.",
  },
  {
    title: "Quick keys",
    body: "Skip the mouse -- left arrow folds, right arrow plays, and once the hand's revealed, either arrow deals the next one.",
  },
];
