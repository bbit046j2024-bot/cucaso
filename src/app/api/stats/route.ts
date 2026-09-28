import { NextResponse } from "next/server";
import { getSystemStats } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { STAFF_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

export async function GET() {
  const { error } = await guardApi(STAFF_ROLES);
  if (error) return error;
  try {
    const stats = await getSystemStats();
    return NextResponse.json({ success: true, data: stats });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
