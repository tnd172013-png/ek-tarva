import type { NextRequest } from "next/server";
import crypto from "crypto";

// Timing-safe check of the `Authorization: Bearer <ADMIN_SECRET>` header.
export function isAdmin(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice(7) : null;
  const secret = process.env.ADMIN_SECRET;

  if (!secret || !token || token.length !== secret.length) return false;

  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(secret));
  } catch {
    return false;
  }
}
