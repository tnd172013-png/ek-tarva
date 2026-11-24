import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { razorpay, settlePayment } from "@/lib/razorpay";

export const runtime = "nodejs";

/** Daily safety net: ask Razorpay about recent unpaid orders in case both the
 *  verify call and the webhook were missed. Nothing is deleted. */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!razorpay) return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });

  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const { data: rows } = await supabase
    .from("registrations")
    .select("razorpay_order_id")
    .eq("payment_method", "razorpay")
    .in("payment_status", ["awaiting_payment", "failed"])
    .not("razorpay_order_id", "is", null)
    .gt("created_at", since);

  let settled = 0;
  for (const { razorpay_order_id: orderId } of rows ?? []) {
    try {
      const { items } = await razorpay.orders.fetchPayments(orderId!);
      for (const p of items) {
        if (["captured", "authorized"].includes(p.status) && (await settlePayment(p as never))) {
          settled++;
          break;
        }
      }
    } catch (err) {
      console.error(`reconcile ${orderId} failed:`, err);
    }
  }
  return NextResponse.json({ checked: rows?.length ?? 0, settled });
}
