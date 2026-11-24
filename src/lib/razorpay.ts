import crypto from "crypto";
import Razorpay from "razorpay";
import { supabase } from "@/lib/supabase";

/** Registration fee in paise. The amount is only ever decided here, on the server. */
export const FEE_PAISE = 249 * 100;
export const CURRENCY = "INR";

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

export const razorpay =
  keyId && keySecret ? new Razorpay({ key_id: keyId, key_secret: keySecret }) : null;

export function hmacHex(secret: string, data: string | Buffer): string {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

export function safeEqualHex(a: string, b: string): boolean {
  const x = Buffer.from(a, "hex");
  const y = Buffer.from(b, "hex");
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
}

/** Checkout signature: HMAC-SHA256 of "order_id|payment_id" with the key secret. */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  if (!keySecret) return false;
  return safeEqualHex(hmacHex(keySecret, `${orderId}|${paymentId}`), signature);
}

interface RzpPayment {
  id: string;
  order_id: string | null;
  amount: number | string;
  currency: string;
  status: string;
}

/**
 * The single place that decides a payment counts. Idempotent, so verify,
 * webhook and the reconcile cron can all call it for the same payment.
 * Returns true when the registration is paid after the call.
 */
export async function settlePayment(payment: RzpPayment): Promise<boolean> {
  if (!razorpay || !payment.order_id) return false;

  const { data: reg } = await supabase
    .from("registrations")
    .select("id, payment_status")
    .eq("razorpay_order_id", payment.order_id)
    .maybeSingle();
  if (!reg) return false;
  if (reg.payment_status === "paid") return true;

  if (Number(payment.amount) !== FEE_PAISE || payment.currency !== CURRENCY) {
    console.warn("Razorpay amount/currency mismatch", { id: payment.id, amount: payment.amount });
    return false;
  }

  let p = payment;
  if (p.status === "authorized") {
    try {
      p = (await razorpay.payments.capture(p.id, FEE_PAISE, CURRENCY)) as unknown as RzpPayment;
    } catch {
      p = (await razorpay.payments.fetch(p.id)) as unknown as RzpPayment; // captured concurrently
    }
  }
  if (p.status !== "captured") return false;

  const { error } = await supabase
    .from("registrations")
    .update({ payment_status: "paid", razorpay_payment_id: p.id })
    .eq("id", reg.id)
    .neq("payment_status", "paid");
  if (error) {
    console.error("settlePayment update error:", error);
    return false;
  }
  return true;
}
