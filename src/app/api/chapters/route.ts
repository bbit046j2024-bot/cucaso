import { NextResponse } from "next/server";
import { getAllChapters, createChapter } from "@/lib/db";

export async function GET() {
  try {
    const chapters = getAllChapters();
    return NextResponse.json({ success: true, data: chapters });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newChapter = createChapter(body);
    return NextResponse.json({ success: true, data: newChapter }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
