import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { fullName, email, phone, linkedin } = await req.json();

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if already registered and paid
    const { data: existing } = await supabase
      .from("registrations")
      .select("id, payment_status")
      .eq("email", email)
      .limit(1)
      .single();

    if (existing?.payment_status === "paid") {
      return NextResponse.json(
        { error: "This email is already registered and paid." },
        { status: 409 }
      );
    }

    // If there's a stale pending row, delete it and re-insert fresh
    if (existing?.payment_status === "pending") {
      await supabase.from("registrations").delete().eq("id", existing.id);
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
