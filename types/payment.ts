import type { FeatureSlug } from "./features";

export interface CreateOrderRequest {
  featureSlug: FeatureSlug;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  /** Public Razorpay key id — safe to expose to the browser. */
  key: string;
  featureSlug: FeatureSlug;
  featureName: string;
}

export interface VerifyPaymentRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  unlockedFeature?: FeatureSlug;
  message?: string;
}

/** Shape of Razorpay's client-side checkout success handler payload. */
export interface RazorpayCheckoutResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}