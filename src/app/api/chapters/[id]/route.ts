import { NextResponse } from "next/server";
import { getChapterById, updateChapter, deleteChapter } from "@/lib/db";
import { guardApi, apiForbidden } from "@/lib/auth";
import { STAFF_WRITE_ROLES, CHAPTER_ROLES, isChapterRole } from "@/lib/roles";

const TIER_MANAGERS = ["SUPER_ADMIN", "COUNCIL_MEMBER"];

// Fields a chapter may never change about itself; tier and status are
// reserved for the council roles in TIER_MANAGERS.
const CHAPTER_LOCKED_FIELDS = ["id", "code", "status", "tierId", "createdAt"];

// Public: chapter profiles are shown on the public directory
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
  const { session, error } = await guardApi([...STAFF_WRITE_ROLES, ...CHAPTER_ROLES]);
  if (error) return error;
  try {
    const body = await request.json();

    if (isChapterRole(session.role)) {
      if (session.chapterId !== params.id) {
        return apiForbidden("You can only edit your own chapter.");
      }
      for (const field of CHAPTER_LOCKED_FIELDS) delete body[field];
    } else if (!TIER_MANAGERS.includes(session.role)) {
      // Staff without a council mandate cannot reassign tiers or status
      delete body.tierId;
      delete body.status;
    }

    const updated = await updateChapter(params.id, body);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Chapter not found" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PUT /api/chapters/[id] error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to update chapter" },
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
  // Deleting a chapter cascades through its entire history — super admin only
  const { error } = await guardApi(["SUPER_ADMIN"]);
  if (error) return error;
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
