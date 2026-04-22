import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.companyName || !body.contactPerson || !body.email || !body.mobile) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const scriptUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
    if (!scriptUrl) {
      console.error("GOOGLE_SHEETS_WEBHOOK_URL is not set");
      return NextResponse.json({ error: "Server is not configured" }, { status: 500 });
    }

    const upstream = await fetch(scriptUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, submittedAt: new Date().toISOString() }),
    });

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      console.error("Google Sheets webhook failed:", upstream.status, text);
      return NextResponse.json({ error: "Could not save submission" }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Yuva register error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
