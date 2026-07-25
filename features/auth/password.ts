import bcrypt from "bcryptjs";
import { z } from "zod";

/**
 * Password hashing + credential validation for email/password auth.
 *
 * Passwords are hashed with bcrypt (cost factor 12, per-password salt) and are
 * never stored, logged, or returned in plaintext. bcrypt only considers the
 * first 72 bytes of input, so we cap length there — this also blocks
 * long-string denial-of-service.
 */

const BCRYPT_COST = 12;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email is required")
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
    .max(PASSWORD_MAX, `Password must be at most ${PASSWORD_MAX} characters`),
});

export type Credentials = z.infer<typeof credentialsSchema>;

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/** Constant-time comparison via bcrypt. Returns false for a null/absent hash. */
export function verifyPassword(
  password: string,
  hash: string | null | undefined,
): Promise<boolean> {
  if (!hash) return Promise.resolve(false);
  return bcrypt.compare(password, hash);
}
