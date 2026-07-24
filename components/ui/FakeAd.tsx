"use client";

import * as React from "react";

const ADS = [
  { tag: "SPONSORED", title: "Tired of paying for math?", body: "Upgrade once. Regret never. Probably." },
  { tag: "AD", title: "Numbers hate this one trick", body: "Multiplication, now only ₹49." },
  { tag: "PROMOTED", title: "Your calculator is watching", body: "It knows you can't afford division." },
  { tag: "SPONSORED", title: "Local integers near you", body: "Want to add them? That part's free." },
];

// Stable fallback rendered by the server — no randomness involved.
const FALLBACK = ADS[0];

export function FakeAd() {
  // Start with the stable fallback so SSR and the initial client render agree.
  // After mount, swap to a random ad — no hydration mismatch.
  const [ad, setAd] = React.useState(FALLBACK);

  React.useEffect(() => {
    const idx = Math.floor(Math.random() * ADS.length);
    setAd(ADS[idx]);
  }, []);

  return (
    <div className="mt-3 flex items-center gap-3 overflow-hidden rounded-2xl border border-dashed border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--surface-3)] text-lg">
        📢
      </div>
      <div className="min-w-0 flex-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
          {ad.tag}
        </span>
        <p className="truncate text-sm font-medium text-[var(--fg)]">{ad.title}</p>
        <p className="truncate text-xs text-[var(--muted)]">{ad.body}</p>
      </div>
    </div>
  );
}