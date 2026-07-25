import Razorpay from "razorpay";

/**
 * Razorpay SDK wrapper. The client is created lazily so that a missing key
 * (e.g. during `next build` in CI) never throws at module-load time.
 */
let liveClient: Razorpay | null = null;
let testClient: Razorpay | null = null;

export function getRazorpayClient(isTest: boolean = false): Razorpay {
  if (isTest) {
    if (testClient) return testClient;
    const key_id = process.env.RAZORPAY_TEST_KEY_ID;
    const key_secret = process.env.RAZORPAY_TEST_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error("Razorpay test credentials are not configured.");
    }
    testClient = new Razorpay({ key_id, key_secret });
    return testClient;
  } else {
    if (liveClient) return liveClient;
    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      throw new Error("Razorpay live credentials are not configured.");
    }
    liveClient = new Razorpay({ key_id, key_secret });
    return liveClient;
  }
}

export interface CreateRazorpayOrderInput {
  /** Amount in paise. */
  amount: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
  isTest?: boolean;
}

export async function createRazorpayOrder(input: CreateRazorpayOrderInput) {
  const razorpay = getRazorpayClient(input.isTest);
  return razorpay.orders.create({
    amount: input.amount,
    currency: input.currency ?? "INR",
    receipt: input.receipt,
    notes: input.notes,
  });
}

/** The public key id, exposed to the browser for the checkout widget. */
export function getPublicKeyId(isTest: boolean = false): string {
  const key = isTest 
    ? (process.env.NEXT_PUBLIC_RAZORPAY_TEST_KEY_ID || process.env.RAZORPAY_TEST_KEY_ID)
    : (process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID);
  if (!key) throw new Error("NEXT_PUBLIC_RAZORPAY_KEY_ID is not configured");
  return key;
}