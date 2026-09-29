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

export async function PATCH(request: Request) {
  const { session, error } = await guardApi([...STAFF_WRITE_ROLES, ...CHAPTER_ROLES]);
  if (error) return error;

  try {
    const body = await request.json();
    const { id, guardianName, guardianPhone, relationship, consentGiven, status } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Missing attendee ID" }, { status: 400 });
    }

    const attendee = await prisma.attendee.findUnique({
      where: { id },
      select: { id: true, chapterId: true },
    });

    if (!attendee) {
      return NextResponse.json({ success: false, error: "Attendee not found" }, { status: 404 });
    }

    if (isChapterRole(session.role) && attendee.chapterId !== session.chapterId) {
      return apiForbidden("You can only update attendees from your own chapter.");
    }

    // Update attendee status if provided
    if (status) {
      await prisma.attendee.update({
        where: { id },
        data: { status },
      });
    }

    // Upsert guardian consent if guardian information provided
    if (guardianName || consentGiven !== undefined) {
      await prisma.guardianConsent.upsert({
        where: { attendeeId: id },
        create: {
          attendeeId: id,
          guardianName: guardianName || "Verified Guardian",
          guardianPhone: guardianPhone || "+254700000000",
          relationship: relationship || "PARENT",
          consentGiven: consentGiven !== undefined ? consentGiven : true,
          noticeVersion: "KDPA-2019-V1",
        },
        update: {
          guardianName: guardianName || undefined,
          guardianPhone: guardianPhone || undefined,
          relationship: relationship || undefined,
          consentGiven: consentGiven !== undefined ? consentGiven : true,
        },
      });

      // Also ensure attendee status is CONFIRMED if consent is granted
      if (consentGiven !== false) {
        await prisma.attendee.update({
          where: { id },
          data: { status: "CONFIRMED" },
        });
      }
    }

    const updated = await prisma.attendee.findUnique({
      where: { id },
      include: { guardianConsent: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("[ATTENDEES/PATCH]", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to update attendee" },
      { status: 500 }
    );
  }
}

