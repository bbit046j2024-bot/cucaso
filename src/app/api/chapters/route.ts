import { NextResponse } from "next/server";
import { getAllChapters, createChapter } from "@/lib/db";
import { guardApi } from "@/lib/auth";
import { STAFF_WRITE_ROLES } from "@/lib/roles";

export const dynamic = "force-dynamic";

// Public: the chapters directory is part of the public site
export async function GET() {
  try {
    const chapters = await getAllChapters();
    return NextResponse.json({ success: true, data: chapters });
  } catch (error: any) {
    console.error("GET /api/chapters error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { error } = await guardApi(STAFF_WRITE_ROLES);
  if (error) return error;
  try {
    const body = await request.json();
    const newChapter = await createChapter(body);
    return NextResponse.json({ success: true, data: newChapter }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
