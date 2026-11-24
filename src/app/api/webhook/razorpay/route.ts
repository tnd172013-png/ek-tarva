import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hmacHex, safeEqualHex, settlePayment } from "@/lib/razorpay";

export const runtime = "nodejs";

/** Razorpay -> server. Catches buyers who paid and then closed the tab. */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const body = await req.text(); // raw body: the signature is over these exact bytes
  const sig = req.headers.get("x-razorpay-signature") ?? "";

  if (!secret || !safeEqualHex(hmacHex(secret, body), sig)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Bad payload" }, { status: 400 });
  }
  const payment = event.payload?.payment?.entity;

  try {
    if (payment && ["payment.captured", "payment.authorized", "order.paid"].includes(event.event)) {
      await settlePayment(payment);
    } else if (payment && event.event === "payment.failed" && payment.order_id) {
      await supabase
        .from("registrations")
        .update({ payment_status: "failed" })
        .eq("razorpay_order_id", payment.order_id)
        .eq("payment_status", "awaiting_payment");
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "retry" }, { status: 500 }); // Razorpay retries
  }
}
