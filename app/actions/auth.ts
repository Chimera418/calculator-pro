"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/features/auth/config";
import { prisma } from "@/lib/prisma";
import { credentialsSchema, hashPassword } from "@/features/auth/password";

export interface AuthFormState {
  error?: string;
}

/**
 * Single entry point for the credentials form, dispatched on a hidden `mode`
 * field ("signin" | "signup"). Shaped for `useActionState`: returns `{ error }`
 * on failure; on success `signIn` throws a redirect (to "/") which propagates.
 */
export async function authenticate(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const mode = formData.get("mode") === "signup" ? "signup" : "signin";

  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    // On sign-up surface the specific rule; on sign-in stay generic.
    return {
      error:
        mode === "signup"
          ? parsed.error.issues[0]?.message ?? "Invalid email or password."
          : "Invalid email or password.",
    };
  }

  const { email, password } = parsed.data;

  if (mode === "signup") {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { error: "That email is already registered. Try signing in instead." };
    }
    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: { email, passwordHash, name: email.split("@")[0] },
    });
  }

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (error) {
    // A successful sign-in throws a redirect — let it propagate.
    if (error instanceof AuthError) {
      return {
        error:
          mode === "signup"
            ? "Account created — please sign in."
            : "Invalid email or password.",
      };
    }
    throw error;
  }
  return {};
}

export async function doSignOut() {
  await signOut({ redirectTo: "/" });
}
