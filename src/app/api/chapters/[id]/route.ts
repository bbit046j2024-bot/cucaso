import { NextResponse } from "next/server";
import { getChapterById, updateChapter, deleteChapter } from "@/lib/db";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const chapter = await getChapterById(params.id);
    if (!chapter) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: chapter });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const updated = await updateChapter(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update chapter" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  return PUT(request, { params });
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const deleted = await deleteChapter(params.id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, message: "Chapter deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete chapter" },
      { status: 500 }
    );
  }
}
