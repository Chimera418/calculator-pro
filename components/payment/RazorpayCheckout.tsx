"use client";

import * as React from "react";
import type {
  CreateOrderResponse,
  RazorpayCheckoutResponse,
  VerifyPaymentResponse,
} from "@/types/payment";
import type { FeatureSlug } from "@/types/features";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: RazorpayCheckoutResponse) => void;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}

function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector(`script[src="${src}"]`)) return resolve(true);
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export type CheckoutStatus = "idle" | "creating" | "processing" | "verifying";

export interface CheckoutHandlers {
  onSuccess: (slug: FeatureSlug) => void;
  onError: (message: string) => void;
  onDismiss?: () => void;
}

/**
 * Client-side Razorpay checkout orchestration:
 *   create-order → open widget → verify signature server-side → onSuccess.
 */
export function useRazorpayCheckout(handlers: CheckoutHandlers) {
  const [status, setStatus] = React.useState<CheckoutStatus>("idle");

  const start = React.useCallback(async (featureSlug: FeatureSlug, userName?: string) => {
    try {
      setStatus("creating");
      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featureSlug }),
      });

      if (!orderRes.ok) {
        const body = await orderRes.json().catch(() => ({}));
        if (orderRes.status === 401) {
          handlers.onError("Please sign in to purchase.");
        } else {
          handlers.onError(body.error ?? "Could not start checkout.");
        }
        setStatus("idle");
        return;
      }

      const order: CreateOrderResponse = await orderRes.json();

      const ok = await loadScript(RAZORPAY_SCRIPT);
      if (!ok || !window.Razorpay) {
        handlers.onError("Failed to load Razorpay. Check your connection.");
        setStatus("idle");
        return;
      }

      setStatus("processing");
      const rzp = new window.Razorpay({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        name: "Calculator Pro",
        description: order.featureName,
        order_id: order.orderId,
        prefill: { name: userName },
        theme: { color: "#0071e3" },
        modal: {
          ondismiss: () => {
            setStatus("idle");
            handlers.onDismiss?.();
          },
        },
        handler: async (response: RazorpayCheckoutResponse) => {
          setStatus("verifying");
          const verifyRes = await fetch("/api/payment/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            }),
          });
          const verify: VerifyPaymentResponse = await verifyRes
            .json()
            .catch(() => ({ success: false }));

          if (verify.success && verify.unlockedFeature) {
            handlers.onSuccess(verify.unlockedFeature);
          } else {
            handlers.onError(verify.message ?? "Payment verification failed.");
          }
          setStatus("idle");
        },
      });
      rzp.open();
    } catch (err) {
      console.error("checkout failed:", err);
      handlers.onError("Unexpected checkout error.");
      setStatus("idle");
    }
  }, [handlers]);

  return { start, status };
}