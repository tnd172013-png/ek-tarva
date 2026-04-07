import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Ping Supabase to keep it alive
  const { count } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({ status: "ok", registrations: count });
}
