import Link from "next/link";
import { auth } from "@/features/auth/config";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { UserMenu } from "@/components/ui/UserMenu";

export async function Navbar() {
  const session = await auth().catch(() => null);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-sm font-bold text-[var(--accent-fg)]">
            =
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-[var(--fg)]">
              Calculator Pro
            </span>
            <span className="text-[10px] text-[var(--muted)]">
              the calculator that bills
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/pricing"
            className="rounded-lg px-3 py-2 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-2)]"
          >
            Pricing
          </Link>
          <ThemeToggle />
          {user ? (
            <UserMenu name={user.name} email={user.email} image={user.image} />
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}