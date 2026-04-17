import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

// TEMPORARY: lowered to ₹1 for testing. REVERT TO 19900 BEFORE GOING LIVE.
const EXPECTED_AMOUNT_PAISE = 100;
const EXPECTED_CURRENCY = "INR";

function timingSafeEqualHex(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, "hex");
  const bBuf = Buffer.from(b, "hex");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (!timingSafeEqualHex(expectedSignature, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    if (eventType === "payment.captured" || eventType === "payment_link.paid") {
      const payment = event.payload.payment?.entity;

      if (!payment) {
        return NextResponse.json({ received: true });
      }

      if (payment.amount !== EXPECTED_AMOUNT_PAISE || payment.currency !== EXPECTED_CURRENCY) {
        console.warn("Webhook: amount/currency mismatch", {
          amount: payment.amount,
          currency: payment.currency,
          paymentId: payment.id,
        });
        return NextResponse.json({ received: true });
      }

      const email = payment.email;
      const paymentId = payment.id;

      if (!email) {
        console.warn("Webhook: payment without email, cannot match", { paymentId });
        return NextResponse.json({ received: true });
      }

      const { data, error } = await supabase
        .from("registrations")
        .update({
          payment_status: "paid",
          razorpay_payment_id: paymentId,
        })
        .eq("email", email)
        .eq("payment_status", "pending")
        .select();

      if (error) {
        console.error("Webhook update error:", error);
      } else if (!data || data.length === 0) {
        console.warn("Webhook: no matching pending registration", { email, paymentId });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
