import Link from "next/link";
import { redirect } from "next/navigation";
import { safeAuth, signIn } from "@/features/auth/config";
import { GoogleIcon, GitHubIcon } from "@/components/ui/ProviderIcons";
import { CredentialsForm } from "@/components/auth/CredentialsForm";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in · Calculator Pro",
};

export default async function LoginPage() {
  const session = await safeAuth();
  if (session?.user) redirect("/");

  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface)] p-8 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent)] text-lg font-bold text-white">
            =
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-[var(--fg)]">
            Sign in to Calculator Pro
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Your purchases and unlocked operators are tied to your account.
          </p>
        </div>

        <CredentialsForm />

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-[var(--border)]" />
          <span className="text-xs text-[var(--muted)]">or continue with</span>
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <div className="space-y-3">
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-3)]"
            >
              <GoogleIcon className="h-5 w-5" />
              Continue with Google
            </button>
          </form>

          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/" });
            }}
          >
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm font-medium text-[var(--fg)] transition hover:bg-[var(--surface-3)]"
            >
              <GitHubIcon className="h-5 w-5" />
              Continue with GitHub
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-xs text-[var(--muted)]">
          By continuing you agree to be charged for arithmetic.{" "}
          <Link href="/pricing" className="underline hover:text-[var(--fg)]">
            View pricing
          </Link>
        </p>
      </div>
    </main>
  );
}