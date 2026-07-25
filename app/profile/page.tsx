import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { safeAuth } from "@/features/auth/config";
import { getUnlockedFeatureSlugs, getCalculationHistory } from "@/lib/user-features";
import { FEATURES, ALL_FEATURE_SLUGS } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import { Check, Lock } from "lucide-react";
import { ClearHistoryButton } from "@/components/profile/ClearHistoryButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profile · Calculator Pro" };

export default async function ProfilePage() {
  const session = await safeAuth();
  if (!session?.user?.id) redirect("/login");

  const [unlocked, history] = await Promise.all([
    getUnlockedFeatureSlugs(session.user.id),
    getCalculationHistory(session.user.id),
  ]);

  const paidSlugs = unlocked.filter((s) => FEATURES[s].price > 0);
  const totalSpent = paidSlugs.reduce((sum, s) => sum + FEATURES[s].price, 0);
  const hasHistory = unlocked.includes("history");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-[var(--muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
        >
          ← Calculator
        </Link>
      </div>
      <header className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--accent)] text-xl font-semibold text-[var(--accent-fg)]">
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt=""
              width={56}
              height={56}
              className="h-full w-full object-cover"
            />
          ) : (
            (session.user.name ?? session.user.email ?? "?").charAt(0).toUpperCase()
          )}
        </div>
        <div>
          <h1 className="text-xl font-semibold text-[var(--fg)]">
            {session.user.name ?? "Your account"}
          </h1>
          <p className="text-sm text-[var(--muted)]">{session.user.email}</p>
        </div>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Features owned" value={`${paidSlugs.length}`} />
        <Stat label="Total spent" value={formatCurrency(totalSpent)} />
        <Stat label="Calculations" value={`${history.length}`} />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-[var(--fg)]">Your features</h2>
        <div className="grid gap-2 sm:grid-cols-2">
          {ALL_FEATURE_SLUGS.filter((s) => FEATURES[s].price > 0).map((slug) => {
            const owned = unlocked.includes(slug);
            const f = FEATURES[slug];
            return (
              <div
                key={slug}
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
              >
                <span className="flex items-center gap-2 text-sm text-[var(--fg)]">
                  {owned ? (
                    <Check className="h-4 w-4 text-[var(--success)]" />
                  ) : (
                    <Lock className="h-4 w-4 text-[var(--lock)]" />
                  )}
                  {f.name}
                </span>
                <span className="text-xs text-[var(--muted)]">
                  {owned ? "Owned" : formatCurrency(f.price)}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-[var(--fg)]">Calculation history</h2>
          {hasHistory && history.length > 0 && <ClearHistoryButton />}
        </div>

        {!hasHistory ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
            History is a premium feature. Unlock the Ultimate Edition to keep a
            record of your calculations.
          </p>
        ) : history.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--border)] p-6 text-center text-sm text-[var(--muted)]">
            No calculations yet.
          </p>
        ) : (
          <ul className="divide-y divide-[var(--border)] rounded-xl border border-[var(--border)] bg-[var(--surface)]">
            {history.map((h) => (
              <li key={h.id} className="flex items-center justify-between px-4 py-3">
                <span className="tnum text-sm text-[var(--muted)]">{h.expression}</span>
                <span className="tnum text-sm font-medium text-[var(--fg)]">= {h.result}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
      <div className="text-2xl font-semibold text-[var(--fg)]">{value}</div>
      <div className="text-xs text-[var(--muted)]">{label}</div>
    </div>
  );
}