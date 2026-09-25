import { NextResponse } from "next/server";
import { checkAttendee, getChapterById } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id") || searchParams.get("admissionOrIdNumber");
    const rallyId = searchParams.get("rallyId") || undefined;

    if (!id || !id.trim()) {
      return NextResponse.json(
        { success: false, error: "Missing required query parameter: id or admissionOrIdNumber" },
        { status: 400 }
      );
    }

    const attendee = await checkAttendee(id.trim(), rallyId);

    if (attendee) {
      let chapterInfo = null;
      if (attendee.chapterId) {
        chapterInfo = await getChapterById(attendee.chapterId);
      }
      return NextResponse.json({
        success: true,
        exists: true,
        registeredByAdmin: attendee.registrationSource !== "SELF_LINK",
        registrationSource: attendee.registrationSource || "ADMIN",
        attendee,
        chapter: chapterInfo,
        message: `Registered on ${attendee.registrationDate} with status: ${attendee.status}`,
      });
    }

    return NextResponse.json({
      success: true,
      exists: false,
      message: "No existing registration found. You may proceed with registration.",
    });
  } catch (error: any) {
    console.error("GET /api/attendees/check error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to check attendee registration" },
      { status: 500 }
    );
  }
}
