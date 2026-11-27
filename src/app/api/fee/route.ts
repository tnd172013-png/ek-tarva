import { NextResponse } from "next/server";
import { FEE_RUPEES } from "@/lib/razorpay";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The fee the server will charge, so the form never shows a stale amount. */
export async function GET() {
  return NextResponse.json({ fee: FEE_RUPEES }, { headers: { "Cache-Control": "no-store" } });
}
