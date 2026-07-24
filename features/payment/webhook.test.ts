import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { verifyPaymentSignature, verifyWebhookSignature } from "./webhook";

const SECRET = "test_secret_key";

function sign(payload: string, secret = SECRET) {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

describe("verifyPaymentSignature", () => {
  const orderId = "order_ABC123";
  const paymentId = "pay_XYZ789";

  it("accepts a valid signature", () => {
    const signature = sign(`${orderId}|${paymentId}`);
    expect(
      verifyPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        secret: SECRET,
      }),
    ).toBe(true);
  });

  it("rejects a tampered signature", () => {
    expect(
      verifyPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: "deadbeef",
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it("rejects a signature for a different order", () => {
    const signature = sign(`order_OTHER|${paymentId}`);
    expect(
      verifyPaymentSignature({
        razorpayOrderId: orderId,
        razorpayPaymentId: paymentId,
        razorpaySignature: signature,
        secret: SECRET,
      }),
    ).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  it("accepts a valid webhook signature", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    const signature = sign(body);
    expect(verifyWebhookSignature({ body, signature, secret: SECRET })).toBe(true);
  });

  it("rejects an invalid webhook signature", () => {
    const body = JSON.stringify({ event: "payment.captured" });
    expect(verifyWebhookSignature({ body, signature: "nope", secret: SECRET })).toBe(false);
  });
});