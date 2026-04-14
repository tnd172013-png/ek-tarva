import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PENDING_COOLDOWN_MS = 10 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, linkedin } = await req.json();

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data: existing } = await supabase
      .from("registrations")
      .select("id, payment_status, created_at")
      .eq("email", email)
      .limit(1)
      .single();

    if (existing?.payment_status === "paid") {
      return NextResponse.json(
        { error: "This email is already registered and paid." },
        { status: 409 }
      );
    }

    if (existing?.payment_status === "pending") {
      const ageMs = Date.now() - new Date(existing.created_at).getTime();
      if (ageMs < PENDING_COOLDOWN_MS) {
        return NextResponse.json(
          {
            error:
              "A registration for this email is already in progress. Please complete payment, or try again in 10 minutes.",
          },
          { status: 409 }
        );
      }

      const { error: updateError } = await supabase
        .from("registrations")
        .update({
          full_name: fullName,
          phone,
          linkedin_url: linkedin || null,
          created_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        return NextResponse.json(
          { error: "Registration failed. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    const { error } = await supabase.from("registrations").insert({
      full_name: fullName,
      email,
      phone,
      linkedin_url: linkedin || null,
      payment_status: "pending",
    });

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { error: "Registration failed. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
