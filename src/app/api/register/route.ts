import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { razorpay, FEE_PAISE, CURRENCY } from "@/lib/razorpay";

export const runtime = "nodejs";

const RECRUITMENT_TYPES = ["Full Time Job", "Internship"];

// Best-effort per-instance throttle: each call creates a Razorpay order.
const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 10;
const hits = new Map<string, number[]>();

function throttled(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

/** Saves the registration as awaiting_payment and creates a Razorpay order.
 *  The amount is decided here, never by the browser. */
export async function POST(req: NextRequest) {
  try {
    if (!razorpay) {
      return NextResponse.json({ error: "Payments are not available right now." }, { status: 503 });
    }
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
    if (throttled(ip)) {
      return NextResponse.json({ error: "Too many attempts. Please try again later." }, { status: 429 });
    }

    const b = await req.json().catch(() => null);
    const fullName = String(b?.fullName ?? "").trim();
    const email = String(b?.email ?? "").trim();
    const phone = String(b?.phone ?? "").trim();
    const linkedin = String(b?.linkedin ?? "").trim();
    const rolePreference = String(b?.rolePreference ?? "").trim();
    const collegeName = String(b?.collegeName ?? "").trim();
    const courseYear = String(b?.courseYear ?? "").trim();
    const recruitmentType = String(b?.recruitmentType ?? "").trim();

    if (!fullName || !email || !phone || !collegeName || !courseYear) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!RECRUITMENT_TYPES.includes(recruitmentType)) {
      return NextResponse.json({ error: "Select a recruitment type." }, { status: 400 });
    }

    const { data: existing } = await supabase
      .from("registrations")
      .select("id, payment_status")
      .eq("email", email)
      .maybeSingle();

    if (existing?.payment_status === "paid") {
      return NextResponse.json({ error: "This email is already registered and paid." }, { status: 409 });
    }

    const fields = {
      full_name: fullName,
      phone,
      linkedin_url: linkedin || null,
      role_preference: rolePreference || null,
      college_name: collegeName,
      course_year: courseYear,
      recruitment_type: recruitmentType,
      payment_method: "razorpay",
      payment_status: "awaiting_payment",
      created_at: new Date().toISOString(),
    };

    let regId = existing?.id as string | undefined;
    if (regId) {
      const { error } = await supabase.from("registrations").update(fields).eq("id", regId);
      if (error) throw error;
    } else {
      const { data, error } = await supabase
        .from("registrations")
        .insert({ ...fields, email })
        .select("id")
        .single();
      if (error) throw error;
      regId = data.id;
    }

    const order = await razorpay.orders.create({
      amount: FEE_PAISE,
      currency: CURRENCY,
      receipt: String(regId).slice(0, 40),
      notes: { registration_id: String(regId), email },
    });

    const { error: linkError } = await supabase
      .from("registrations")
      .update({ razorpay_order_id: order.id })
      .eq("id", regId);
    if (linkError) throw linkError;

    return NextResponse.json({
      orderId: order.id,
      amount: FEE_PAISE,
      currency: CURRENCY,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
