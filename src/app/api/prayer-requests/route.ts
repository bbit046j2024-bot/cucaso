import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/prayer-requests
 * Admin: fetch all prayer requests (newest first).
 */
export async function GET() {
  try {
    const requests = await prisma.prayerRequest.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, data: requests });
  } catch (error: any) {
    console.error("GET /api/prayer-requests error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/prayer-requests
 * Public: submit a prayer request.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, emailOrPhone, requestText, isPrivate } = body;

    if (!requestText || requestText.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: "Prayer request text is required." },
        { status: 400 }
      );
    }

    const created = await prisma.prayerRequest.create({
      data: {
        submitterName: name?.trim() || "Anonymous",
        submitterContact: emailOrPhone?.trim() || null,
        requestText: requestText.trim(),
        isPrivate: Boolean(isPrivate),
      },
    });

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/prayer-requests error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * PATCH /api/prayer-requests
 * Admin: mark a prayer request as read / approved.
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, isRead, isModeratedApproved } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }
    const updated = await prisma.prayerRequest.update({
      where: { id },
      data: {
        ...(isRead !== undefined ? { isRead } : {}),
        ...(isModeratedApproved !== undefined ? { isModeratedApproved } : {}),
      },
    });
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    console.error("PATCH /api/prayer-requests error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/prayer-requests
 * Admin: delete a prayer request by ID.
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ success: false, error: "Missing ID" }, { status: 400 });
    }
    await prisma.prayerRequest.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/prayer-requests error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
