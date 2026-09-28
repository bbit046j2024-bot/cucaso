import { NextResponse } from "next/server";
import { getAttendees, createAttendee, deleteAttendee } from "@/lib/db";
import { getSession, guardApi, apiForbidden } from "@/lib/auth";
import { STAFF_ROLES, STAFF_WRITE_ROLES, CHAPTER_ROLES, isChapterRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const READ_ROLES = [...STAFF_ROLES, ...CHAPTER_ROLES];

export async function GET(request: Request) {
  const { session, error } = await guardApi(READ_ROLES);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    let chapterId = searchParams.get("chapterId") || undefined;
    // Chapter-level users can only ever see their own roster
    if (isChapterRole(session.role)) {
      chapterId = session.chapterId ?? "__none__";
    }
    const attendees = await getAttendees(chapterId);
    return NextResponse.json({ success: true, data: attendees });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}

// Public self-registration stays open (registration links); a signed-in
// chapter user is pinned to their own chapter.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const session = await getSession();
    if (session.isAuthenticated && isChapterRole(session.role)) {
      if (!session.chapterId) {
        return apiForbidden("Your account is not linked to a chapter.");
      }
      body.chapterId = session.chapterId;
    }
    const newAttendee = await createAttendee(body);
    return NextResponse.json({ success: true, data: newAttendee }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to create attendee" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: Request) {
  const { session, error } = await guardApi([...STAFF_WRITE_ROLES, ...CHAPTER_ROLES]);
  if (error) return error;
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing attendee id" }, { status: 400 });
    }
    if (isChapterRole(session.role)) {
      const attendee = await prisma.attendee.findUnique({
        where: { id },
        select: { chapterId: true },
      });
      if (!attendee || attendee.chapterId !== session.chapterId) {
        return apiForbidden("You can only remove attendees from your own chapter.");
      }
    }
    const deleted = await deleteAttendee(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete attendee" },
      { status: 500 }
    );
  }
}
