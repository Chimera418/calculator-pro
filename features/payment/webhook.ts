import crypto from "node:crypto";

/**
 * Razorpay signature verification helpers. All verification is server-side
 * only — the browser never sees the key secret.
 */

/**
 * Verify the checkout handler signature returned to the client after payment.
 * Razorpay signs `${orderId}|${paymentId}` with the key secret (HMAC-SHA256).
 */
export function verifyPaymentSignature(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  secret?: string;
  isTest?: boolean;
}): boolean {
  const secret = params.secret ?? (params.isTest ? process.env.RAZORPAY_TEST_KEY_SECRET : process.env.RAZORPAY_KEY_SECRET);
  if (!secret) throw new Error("RAZORPAY_KEY_SECRET is not configured");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${params.razorpayOrderId}|${params.razorpayPaymentId}`)
    .digest("hex");

  return timingSafeEqual(expected, params.razorpaySignature);
}

/**
 * Verify a webhook payload against the `X-Razorpay-Signature` header.
 * The webhook secret is configured separately in the Razorpay dashboard.
 */
export function verifyWebhookSignature(params: {
  body: string;
  signature: string;
  secret?: string;
}): boolean {
  const secret = params.secret ?? process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) throw new Error("RAZORPAY_WEBHOOK_SECRET is not configured");

  const expected = crypto
    .createHmac("sha256", secret)
    .update(params.body)
    .digest("hex");

  return timingSafeEqual(expected, params.signature);
}

/** Constant-time comparison that tolerates length mismatches safely. */
function timingSafeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}