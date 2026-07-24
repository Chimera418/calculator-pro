"use client";

import * as React from "react";
import confetti from "canvas-confetti";

/** Fire a celebratory confetti burst. Call `fireConfetti()` on unlock. */
export function fireConfetti() {
  const end = Date.now() + 800;
  const colors = ["#0071e3", "#30d158", "#7c3aed", "#ffd60a"];

  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

/** Optional inline success flourish for the modal body. */
export function SuccessAnimation({ featureName }: { featureName: string }) {
  React.useEffect(() => {
    fireConfetti();
  }, []);

  return (
    <div className="flex flex-col items-center gap-2 py-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--success)]/15 text-3xl">
        🎉
      </div>
      <p className="text-lg font-semibold text-[var(--fg)]">{featureName} unlocked!</p>
      <p className="text-sm text-[var(--muted)]">
        You may now use it. Congratulations on your purchase.
      </p>
    </div>
  );
}