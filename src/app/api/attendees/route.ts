import { NextResponse } from "next/server";
import { getAttendees, createAttendee, deleteAttendee } from "@/lib/db";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chapterId = searchParams.get("chapterId") || undefined;
    const attendees = await getAttendees(chapterId);
    return NextResponse.json({ success: true, data: attendees });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendees" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
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
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing attendee id" }, { status: 400 });
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
