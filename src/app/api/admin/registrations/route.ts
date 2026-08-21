import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { isAdmin } from "@/lib/admin";

const SCREENSHOT_BUCKET = "payment-proofs";
const SIGNED_URL_TTL_S = 60 * 60; // links in the admin list live for an hour

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("id, full_name, email, phone, role_preference, utr, screenshot_path, payment_status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Admin registrations fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 });
  }

  const rows = data ?? [];

  // Flag UTRs that appear on more than one registration (reused screenshots).
  const utrCounts = new Map<string, number>();
  for (const r of rows) {
    if (r.utr) utrCounts.set(r.utr, (utrCounts.get(r.utr) ?? 0) + 1);
  }

  const paths = rows.map((r) => r.screenshot_path).filter(Boolean) as string[];
  const signedByPath = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed, error: signError } = await supabase.storage
      .from(SCREENSHOT_BUCKET)
      .createSignedUrls(paths, SIGNED_URL_TTL_S);
    if (signError) {
      console.error("Signed URL error:", signError);
    } else {
      for (const s of signed ?? []) {
        if (s.path && s.signedUrl) signedByPath.set(s.path, s.signedUrl);
      }
    }
  }

  return NextResponse.json({
    registrations: rows.map((r) => ({
      id: r.id,
      fullName: r.full_name,
      email: r.email,
      phone: r.phone,
      rolePreference: r.role_preference,
      utr: r.utr,
      paymentStatus: r.payment_status,
      createdAt: r.created_at,
      screenshotUrl: r.screenshot_path ? signedByPath.get(r.screenshot_path) ?? null : null,
      duplicateUtr: r.utr ? (utrCounts.get(r.utr) ?? 0) > 1 : false,
    })),
  });
}
