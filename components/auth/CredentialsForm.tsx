"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authenticate, type AuthFormState } from "@/app/actions/auth";
import { PASSWORD_MIN } from "@/features/auth/password";

type Mode = "signin" | "signup";

const initialState: AuthFormState = {};

export function CredentialsForm() {
  const [mode, setMode] = React.useState<Mode>("signin");
  const [showPassword, setShowPassword] = React.useState(false);

  const [state, formAction] = React.useActionState(authenticate, initialState);

  const toggleMode = () => {
    setMode((m) => (m === "signin" ? "signup" : "signin"));
  };

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="mode" value={mode} />
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block text-xs font-medium text-[var(--muted)]"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 text-sm text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        />
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block text-xs font-medium text-[var(--muted)]"
        >
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            minLength={PASSWORD_MIN}
            autoComplete={mode === "signin" ? "current-password" : "new-password"}
            placeholder={mode === "signup" ? `At least ${PASSWORD_MIN} characters` : "••••••••"}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3 pr-11 text-sm text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)] focus-visible:border-[var(--accent)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-[var(--muted)] transition hover:bg-[var(--surface-3)] hover:text-[var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {state.error && (
        <p role="alert" className="text-xs text-[var(--danger)]">
          {state.error}
        </p>
      )}

      <SubmitButton mode={mode} />

      <p className="text-center text-xs text-[var(--muted)]">
        {mode === "signin" ? "No account yet?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={toggleMode}
          className="font-medium text-[var(--accent)] underline-offset-2 hover:underline focus-visible:outline-none focus-visible:underline"
        >
          {mode === "signin" ? "Create one" : "Sign in"}
        </button>
      </p>
    </form>
  );
}

function SubmitButton({ mode }: { mode: Mode }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--accent-fg)] transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {pending
        ? mode === "signin"
          ? "Signing in…"
          : "Creating account…"
        : mode === "signin"
          ? "Sign in"
          : "Create account"}
    </button>
  );
}
