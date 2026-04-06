import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const eventType = event.event;

    // Handle payment captured event (payment link payments trigger this)
    if (eventType === "payment.captured" || eventType === "payment_link.paid") {
      const payment = event.payload.payment?.entity;

      if (!payment) {
        return NextResponse.json({ error: "No payment data" }, { status: 400 });
      }

      const email = payment.email;
      const phone = payment.contact;
      const paymentId = payment.id;

      let matched = false;

      // Try matching by email first
      if (email) {
        const { data } = await supabase
          .from("registrations")
          .update({
            payment_status: "paid",
            razorpay_payment_id: paymentId,
          })
          .eq("email", email)
          .eq("payment_status", "pending")
          .select();

        if (data && data.length > 0) matched = true;
      }

      // If no email match, try matching by phone (last 10 digits)
      if (!matched && phone) {
        const cleaned = phone.replace(/\D/g, "").slice(-10);
        const { data: rows } = await supabase
          .from("registrations")
          .select("id, phone")
          .eq("payment_status", "pending");

        if (rows) {
          const match = rows.find((r) =>
            r.phone.replace(/\D/g, "").slice(-10) === cleaned
          );
          if (match) {
            await supabase
              .from("registrations")
              .update({
                payment_status: "paid",
                razorpay_payment_id: paymentId,
              })
              .eq("id", match.id);
          }
        }
      }
    }

    // Always return 200 to Razorpay (so it doesn't retry endlessly)
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    // Still return 200 — don't let parsing errors cause infinite retries
    return NextResponse.json({ received: true });
  }
}
