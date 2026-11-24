import { NextRequest, NextResponse } from "next/server";
import { razorpay, settlePayment, verifyCheckoutSignature } from "@/lib/razorpay";

export const runtime = "nodejs";

/** Called by the browser right after Checkout succeeds. The signature proves
 *  Razorpay issued it; we then confirm the payment with Razorpay's API. */
export async function POST(req: NextRequest) {
  const b = await req.json().catch(() => null);
  const orderId = String(b?.razorpay_order_id ?? "");
  const paymentId = String(b?.razorpay_payment_id ?? "");
  const signature = String(b?.razorpay_signature ?? "");

  if (!razorpay || !orderId || !paymentId || !verifyCheckoutSignature(orderId, paymentId, signature)) {
    return NextResponse.json({ error: "Payment could not be verified." }, { status: 400 });
  }

  try {
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.order_id !== orderId || !(await settlePayment(payment as never))) {
      return NextResponse.json({ error: "Payment is not confirmed yet." }, { status: 402 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Payment verify error:", err);
    return NextResponse.json({ error: "Could not confirm payment. Please contact us." }, { status: 502 });
  }
}
