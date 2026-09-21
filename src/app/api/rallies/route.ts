import { NextResponse } from "next/server";
import { getCurrentRally } from "@/lib/db";
import { CURRENT_RALLY as FALLBACK_RALLY } from "@/lib/data";

/**
 * GET /api/rallies
 * Returns the current/active rally for public consumption.
 * Falls back to static data if DB is unavailable.
 */
export async function GET() {
  try {
    const rally = await getCurrentRally();
    return NextResponse.json({ success: true, data: rally });
  } catch (error: any) {
    // DB unavailable — return static fallback so the site still renders
    return NextResponse.json({ success: true, data: FALLBACK_RALLY, fallback: true });
  }
}
