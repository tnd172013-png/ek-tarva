import { NextRequest, NextResponse } from "next/server";
import { getRazorpay } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, email, phone, experience } = body;

    if (!fullName || !email || !phone || !experience) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const order = await getRazorpay().orders.create({
      amount: 19900, // ₹199 in paise
      currency: "INR",
      receipt: `pth_${Date.now()}`,
      notes: {
        fullName,
        email,
        phone,
        experience,
      },
    });

    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
