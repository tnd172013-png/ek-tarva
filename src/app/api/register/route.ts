import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

const PENDING_COOLDOWN_MS = 10 * 60 * 1000;
const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024;
const SCREENSHOT_BUCKET = "payment-proofs";

const UTR_RE = /^[A-Za-z0-9-]{8,30}$/;

function screenshotExt(file: File): string | null {
  if (file.type === "application/pdf") return "pdf";
  if (file.type.startsWith("image/")) {
    const sub = file.type.slice("image/".length);
    return /^[a-z0-9+.-]+$/i.test(sub) ? sub.replace("jpeg", "jpg") : "img";
  }
  return null;
}

async function uploadScreenshot(file: File, email: string): Promise<string | { error: string }> {
  const ext = screenshotExt(file);
  if (!ext) return { error: "Screenshot must be an image or a PDF." };
  if (file.size > MAX_SCREENSHOT_BYTES) return { error: "Screenshot must be under 5 MB." };

  const safeEmail = email.toLowerCase().replace(/[^a-z0-9]/g, "_");
  const path = `${safeEmail}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(SCREENSHOT_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: false });

  if (error) {
    console.error("Screenshot upload error:", error);
    return { error: "Could not save your screenshot. Please try again." };
  }
  return path;
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const fullName = String(form.get("fullName") || "").trim();
    const email = String(form.get("email") || "").trim();
    const phone = String(form.get("phone") || "").trim();
    const linkedin = String(form.get("linkedin") || "").trim();
    const rolePreference = String(form.get("rolePreference") || "").trim();
    const utr = String(form.get("utr") || "").trim();
    const screenshot = form.get("screenshot");

    if (!fullName || !email || !phone) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!UTR_RE.test(utr)) {
      return NextResponse.json(
        { error: "The UTR / transaction ID looks invalid. Copy it from your payment app." },
        { status: 400 }
      );
    }
    if (!(screenshot instanceof File) || screenshot.size === 0) {
      return NextResponse.json(
        { error: "Payment screenshot is required." },
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
        { error: "This email is already registered and verified." },
        { status: 409 }
      );
    }

    if (existing?.payment_status === "pending") {
      const ageMs = Date.now() - new Date(existing.created_at).getTime();
      if (ageMs < PENDING_COOLDOWN_MS) {
        return NextResponse.json(
          {
            error:
              "A registration for this email was just submitted and is awaiting verification. If you need to change something, try again in 10 minutes.",
          },
          { status: 409 }
        );
      }

      const uploaded = await uploadScreenshot(screenshot, email);
      if (typeof uploaded !== "string") {
        return NextResponse.json({ error: uploaded.error }, { status: 400 });
      }

      const { error: updateError } = await supabase
        .from("registrations")
        .update({
          full_name: fullName,
          phone,
          linkedin_url: linkedin || null,
          role_preference: rolePreference || null,
          utr,
          screenshot_path: uploaded,
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

    const uploaded = await uploadScreenshot(screenshot, email);
    if (typeof uploaded !== "string") {
      return NextResponse.json({ error: uploaded.error }, { status: 400 });
    }

    const { error } = await supabase.from("registrations").insert({
      full_name: fullName,
      email,
      phone,
      linkedin_url: linkedin || null,
      role_preference: rolePreference || null,
      utr,
      screenshot_path: uploaded,
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
