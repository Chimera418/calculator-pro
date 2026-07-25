import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { credentialsSchema, verifyPassword } from "./password";

/**
 * Auth.js (NextAuth v5) configuration.
 *
 * Providers: Google + GitHub OAuth, plus email/password (Credentials).
 *
 * Session strategy is JWT rather than database: the Credentials provider is
 * only supported with JWT sessions in Auth.js v5. OAuth accounts are still
 * persisted through the Prisma adapter; the user id is threaded through the
 * token so `session.user.id` stays available everywhere it's consumed.
 */
export const {
  handlers,
  auth,
  signIn,
  signOut,
} = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        // Always run a compare so response time doesn't reveal whether the
        // email exists. `verifyPassword` returns false for a null hash.
        const ok = await verifyPassword(password, user?.passwordHash);
        if (!ok || !user) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      // `token.sub` is the user id, set automatically on sign-in for every
      // provider. Thread it onto the session so `session.user.id` stays available.
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  logger: {
    error(error) {
      // A stale/undecodable session cookie — e.g. one issued under the old
      // database-session strategy, or after AUTH_SECRET rotation — is expected
      // and handled as "logged out". Log a concise warning instead of a full
      // error (which the Next dev overlay would surface) so it isn't alarming.
      if (error?.name === "JWTSessionError") {
        console.warn("[auth] Ignoring stale session cookie (treated as signed out).");
        return;
      }
      console.error(error);
    },
  },
});

/**
 * `auth()` that never throws on a malformed/stale session cookie, returning
 * `null` (signed-out) instead. Use this everywhere a session is read so a bad
 * cookie can't crash a page, server action, or route handler.
 */
export async function safeAuth() {
  try {
    return await auth();
  } catch {
    return null;
  }
}
