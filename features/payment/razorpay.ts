import Razorpay from "razorpay";

/**
 * Razorpay SDK wrapper. The client is created lazily so that a missing key
 * (e.g. during `next build` in CI) never throws at module-load time.
 */
let client: Razorpay | null = null;

export function getRazorpayClient(): Razorpay {
  if (client) return client;

  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new Error(
      "Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env",
    );
  }

  client = new Razorpay({ key_id, key_secret });
  return client;
}

export interface CreateRazorpayOrderInput {
  /** Amount in paise. */
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(input: CreateRazorpayOrderInput) {
  const razorpay = getRazorpayClient();
  return razorpay.orders.create({
    amount: input.amount,
    currency: input.currency ?? "INR",
    receipt: input.receipt,
    notes: input.notes,
  });
}

/** The public key id, exposed to the browser for the checkout widget. */
export function getPublicKeyId(): string {
  const key =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  if (!key) throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured");
  return key;
}