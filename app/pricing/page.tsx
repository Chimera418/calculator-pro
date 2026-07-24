import { PricingTable } from "@/components/pricing/PricingTable";

export const metadata = {
  title: "Pricing · Calculator Pro",
};

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:py-14">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--fg)]">
          Pricing
        </h1>
        <p className="mx-auto mt-2 max-w-lg text-sm text-[var(--muted)]">
          Buy exactly the arithmetic you need. Every unlock is a one-time
          purchase and yours forever. Addition and subtraction are, generously,
          free.
        </p>
      </header>

      <PricingTable />

      <p className="mt-10 text-center text-xs text-[var(--muted)]">
        Prices in INR. Payments processed by Razorpay in test mode for this
        demo.
      </p>
    </main>
  );
}