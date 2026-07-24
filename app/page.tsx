import Link from "next/link";
import { Calculator } from "@/components/calculator/Calculator";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">
      <section className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--fg)] sm:text-3xl">
          The world&apos;s most honest calculator
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--muted)]">
          Addition and subtraction are free. Every other operation is a
          one-time in-app purchase. No subscriptions, no nonsense — just a bill
          for multiplication.{" "}
          <Link href="/pricing" className="text-[var(--accent)] underline-offset-2 hover:underline">
            See pricing
          </Link>
          .
        </p>
      </section>

      <Calculator />

      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        This is a satirical demo. Payments run in Razorpay test mode — no real
        money changes hands.
      </p>
    </main>
  );
}