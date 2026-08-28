import { useState } from "react";

const STORAGE_KEY = "foldorplay.onboarded.v1";

function readSeen(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

function writeSeen() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // private browsing or storage disabled -- onboarding just reopens next visit
  }
}

/** First-run onboarding visibility, backed by a localStorage seen-flag. */
export function useOnboarding() {
  const [open, setOpen] = useState(() => !readSeen());

  function close() {
    writeSeen();
    setOpen(false);
  }

  function reopen() {
    setOpen(true);
  }

  return { open, close, reopen };
}
