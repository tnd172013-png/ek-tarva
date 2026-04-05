import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      linkedin,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    // Verify Razorpay signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Store registration in Supabase
    const { error } = await supabase.from("registrations").insert({
      full_name: fullName,
      email,
      phone,
      linkedin_url: linkedin || null,
      razorpay_order_id,
      razorpay_payment_id,
      payment_status: "paid",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      // Still return success if payment verified — don't fail the user
      // The payment is confirmed, DB insert can be retried
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
